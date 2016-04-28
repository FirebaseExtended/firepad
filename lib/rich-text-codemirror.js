var firepad = firepad || { };

firepad.RichTextCodeMirror = (function () {
  var utils = firepad.utils;

  function RichTextCodeMirror(codeMirror) {
    this.codeMirror = codeMirror;

    bind(this, 'onCodeMirrorChange_');

    if (parseInt(CodeMirror.version) >= 4) {
      this.codeMirror.on('changes', this.onCodeMirrorChange_);
    } else {
      this.codeMirror.on('change', this.onCodeMirrorChange_);
    }

    this.changeId_ = 0;
  }
  utils.makeEventEmitter(RichTextCodeMirror, ['change']);

  RichTextCodeMirror.prototype.detach = function() {
    this.codeMirror.off('change', this.onCodeMirrorChange_);
    this.codeMirror.off('changes', this.onCodeMirrorChange_);
  };

  RichTextCodeMirror.prototype.replaceText = function(start, end, text, origin) {
    this.changeId_++;

    var cm = this.codeMirror;
    var from = cm.posFromIndex(start);
    var to = typeof end === 'number' ? cm.posFromIndex(end) : null;
    cm.replaceRange(text, from, to, origin);
  };

  RichTextCodeMirror.prototype.insertText = function(index, text, origin) {
    var cm = this.codeMirror;
    var cursor = cm.getCursor();
    var resetCursor = origin == 'RTCMADAPTER' && !cm.somethingSelected() && index == cm.indexFromPos(cursor);
    this.replaceText(index, null, text, origin);
    if (resetCursor) cm.setCursor(cursor);
  };

  RichTextCodeMirror.prototype.removeText = function(start, end, origin) {
    var cm = this.codeMirror;
    cm.replaceRange("", cm.posFromIndex(start), cm.posFromIndex(end), origin);
  };

  RichTextCodeMirror.prototype.end = function() {
    var lastLine = this.codeMirror.lineCount() - 1;
    return this.codeMirror.indexFromPos({line: lastLine, ch: this.codeMirror.getLine(lastLine).length});
  };

  RichTextCodeMirror.prototype.onCodeMirrorChange_ = function(cm, cmChanges) {
     this.trigger('change', this, cmChanges);
   };

  RichTextCodeMirror.prototype.getText = function() {
    return this.codeMirror.getValue();
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

  return RichTextCodeMirror;
})();
