firepad.MonacoAdapter = (function () {
  var __bind = function (fn, me) {
    return function () {
      return fn.apply(me, arguments);
    };
  }
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
      var content = this.lastDocLines.join(this.monacoModel.getEOL());
      var offsetLength = 0;
      try {
        change.changes.reverse().forEach(function(chan) {
          pair = this.operationFromMonacoChange(chan, content, offsetLength);
          offsetLength = offsetLength + (pair[0].targetLength - pair[0].baseLength);
          this.trigger.apply(this, ['change'].concat(__slice.call(pair)));
        }.bind(this))
      } catch (error) {
        firepad.utils.log('Monaco change transformation failed.', error);
        this.trigger('sync_failed');
      }
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

  MonacoAdapter.prototype.operationFromMonacoChange = function (change, content, offsetLength) {
    text = change.text;
    start = change.rangeOffset + offsetLength;

    restLength = content.length - start + offsetLength;
    text_ins = change.text;
    rangeLength = change.rangeLength;

    if (text.length === 0 && rangeLength > 0) {
      // Delete operation.
      var replacedText = content.slice(start, start + rangeLength);

      var delete_op = new firepad.TextOperation()
          .retain(start)
          .delete(rangeLength)
          .retain(restLength - rangeLength);

      var inverse_op = new firepad.TextOperation()
          .retain(start)
          .insert(replacedText)
          .retain(restLength - rangeLength);

      return [delete_op, inverse_op];
    } else if (text.length > 0 && rangeLength > 0) {
      // Replace operation.
      var replacedText = content.slice(start, start + rangeLength);

      var replace_op = new firepad.TextOperation()
          .retain(start)
          .delete(rangeLength)
          .insert(text)
          .retain(restLength - rangeLength);

      var inverse_op = new firepad.TextOperation()
          .retain(start)
          .delete(text.length)
          .insert(replacedText)
          .retain(restLength - rangeLength);

      return [replace_op, inverse_op];
    } else {
      // Insert operation.

      var insert_op = new firepad.TextOperation()
          .retain(start)
          .insert(text)
          .retain(restLength);

      var inverse_op = new firepad.TextOperation()
          .retain(start)
          .delete(text)
          .retain(restLength);

      return [insert_op, inverse_op];
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
        var pos = this.monacoModel.getPositionAt(index);
        range = new monaco.Range(
          pos.lineNumber,
          pos.column,
          pos.lineNumber,
          pos.column
        );
        id = { major: 1, minor: 1 };
        ops = {
          identifier: id, range: range, text: op.text,
          forceMoveMarkers: true
        };
        this.monaco.executeEdits("my-source", [ops]);
        index += op.text.length;
      } else if (op.isDelete()) {
        from = this.monacoModel.getPositionAt(index);
        to = this.monacoModel.getPositionAt(index + op.chars);

        range = new monaco.Range(from.lineNumber, from.column, to.lineNumber, to.column);
        id = { major: 1, minor: 2 };
        ops = {
          identifier: id, range: range, text: "",
          forceMoveMarkers: true
        };
        this.monaco.executeEdits("my-source", [ops]);
      }
    }
    this.grabDocumentState();
  };

  MonacoAdapter.prototype.getValue = function () {
    return this.monacoModel.getValue();
  };

  MonacoAdapter.prototype.getCursor = function () {
    var e, e2, end, start, _ref, _ref1;
    try {
      selection = this.monaco.getSelection();

      if (typeof selection === 'undefined' || selection === null) {
        selection = this.lastCursorRange;
      }

      start = this.monacoModel.getOffsetAt(selection.getStartPosition());
      end = this.monacoModel.getOffsetAt(selection.getEndPosition());
    } catch (_error) {
      e2 = _error;
      console.log("Couldn't figure out the cursor range:",
        e2, "-- setting it to 0:0.");
      _ref = [0, 0], start = _ref[0], end = _ref[1];
    }

    if (start > end) {
      _ref1 = [end, start], start = _ref1[0], end = _ref1[1];
    }
    return new firepad.Cursor(start, end);
  };

  MonacoAdapter.prototype.setCursor = function (cursor) {
    var end, start, _ref;
    start = this.monacoModel.getPositionAt(cursor.position);
    end = this.monacoModel.getPositionAt(cursor.selectionEnd);
    if (cursor.position > cursor.selectionEnd) {
      _ref = [end, start], start = _ref[0], end = _ref[1];
    }
    return this.monaco.setSelection(
      new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column)
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
    } else {
      this.otherCursors[clientId] = [];
    }
    start = this.monacoModel.getPositionAt(cursor.position);
    end = this.monacoModel.getPositionAt(cursor.selectionEnd);
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
          start.lineNumber, start.column, end.lineNumber, end.column),
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
