var ACEAdapter, firepad,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice;

if (typeof firepad === "undefined" || firepad === null) {
  firepad = {};
}

firepad.ACEAdapter = ACEAdapter = (function() {
  ACEAdapter.prototype.ignoreChanges = false;

  function ACEAdapter(ace) {
    this.ace = ace;
    this.onCursorActivity = __bind(this.onCursorActivity, this);
    this.onBlur = __bind(this.onBlur, this);
    this.onChange = __bind(this.onChange, this);
    this.aceSession = this.ace.getSession();
    this.aceDoc = this.aceSession.getDocument();
    this.aceDoc.setNewLineMode('unix');
    this.grabDocumentState();
    this.ace.on('change', this.onChange);
    this.ace.on('blur', this.onBlur);
    this.ace.on('focus', this.onCursorActivity);
    this.aceSession.selection.on('changeCursor', this.onCursorActivity);
  }

  ACEAdapter.prototype.grabDocumentState = function() {
    this.lastDocLines = this.aceDoc.getAllLines();
    return this.lastCursorRange = this.aceSession.selection.getRange();
  };

  ACEAdapter.prototype.detach = function() {
    this.ace.removeListener('change', this.onChange);
    this.ace.removeListener('blur', this.onBlur);
    this.ace.removeListener('focus', this.onCursorActivity);
    return this.aceSession.selection.removeListener('changeCursor', this.onCursorActivity);
  };

  ACEAdapter.prototype.onChange = function(change) {
    var pair;
    if (!this.ignoreChanges) {
      pair = this.operationFromACEChange(change);
      this.trigger.apply(this, ['change'].concat(__slice.call(pair)));
      return this.grabDocumentState();
    }
  };

  ACEAdapter.prototype.onBlur = function() {
    if (this.ace.selection.isEmpty()) {
      return this.trigger('blur');
    }
  };

  ACEAdapter.prototype.onCursorActivity = function() {
    return this.trigger('cursorActivity');
  };

  ACEAdapter.prototype.operationFromACEChange = function(change) {
    var action, delta, inverse, operation, restLength, start, text, _ref, _ref1;
    delta = change.data;
    if ((_ref = delta.action) === "insertLines" || _ref === "removeLines") {
      text = delta.lines.join("\n") + "\n";
      action = delta.action.replace("Lines", "");
    } else {
      text = delta.text;
      action = delta.action.replace("Text", "");
    }
    start = this.indexFromPos(delta.range.start);
    restLength = this.lastDocLines.join(this.aceDoc.$autoNewLine).length - start;
    if (action === "remove") {
      restLength -= text.length;
    }
    operation = new firepad.TextOperation().retain(start).insert(text).retain(restLength);
    inverse = new firepad.TextOperation().retain(start)["delete"](text).retain(restLength);
    if (action === 'remove') {
      _ref1 = [inverse, operation], operation = _ref1[0], inverse = _ref1[1];
    }
    return [operation, inverse];
  };

  ACEAdapter.prototype.applyOperationToACE = function(operation) {
    var from, index, op, range, to, _i, _len, _ref, _ref1;
    if (this.aceRange == null) {
      this.aceRange = ((_ref = ace.require) != null ? _ref : require)("ace/range").Range;
    }
    index = 0;
    _ref1 = operation.ops;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      op = _ref1[_i];
      if (op.isRetain()) {
        index += op.chars;
      } else if (op.isInsert()) {
        this.aceDoc.insert(this.posFromIndex(index), op.text);
        index += op.text.length;
      } else if (op.isDelete()) {
        from = this.posFromIndex(index);
        to = this.posFromIndex(index + op.chars);
        range = this.aceRange.fromPoints(from, to);
        this.aceDoc.remove(range);
      }
    }
    return this.grabDocumentState();
  };

  ACEAdapter.prototype.posFromIndex = function(index) {
    var line, row, _i, _len, _ref;
    _ref = this.aceDoc.$lines;
    for (row = _i = 0, _len = _ref.length; _i < _len; row = ++_i) {
      line = _ref[row];
      if (index <= line.length) {
        break;
      }
      index -= line.length + this.aceDoc.$autoNewLine.length;
    }
    return {
      row: row,
      column: index
    };
  };

  ACEAdapter.prototype.indexFromPos = function(pos, lines) {
    var i, index, _i, _ref;
    if (lines == null) {
      lines = this.lastDocLines;
    }
    index = 0;
    for (i = _i = 0, _ref = pos.row; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      index += this.lastDocLines[i].length + this.aceDoc.$autoNewLine.length;
    }
    return index += pos.column;
  };

  ACEAdapter.prototype.getValue = function() {
    return this.aceDoc.getValue();
  };

  ACEAdapter.prototype.getCursor = function() {
    var e, end, start, _ref;
    try {
      start = this.indexFromPos(this.aceSession.selection.getRange().start, this.aceDoc.$lines);
      end = this.indexFromPos(this.aceSession.selection.getRange().end, this.aceDoc.$lines);
    } catch (_error) {
      e = _error;
      start = this.indexFromPos(this.lastCursorRange.start);
      end = this.indexFromPos(this.lastCursorRange.end);
    }
    if (start > end) {
      _ref = [end, start], start = _ref[0], end = _ref[1];
    }
    return new firepad.Cursor(start, end);
  };

  ACEAdapter.prototype.setCursor = function(cursor) {
    var end, start, _ref, _ref1;
    if (this.aceRange == null) {
      this.aceRange = ((_ref = ace.require) != null ? _ref : require)("ace/range").Range;
    }
    start = this.posFromIndex(cursor.position);
    end = this.posFromIndex(cursor.selectionEnd);
    if (cursor.position > cursor.selectionEnd) {
      _ref1 = [end, start], start = _ref1[0], end = _ref1[1];
    }
    return this.aceSession.selection.setSelectionRange(new this.aceRange(start.row, start.column, end.row, end.column));
  };

  ACEAdapter.prototype.setOtherCursor = function(cursor, color, clientId) {
    var clazz, css, cursorRange, end, justCursor, start, _ref,
      _this = this;
    if (this.otherCursors == null) {
      this.otherCursors = {};
    }
    cursorRange = this.otherCursors[clientId];
    if (cursorRange) {
      cursorRange.start.detach();
      cursorRange.end.detach();
      this.aceSession.removeMarker(cursorRange.id);
    }
    start = this.posFromIndex(cursor.position);
    end = this.posFromIndex(cursor.selectionEnd);
    if (cursor.selectionEnd < cursor.position) {
      _ref = [end, start], start = _ref[0], end = _ref[1];
    }
    clazz = "other-client-selection-" + (color.replace('#', ''));
    justCursor = cursor.position === cursor.selectionEnd;
    if (justCursor) {
      end.column += 1;
      clazz = clazz.replace('selection', 'cursor');
    }
    css = "." + clazz + " {\n  position: absolute;\n  background-color: " + (justCursor ? 'transparent' : color) + ";\n  border-left: 2px solid " + color + ";\n}";
    this.addStyleRule(css);
    this.otherCursors[clientId] = cursorRange = new this.aceRange(start.row, start.column, end.row, end.column);
    cursorRange.start = this.aceDoc.createAnchor(cursorRange.start);
    cursorRange.end = this.aceDoc.createAnchor(cursorRange.end);
    cursorRange.id = this.aceSession.addMarker(cursorRange, clazz, "text");
    return {
      clear: function() {
        cursorRange.start.detach();
        cursorRange.end.detach();
        return _this.aceSession.removeMarker(cursorRange.id);
      }
    };
  };

  ACEAdapter.prototype.addStyleRule = function(css) {
    var styleElement;
    if (typeof document === "undefined" || document === null) {
      return;
    }
    if (!this.addedStyleRules) {
      this.addedStyleRules = {};
      styleElement = document.createElement('style');
      document.documentElement.getElementsByTagName('head')[0].appendChild(styleElement);
      this.addedStyleSheet = styleElement.sheet;
    }
    if (this.addedStyleRules[css]) {
      return;
    }
    this.addedStyleRules[css] = true;
    return this.addedStyleSheet.insertRule(css, 0);
  };

  ACEAdapter.prototype.registerCallbacks = function(callbacks) {
    this.callbacks = callbacks;
  };

  ACEAdapter.prototype.trigger = function() {
    var args, event, _ref, _ref1;
    event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return (_ref = this.callbacks) != null ? (_ref1 = _ref[event]) != null ? _ref1.apply(this, args) : void 0 : void 0;
  };

  ACEAdapter.prototype.applyOperation = function(operation) {
    if (!operation.isNoop()) {
      this.ignoreChanges = true;
    }
    this.applyOperationToACE(operation);
    return this.ignoreChanges = false;
  };

  ACEAdapter.prototype.registerUndo = function(undoFn) {
    return this.ace.undo = undoFn;
  };

  ACEAdapter.prototype.registerRedo = function(redoFn) {
    return this.ace.redo = redoFn;
  };

  ACEAdapter.prototype.invertOperation = function(operation) {
    return operation.invert(this.getValue());
  };

  return ACEAdapter;

})();
