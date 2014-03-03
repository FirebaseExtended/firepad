var AtomAdapter, Range, firepad,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Range = require('atom').Range;

if (typeof firepad === "undefined" || firepad === null) {
  firepad = {};
}

firepad.AtomAdapter = AtomAdapter = (function() {
  AtomAdapter.prototype.ignoreChanges = false;

  function AtomAdapter(atom) {
    this.atom = atom;
    this.onChange = __bind(this.onChange, this);
    this.buffer = this.atom.buffer;
    this.grabDocumentState();
    this.buffer.on('changed', this.onChange);
  }

  AtomAdapter.prototype.grabDocumentState = function() {
    this.lastDocState = this.atom.getText();
    return this.lastDocLines = this.buffer.getLines();
  };

  AtomAdapter.prototype.detach = function() {
    return this.buffer.off('changed');
  };

  AtomAdapter.prototype.onChange = function(change) {
    var pair;
    if (!this.ignoreChanges) {
      pair = this.operationFromAtomChange(change);
      this.firepadTriggers['change'].apply(this, pair);
      return this.grabDocumentState();
    }
  };

  AtomAdapter.prototype.operationFromAtomChange = function(change) {
    var current, inverse, operation, remaining, start;
    current = this.buffer.getMaxCharacterIndex();
    start = this.buffer.characterIndexForPosition(change.newRange.start);
    remaining = current - this.buffer.characterIndexForPosition(change.newRange.end);
    operation = new firepad.TextOperation().retain(start)["delete"](change.oldText).insert(change.newText).retain(remaining);
    inverse = new firepad.TextOperation().retain(start)["delete"](change.newText).insert(change.oldText).retain(remaining);
    return [operation, inverse];
  };

  AtomAdapter.prototype.applyOperationToAtom = function(operation) {
    var from, index, op, to, _i, _len, _ref;
    index = 0;
    _ref = operation.ops;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      op = _ref[_i];
      if (op.isRetain()) {
        index += op.chars;
      } else if (op.isInsert()) {
        this.buffer.insert(this.buffer.positionForCharacterIndex(index), op.text);
        index += op.text.length;
      } else if (op.isDelete()) {
        from = this.buffer.positionForCharacterIndex(index);
        to = this.buffer.positionForCharacterIndex(index + op.chars);
        this.buffer["delete"](new Range(from, to));
      }
    }
    return this.grabDocumentState();
  };

  AtomAdapter.prototype.getValue = function() {
    return this.atom.getText();
  };

  AtomAdapter.prototype.getCursor = function() {
    var cursor, end, index, range, selection, start;
    selection = this.atom.getLastSelection();
    if (selection) {
      range = selection.getBufferRange();
      start = this.buffer.characterIndexForPosition(range.start);
      end = this.buffer.characterIndexForPosition(range.end);
      return new firepad.Cursor(start, end);
    }
    cursor = this.atom.getCursor();
    index = this.buffer.characterIndexForPosition(cursor.getBufferPosition());
    return new firepad.Cursor(index, index);
  };

  AtomAdapter.prototype.setCursor = function(cursor) {
    var end, start, _ref;
    start = this.posFromIndex(cursor.position);
    end = this.posFromIndex(cursor.selectionEnd);
    if (cursor.position > cursor.selectionEnd) {
      _ref = [end, start], start = _ref[0], end = _ref[1];
    }
    return this.aceSession.selection.setSelectionRange(new this.aceRange(start.row, start.column, end.row, end.column));
  };

  AtomAdapter.prototype.setOtherCursor = function(cursor, color, clientId) {};

  AtomAdapter.prototype.registerCallbacks = function(firepadTriggers) {
    this.firepadTriggers = firepadTriggers;
  };

  AtomAdapter.prototype.applyOperation = function(operation) {
    if (!operation.isNoop()) {
      this.ignoreChanges = true;
    }
    this.applyOperationToAtom(operation);
    return this.ignoreChanges = false;
  };

  AtomAdapter.prototype.registerUndo = function(undoFn) {
    return this.undo = undoFn;
  };

  AtomAdapter.prototype.registerRedo = function(redoFn) {
    return this.redo = redoFn;
  };

  AtomAdapter.prototype.invertOperation = function(operation) {
    return operation.invert(this.getValue());
  };

  return AtomAdapter;

})();
