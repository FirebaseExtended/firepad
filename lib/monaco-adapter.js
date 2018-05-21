/**
 * TODO:
 * 1. Update detach
 * 2. Modify setCursor
 * 3. Modify setOtherCursor
 * @type {MonacoAdapter}
 */

firepad.MonacoAdapter = (function() {
  MonacoAdapter.prototype.ignoreChanges = false;

  function MonacoAdapter(monacoInstance) {
    this.onCursorActivity = __bind(this.onCursorActivity, this);
    this.onFocus = __bind(this.onFocus, this);
    this.onBlur = __bind(this.onBlur, this);
    this.onChange = __bind(this.onChange, this);
    this.monaco = monacoInstance;
    this.monacoModel = this.monaco.getModel();

    this.grabDocumentState();
    this.monaco.onDidChangeModelContent(this.onChange);
    this.monaco.onDidBlurEditor(this.onBlur);
    this.monaco.onDidFocusEditor(this.onFocus);
    this.monaco.onDidChangeCursorPosition(this.onCursorActivity);
  }

  MonacoAdapter.prototype.grabDocumentState = function() {
    this.lastDocLines = this.monacoModel.getLinesContent();
    var range = this.monaco.getSelection();
    return this.lastCursorRange = range;
  };

  MonacoAdapter.prototype.detach = function() {
    // this.monaco.removeListener('change', this.onChange);
    // this.monaco.removeListener('blur', this.onBlur);
    // this.monaco.removeListener('focus', this.onFocus);
    // return this.monaco.removeListener('changeCursor', this.onCursorActivity);
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
    if (this.monaco.getSelection().isEmpty()) {
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

  // Index for column and row starts with 1
  MonacoAdapter.prototype.operationFromMonacoChange = function(change) {
    console.log(change);

    var delete_op, insert_op, restLength, start, text;

    text = change.changes[0].text;
    start = this.indexFromPos(change.changes[0].range, 'start');
    restLength = this.lastDocLines.join('\n').length - start;
    text_m = change.changes[0].text;


    if (change.changes[0].rangeLength > 0) {
      restLength -= change.changes[0].rangeLength;
      text = this.lastDocLines.join('\n').slice(start, start+change.changes[0].rangeLength);
    }
    console.log('start', start);
    console.log('text', text);
    console.log("restLength", restLength);
    insert_op = new firepad.TextOperation().retain(start).insert(text).retain(restLength);
    delete_op = new firepad.TextOperation().retain(start)["delete"](text).retain(restLength);
    if (change.changes[0].text === "" && change.changes[0].rangeLength > 0) {
      return [delete_op, insert_op];
    } else if(change.changes[0].text !== "" && change.changes[0].rangeLength > 0) {
      dop = new firepad.TextOperation().retain(start)["delete"](text)
          .insert(text_m).retain(restLength);
      iop = new firepad.TextOperation().retain(start)["delete"](text_m)
          .insert(text).retain(restLength);
      return [dop, iop]
    } else {
      return [insert_op, delete_op];
    }
  };

  MonacoAdapter.prototype.applyOperationToMonaco = function(operation) {
    var from, index, op, to, _i, _len, _ref;
    index = 0;
      _ref = operation.ops;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      op = _ref[_i];
      if (op.isRetain()) {
        index += op.chars;
      } else if (op.isInsert()) {
        var range = new monaco.Range(this.posFromIndex(index).row,
          this.posFromIndex(index).column,
          this.posFromIndex(index).row,
          this.posFromIndex(index).column);
        var id = { major: 1, minor: 1 };
        var ops = {identifier: id, range: range, text: op.text, forceMoveMarkers: true};
        editor.executeEdits("my-source", [ops]);
        index += op.text.length;
      } else if (op.isDelete()) {
        from = this.posFromIndex(index);
        to = this.posFromIndex(index + op.chars);
        var range = new monaco.Range(from.row, from.column, to.row, to.column);
        var id = { major: 1, minor: 2 };
        var ops = {identifier: id, range: range, text: "", forceMoveMarkers: true};
        editor.executeEdits("my-source", [ops]);
      }
    }
    return this.grabDocumentState();
  };

  MonacoAdapter.prototype.posFromIndex = function(index) {
    var line, row, _i, _len, _ref;
    _ref = this.lastDocLines;
    for (row = _i = 0, _len = _ref.length; _i < _len; row = ++_i) {
      line = _ref[row];
      if (index <= line.length) {
        break;
      }
      index -= line.length + 1;
    }
    return {
      row: row + 1, // Index starts from 1
      column: index + 1 // Index starts from 1
    };
  };

  MonacoAdapter.prototype.indexFromPos = function(range, upto, lines) {
    var index;
    if (lines == null) {
      lines = this.lastDocLines;
    }
    index = 0;
    if (upto === 'start') {
      for (row = 1; row < range.startLineNumber; row++) {
        index += lines[row-1].length + 1
      }
      return index + range.startColumn -1; // Index starts from 1
    } else {
      for (row = 1; row < range.endLineNumber; row++) {
        index += lines[row-1].length + 1
      }
      return index + range.endColumn -1; // Index starts from 1
    }
  };

  MonacoAdapter.prototype.getValue = function() {
    return this.monacoModel.getValue();
  };

  MonacoAdapter.prototype.getCursor = function() {
    console.log('get Cursor call');
    var e, e2, end, start, _ref, _ref1;
    try {
      start = this.indexFromPos(this.monaco.getSelection(), 'start', this.lastDocLines);
      end = this.indexFromPos(this.monaco.getSelection(), 'end', this.lastDocLines);
    } catch (_error) {
      e = _error;
      try {
        start = this.indexFromPos(this.lastCursorRange, 'start');
        end = this.indexFromPos(this.lastCursorRange, 'end');
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
    start = this.posFromIndex(cursor.position); // Index starts from 1
    end = this.posFromIndex(cursor.selectionEnd); // Index starts from 1
    if (cursor.position > cursor.selectionEnd) {
      _ref = [end, start], start = _ref[0], end = _ref[1];
    }
    return this.monaco.setSelection(new monaco.Range(start.row, start.column, end.row, end.column));
  };

  MonacoAdapter.prototype.setOtherCursor = function(cursor, color, clientId) {
    if (this.otherCursors == null){
      this.otherCursors = {};
      this.otherCursors[clientId] = [];
    }

    console.log('setOtherCursor call');
    start = this.posFromIndex(cursor.position);
    end = this.posFromIndex(cursor.selectionEnd);
    clazz = "other-client-selection-" + (color.replace('#', ''));
    if (start < 0 || end < 0 || start > end) {
      return;
    }
    if(cursor.position === cursor.selectionEnd){
      // show cursor
      clazz = clazz.replace('selection', 'cursor');
      css = "." + clazz + " {\n  position: absolute;\n  background-color: " + (1 ? 'transparent' : color) + ";\n  border-left: 2px solid " + color + ";\n}";
      this.addStyleRule(css);
      this.otherCursors[clientId] = this.monaco.deltaDecorations(this.otherCursors[clientId],
          [{ range: new monaco.Range(start.row, start.column, end.row, end.column),
          options: {className: clazz}},]);
    } else {
      // show selection
      css = "." + clazz + " {\n  position: absolute;\n  background-color: " + (0 ? 'transparent' : color) + ";\n  border-left: 2px solid " + color + ";\n}";
      this.addStyleRule(css);
      this.otherCursors[clientId] = this.monaco.deltaDecorations(this.otherCursors[clientId],
          [{ range: new monaco.Range(start.row, start.column, end.row, end.column),
              options: {className: clazz}},]);
    }
  };

  MonacoAdapter.prototype.addStyleRule = function(css) {
    console.log('called');
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

  // MonacoAdapter.prototype.trigger = function() {
  //   var args, event, _ref, _ref1;
  //   event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  //   console.log('event', event);
  //   console.log('args', arguments);
  //   return (_ref = this.callbacks) != null ? (_ref1 = _ref[event]) != null ? _ref1.apply(this, args) : void 0 : void 0;
  // };

  MonacoAdapter.prototype.trigger = function (event) {
      var args = Array.prototype.slice.call(arguments, 1);
      var action = this.callbacks && this.callbacks[event];
      if (action) { action.apply(this, args); }
  };

  MonacoAdapter.prototype.applyOperation = function(operation) {
    if (!operation.isNoop()) {
      this.ignoreChanges = true;
    }
    this.applyOperationToMonaco(operation);
    return this.ignoreChanges = false;
  };

  MonacoAdapter.prototype.registerUndo = function(undoFn) {
    return this.monacoModel.undo = undoFn;
  };

  MonacoAdapter.prototype.registerRedo = function(redoFn) {
    return this.monacoModel.redo = redoFn;
  };

  MonacoAdapter.prototype.invertOperation = function(operation) {
    return operation.invert(this.getValue());
  };

  return MonacoAdapter;

})();
