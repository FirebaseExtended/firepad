var firepad,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice;

if (typeof firepad === "undefined" || firepad === null) {
  firepad = {};
}

firepad.MonacoAdapter = (function (listener) {
  ACEAdapter.prototype.ignoreChanges = false;

  function MonacoAdapter(monacoInstance) {
    this.onCursorActivity = __bind(this.onCursorActivity, this);
    this.onFocus = __bind(this.onFocus, this);
    this.onBlur = __bind(this.onBlur, this);
    this.onChange = __bind(this.onChange, this);
    var _ref;
    this.monaco = monacoInstance;
    this.monacoModel = this.monaco.getModel();
    // this.aceDoc = this.aceSession.getDocument();
    // this.aceDoc.setNewLineMode('unix');
    this.grabDocumentState();
    this.monaco.onDidChangeModelContent(this.onChange,);
    this.monaco.onDidBlurEditor(this.onBlur);
    this.monaco.onDidFocusEditor(this.onFocus);
    this.monaco.onDidChangeCursorPosition(this.onCursorActivity);
    //   if (this.aceRange == null) {
    //     this.aceRange = ((_ref = ace.require) != null ? _ref : require)("ace/range").Range;
    //   }
    // }

  MonacoAdapter.prototype.grabDocumentState = function() {
    this.lastDocLines = this.monacoModel.getLinesContent();
    var range = this.monaco.getSelection();
    var rangeObj = {end : {row : '', column: ''}, start : {row : '', column: ''}};
    // To keep the output format same for monaco and ace
    rangeObj['end'].row = range.endLineNumber;
    rangeObj['end'].column = range.endColumn;
    rangeObj['start'].row = range.startLineNumber;
    rangeObj['start'].column = range.startColumn;
    return this.lastCursorRange = rangeObj;
  };

  MonacoAdapter.prototype.detach = function() {
    this.monaco.removeListener('change', this.onChange);
    this.monaco.removeListener('blur', this.onBlur);
    this.monaco.removeListener('focus', this.onFocus);
    return this.aceSession.selection.removeListener('changeCursor', this.onCursorActivity);
  };

  MonacoAdapter.prototype.onChange = function(change) {
    var pair;
    if (!this.ignoreChanges) {
      pair = this.operationFromMonacoChange(change);
      this.trigger.apply(this, ['change'].concat(__slice.call(pair)));
      return this.grabDocumentState();
    }
  };

  MonacoAdapter.prototype.onBlur = function() {
    if (this.ace.selection.isEmpty()) {
      return this.trigger('blur');
    }
  };

  MonacoAdapter.prototype.onFocus = function() {
    return this.trigger('focus');
  };

  MonacoAdapter.prototype.onCursorActivity = function() {
    var _this = this;
    return setTimeout(function() {
      return _this.trigger('cursorActivity');
    }, 0);
  };

  MonacoAdapter.prototype.operationFromMonacoChange = function(change) {
    var action, delete_op, delta, insert_op, restLength, start, text, _ref;
    if (change.data) {
      delta = change.data;
      if ((_ref = delta.action) === 'insertLines' || _ref === 'removeLines') {
        text = delta.lines.join('\n') + '\n';
        action = delta.action.replace('Lines', '');
      } else {
        text = delta.text.replace(this.aceDoc.getNewLineCharacter(), '\n');
        action = delta.action.replace('Text', '');
      }
      start = this.indexFromPos(delta.range.start);
    } else {
      text = change.lines.join('\n');
      start = this.indexFromPos(change.start);
    }
    restLength = this.lastDocLines.join('\n').length - start;
    if (change.action === 'remove') {
      restLength -= text.length;
    }
    insert_op = new firepad.TextOperation().retain(start).insert(text).retain(restLength);
    delete_op = new firepad.TextOperation().retain(start)["delete"](text).retain(restLength);
    if (change.action === 'remove') {
      return [delete_op, insert_op];
    } else {
      return [insert_op, delete_op];
    }
  };

  MonacoAdapter.prototype.applyOperationToMonaco = function(operation) {
    var from, index, op, range, to, _i, _len, _ref;
    index = 0;
    _ref = operation.ops;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      op = _ref[_i];
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

  MonacoAdapter.prototype.posFromIndex = function(index) {
    var line, row, _i, _len, _ref;
    _ref = this.aceDoc.$lines;
    for (row = _i = 0, _len = _ref.length; _i < _len; row = ++_i) {
      line = _ref[row];
      if (index <= line.length) {
        break;
      }
      index -= line.length + 1;
    }
    return {
      row: row,
      column: index
    };
  };

  MonacoAdapter.prototype.indexFromPos = function(pos, lines) {
    var i, index, _i, _ref;
    if (lines == null) {
      lines = this.lastDocLines;
    }
    index = 0;
    for (i = _i = 0, _ref = pos.row; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      index += this.lastDocLines[i].length + 1;
    }
    return index += pos.column;
  };

  MonacoAdapter.prototype.getValue = function() {
    return this.aceDoc.getValue();
  };

  MonacoAdapter.prototype.getCursor = function() {
    var e, e2, end, start, _ref, _ref1;
    try {
      start = this.indexFromPos(this.aceSession.selection.getRange().start, this.aceDoc.$lines);
      end = this.indexFromPos(this.aceSession.selection.getRange().end, this.aceDoc.$lines);
    } catch (_error) {
      e = _error;
      try {
        start = this.indexFromPos(this.lastCursorRange.start);
        end = this.indexFromPos(this.lastCursorRange.end);
      } catch (_error) {
        e2 = _error;
        console.log("Couldn't figure out the cursor range:", e2, "-- setting it to 0:0.");
        _ref = [0, 0], start = _ref[0], end = _ref[1];
      }
    }
    if (start > end) {
      _ref1 = [end, start], start = _ref1[0], end = _ref1[1];
    }
    return new firepad.Cursor(start, end);
  };

  MonacoAdapter.prototype.setCursor = function(cursor) {
    var end, start, _ref;
    start = this.posFromIndex(cursor.position);
    end = this.posFromIndex(cursor.selectionEnd);
    if (cursor.position > cursor.selectionEnd) {
      _ref = [end, start], start = _ref[0], end = _ref[1];
    }
    return this.aceSession.selection.setSelectionRange(new this.aceRange(start.row, start.column, end.row, end.column));
  };

  MonacoAdapter.prototype.setOtherCursor = function(cursor, color, clientId) {
    var clazz, css, cursorRange, end, justCursor, self, start, _ref,
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
      clazz = clazz.replace('selection', 'cursor');
    }
    css = "." + clazz + " {\n  position: absolute;\n  background-color: " + (justCursor ? 'transparent' : color) + ";\n  border-left: 2px solid " + color + ";\n}";
    this.addStyleRule(css);
    this.otherCursors[clientId] = cursorRange = new this.aceRange(start.row, start.column, end.row, end.column);
    self = this;
    cursorRange.clipRows = function() {
      var range;
      range = self.aceRange.prototype.clipRows.apply(this, arguments);
      range.isEmpty = function() {
        return false;
      };
      return range;
    };
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

  MonacoAdapter.prototype.addStyleRule = function(css) {
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

  MonacoAdapter.prototype.registerCallbacks = function(callbacks) {
    this.callbacks = callbacks;
  };

  MonacoAdapter.prototype.trigger = function() {
    var args, event, _ref, _ref1;
    event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return (_ref = this.callbacks) != null ? (_ref1 = _ref[event]) != null ? _ref1.apply(this, args) : void 0 : void 0;
  };

  MonacoAdapter.prototype.applyOperation = function(operation) {
    if (!operation.isNoop()) {
      this.ignoreChanges = true;
    }
    this.applyOperationToMonaco(operation);
    return this.ignoreChanges = false;
  };

  MonacoAdapter.prototype.registerUndo = function(undoFn) {
    return this.ace.undo = undoFn;
  };

  MonacoAdapter.prototype.registerRedo = function(redoFn) {
    return this.ace.redo = redoFn;
  };

  MonacoAdapter.prototype.invertOperation = function(operation) {
    return operation.invert(this.getValue());
  };

  return MonacoAdapter;

})();
