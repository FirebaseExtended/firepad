var firepad = firepad || { };

firepad.FirebaseAdapter = (function (global) {
  var TextOperation = firepad.TextOperation;
  var utils = firepad.utils;

  // Save a checkpoint every 100 edits.
  var CHECKPOINT_FREQUENCY = 100;

  function FirebaseAdapter (ref, userId, userColor) {
    this.ref_ = ref;
    this.ready_ = false;

    // We store the current document state as a TextOperation so we can write checkpoints to Firebase occasionally.
    // TODO: Consider more efficient ways to do this. (composing text operations is linear in the length of the document).
    this.document_ = new TextOperation();

    // The next expected revision.
    this.revision_ = 0;

    // This is used for two purposes:
    // 1) On initialization, we fill this with the latest checkpoint and any subsequent operations and then
    //      process them all together.
    // 2) If we ever receive revisions out-of-order (e.g. rev 5 before rev 4), we queue them here until it's time
    //    for them to be handled. [this should never happen with well-behaved clients; but if it /does/ happen we want
    //    to handle it gracefully.]
    this.pendingReceivedRevisions_ = { };

    this.setUserId(userId);
    this.setColor(userColor);

    ref.root().child('.info/connected').on('value', function(s) {
      if (s.val() === true) { this.initializeUserData_(); }
    }, this);

    var self = this;
    // Avoid triggering any events until our callers have had a chance to attach their listeners.
    setTimeout(function() {
      self.monitorCursors_();
      self.monitorHistory_();
    }, 0);
  }
  utils.makeEventEmitter(FirebaseAdapter, ['ready', 'cursor', 'operation', 'ack', 'retry']);

  FirebaseAdapter.prototype.setUserId = function(userId) {
    if (this.userRef_) {
      // clean up existing data.
      this.userRef_.child('cursor').remove();
      this.userRef_.child('cursor').onDisconnect().cancel();
      this.userRef_.child('color').remove();
      this.userRef_.child('color').onDisconnect().cancel();
    }

    this.userId_ = userId;
    this.userRef_ = this.ref_.child('users').child(userId);

    this.initializeUserData_();
  };

  FirebaseAdapter.prototype.isHistoryEmpty = function() {
    assert(this.ready_, "Not ready yet.");
    return this.revision_ === 0;
  };

  FirebaseAdapter.prototype.sendOperation = function (operation, cursor) {
    var self = this;

    // Sanity check that this operation is valid.
    assert(this.document_.targetLength === operation.baseLength, "sendOperation() called with invalid operation.");

    // Convert revision into an id that will sort properly lexicographically.
    var revisionId = revisionToId(this.revision_);
    this.sent_ = {id: revisionId, op: operation };
    this.ref_.child('history').child(revisionId).transaction(function(current) {
      if (current === null) {
        return { a: self.userId_, o: operation.toJSON() };
      }
    }, function(error, committed) {
      if (error) {
        console.error('Transaction failure!', error);
        throw error;
      }
      if (committed) {
        // We trigger the 'ack' when we get the child_added event for it.
        self.sendCursor(cursor);
      } else {
        self.trigger('retry');
      }
    }, /*applyLocally=*/false);
  };

  FirebaseAdapter.prototype.sendCursor = function (obj) {
    this.userRef_.child('cursor').set(obj);
    this.cursor_ = obj;
  };

  FirebaseAdapter.prototype.setColor = function(color) {
    this.userRef_.child('color').set(color);
    this.color_ = color;
  };

  FirebaseAdapter.prototype.getDocument = function() {
    return this.document_;
  };

  FirebaseAdapter.prototype.registerCallbacks = function(callbacks) {
    for (var eventType in callbacks) {
      this.on(eventType, callbacks[eventType]);
    }
  };

  FirebaseAdapter.prototype.initializeUserData_ = function() {
    this.userRef_.child('cursor').onDisconnect().remove();
    this.userRef_.child('color').onDisconnect().remove();

    this.sendCursor(this.cursor_ || null);
    this.setColor(this.color_ || null);
  };

  FirebaseAdapter.prototype.monitorCursors_ = function() {
    var usersRef = this.ref_.child('users'), self = this;
    var user2Callback = { };

    usersRef.on('child_added', function(childSnap) {
      var userId = childSnap.name();
      if (userId !== self.userId_) {
        // Monitor other users' cursors.
        user2Callback[userId] = function(userSnap) {
          var userData = userSnap.val() || { };
          self.trigger('cursor', userId, userData.cursor, userData.color);
        };
        // Since we're monitoring the whole node, this may be a little noisy, but that's okay.
        childSnap.ref().on('value', user2Callback[userId]);
      }
    });

    usersRef.on('child_removed', function(childSnap) {
      var userId = childSnap.name();
      childSnap.ref().off('value', user2Callback[userId]);
      self.trigger('cursor', userId, null);
    });
  };

  FirebaseAdapter.prototype.monitorHistory_ = function() {
    var self = this;
    // Get the latest checkpoint as a starting point so we don't have to re-play entire history.
    this.ref_.child('checkpoint').once('value', function(s) {
      var revision = s.child('rev').val(),  op = s.child('op').val();
      if (op != null && revision != null) {
        self.pendingReceivedRevisions_[revisionToId(revision)] = { o: op, a: 'checkpoint' };
        self.checkpointRevision_ = revision;
        self.monitorHistoryStartingAt_(self.checkpointRevision_ + 1);
      } else {
        self.checkpointRevision_ = 0;
        self.monitorHistoryStartingAt_(self.checkpointRevision_);
      }
    });
  };

  FirebaseAdapter.prototype.monitorHistoryStartingAt_ = function(revision) {
    var historyRef = this.ref_.child('history').startAt(null, revisionToId(revision));
    var self = this;

    setTimeout(function() {
      historyRef.on('child_added', function(revisionSnapshot) {
        var revisionId = revisionSnapshot.name();
        self.pendingReceivedRevisions_[revisionId] = revisionSnapshot.val();
        if (self.ready_) {
          self.handlePendingReceivedRevisions_();
        }
      });

      historyRef.once('value', function() {
        self.handleInitialRevisions_();
      });
    }, 0);
  };

  FirebaseAdapter.prototype.handleInitialRevisions_ = function() {
    assert(!this.ready_, "Should not be called multiple times.");

    // Compose the checkpoint and all subsequent revisions into a single operation to apply at once.
    this.revision_ = this.checkpointRevision_;
    var revisionId = revisionToId(this.revision_), pending = this.pendingReceivedRevisions_;
    while (pending[revisionId]) {
      var author = pending[revisionId].a,
          op = TextOperation.fromJSON(pending[revisionId].o);
      delete pending[revisionId];

      // If a misbehaved client adds a bad operation, just ignore it.
      if (this.document_.targetLength !== op.baseLength) {
        console.log('Invalid operation.', revisionId, author, op);
      } else {
        this.document_ = this.document_.compose(op);
      }

      this.revision_++;
      revisionId = revisionToId(this.revision_);
    }

    this.trigger('operation', this.document_);

    this.ready_ = true;
    this.trigger('ready');
  };

  FirebaseAdapter.prototype.handlePendingReceivedRevisions_ = function() {
    var pending = this.pendingReceivedRevisions_;
    var revisionId = revisionToId(this.revision_);
    while (pending[revisionId]) {
      var author = pending[revisionId].a,
          op = TextOperation.fromJSON(pending[revisionId].o);
      delete pending[revisionId];
      this.revision_++;

      if (op.baseLength !== this.document_.targetLength) {
        // If a misbehaved client adds a bad operation, just ignore it.
        console.log('Invalid operation.', revisionId, author, op);
      } else {
        this.document_ = this.document_.compose(op);
        if (this.sent_ && revisionId === this.sent_.id && this.sent_.op.equals(op) && author === this.userId_) {
          // Need to trigger the ack before handling any more operations.
          if (this.revision_ % CHECKPOINT_FREQUENCY === 0) {
            this.saveCheckpoint_();
          }
          this.sent_ = null;
          this.trigger('ack');
        } else {
          this.trigger('operation', op);
        }
      }

      revisionId = revisionToId(this.revision_);
    }
  };

  FirebaseAdapter.prototype.saveCheckpoint_ = function() {
    this.ref_.child('checkpoint').set({
      a: this.userId_,
      op: this.document_.toJSON(),
      rev: this.revision_ - 1
    });
  };

  // Throws an error if the first argument is falsy. Useful for debugging.
  function assert (b, msg) {
    if (!b) {
      throw new Error(msg || "assertion error");
    }
  }

  // Based off ideas from http://www.zanopha.com/docs/elen.pdf
  var characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  function revisionToId(revision) {
    if (revision === 0) {
      return 'A0';
    }

    var str = '';
    while (revision > 0) {
      var digit = (revision % characters.length);
      str = characters[digit] + str;
      revision -= digit;
      revision /= characters.length;
    }

    // Prefix with length (starting at 'A' for length 1) to ensure the id's sort lexicographically.
    var prefix = characters[str.length + 9];
    return prefix + str;
  }

  return FirebaseAdapter;
}());
