firepad.MonacoAdapter = (function () {
  var __bind = function (fn, me) { return function () { return fn.apply(me, arguments); }; }
  var __slice = [].slice;

  MonacoAdapter.prototype.ignoreChanges = false;

  function MonacoAdapter(monacoInstance) {
    this.onCursorActivity = __bind(this.onCursorActivity, this);
    this.onFocus = __bind(this.onFocus, this);
    this.onBlur = __bind(this.onBlur, this);
    this.onChange = __bind(this.onChange, this);
    this.monaco = monacoInstance;
    this.monacoModel = this.monaco.getModel();

    this.grabDocumentState();
    var changeHandler = this.monaco.onDidChangeModelContent(this.onChange);
    var didBlurHandler = this.monaco.onDidBlurEditorWidget(this.onBlur);
    var didFocusHandler = this.monaco.onDidFocusEditorWidget(this.onFocus);
    var didChangeCursorPositionHandler = this.monaco.onDidChangeCursorPosition(this.onCursorActivity);

    this.detach = function () {
      changeHandler.dispose();
      didBlurHandler.dispose();
      didFocusHandler.dispose();
      didChangeCursorPositionHandler.dispose();
    };
  }

  MonacoAdapter.prototype.grabDocumentState = function () {
    this.lastDocLines = this.monacoModel.getLinesContent();
    var range = this.monaco.getSelection();
    return this.lastCursorRange = range;
  };

  MonacoAdapter.prototype.onChange = function (change) {
    var pair;
    if (!this.ignoreChanges) {
      pair = this.operationFromMonacoChange(change);
      this.trigger.apply(this, ['change'].concat(__slice.call(pair)));
      return this.grabDocumentState();
    }
  };

  MonacoAdapter.prototype.onBlur = function () {
    if (this.monaco.getSelection().isEmpty()) {
      return this.trigger('blur');
    }
  };

  MonacoAdapter.prototype.onFocus = function () {
    return this.trigger('focus');
  };

  MonacoAdapter.prototype.onCursorActivity = function () {
    var _this = this;
    return setTimeout(function () {
      return _this.trigger('cursorActivity');
    }, 0);
  };

  MonacoAdapter.prototype.operationFromMonacoChange = function (change) {
    text = change.changes[0].text;
    start = this.indexFromPos(change.changes[0].range, 'start');
    restLength = this.lastDocLines.join(this.monacoModel.getEOL()).length - start;
    text_ins = change.changes[0].text;
    rangeLen = change.changes[0].rangeLength;

    if (change.changes[0].rangeLength > 0) {
      restLength -= rangeLen;
      text = this.lastDocLines.join(this.monacoModel.getEOL())
        .slice(start, start + rangeLen);
    }

    insert_op = new firepad.TextOperation().retain(start).insert(text)
      .retain(restLength);
    delete_op = new firepad.TextOperation().retain(start)["delete"](text)
      .retain(restLength);
    ins_op_ne = new firepad.TextOperation().retain(start)["delete"](text_ins)
      .insert(text).retain(restLength);
    del_op_ne = new firepad.TextOperation().retain(start)["delete"](text)
      .insert(text_ins).retain(restLength);

    if (change.changes[0].text === "" && rangeLen > 0) {
      return [delete_op, insert_op];
    } else if (change.changes[0].text !== "" && rangeLen > 0) {
      return [del_op_ne, ins_op_ne];
    } else {
      return [insert_op, delete_op];
    }
  };

  MonacoAdapter.prototype.applyOperationToMonaco = function (operation) {
    var from, index, op, to, _i, _len, _ref, id, ops, range;
    index = 0;
    _ref = operation.ops;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      op = _ref[_i];
      if (op.isRetain()) {
        index += op.chars;
      } else if (op.isInsert()) {
        range = new monaco.Range(
          this.posFromIndex(index).row,
          this.posFromIndex(index).column,
          this.posFromIndex(index).row,
          this.posFromIndex(index).column
        );
        id = { major: 1, minor: 1 };
        ops = {
          identifier: id, range: range, text: op.text,
          forceMoveMarkers: true
        };
        this.monaco.executeEdits("my-source", [ops]);
        index += op.text.length;
      } else if (op.isDelete()) {
        content = this.monacoModel.getLinesContent();
        from = this.posFromIndex(index, content);
        to = this.posFromIndex(index + op.chars, content);

        range = new monaco.Range(from.row, from.column, to.row, to.column);
        id = { major: 1, minor: 2 };
        ops = {
          identifier: id, range: range, text: "",
          forceMoveMarkers: true
        };
        this.monaco.executeEdits("my-source", [ops]);
      }
    }
    return this.grabDocumentState();
  };

  // Index in monaco starts from 1
  MonacoAdapter.prototype.posFromIndex = function (index, content) {
    var line, row, _i, _len, _ref;
    if (content == null) {
      _ref = this.lastDocLines;
    }
    else {
      _ref = content;
    }
    for (row = _i = 0, _len = _ref.length; _i < _len; row = ++_i) {
      line = _ref[row];
      if (index <= line.length) {
        break;
      }
      index -= line.length + this.monacoModel.getEOL().length;
    }
    return {
      row: row + 1,
      column: index + 1
    };
  };

  // Index in monaco start from 1
  MonacoAdapter.prototype.indexFromPos = function (range, upto, lines) {
    var index;
    if (lines == null) {
      lines = this.lastDocLines;
    }
    index = 0;
    if (upto === 'start') {
      for (row = 1; row < range.startLineNumber; row++) {
        index += lines[row - 1].length + this.monacoModel.getEOL().length;
      }
      return index + range.startColumn - 1;
    } else {
      for (row = 1; row < range.endLineNumber; row++) {
        index += lines[row - 1].length + this.monacoModel.getEOL().length;
      }
      return index + range.endColumn - 1;
    }
  };

  MonacoAdapter.prototype.getValue = function () {
    return this.monacoModel.getValue();
  };

  MonacoAdapter.prototype.getCursor = function () {
    var e, e2, end, start, _ref, _ref1;
    try {
      selection = this.monaco.getSelection();
      start = this.indexFromPos(selection, 'start', this.lastDocLines);
      end = this.indexFromPos(selection, 'end', this.lastDocLines);
    } catch (_error) {
      e = _error;
      try {
        start = this.indexFromPos(this.lastCursorRange, 'start');
        end = this.indexFromPos(this.lastCursorRange, 'end');
      } catch (_error) {
        e2 = _error;
        console.log("Couldn't figure out the cursor range:",
          e2, "-- setting it to 0:0.");
        _ref = [0, 0], start = _ref[0], end = _ref[1];
      }
    }
    if (start > end) {
      _ref1 = [end, start], start = _ref1[0], end = _ref1[1];
    }
    return new firepad.Cursor(start, end);
  };

  MonacoAdapter.prototype.setCursor = function (cursor) {
    var end, start, _ref;
    start = this.posFromIndex(cursor.position);
    end = this.posFromIndex(cursor.selectionEnd);
    if (cursor.position > cursor.selectionEnd) {
      _ref = [end, start], start = _ref[0], end = _ref[1];
    }
    return this.monaco.setSelection(
      new monaco.Range(start.row, start.column, end.row, end.column)
    );
  };

  MonacoAdapter.prototype.setOtherCursor = function (cursor, color, clientId) {
    if (this.otherCursors == null) {
      this.otherCursors = {};
      this.otherCursors[clientId] = [];
    }
    if (this.otherCursors[clientId]) {
      this.otherCursors[clientId] = this.monaco.deltaDecorations(
        this.otherCursors[clientId], []
      );
    }
    start = this.posFromIndex(cursor.position);
    end = this.posFromIndex(cursor.selectionEnd);
    clazz = "other-client-selection-" + (color.replace('#', ''));
    if (start < 0 || end < 0 || start > end) {
      return;
    }
    justCursor = cursor.position === cursor.selectionEnd;
    if (justCursor) {
      // show cursor
      clazz = clazz.replace('selection', 'cursor');
    }
    css = "." + clazz + " {\n  position: relative;\n" +
      "background-color: " + (justCursor ? 'transparent' : color) + ";\n" +
      "border-left: 2px solid " + color + ";\n}";
    this.addStyleRule(css);
    this.otherCursors[clientId] = this.monaco.deltaDecorations(
      this.otherCursors[clientId], [{
        range: new monaco.Range(
          start.row, start.column, end.row, end.column),
        options: { className: clazz }
      },
      ]
    );
    _this = this;
    return {
      clear: function () {
        return _this.monaco.deltaDecorations(
          _this.otherCursors[clientId], []);
      }
    };
  };

  MonacoAdapter.prototype.addStyleRule = function (css) {
    var styleElement;
    if (typeof document === "undefined" || document === null) {
      return;
    }
    if (!this.addedStyleRules) {
      this.addedStyleRules = {};
      styleElement = document.createElement('style');
      document.documentElement.getElementsByTagName('head')[0]
        .appendChild(styleElement);
      this.addedStyleSheet = styleElement.sheet;
    }
    if (this.addedStyleRules[css]) {
      return;
    }
    this.addedStyleRules[css] = true;
    return this.addedStyleSheet.insertRule(css, 0);
  };

  MonacoAdapter.prototype.registerCallbacks = function (callbacks) {
    this.callbacks = callbacks;
  };

  MonacoAdapter.prototype.trigger = function (event) {
    var args = Array.prototype.slice.call(arguments, 1);
    var action = this.callbacks && this.callbacks[event];
    if (action) { action.apply(this, args); }
  };

  MonacoAdapter.prototype.applyOperation = function (operation) {
    if (!operation.isNoop()) {
      this.ignoreChanges = true;
    }
    this.applyOperationToMonaco(operation);
    return this.ignoreChanges = false;
  };

  MonacoAdapter.prototype.registerUndo = function (undoFn) {
    return this.monacoModel.undo = undoFn;
  };

  MonacoAdapter.prototype.registerRedo = function (redoFn) {
    return this.monacoModel.redo = redoFn;
  };

  MonacoAdapter.prototype.invertOperation = function (operation) {
    return operation.invert(this.getValue());
  };

  return MonacoAdapter;

})();