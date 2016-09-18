var firepad = firepad || { };

/**
 * Instance of headless Firepad for use in NodeJS. Supports get/set on text/html.
 */
firepad.Headless = (function() {
  var TextOperation   = firepad.TextOperation;
  var FirebaseAdapter = firepad.FirebaseAdapter;
  var EntityManager   = firepad.EntityManager;
  var ParseHtml       = firepad.ParseHtml;

  function Headless(refOrPath) {
    // Allow calling without new.
    if (!(this instanceof Headless)) { return new Headless(refOrPath); }

    var firebase, ref;
    if (typeof refOrPath === 'string') {
      if (window.firebase === undefined && typeof firebase !== 'object') {
            console.log("REQUIRING");
        firebase = require('firebase');
      } else {
        firebase = window.firebase;
      }

      ref = firebase.database().refFromURL(refOrPath);
    } else {
      ref = refOrPath;
    }

    this.entityManager_  = new EntityManager();

    this.firebaseAdapter_ = new FirebaseAdapter(ref);
    this.ready_ = false;
    this.zombie_ = false;
  }

  Headless.prototype.getDocument = function(callback) {
    var self = this;

    if (self.ready_) {
      return callback(self.firebaseAdapter_.getDocument());
    }

    self.firebaseAdapter_.on('ready', function() {
      self.ready_ = true;
      callback(self.firebaseAdapter_.getDocument());
    });
  }

  Headless.prototype.getText = function(callback) {
    if (this.zombie_) {
      throw new Error('You can\'t use a firepad.Headless after calling dispose()!');
    }

    this.getDocument(function(doc) {
      var text = doc.apply('');

      // Strip out any special characters from Rich Text formatting
      for (key in firepad.sentinelConstants) {
        text = text.replace(new RegExp(firepad.sentinelConstants[key], 'g'), '');
      }
      callback(text);
    });
  }

  Headless.prototype.setText = function(text, callback) {
    if (this.zombie_) {
      throw new Error('You can\'t use a firepad.Headless after calling dispose()!');
    }

    var op = TextOperation().insert(text);
    this.sendOperationWithRetry(op, callback);
  }

  Headless.prototype.initializeFakeDom = function(callback) {
    if (typeof document === 'object' || typeof firepad.document === 'object') {
      callback();
    } else {
      require('jsdom').env('<head></head><body></body>', function(err, window) {
        if (firepad.document) {
          // Return if we've already made a jsdom to avoid making more than one
          // This would be easier with promises but we want to avoid introducing
          // another dependency for just headless mode.
          window.close();
          return callback();
        }
        firepad.document = window.document;
        callback();
      });
    }
  }

  Headless.prototype.getHtml = function(callback) {
    var self = this;

    if (this.zombie_) {
      throw new Error('You can\'t use a firepad.Headless after calling dispose()!');
    }

    self.initializeFakeDom(function() {
      self.getDocument(function(doc) {
        callback(firepad.SerializeHtml(doc, self.entityManager_));
      });
    });
  }

  Headless.prototype.setHtml = function(html, callback) {
    var self = this;

    if (this.zombie_) {
      throw new Error('You can\'t use a firepad.Headless after calling dispose()!');
    }

    self.initializeFakeDom(function() {
      var textPieces = ParseHtml(html, self.entityManager_);
      var inserts    = firepad.textPiecesToInserts(true, textPieces);
      var op         = new TextOperation();

      for (var i = 0; i < inserts.length; i++) {
        op.insert(inserts[i].string, inserts[i].attributes);
      }

      self.sendOperationWithRetry(op, callback);
    });
  }

  Headless.prototype.sendOperationWithRetry = function(operation, callback) {
    var self = this;

    self.getDocument(function(doc) {
      var op = operation.clone()['delete'](doc.targetLength);
      self.firebaseAdapter_.sendOperation(op, function(err, committed) {
        if (committed) {
          if (typeof callback !== "undefined") {
            callback(null, committed);
          }
        } else {
          self.sendOperationWithRetry(operation, callback);
        }
      });
    });
  }

  Headless.prototype.dispose = function() {
    this.zombie_ = true; // We've been disposed.  No longer valid to do anything.

    this.firebaseAdapter_.dispose();
  };

  return Headless;
})();
