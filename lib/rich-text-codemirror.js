var firepad = firepad || { };

firepad.RichTextCodeMirror = (function () {
  var AnnotationList = firepad.AnnotationList;
  var Span = firepad.Span;
  var utils = firepad.utils;
  var RichTextClassPrefixDefault = 'cmrt-';
  var RichTextOriginPrefix = 'cmrt-';

  function RichTextCodeMirror(codeMirror, options) {
    this.codeMirror = codeMirror;
    this.options_ = options || { };
    this.currentAttributes_ = {};

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
      var attributes = { };
      attributes[attribute] = value;
      this.updateTextAttributes(cm.indexFromPos(cm.getCursor('start')), cm.indexFromPos(cm.getCursor('end')), attributes);
      this.updateCurrentAttributes_();
    }
  };

  RichTextCodeMirror.prototype.updateTextAttributes = function(start, end, appliedAttributes, origin) {
    if (emptyAttributes(appliedAttributes)) {
      return;
    }

    var newChangeList = { }, newChange = newChangeList;
    var pos = start;
    this.annotationList_.updateSpan(new Span(start, end - start), function(annotation, length) {
      var attributes = { };
      for(var attr in annotation.attributes) {
        attributes[attr] = annotation.attributes[attr];
      }

      // changedAttributes will be the attributes we changed, with their new values.
      // changedAttributesInverse will be the attributes we changed, with their old values.
      var changedAttributes = { }, changedAttributesInverse = { };
      for (attr in appliedAttributes) {
        var value = appliedAttributes[attr];
        if (value === false) {
          if (attr in attributes) {
            changedAttributesInverse[attr] = attributes[attr];
            changedAttributes[attr] = false;
            delete attributes[attr];
          }
        } else if (attributes[attr] !== value) {
          changedAttributesInverse[attr] = attributes[attr] || false;
          changedAttributes[attr] = value;
          attributes[attr] = value;
        }
      }
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

  RichTextCodeMirror.prototype.insertText = function(pos, text, attributes, origin) {
    this.changeId_++;
    var newOrigin = RichTextOriginPrefix + this.changeId_;
    this.outstandingChanges_[newOrigin] = { origOrigin: origin, attributes: attributes };

    var cm = this.codeMirror;
    cm.replaceRange(text, cm.posFromIndex(pos), null, newOrigin);
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
    for(var i = 0; i < oldNodes.length; i++) {
      marker = oldNodes[i].getAttachedObject();
      if (marker) {
        marker.clear();
      }
    }

    for (i = 0; i < newNodes.length; i++) {
      var annotation = newNodes[i].annotation;
      var className='';
      for(var attr in annotation.attributes) {
        var val = annotation.attributes[attr];
        className += ' ' + (this.options_['cssPrefix'] || RichTextClassPrefixDefault) + attr;
        if (val !== true) {
          val = val.toString().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
          className += '-' + val;
        }
      }

      if (className !== '') {
        var from = this.codeMirror.posFromIndex(newNodes[i].pos);
        var to = this.codeMirror.posFromIndex(newNodes[i].pos + newNodes[i].length);
        marker = this.codeMirror.markText(from, to, { className: className });

        newNodes[i].attachObject(marker);
      }
    }
  };

  RichTextCodeMirror.prototype.emptySelection_ = function() {
    var start = this.codeMirror.getCursor('start'), end = this.codeMirror.getCursor('end');
    return (start.line === end.line && start.ch === end.ch);
  };

  RichTextCodeMirror.prototype.onCodeMirrorChange_ = function(cm, change) {
    var newChangeList = { }, newChange = newChangeList;
    var changeOffset = 0;
    // TODO: This is wrong.  It only works if the changes are in order by where they occur in the text.
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
    if (newChangeList.next) {
      this.trigger('change', this, newChangeList.next);
    }
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
    if (spans.length > 0) {
      for(var attr in spans[0].annotation.attributes) {
        this.currentAttributes_[attr] = spans[0].annotation.attributes[attr];
      }
    }
  };

  RichTextCodeMirror.prototype.clearAnnotations_ = function() {
    this.annotationList_.updateSpan(new Span(0, this.end()), function(annotation, length) {
      return new RichTextAnnotation({ });
    });
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