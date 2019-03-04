var firepad;

if (typeof firepad === "undefined" || firepad === null) {
  firepad = {};
}

firepad.ACEAdapter = (function() {
  class ACEAdapter {
    constructor(aceInstance) {
      var ref;
      this.onChange = this.onChange.bind(this);
      this.onBlur = this.onBlur.bind(this);
      this.onFocus = this.onFocus.bind(this);
      this.onCursorActivity = this.onCursorActivity.bind(this);
      this.ace = aceInstance;
      this.aceSession = this.ace.getSession();
      this.aceDoc = this.aceSession.getDocument();
      this.aceDoc.setNewLineMode('unix');
      this.grabDocumentState();
      this.ace.on('change', this.onChange);
      this.ace.on('blur', this.onBlur);
      this.ace.on('focus', this.onFocus);
      this.aceSession.selection.on('changeCursor', this.onCursorActivity);
      if (this.aceRange == null) {
        this.aceRange = ((ref = ace.require) != null ? ref : require)("ace/range").Range;
      }
    }

    grabDocumentState() {
      this.lastDocLines = this.aceDoc.getAllLines();
      return this.lastCursorRange = this.aceSession.selection.getRange();
    }

    // Removes all event listeners from the ACE editor instance
    detach() {
      this.ace.removeListener('change', this.onChange);
      this.ace.removeListener('blur', this.onBlur);
      this.ace.removeListener('focus', this.onFocus);
      return this.aceSession.selection.removeListener('changeCursor', this.onCursorActivity);
    }

    onChange(change) {
      var pair;
      if (!this.ignoreChanges) {
        pair = this.operationFromACEChange(change);
        this.trigger('change', ...pair);
        return this.grabDocumentState();
      }
    }

    onBlur() {
      if (this.ace.selection.isEmpty()) {
        return this.trigger('blur');
      }
    }

    onFocus() {
      return this.trigger('focus');
    }

    onCursorActivity() {
      return setTimeout(() => {
        return this.trigger('cursorActivity');
      }, 0);
    }

    // Converts an ACE change object into a TextOperation and its inverse
    // and returns them as a two-element array.
    operationFromACEChange(change) {
      var action, delete_op, delta, insert_op, ref, restLength, start, text;
      if (change.data) {
        // Ace < 1.2.0
        delta = change.data;
        if ((ref = delta.action) === 'insertLines' || ref === 'removeLines') {
          text = delta.lines.join('\n') + '\n';
          action = delta.action.replace('Lines', '');
        } else {
          text = delta.text.replace(this.aceDoc.getNewLineCharacter(), '\n');
          action = delta.action.replace('Text', '');
        }
        start = this.indexFromPos(delta.range.start);
      } else {
        // Ace 1.2.0+
        text = change.lines.join('\n');
        start = this.indexFromPos(change.start);
      }
      restLength = this.lastDocLines.join('\n').length - start;
      if (change.action === 'remove') {
        restLength -= text.length;
      }
      insert_op = new firepad.TextOperation().retain(start).insert(text).retain(restLength);
      delete_op = new firepad.TextOperation().retain(start).delete(text).retain(restLength);
      if (change.action === 'remove') {
        return [delete_op, insert_op];
      } else {
        return [insert_op, delete_op];
      }
    }

    // Apply an operation to an ACE instance.
    applyOperationToACE(operation) {
      var from, index, j, len, op, range, ref, to;
      index = 0;
      ref = operation.ops;
      for (j = 0, len = ref.length; j < len; j++) {
        op = ref[j];
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
    }

    posFromIndex(index) {
      var j, len, line, ref, row;
      ref = this.aceDoc.$lines;
      for (row = j = 0, len = ref.length; j < len; row = ++j) {
        line = ref[row];
        if (index <= line.length) {
          break;
        }
        index -= line.length + 1;
      }
      return {
        row: row,
        column: index
      };
    }

    indexFromPos(pos, lines) {
      var i, index, j, ref;
      if (lines == null) {
        lines = this.lastDocLines;
      }
      index = 0;
      for (i = j = 0, ref = pos.row; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
        index += this.lastDocLines[i].length + 1;
      }
      return index += pos.column;
    }

    getValue() {
      return this.aceDoc.getValue();
    }

    getCursor() {
      var e, e2, end, start;
      try {
        start = this.indexFromPos(this.aceSession.selection.getRange().start, this.aceDoc.$lines);
        end = this.indexFromPos(this.aceSession.selection.getRange().end, this.aceDoc.$lines);
      } catch (error) {
        e = error;
        try {
          // If the new range doesn't work (sometimes with setValue), we'll use the old range
          start = this.indexFromPos(this.lastCursorRange.start);
          end = this.indexFromPos(this.lastCursorRange.end);
        } catch (error) {
          e2 = error;
          console.log("Couldn't figure out the cursor range:", e2, "-- setting it to 0:0.");
          [start, end] = [0, 0];
        }
      }
      if (start > end) {
        [start, end] = [end, start];
      }
      return new firepad.Cursor(start, end);
    }

    setCursor(cursor) {
      var end, start;
      start = this.posFromIndex(cursor.position);
      end = this.posFromIndex(cursor.selectionEnd);
      if (cursor.position > cursor.selectionEnd) {
        [start, end] = [end, start];
      }
      return this.aceSession.selection.setSelectionRange(new this.aceRange(start.row, start.column, end.row, end.column));
    }

    setOtherCursor(cursor, color, clientId) {
      var clazz, css, cursorRange, end, justCursor, self, start;
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
        [start, end] = [end, start];
      }
      clazz = `other-client-selection-${color.replace('#', '')}`;
      justCursor = cursor.position === cursor.selectionEnd;
      if (justCursor) {
        clazz = clazz.replace('selection', 'cursor');
      }
      css = `.${clazz} {\n  position: absolute;\n  background-color: ${(justCursor ? 'transparent' : color)};\n  border-left: 2px solid ${color};\n}`;
      this.addStyleRule(css);
      this.otherCursors[clientId] = cursorRange = new this.aceRange(start.row, start.column, end.row, end.column);
      // Hack this specific range to, when clipped, return an empty range that
      // pretends to not be empty. This lets us draw markers at the ends of lines.
      // This might be brittle in the future.
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
        // Return something with a clear method to mimic expected API from CodeMirror
        clear: () => {
          cursorRange.start.detach();
          cursorRange.end.detach();
          return this.aceSession.removeMarker(cursorRange.id);
        }
      };
    }

    addStyleRule(css) {
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
    }

    registerCallbacks(callbacks) {
      this.callbacks = callbacks;
    }

    trigger(event, ...args) {
      var ref, ref1;
      return (ref = this.callbacks) != null ? (ref1 = ref[event]) != null ? ref1.apply(this, args) : void 0 : void 0;
    }

    applyOperation(operation) {
      if (!operation.isNoop()) {
        this.ignoreChanges = true;
      }
      this.applyOperationToACE(operation);
      return this.ignoreChanges = false;
    }

    registerUndo(undoFn) {
      return this.ace.undo = undoFn;
    }

    registerRedo(redoFn) {
      return this.ace.redo = redoFn;
    }

    invertOperation(operation) {
      // TODO: Optimize to avoid copying entire text?
      return operation.invert(this.getValue());
    }

  };

  ACEAdapter.prototype.ignoreChanges = false;

  return ACEAdapter;

}).call(this);
