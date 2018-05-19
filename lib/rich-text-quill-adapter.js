var firepad = firepad || { };

firepad.RichTextQuillAdapter = (function () {
  'use strict';

  var WrappedOperation = firepad.WrappedOperation;
  var Cursor = firepad.Cursor;
  var Delta = Quill.import('delta');

  function RichTextQuillAdapter (quill) {
    this.quill = quill;

    bind(this, 'onChange');
    bind(this, 'onSelectionChange');

    this.quill.on('text-change', this.onChange);
    this.quill.on('selection-change', this.onSelectionChange);
  }

  // Removes all event listeners from the CodeMirror instance.
  RichTextQuillAdapter.prototype.detach = function () {
    this.quill.off('text-change', this.onChange);
    this.quill.off('selection-change', this.onSelectionChange);
  };

  RichTextQuillAdapter.prototype.registerCallbacks = function (cb) {
    this.callbacks = cb;
  };

  RichTextQuillAdapter.prototype.onChange = function (delta, oldDelta, source) {
    if (source !== 'user') {
      return;
    }
    this.trigger('change', delta, this.invertOperation(delta, oldDelta));
  };

  RichTextQuillAdapter.prototype.onSelectionChange = function (range, oldRange, source) {
    if (source !== 'user') {
      return;
    }
    if (range) {
      // We want to push cursor changes to Firebase AFTER edits to the history,
      // because the cursor coordinates will already be in post-change units.
      // Sleeping for 1ms ensures that sendCursor happens after sendOperation.
      var self = this;
      setTimeout(function() {
        self.trigger('cursorActivity');
      }, 1);
    } else if (!this.quill.hasFocus()) {
      this.trigger('blur');
    }
  };

  RichTextQuillAdapter.prototype.getCursor = function () {
    if (this.quill.hasFocus()) {
      var range = this.quill.getSelection();
      return new Cursor(range.index, range.index + range.length);
    }
    return null;
  };

  RichTextQuillAdapter.prototype.setCursor = function (cursor) {
    this.quill.setSelection(cursor.position, cursor.selectionEnd - cursor.position);
  };

  RichTextQuillAdapter.prototype.setOtherCursor = function (cursor, color, clientId) {
    return;
  };

  RichTextQuillAdapter.prototype.trigger = function (event) {
    var args = Array.prototype.slice.call(arguments, 1);
    var action = this.callbacks && this.callbacks[event];
    if (action) { action.apply(this, args); }
  };

  // Apply an operation to a CodeMirror instance.
  RichTextQuillAdapter.prototype.applyOperation = function (operation) {
    this.quill.updateContents(operation);
  };

  RichTextQuillAdapter.prototype.registerUndo = function (undoFn) {
  };

  RichTextQuillAdapter.prototype.registerRedo = function (redoFn) {
  };

  RichTextQuillAdapter.prototype.invertOperation = function(operation, oldContent) {
    // TODO: larry not implemented yet
    var inverse = new Delta();
    if (operation instanceof WrappedOperation) {
      return new WrappedOperation(inverse, operation.meta.invert());
    }
    return inverse;
  };

  // Bind a method to an object, so it doesn't matter whether you call
  // object.method() directly or pass object.method as a reference to another
  // function.
  function bind (obj, method) {
    var fn = obj[method];
    obj[method] = function () {
      fn.apply(obj, arguments);
    };
  }

  Delta.prototype.equals = function (other) {
    if (this.ops.length !== other.ops.length) { return false; }
    for (var i = 0; i < this.ops.length; i++) {
      if (typeof this.ops[i]['delete'] === 'number') {
        if (this.ops[i]['delete'] !== other.ops[i]['delete']) { return false; }
      } else if (typeof this.ops[i].retain === 'number') {
        if (this.ops[i].retain !== other.ops[i].retain || !attributesEqual(this.ops[i].attributes, other.ops[i].attributes)) { return false; }
      } else if (typeof this.ops[i].insert === 'string') {
        if (this.ops[i].insert !== other.ops[i].insert || !attributesEqual(this.ops[i].attributes, other.ops[i].attributes)) { return false; }
      } else {
        var embed = Object.keys(this.ops[i].insert)[0];
        if (typeof this.ops[i].insert[embed] !== 'object') {
          if (this.ops[i].insert[embed] !== other.ops[i].insert[embed] || !attributesEqual(this.ops[i].attributes, other.ops[i].attributes)) { return false; }
        } else {
          if (!attributesEqual(this.ops[i].insert[embed],  other.ops[i].insert[embed])
              || !attributesEqual(this.ops[i].attributes, other.ops[i].attributes)) { return false; }
        }
      }
    }
    return true;
  };
  function attributesEqual (attributes1, attributes2) {
    if ((attributes1 === undefined || attributes2 === undefined) && attributes1 !== attributes2) { return false; }
    for (var attr in attributes1) {
      if (attributes1[attr] !== attributes2[attr]) { return false; }
    }
    for (attr in attributes2) {
      if (attributes1[attr] !== attributes2[attr]) { return false; }
    }
    return true;
  }

  return RichTextQuillAdapter;
}());
