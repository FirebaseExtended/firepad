var firepad = firepad || { };

firepad.EditorClient = (function () {
  'use strict';

  var Cursor = firepad.Cursor;
  var DiffMatchPatch = firepad.DiffMatchPatch;
  var TextOperation = firepad.TextOperation;
  var UndoManager = firepad.UndoManager;
  var WrappedOperation = firepad.WrappedOperation;

  function SelfMeta (cursorBefore, cursorAfter) {
    this.cursorBefore = cursorBefore;
    this.cursorAfter  = cursorAfter;
  }

  SelfMeta.prototype.invert = function () {
    return new SelfMeta(this.cursorAfter, this.cursorBefore);
  };

  SelfMeta.prototype.compose = function (other) {
    return new SelfMeta(this.cursorBefore, other.cursorAfter);
  };

  SelfMeta.prototype.transform = function (operation) {
    return new SelfMeta(
      this.cursorBefore ? this.cursorBefore.transform(operation) : null,
      this.cursorAfter ? this.cursorAfter.transform(operation) : null
    );
  };

  function OtherClient (id, editorAdapter) {
    this.id = id;
    this.editorAdapter = editorAdapter;
  }

  OtherClient.prototype.setColor = function (color) {
    this.color = color;
  };

  OtherClient.prototype.updateCursor = function (cursor) {
    this.removeCursor();
    this.cursor = cursor;
    this.mark = this.editorAdapter.setOtherCursor(
      cursor,
      this.color,
      this.id
    );
  };

  OtherClient.prototype.removeCursor = function () {
    if (this.mark) { this.mark.clear(); }
  };

  function EditorClient (firebaseAdapter, editorAdapter) {
    this.firebaseAdapter = firebaseAdapter;
    this.editorAdapter = editorAdapter;
    this.undoManager = new UndoManager();
    this.inflight  = false;
    this.pending = null;
    this.buffer   = null;

    this.clients = { };

    var self = this;

    this.editorAdapter.registerCallbacks({
      change: function () { self.synchronize(); },
      cursorActivity: function () { self.onCursorActivity(); },
      blur: function () { self.onBlur(); },
      focus: function () { self.onFocus(); }
    });
    this.editorAdapter.registerUndo(function () { self.undo(); });
    this.editorAdapter.registerRedo(function () { self.redo(); });

    this.firebaseAdapter.registerCallbacks({
      ack: function() { self.pending = null; },
      retry: function() { self.synchronize(); },
      operation: function (operation) {
        self.applyServer(operation);
      },
      cursor: function (clientId, cursor, color) {
        if (self.firebaseAdapter.userId_ === clientId || self.inflight) {
          return;
        }
        var client = self.getClientObject(clientId);
        if (cursor) {
          if (color) client.setColor(color);
          client.updateCursor(Cursor.fromJSON(cursor));
        } else {
          client.removeCursor();
        }
      }
    });
  }

  EditorClient.prototype.getClientObject = function (clientId) {
    var client = this.clients[clientId];
    if (client) { return client; }
    return this.clients[clientId] = new OtherClient(
      clientId,
      this.editorAdapter
    );
  };

  EditorClient.prototype.applyUnredo = function (operation) {
    this.undoManager.add(this.editorAdapter.invertOperation(operation));
    this.editorAdapter.applyOperation(operation.wrapped);
    this.cursor = operation.meta.cursorAfter;
    if (this.cursor)
      this.editorAdapter.setCursor(this.cursor);
    this.sendOperation(operation.wrapped);
  };

  EditorClient.prototype.undo = function () {
    var self = this;
    if (!this.undoManager.canUndo()) { return; }
    this.undoManager.performUndo(function (o) { self.applyUnredo(o); });
  };

  EditorClient.prototype.redo = function () {
    var self = this;
    if (!this.undoManager.canRedo()) { return; }
    this.undoManager.performRedo(function (o) { self.applyUnredo(o); });
  };

  EditorClient.prototype.synchronize = function () {
    var before = this.firebaseAdapter.getDocument();
    if (this.pending) before = before.compose(this.pending);
    if (this.buffer) before = before.compose(this.buffer);
    before = before.apply('');
    var after = this.editorAdapter.getValue();

    if (before === after) return;

    var operations = operationsFromText(before, after);
    var operation = operations[0], inverse = operations[1];

    var compose = this.undoManager.undoStack.length > 0 &&
      inverse.shouldBeComposedWithInverted(last(this.undoManager.undoStack).wrapped);

    var cursorBefore = this.cursor;
    this.updateCursor();

    var inverseMeta = new SelfMeta(this.cursor, cursorBefore);
    this.undoManager.add(new WrappedOperation(inverse, inverseMeta), compose);

    this.sendOperation(operation);
  };

  EditorClient.prototype.sendOperation = function(operation) {
    if (this.buffer) {
      this.buffer = this.buffer.compose(operation);
    } else if (this.pending) {
      this.buffer = operation;
    } else {
      this.pending = operation;
    }

    this.handleOutgoingOperations();
  };

  EditorClient.prototype.handleOutgoingOperations = function() {
    if (this.inflight) return;
    var self = this;

    if (!this.pending && !this.buffer) {
      this.updateCursor();
      this.sendCursor(this.cursor);
      return;
    }

    if (this.pending && this.buffer) {
      this.pending = this.pending.compose(this.buffer);
      this.buffer = null;
    } else if (!this.pending && this.buffer) {
      this.pending = this.buffer;
      this.buffer = null;
    }

    this.inflight = true;
    this.firebaseAdapter.sendOperation(this.pending, function(succeeded) {
      self.inflight = false;
      setTimeout(function() {
        self.handleOutgoingOperations();
      }, 1);
    });
  };

  function operationsFromText(before, after) {
    var diffObj = new DiffMatchPatch();
    var diffs = diffObj.diff_main(before, after);
    diffObj.diff_cleanupSemantic(diffs);

    var operation = new TextOperation();
    var inverse   = new TextOperation();

    for (var i = 0; i < diffs.length; i++) {
      var type  = diffs[i][0];
      var value = diffs[i][1];

      if (type === 1) {
        operation.insert(value);
        inverse['delete'](value);
      } else if (type === -1) {
        operation['delete'](value);
        inverse.insert(value);
      } else {
        operation.retain(value.length);
        inverse.retain(value.length);
      }
    }

    return [operation, inverse];
  }

  EditorClient.prototype.applyServer = function (operation) {
    var pair;
    if (this.pending) {
      pair = this.pending.transform(operation);
      this.pending = pair[0];
      operation = pair[1];
    }

    if (this.buffer) {
      pair = this.buffer.transform(operation);
      this.buffer = pair[0];
      operation = pair[1];
    }

    this.editorAdapter.applyOperation(operation);
    this.updateCursor();
    this.undoManager.transform(new WrappedOperation(operation, null));
  }

  EditorClient.prototype.updateCursor = function () {
    this.cursor = this.editorAdapter.getCursor();
  };

  EditorClient.prototype.onCursorActivity = function () {
    var oldCursor = this.cursor;
    this.updateCursor();
    if (!this.focused || oldCursor && this.cursor.equals(oldCursor)) { return; }
    this.sendCursor(this.cursor);
  };

  EditorClient.prototype.onBlur = function () {
    this.cursor = null;
    this.sendCursor(null);
    this.focused = false;
  };

  EditorClient.prototype.onFocus = function () {
    this.focused = true;
    this.onCursorActivity();
  };

  EditorClient.prototype.sendCursor = function (cursor) {
    if (this.inflight) { return; }
    this.firebaseAdapter.sendCursor(cursor);
  };

  function last (arr) { return arr[arr.length - 1]; }

  return EditorClient;
}());
