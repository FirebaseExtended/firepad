var firepad = firepad || { };

firepad.RichTextCodeMirror = (function () {
  var utils = firepad.utils;
  var RichTextOriginPrefix = 'cmrt-';

  function RichTextCodeMirror(codeMirror) {
    this.codeMirror = codeMirror;

    bind(this, 'onCodeMirrorBeforeChange_');
    bind(this, 'onCodeMirrorChange_');

    if (parseInt(CodeMirror.version) >= 4) {
      this.codeMirror.on('changes', this.onCodeMirrorChange_);
    } else {
      this.codeMirror.on('change', this.onCodeMirrorChange_);
    }
    this.codeMirror.on('beforeChange', this.onCodeMirrorBeforeChange_);

    this.changeId_ = 0;
    this.outstandingChanges_ = { };
  }
  utils.makeEventEmitter(RichTextCodeMirror, ['change']);

  RichTextCodeMirror.prototype.detach = function() {
    this.codeMirror.off('beforeChange', this.onCodeMirrorBeforeChange_);
    this.codeMirror.off('change', this.onCodeMirrorChange_);
    this.codeMirror.off('changes', this.onCodeMirrorChange_);
  };

  RichTextCodeMirror.prototype.replaceText = function(start, end, text, origin) {
    this.changeId_++;
    var newOrigin = RichTextOriginPrefix + this.changeId_;
    this.outstandingChanges_[newOrigin] = { origOrigin: origin };

    var cm = this.codeMirror;
    var from = cm.posFromIndex(start);
    var to = typeof end === 'number' ? cm.posFromIndex(end) : null;
    cm.replaceRange(text, from, to, newOrigin);
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

  RichTextCodeMirror.prototype.getRange = function(start, end) {
    var from = this.codeMirror.posFromIndex(start), to = this.codeMirror.posFromIndex(end);
    return this.codeMirror.getRange(from, to);
  };

  RichTextCodeMirror.prototype.onCodeMirrorBeforeChange_ = function(cm, change) {
    // Remove LineSentinelCharacters from incoming input (e.g copy/pasting)
    if (change.origin === '+input' || change.origin === 'paste') {
      var newText = [];
      for(var i = 0; i < change.text.length; i++) {
        newText.push(change.text[i]);
      }
      change.update(change.from, change.to, newText);
    }
  };

  function cmpPos (a, b) {
    return (a.line - b.line) || (a.ch - b.ch);
  }
  function posEq (a, b) { return cmpPos(a, b) === 0; }
  function posLe (a, b) { return cmpPos(a, b) <= 0; }

  function last (arr) { return arr[arr.length - 1]; }

  function sumLengths (strArr) {
    if (strArr.length === 0) { return 0; }
    var sum = 0;
    for (var i = 0; i < strArr.length; i++) { sum += strArr[i].length; }
    return sum + strArr.length - 1;
  }

  RichTextCodeMirror.prototype.onCodeMirrorChange_ = function(cm, cmChanges) {
    // Handle single change objects and linked lists of change objects.
    if (typeof cmChanges.from === 'object') {
      var changeArray = [];
      while (cmChanges) {
        changeArray.push(cmChanges);
        cmChanges = cmChanges.next;
      }
      cmChanges = changeArray;
    }

    var changes = this.convertCoordinateSystemForChanges_(cmChanges);
    var newChanges = [];

    for (var i = 0; i < changes.length; i++) {
      var change = changes[i];
      var start = change.start, end = change.end, text = change.text, removed = change.removed, origin = change.origin;

      if (removed.length > 0) {
        newChanges.push({ start: start, end: end, removed: removed, text: "", origin: change.origin });
      }

      if (text.length > 0) {
        if (origin in this.outstandingChanges_) {
          origin = this.outstandingChanges_[origin].origOrigin;
          delete this.outstandingChanges_[origin];
        }

        newChanges.push({ start: start, end: start, removed: "", text: text, origin: origin });
      }
    }

     if (newChanges.length > 0) {
       this.trigger('change', this, newChanges);
     }
   };

  RichTextCodeMirror.prototype.convertCoordinateSystemForChanges_ = function(changes) {
    // We have to convert the positions in the pre-change coordinate system to indexes.
    // CodeMirror's `indexFromPos` method does this for the current state of the editor.
    // We can use the information of a single change object to convert a post-change
    // coordinate system to a pre-change coordinate system. We can now proceed inductively
    // to get a pre-change coordinate system for all changes in the linked list.  A
    // disadvantage of this approach is its complexity `O(n^2)` in the length of the
    // linked list of changes.

    var self = this;
    var indexFromPos = function (pos) {
      return self.codeMirror.indexFromPos(pos);
    };

    function updateIndexFromPos (indexFromPos, change) {
      return function (pos) {
        if (posLe(pos, change.from)) { return indexFromPos(pos); }
        if (posLe(change.to, pos)) {
          return indexFromPos({
            line: pos.line + change.text.length - 1 - (change.to.line - change.from.line),
            ch: (change.to.line < pos.line) ?
                pos.ch :
                (change.text.length <= 1) ?
                    pos.ch - (change.to.ch - change.from.ch) + sumLengths(change.text) :
                    pos.ch - change.to.ch + last(change.text).length
          }) + sumLengths(change.removed) - sumLengths(change.text);
        }
        if (change.from.line === pos.line) {
          return indexFromPos(change.from) + pos.ch - change.from.ch;
        }
        return indexFromPos(change.from) +
            sumLengths(change.removed.slice(0, pos.line - change.from.line)) +
            1 + pos.ch;
      };
    }

    var newChanges = [];
    for (var i = changes.length - 1; i >= 0; i--) {
      var change = changes[i];
      indexFromPos = updateIndexFromPos(indexFromPos, change);

      var start = indexFromPos(change.from);

      var removedText = change.removed.join('\n');
      var text = change.text.join('\n');
      newChanges.unshift({ start: start, end: start + removedText.length, removed: removedText, text: text,
        origin: change.origin});
    }
    return newChanges;
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
