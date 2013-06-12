var firepad = firepad || { };

firepad.RichTextCodeMirror = (function () {
  var AnnotationList = firepad.AnnotationList;
  var Span = firepad.Span;
  var utils = firepad.utils;
  var ATTR = firepad.AttributeConstants;
  var RichTextClassPrefixDefault = 'cmrt-';
  var RichTextOriginPrefix = 'cmrt-';

  function RichTextCodeMirror(codeMirror, options) {
    this.codeMirror = codeMirror;
    this.options_ = options || { };
    this.currentAttributes_ = null;

    var self = this;
    this.annotationList_ = new AnnotationList(
        function(oldNodes, newNodes) { self.onAnnotationsChanged_(oldNodes, newNodes); });

    // Ensure annotationList is in sync with any existing codemirror contents.
    this.initAnnotationList_();

    bind(this, 'onCodeMirrorChange_');
    bind(this, 'onCursorActivity_');

    this.codeMirror.on('change', this.onCodeMirrorChange_);
    this.codeMirror.on('cursorActivity', this.onCursorActivity_);

    this.changeId_ = 0;
    this.outstandingChanges_ = { };
  }
  utils.makeEventEmitter(RichTextCodeMirror, ['change', 'attributesChange']);

  // A special character we insert at the beginning of lines so we can attach attributes to it to represent
  // "line attributes."  E000 is from the unicode "private use" range.
  var LineSentinelCharacter = '\uE000';
  RichTextCodeMirror.LineSentinelCharacter = LineSentinelCharacter;

  RichTextCodeMirror.prototype.detach = function() {
    this.codeMirror.off('change', this.onCodeMirrorChange_);
    this.codeMirror.off('cursorActivity', this.onCursorActivity_);
    this.clearAnnotations_();
  };

  RichTextCodeMirror.prototype.toggleAttribute = function(attribute) {
    if (this.emptySelection_()) {
      var attrs = this.getCurrentAttributes_();
      if (attrs[attribute] === true) {
        delete attrs[attribute];
      } else {
        attrs[attribute] = true;
      }
      this.currentAttributes_ = attrs;
    } else {
      var attributes = this.getCurrentAttributes_();
      var newValue = (attributes[attribute] !== true);
      this.setAttribute(attribute, newValue);
    }
  };

  RichTextCodeMirror.prototype.setAttribute = function(attribute, value) {
    var cm = this.codeMirror;
    if (this.emptySelection_()) {
      var attrs = this.getCurrentAttributes_();
      if (value === false) {
        delete attrs[attribute];
      } else {
        attrs[attribute] = value;
      }
      this.currentAttributes_ = attrs;
    } else {
      this.updateTextAttributes(cm.indexFromPos(cm.getCursor('start')), cm.indexFromPos(cm.getCursor('end')),
        function(attributes) {
          if (value === false) {
            delete attributes[attribute];
          } else {
            attributes[attribute] = value;
          }
        });

      this.updateCurrentAttributes_();
    }
  };

  RichTextCodeMirror.prototype.updateTextAttributes = function(start, end, updateFn, origin) {
    var newChangeList = { }, newChange = newChangeList;
    var pos = start, self = this;
    this.annotationList_.updateSpan(new Span(start, end - start), function(annotation, length) {
      var attributes = { };
      for(var attr in annotation.attributes) {
        attributes[attr] = annotation.attributes[attr];
      }

      updateFn(attributes);

      // changedAttributes will be the attributes we changed, with their new values.
      // changedAttributesInverse will be the attributes we changed, with their old values.
      var changedAttributes = { }, changedAttributesInverse = { };
      self.computeChangedAttributes_(annotation.attributes, attributes, changedAttributes, changedAttributesInverse);
      if (!emptyAttributes(changedAttributes)) {
        newChange.next = { start: pos, end: pos + length, attributes: changedAttributes, attributesInverse: changedAttributesInverse, origin: origin };
        newChange = newChange.next;
      }

      pos += length;
      return new RichTextAnnotation(attributes);
    });

    if (newChangeList.next) {
      this.trigger('attributesChange', this, newChangeList.next);
    }
  };

  RichTextCodeMirror.prototype.computeChangedAttributes_ = function(oldAttrs, newAttrs, changed, inverseChanged) {
    var attrs = { }, attr;
    for(attr in oldAttrs) { attrs[attr] = true; }
    for(attr in newAttrs) { attrs[attr] = true; }

    for (attr in attrs) {
      if (!(attr in newAttrs)) {
        // it was removed.
        changed[attr] = false;
        inverseChanged[attr] = oldAttrs[attr];
      } else if (!(attr in oldAttrs)) {
        // it was added.
        changed[attr] = newAttrs[attr];
        inverseChanged[attr] = false;
      } else if (oldAttrs[attr] !== newAttrs[attr]) {
        // it was changed.
        changed[attr] = newAttrs[attr];
        inverseChanged[attr] = oldAttrs[attr];
      }
    }
  };

  RichTextCodeMirror.prototype.toggleLineAttribute = function(attribute, value) {
    var currentAttributes = this.getCurrentLineAttributes_();
    var newValue;
    if (!(attribute in currentAttributes) || currentAttributes[attribute] !== value) {
      newValue = value;
    } else {
      newValue = false;
    }
    this.setLineAttribute(attribute, newValue);
  };

  RichTextCodeMirror.prototype.setLineAttribute = function(attribute, value) {
    this.updateLineAttributesForSelection(function(attributes) {
      if (value === false) {
        delete attributes[attribute];
      } else {
        attributes[attribute] = value;
      }
    });
  };

  RichTextCodeMirror.prototype.updateLineAttributesForSelection = function(updateFn) {
    var cm = this.codeMirror;
    var start = cm.getCursor('start'), end = cm.getCursor('end');
    var startLine = start.line, endLine = end.line;
    var endLineText = cm.getLine(endLine);
    var endsAtBeginningOfLine = this.areLineSentinelCharacters_(endLineText.substr(0, end.ch));
    if (endLine > startLine && endsAtBeginningOfLine) {
      // If the selection ends at the beginning of a line, don't include that line.
      endLine--;
    }

    this.updateLineAttributes(startLine, endLine, updateFn);
  };

  RichTextCodeMirror.prototype.updateLineAttributes = function(startLine, endLine, updateFn) {
    // TODO: Batch this into a single operation somehow.
    for(var line = startLine; line <= endLine; line++) {
      var text = this.codeMirror.getLine(line);
      var lineStartIndex = this.codeMirror.indexFromPos({line: line, ch: 0});
      // Create line sentinel character if necessary.
      if (text[0] !== LineSentinelCharacter) {
        var attributes = { };
        attributes[ATTR.LINE_SENTINEL] = true;
        updateFn(attributes);
        this.insertText(lineStartIndex, LineSentinelCharacter, attributes);
      } else {
        this.updateTextAttributes(lineStartIndex, lineStartIndex + 1, updateFn);
      }
    }
  };

  RichTextCodeMirror.prototype.replaceText = function(start, end, text, attributes, origin) {
    this.changeId_++;
    var newOrigin = RichTextOriginPrefix + this.changeId_;
    this.outstandingChanges_[newOrigin] = { origOrigin: origin, attributes: attributes };

    var cm = this.codeMirror;
    var from = cm.posFromIndex(start);
    var to = typeof end === 'number' ? cm.posFromIndex(end) : null;
    cm.replaceRange(text, from, to, newOrigin);
  };

  RichTextCodeMirror.prototype.insertText = function(index, text, attributes, origin) {
    this.replaceText(index, null, text, attributes, origin);
  };

  RichTextCodeMirror.prototype.removeText = function(start, end, origin) {
    var cm = this.codeMirror;
    cm.replaceRange("", cm.posFromIndex(start), cm.posFromIndex(end), origin);
  };

  RichTextCodeMirror.prototype.getAttributeSpans = function(start, end) {
    var spans = [];
    var annotatedSpans = this.annotationList_.getAnnotatedSpansForSpan(new Span(start, end - start));
    for(var i  = 0; i < annotatedSpans.length; i++) {
      spans.push({ length: annotatedSpans[i].length, attributes: annotatedSpans[i].annotation.attributes });
    }

    return spans;
  };

  RichTextCodeMirror.prototype.end = function() {
    var lastLine = this.codeMirror.lineCount() - 1;
    return this.codeMirror.indexFromPos({line: lastLine, ch: this.codeMirror.getLine(lastLine).length});
  };

  RichTextCodeMirror.prototype.getText = function(start, end) {
    var from = this.codeMirror.posFromIndex(start), to = this.codeMirror.posFromIndex(end);
    return this.codeMirror.getRange(from, to);
  };

  RichTextCodeMirror.prototype.initAnnotationList_ = function() {
    // Insert empty annotation span for existing content.
    var end = this.end();
    if (end !== 0) {
      this.annotationList_.insertAnnotatedSpan(new Span(0, end), new RichTextAnnotation());
    }
  };

  RichTextCodeMirror.prototype.onAnnotationsChanged_ = function(oldNodes, newNodes) {
    var marker;

    var linesToReMark = { };

    for(var i = 0; i < oldNodes.length; i++) {
      var attributes = oldNodes[i].annotation.attributes;
      if (ATTR.LINE_SENTINEL in attributes) {
        linesToReMark[this.codeMirror.posFromIndex(oldNodes[i].pos).line] = true;
      }
      marker = oldNodes[i].getAttachedObject();
      if (marker) {
        marker.clear();
      }
    }

    for (i = 0; i < newNodes.length; i++) {
      var annotation = newNodes[i].annotation;
      var className = this.getClassNameForAttributes_(annotation.attributes);
      var forLine = (ATTR.LINE_SENTINEL in annotation.attributes);

      if (className !== '') {
        var from = this.codeMirror.posFromIndex(newNodes[i].pos);
        if (forLine) {
          linesToReMark[from.line] = true;
        } else {
          var to = this.codeMirror.posFromIndex(newNodes[i].pos + newNodes[i].length);
          marker = this.codeMirror.markText(from, to, { className: className });
          newNodes[i].attachObject(marker);
        }
      }
    }

    for(var line in linesToReMark) {
      // HACK: Wait for annotation list to be fully in sync with codemirror changes before marking line sentinels.
      (function(self, lineHandle) {
        setTimeout(function() {
          var lineNum = self.codeMirror.getLineNumber(lineHandle);
          self.markLineSentinelCharactersForChangedLines_(lineNum, lineNum);
        }, 0);
      })(this, this.codeMirror.getLineHandle(Number(line)));
    }
  };

  RichTextCodeMirror.prototype.getClassNameForAttributes_ = function(attributes) {
    var className = '';
    for(var attr in attributes) {
      var val = attributes[attr];
      if (attr === ATTR.LINE_SENTINEL) {
        firepad.utils.assert(val === true, "LINE_SENTINEL attribute should be true if it exists.");
      } else {
        className += ' ' + (this.options_['cssPrefix'] || RichTextClassPrefixDefault) + attr;
        if (val !== true) {
          val = val.toString().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
          className += '-' + val;
        }
      }
    }
    return className;
  };

  RichTextCodeMirror.prototype.lineClassRemover_ = function(lineNum) {
    var cm = this.codeMirror;
    var lineHandle = cm.getLineHandle(lineNum);
    return {
      clear: function() {
        // HACK to remove all classes (since CodeMirror treats this as a regex internally).
        cm.removeLineClass(lineHandle, "text", ".*");
      }
    }
  };

  RichTextCodeMirror.prototype.emptySelection_ = function() {
    var start = this.codeMirror.getCursor('start'), end = this.codeMirror.getCursor('end');
    return (start.line === end.line && start.ch === end.ch);
  };

  RichTextCodeMirror.prototype.onCodeMirrorChange_ = function(cm, changes) {
    var newChangeList = { }, newChange = newChangeList;
    var changeOffset = 0;
    // TODO: This is wrong.  It only works if the changes are in order by where they occur in the text.
    var change = changes;
    while (change) {
      var start = this.codeMirror.indexFromPos(change.from);
      var removedText = change.removed.join('\n');
      if (removedText.length > 0) {
        var oldAnnotationSpans = this.annotationList_.getAnnotatedSpansForSpan(new Span(start, removedText.length));
        var removedTextPos = 0;
        for(var i = 0; i < oldAnnotationSpans.length; i++) {
          var span = oldAnnotationSpans[i];
          newChange.next = { start: start, end: start + span.length, removedAttributes: span.annotation.attributes,
            removed: removedText.substr(removedTextPos, span.length), attributes: { }, text: "", origin: change.origin };
          newChange = newChange.next;
          removedTextPos += span.length;
        }
        
        this.annotationList_.removeSpan(new Span(start, removedText.length));
      }

      var text = change.text.join('\n');
      var origin = change.origin;
      if (text.length > 0) {
        var attributes;
        // TODO: Handle 'paste' differently?
        if (change.origin === '+input' || change.origin === 'paste') {
          attributes = this.getCurrentAttributes_();
        } else if (origin in this.outstandingChanges_) {
          attributes = this.outstandingChanges_[origin].attributes;
          origin = this.outstandingChanges_[origin].origOrigin;
          delete this.outstandingChanges_[origin];
        } else {
          attributes = {};
        }

        this.annotationList_.insertAnnotatedSpan(new Span(start, text.length), new RichTextAnnotation(attributes));

        newChange.next = { start: start, end: start, removedAttributes: { }, removed: "", text: text,
          attributes: attributes, origin: origin };
        newChange = newChange.next;
      }

      change = change.next;
    }

    this.markLineSentinelCharactersForChanges_(changes);

    if (newChangeList.next) {
      this.trigger('change', this, newChangeList.next);
    }
  };

  /**
   * Detects whether any line sentinel characters were added or removed by the change and if so,
   * re-marks line sentinel characters on the affected range of lines.
   * @param changes
   * @private
   */
  RichTextCodeMirror.prototype.markLineSentinelCharactersForChanges_ = function(changes) {
    var startLine = Number.MAX_VALUE, endLine = -1;

    var change = changes;
    while (change) {
      var line = change.from.line, ch = change.from.ch;

      if (change.removed.length > 1 || change.removed[0].indexOf(LineSentinelCharacter) >= 0) {
        // We removed 1+ newlines or line sentinel characters.
        startLine = Math.min(startLine, line);
        endLine = Math.max(endLine, line);
      }

      if (change.text.length > 1) { // 1+ newlines
        startLine = Math.min(startLine, line);
        endLine = Math.max(endLine, line + change.text.length - 1);
      } else if (change.text[0].indexOf(LineSentinelCharacter) >= 0) {
        startLine = Math.min(startLine, line);
        endLine = Math.max(endLine, line);
      }

      change = change.next;
    }

    this.markLineSentinelCharactersForChangedLines_(startLine, endLine);
  };

  RichTextCodeMirror.prototype.markLineSentinelCharactersForChangedLines_ = function(startLine, endLine) {
    // Back up to first list item.
    if (startLine < Number.MAX_VALUE) {
      while(startLine > 0 && this.lineIsListItemOrIndented_(startLine-1)) {
        startLine--;
      }
    }

    // Advance to last list item.
    if (endLine > -1) {
      var lineCount = this.codeMirror.lineCount();
      while (endLine + 1 < lineCount && this.lineIsListItemOrIndented_(endLine+1)) {
        endLine++;
      }
    }

    var listNumber = [1, 1, 1, 1, 1, 1, 1]; // keeps track of the list number at each indent level.
    var cm = this.codeMirror;
    for(var line = startLine; line <= endLine; line++) {
      var text = cm.getLine(line);

      // Remove any existing line classes.
      var lineHandle = cm.getLineHandle(line);
      cm.removeLineClass(lineHandle, "text", ".*");

      if (text.length > 0) {
        var markIndex = text.indexOf(LineSentinelCharacter);
        while (markIndex >= 0) {
          var markStartIndex = markIndex;

          // Find the end of this series of sentinel characters, and remove any existing markers.
          while (markIndex < text.length && text[markIndex] === LineSentinelCharacter) {
            var marks = cm.findMarksAt({ line: line, ch: markIndex });
            for(var i = 0; i < marks.length; i++) {
              if (marks[i].isForLineSentinel) {
                marks[i].clear();
              }
            }

            markIndex++;
          }

          // If the mark is at the beginning of the line and it represents a list element, we need to replace it with
          // the appropriate html element for the list heading.
          var element = null;
          if (markStartIndex === 0) {
            var attributes = this.getLineAttributes_(line);
            var listType = attributes[ATTR.LIST_TYPE];
            var indent = attributes[ATTR.LINE_INDENT] || 0;
            if (listType && indent === 0) { indent = 1; }
            if (indent >= listNumber.length) indent = listNumber.length - 1; // we don't support deeper indents.
            if (listType === 'o') {
              element = this.makeOrderedListElement_(listNumber[indent]);
              listNumber[indent]++;
            } else if (listType === 'u') {
              element = this.makeUnorderedListElement_();
              listNumber[indent] = 1;
            }

            var className = this.getClassNameForAttributes_(attributes);
            if (className !== '') {
              this.codeMirror.addLineClass(line, "text", className);
            }

            // Reset deeper indents back to 1.
            for(i = indent+1; i < listNumber.length; i++) {
              listNumber[i] = 1;
            }
          }

          // Create a marker to cover this series of sentinel characters.
          // NOTE: The reason we treat them as a group (one marker for all subsequent sentinel characters instead of
          // one marker for each sentinel character) is that CodeMirror seems to get angry if we don't.
          var markerOptions = { inclusiveLeft: true, collapsed: true };
          if (element) {
            markerOptions.replacedWith = element;
          }
          var marker = cm.markText({line: line, ch: markStartIndex }, { line: line, ch: markIndex }, markerOptions);
          // track that it's a line-sentinel character so we can identify it later.
          marker.isForLineSentinel = true;

          markIndex = text.indexOf(LineSentinelCharacter, markIndex);
        }
      } else {
        // Reset all indents.
        for(i = 0; i < listNumber.length; i++) {
          listNumber[i] = 1;
        }
      }
    }
  };

  RichTextCodeMirror.prototype.makeOrderedListElement_ = function(number) {
    return utils.elt('div', number + '.', {
      style: "margin-left: -20px; display:inline-block; width:15px;"
    });
  };

  RichTextCodeMirror.prototype.makeUnorderedListElement_ = function() {
    return utils.elt('div', '\u2022', {
      style: "margin-left: -20px; display:inline-block; width:15px;"
    });
  };

  RichTextCodeMirror.prototype.lineIsListItemOrIndented_ = function(lineNum) {
    var attrs = this.getLineAttributes_(lineNum);
    return ((attrs[ATTR.LIST_TYPE] || false) !== false) ||
           ((attrs[ATTR.LINE_INDENT] || 0) !== 0);
  };

  RichTextCodeMirror.prototype.onCursorActivity_ = function() {
    this.updateCurrentAttributes_();
  };

  RichTextCodeMirror.prototype.getCurrentAttributes_ = function() {
    if (!this.currentAttributes_) {
      this.updateCurrentAttributes_();
    }
    return this.currentAttributes_;
  };

  RichTextCodeMirror.prototype.updateCurrentAttributes_ = function() {
    var pos;
    var cm = this.codeMirror;
    var anchor = cm.indexFromPos(cm.getCursor('anchor')), head = cm.indexFromPos(cm.getCursor('head'));
    if (anchor > head) { // backwards selection
      pos = head + 1;
    } else {
      pos = head;
    }
    var spans = this.annotationList_.getAnnotatedSpansForPos(pos);
    this.currentAttributes_ = {};

    var attributes = {};
    // Use the attributes to the left unless they're line attributes (in which case use the ones to the right.
    if (spans.length > 0 && (!(ATTR.LINE_SENTINEL in spans[0].annotation.attributes))) {
      attributes = spans[0].annotation.attributes;
    } else if (spans.length > 1) {
      firepad.utils.assert(!(ATTR.LINE_SENTINEL in spans[1].annotation.attributes), "Cursor can't be between two line sentinel characters.");
      attributes = spans[1].annotation.attributes;
    }
    for(var attr in attributes) {
      this.currentAttributes_[attr] = attributes[attr];
    }

    // HACK.
    delete this.currentAttributes_['l'];
    delete this.currentAttributes_['lt'];
  };

  RichTextCodeMirror.prototype.getCurrentLineAttributes_ = function() {
    var cm = this.codeMirror;
    var anchor = cm.getCursor('anchor'), head = cm.getCursor('head');
    var line = head.line;
    // If it's a forward selection and the cursor is at the beginning of a line, use the previous line.
    if (head.ch === 0 && anchor.line < head.line) {
      line--;
    }
    return this.getLineAttributes_(line);
  };

  RichTextCodeMirror.prototype.getLineAttributes_ = function(lineNum) {
    var attributes = {};
    var line = this.codeMirror.getLine(lineNum);
    if (line.length > 0 && line[0] === LineSentinelCharacter) {
      var lineStartIndex = this.codeMirror.indexFromPos({ line: lineNum, ch: 0 });
      var spans = this.annotationList_.getAnnotatedSpansForSpan(new Span(lineStartIndex, 1));
      firepad.utils.assert(spans.length === 1);
      for(var attr in spans[0].annotation.attributes) {
        attributes[attr] = spans[0].annotation.attributes[attr];
      }
    }
    return attributes;
  };

  RichTextCodeMirror.prototype.clearAnnotations_ = function() {
    this.annotationList_.updateSpan(new Span(0, this.end()), function(annotation, length) {
      return new RichTextAnnotation({ });
    });
  };

  RichTextCodeMirror.prototype.newline = function() {
    var cm = this.codeMirror;
    if (!this.emptySelection_()) {
      cm.replaceSelection('\n', 'end', '+input');
    } else {
      var cursorLine = cm.getCursor('head').line;
      var lineAttributes = this.getLineAttributes_(cursorLine);
      var listType = lineAttributes[ATTR.LIST_TYPE];

      if (listType && cm.getLine(cursorLine).length === 1) {
        // They hit enter on a line with just a list heading.  Just remove the list heading.
        this.updateLineAttributes(cursorLine, cursorLine, function(attributes) {
          delete attributes[ATTR.LIST_TYPE];
          delete attributes[ATTR.LINE_INDENT];
        });
      } else {
        cm.replaceSelection('\n', 'end', '+input');

        if (listType) {
          // Copy line attributes forward.
          this.updateLineAttributes(cursorLine+1, cursorLine+1, function(attributes) {
            for(var attr in lineAttributes) {
              attributes[attr] = lineAttributes[attr];
            }
          });
        }
      }
    }
  };

  RichTextCodeMirror.prototype.deleteLeft = function() {
    var cm = this.codeMirror;
    var cursorPos = cm.getCursor('head');
    var lineAttributes = this.getLineAttributes_(cursorPos.line);
    var listType = lineAttributes[ATTR.LIST_TYPE];
    var indent = lineAttributes[ATTR.LINE_INDENT];

    var backspaceAtStartOfLine = this.emptySelection_() && cursorPos.ch === 1;

    if (backspaceAtStartOfLine && listType) {
      // They hit backspace at the beginning of a line with a list heading.  Just remove the list heading.
      this.updateLineAttributes(cursorPos.line, cursorPos.line, function(attributes) {
        delete attributes[ATTR.LIST_TYPE];
        delete attributes[ATTR.LINE_INDENT];
      });
    } else if (backspaceAtStartOfLine && indent && indent > 0) {
      this.updateLineAttributes(cursorPos.line, cursorPos.line, function(attributes) {
        attributes[ATTR.LINE_INDENT]--;
      });
    } else {
      cm.deleteH(-1, "char");
    }
  };

  RichTextCodeMirror.prototype.deleteRight = function() {
    var cm = this.codeMirror;
    var cursorPos = cm.getCursor('head');

    var text = cm.getLine(cursorPos.line);
    var emptyLine = this.areLineSentinelCharacters_(text);
    var nextLineText = (cursorPos.line + 1 < cm.lineCount()) ? cm.getLine(cursorPos.line + 1) : "";
    if (this.emptySelection_() && emptyLine && nextLineText[0] === LineSentinelCharacter) {
      // Delete the empty line but not the line sentinel character on the next line.
      cm.replaceRange('', { line: cursorPos.line, ch: 0 }, { line: cursorPos.line + 1, ch: 0}, '+input');
    } else {
      cm.deleteH(1, "char");
    }
  };

  RichTextCodeMirror.prototype.indent = function() {
    this.updateLineAttributesForSelection(function(attributes) {
      var indent = attributes[ATTR.LINE_INDENT];
      var listType = attributes[ATTR.LIST_TYPE];

      if (indent && indent < 6) {
        attributes[ATTR.LINE_INDENT]++;
      } else if (listType) {
        // lists are implicitly already indented once.
        attributes[ATTR.LINE_INDENT] = 2;
      } else {
        attributes[ATTR.LINE_INDENT] = 1;
      }
    });
  };

  RichTextCodeMirror.prototype.unindent = function() {
    this.updateLineAttributesForSelection(function(attributes) {
      var indent = attributes[ATTR.LINE_INDENT];
      var listType = attributes[ATTR.LIST_TYPE];

      if (indent && indent > 1) {
        attributes[ATTR.LINE_INDENT] = indent - 1;
      } else {
        attributes[ATTR.LINE_INDENT] = false;
        if (listType) {
          // Remove list.
          attributes[ATTR.LIST_TYPE] = false;
        }
      }
    });
  };

  RichTextCodeMirror.prototype.getText = function() {
    return this.codeMirror.getValue().replace(new RegExp(LineSentinelCharacter, "g"), '');
  };

  RichTextCodeMirror.prototype.areLineSentinelCharacters_ = function(text) {
    for(var i = 0; i < text.length; i++) {
      if (text[i] !== LineSentinelCharacter)
        return false;
    }
    return true;
  };

  /**
   * Used for the annotations we store in our AnnotationList.
   * @param attributes
   * @constructor
   */
  function RichTextAnnotation(attributes) {
    this.attributes = attributes || { };
  }

  RichTextAnnotation.prototype.equals = function(other) {
    if (!(other instanceof RichTextAnnotation)) {
      return false;
    }
    var attr;
    for(attr in this.attributes) {
      if (other.attributes[attr] !== this.attributes[attr]) {
        return false;
      }
    }

    for(attr in other.attributes) {
      if (other.attributes[attr] !== this.attributes[attr]) {
        return false;
      }
    }

    return true;
  };

  function emptyAttributes(attributes) {
    for(var attr in attributes) {
      return false;
    }
    return true;
  }

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