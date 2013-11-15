var firepad = firepad || { };

firepad.Firepad = (function(global) {
  if (!firepad.RichTextCodeMirrorAdapter) {
    throw new Error("Oops! It looks like you're trying to include lib/firepad.js directly.  This is actually one of many source files that make up firepad.  You want dist/firepad.js instead.");
  }
  var RichTextCodeMirrorAdapter = firepad.RichTextCodeMirrorAdapter;
  var RichTextCodeMirror = firepad.RichTextCodeMirror;
  var RichTextToolbar = firepad.RichTextToolbar;
  var ACEAdapter = firepad.ACEAdapter;
  var FirebaseAdapter = firepad.FirebaseAdapter;
  var EditorClient = firepad.EditorClient;
  var EntityManager = firepad.EntityManager;
  var ATTR = firepad.AttributeConstants;
  var utils = firepad.utils;
  var LIST_TYPE = firepad.LineFormatting.LIST_TYPE;
  var CodeMirror = global.CodeMirror;
  var ace = global.ace;

  function Firepad(ref, place, options) {
    if (!(this instanceof Firepad)) { return new Firepad(ref, place, options); }

    if (!CodeMirror && !ace) {
      throw new Error('Couldn\'t find CodeMirror or ACE.  Did you forget to include codemirror.js or ace.js?');
    }

    if (CodeMirror && place instanceof CodeMirror) {
      this.codeMirror_ = this.editor_ = place;
      var curValue = this.codeMirror_.getValue();
      if (curValue !== '') {
        throw new Error("Can't initialize Firepad with a CodeMirror instance that already contains text.");
      }
    } else if (ace && place && place.session instanceof ace.EditSession) {
      this.ace_ = this.editor_ = place;
      curValue = this.ace_.getValue();
      if (curValue !== '') {
        throw new Error("Can't initialize Firepad with an ACE instance that already contains text.");
      }
    } else {
      this.codeMirror_ = this.editor_ = new CodeMirror(place);
    }

    var editorWrapper = this.codeMirror_ ? this.codeMirror_.getWrapperElement() : this.ace_.container;
    this.firepadWrapper_ = utils.elt("div", null, { 'class': 'firepad' });
    editorWrapper.parentNode.replaceChild(this.firepadWrapper_, editorWrapper);
    this.firepadWrapper_.appendChild(editorWrapper);

    // Don't allow drag/drop because it causes issues.  See https://github.com/firebase/firepad/issues/36
    utils.on(editorWrapper, 'dragstart', utils.stopEvent);

    // Provide an easy way to get the firepad instance associated with this CodeMirror instance.
    this.editor_.firepad = this;

    this.options_ = options || { };

    if (this.getOption('richTextShortcuts', false)) {
      if (!CodeMirror.keyMap['richtext']) {
        this.initializeKeyMap_();
      }
      this.codeMirror_.setOption('keyMap', 'richtext');
      this.firepadWrapper_.className += ' firepad-richtext';
    }

    if (this.getOption('richTextToolbar', false)) {
      this.addToolbar_();
      this.firepadWrapper_.className += ' firepad-richtext firepad-with-toolbar';
    }

    this.addPoweredByLogo_();

    // Now that we've mucked with CodeMirror, refresh it.
    if (this.codeMirror_)
      this.codeMirror_.refresh();

    var userId = this.getOption('userId', ref.push().name());
    var userColor = this.getOption('userColor', colorFromUserId(userId));

    this.entityManager_ = new EntityManager();
    this.registerBuiltinEntities_();

    this.firebaseAdapter_ = new FirebaseAdapter(ref, userId, userColor);
    if (this.codeMirror_) {
      this.richTextCodeMirror_ = new RichTextCodeMirror(this.codeMirror_, this.entityManager_, { cssPrefix: 'firepad-' });
      this.editorAdapter_ = new RichTextCodeMirrorAdapter(this.richTextCodeMirror_);
    } else {
      this.editorAdapter_ = new ACEAdapter(this.ace_);
    }
    this.client_ = new EditorClient(this.firebaseAdapter_, this.editorAdapter_);

    var self = this;
    this.firebaseAdapter_.on('cursor', function() {
      self.trigger.apply(self, ['cursor'].concat([].slice.call(arguments)));
    });
    this.firebaseAdapter_.on('ready', function() {
      self.ready_ = true;
      if (this.ace_)
        this.editorAdapter_.grabDocumentState();
      self.trigger('ready');
    });

    // Hack for IE8 to make font icons work more reliably.
    // http://stackoverflow.com/questions/9809351/ie8-css-font-face-fonts-only-working-for-before-content-on-over-and-sometimes
    if (navigator.appName == 'Microsoft Internet Explorer' && navigator.userAgent.match(/MSIE 8\./)) {
      window.onload = function() {
        var head = document.getElementsByTagName('head')[0],
          style = document.createElement('style');
        style.type = 'text/css';
        style.styleSheet.cssText = ':before,:after{content:none !important;}';
        head.appendChild(style);
        setTimeout(function() {
          head.removeChild(style);
        }, 0);
      };
    }
  }
  utils.makeEventEmitter(Firepad);

  // For readability, these are the primary "constructors", even though right now they're just aliases for Firepad.
  Firepad.fromCodeMirror = Firepad;
  Firepad.fromACE = Firepad;

  Firepad.prototype.dispose = function() {
    this.zombie_ = true; // We've been disposed.  No longer valid to do anything.

    // Unwrap the editor.
    var editorWrapper = this.codeMirror_ ? this.codeMirror_.getWrapperElement() : this.ace_.container;
    this.firepadWrapper_.removeChild(editorWrapper);
    this.firepadWrapper_.parentNode.replaceChild(editorWrapper, this.firepadWrapper_);

    this.editor_.firepad = null;

    if (this.codeMirror_ && this.codeMirror_.getOption('keyMap') === 'richtext') {
      this.codeMirror_.setOption('keyMap', 'default');
    }

    this.firebaseAdapter_.dispose();
    this.editorAdapter_.detach();
    if (this.richTextCodeMirror_)
      this.richTextCodeMirror_.detach();
  };

  Firepad.prototype.setUserId = function(userId) {
    this.firebaseAdapter_.setUserId(userId);
  };

  Firepad.prototype.setUserColor = function(color) {
    this.firebaseAdapter_.setColor(color);
  };

  Firepad.prototype.getText = function() {
    this.assertReady_('getText');
    if (this.codeMirror_)
      return this.richTextCodeMirror_.getText();
    else
      return this.ace_.getSession().getDocument().getValue();
  };

  Firepad.prototype.setText = function(textPieces) {
    this.insertText(textPieces, 0, true)
  };

  Firepad.prototype.insertTextAtCursor = function(textPieces) {
    this.insertText(textPieces, null, false)
  };
  
  Firepad.prototype.insertText = function(textPieces, origin, shouldEmpty) {
    this.assertReady_('setText');
    if (this.ace_) {
      return this.ace_.getSession().getDocument().setValue(textPieces);
    } else {
      // Wrap it in an array if it's not already.
      if(Object.prototype.toString.call(textPieces) !== '[object Array]') {
        textPieces = [textPieces];
      }

      // TODO: Batch this all into a single operation.
      if (shouldEmpty) {
        this.codeMirror_.setValue("");
      }
      var end = (typeof origin != 'undefined' && origin != null) ? origin : this.codeMirror_.indexFromPos(this.codeMirror_.getCursor()), atNewLine = false, shouldEmpty = shouldEmpty || false, self = this;

      function insert(string, attributes) {
        self.richTextCodeMirror_.insertText(end, string, attributes || null);
        end += string.length;
        atNewLine = string[string.length-1] === '\n';
      }

      function insertTextOrString(x) {
        if (x instanceof firepad.Text) {
          insert(x.text, x.formatting.attributes);
        } else if (typeof x === 'string') {
          insert(x);
        } else {
          console.error("Can't insert into firepad", x);
          throw "Can't insert into firepad: " + x;
        }
      }

      function insertLine(line) {
        if (!atNewLine)
          insert('\n');

        insert(RichTextCodeMirror.LineSentinelCharacter, line.formatting.attributes);

        for(var i = 0; i < line.textPieces.length; i++) {
          insertTextOrString(line.textPieces[i]);
        }

        insert('\n');
      }

      for(var i = 0; i < textPieces.length; i++) {
        if (!i && !shouldEmpty) {
          atNewLine = true;
        }
        if (textPieces[i] instanceof firepad.Line) {
          insertLine(textPieces[i]);
        } else {
          insertTextOrString(textPieces[i]);
        }
      }
    }
  };
  
  Firepad.prototype.getOperationForSpan = function(start, end) {
    var text = this.richTextCodeMirror_.getRange(start, end);
    var spans = this.richTextCodeMirror_.getAttributeSpans(start, end);
    var pos = 0;
    var op = new firepad.TextOperation();
    for(var i = 0; i < spans.length; i++) {
      op.insert(text.substr(pos, spans[i].length), spans[i].attributes);
      pos += spans[i].length;
    }
    return op;
  };


  Firepad.TODO_STYLE = '<style>ul.firepad-todo { list-style: none; margin-left: 0; padding-left: 0; } ul.firepad-todo > li { padding-left: 1em; text-indent: -1em; } ul.firepad-todo > li:before { content: "\\2610"; padding-right: 5px; } ul.firepad-todo > li.firepad-checked:before { content: "\\2611"; padding-right: 5px; }</style>\n';
  
  Firepad.prototype.getHtml = function() {
    this.getHtmlFromRange(null, null);
  };

  Firepad.prototype.getHtmlFromSelection = function() {
    var startPos = this.codeMirror_.getCursor('start'), endPos = this.codeMirror_.getCursor('end');
    var startIndex = this.codeMirror_.indexFromPos(startPos), endIndex = this.codeMirror_.indexFromPos(endPos);
    return this.getHtmlFromRange(startIndex, endIndex);
  };
  
  Firepad.prototype.getHtmlFromRange = function(start, end) {
    var doc = (start != null && end != null) ? this.getOperationForSpan(start, end) : this.firebaseAdapter_.getDocument();
    var html = '', newLine = true;
    html += Firepad.EXPORT_HTML_STYLE;

    function open(listType) {
      return (listType === LIST_TYPE.ORDERED) ? '<ol>' :
             (listType === LIST_TYPE.UNORDERED) ? '<ul>' :
             '<ul class="firepad-todo">';
    }

    function close(listType) {
      return (listType === LIST_TYPE.ORDERED) ? '</ol>' : '</ul>';
    }

    var listTypeStack = [];
    var inListItem = false;
    var firstLine = true;
    var emptyLine = true;
    var i = 0, op = doc.ops[i];
    var usesTodo = false;
    while(op) {
      utils.assert(op.isInsert());
      var attrs = op.attributes;

      if (newLine) {
        newLine = false;

        var indent = 0, listType = null, lineAlign = 'left';
        if (ATTR.LINE_SENTINEL in attrs) {
          indent = attrs[ATTR.LINE_INDENT] || 0;
          listType = attrs[ATTR.LIST_TYPE] || null;
          lineAlign = attrs[ATTR.LINE_ALIGN] || 'left';
        }
        if (listType) {
          indent = indent || 1; // lists are automatically indented at least 1.
        }

        if (inListItem) {
          html += '</li>';
          inListItem = false;
        } else if (!firstLine) {
          if (emptyLine) {
            html += '<br/>';
          }
          html += '</div>';
        }
        firstLine = false;

        // Close any extra lists.
        function compatibleListType(l1, l2) {
          return (l1 === l2) ||
              (l1 === LIST_TYPE.TODO && l2 === LIST_TYPE.TODOCHECKED) ||
              (l1 === LIST_TYPE.TODOCHECKED && l2 === LIST_TYPE.TODO);
        }
        utils.assert(indent >= 0, "Indent must not be negative.");
        while (listTypeStack.length > indent ||
            (indent === listTypeStack.length && listType !== null && !compatibleListType(listType, listTypeStack[listTypeStack.length - 1]))) {
          html += close(listTypeStack.pop());
        }

        // Open any needed lists.
        while (listTypeStack.length < indent) {
          var toOpen = listType || LIST_TYPE.UNORDERED; // default to unordered lists for indenting non-list-item lines.
          usesTodo = listType == LIST_TYPE.TODO || listType == LIST_TYPE.TODOCHECKED || usesTodo;
          html += open(toOpen);
          listTypeStack.push(toOpen);
        }

        var style = (lineAlign !== 'left') ? ' style="text-align:' + lineAlign + '"': '';
        if (listType) {
          var clazz = '';
          switch (listType) 
          {
            case LIST_TYPE.TODOCHECKED:
              clazz = ' class="firepad-checked"';
              break;
            case LIST_TYPE.TODO:
              clazz = ' class="firepad-unchecked"';
              break;
          }
          html += "<li" + clazz + style + ">";
          inListItem = true;
        } else {
          // start line div.
          html += '<div' + style + '>';
        }
        emptyLine = true;
      }

      if (ATTR.LINE_SENTINEL in attrs) {
        op = doc.ops[++i];
        continue;
      }

      if (ATTR.ENTITY_SENTINEL in attrs) {
        for(var j = 0; j < op.text.length; j++) {
          var entity = firepad.Entity.fromAttributes(attrs);
          var element = this.entityManager_.exportToElement(entity);
          html += element.outerHTML;
        }

        op = doc.ops[++i];
        continue;
      }

      var prefix = '', suffix = '';
      for(var attr in attrs) {
        var value = attrs[attr];
        var start, end;
        if (attr === ATTR.BOLD || attr === ATTR.ITALIC || attr === ATTR.UNDERLINE || attr === ATTR.STRIKE) {
          utils.assert(value === true);
          start = end = attr;
        } else if (attr === ATTR.FONT_SIZE) {
          start = 'span style="font-size: ' + value;
          start += (typeof value !== "string" || value.indexOf("px", value.length - 2) === -1) ? 'px"' : '"';
          end = 'span';
        } else if (attr === ATTR.FONT) {
          start = 'span style="font-family: ' + value + '"';
          end = 'span';
        } else if (attr === ATTR.COLOR) {
          start = 'span style="color: ' + value + '"';
          end = 'span';
        } else if (attr === ATTR.BACKGROUND_COLOR) {
          start = 'span style="background-color: ' + value + '"';
          end = 'span';
        }
        else {
          utils.log(false, "Encountered unknown attribute while rendering html: " + attr);
        }
        if (start) prefix += '<' + start + '>';
	      if (end) suffix = '</' + end + '>' + suffix;
      }

      var text = op.text;
      var newLineIndex = text.indexOf('\n');
      if (newLineIndex >= 0) {
        newLine = true;
        if (newLineIndex < text.length - 1) {
          // split op.
          op = new firepad.TextOp('insert', text.substr(newLineIndex+1), attrs);
        } else {
          op = doc.ops[++i];
        }
        text = text.substr(0, newLineIndex);
      } else {
        op = doc.ops[++i];
      }

      // Replace leading, trailing, and consecutive spaces with nbsp's to make sure they're preserved.
      text = text.replace(/  +/g, function(str) {
        return new Array(str.length + 1).join('\u00a0');
      }).replace(/^ /, '\u00a0').replace(/ $/, '\u00a0');
      if (text.length > 0) {
        emptyLine = false;
      }

      html += prefix + this.textToHtml_(text) + suffix;
    }

    if (inListItem) {
      html += '</li>';
    } else if (!firstLine) {
      if (emptyLine) {
        html += '&nbsp;';
      }
      html += '</div>';
    }

    // Close any extra lists.
    while (listTypeStack.length > 0) {
      html += close(listTypeStack.pop());
    }

    if (usesTodo) {
      html =  Firepad.TODO_STYLE + html;
    }

    return html;
  };

  Firepad.EXPORT_HTML_STYLE = '';

  Firepad.prototype.textToHtml_ = function(text) {
    return text.replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\u00a0/g, '&nbsp;')
  };

  Firepad.prototype.insertHtml = function (html, origin) {
    var lines = firepad.ParseHtml(html, this.entityManager_);
    this.insertText(lines, origin);
  };

  Firepad.prototype.insertHtmlAtCursor = function (html) {
    this.insertHtml(html);
  };

  Firepad.prototype.setHtml = function (html) {
    var lines = firepad.ParseHtml(html, this.entityManager_);
    this.setText(lines);
  };

  Firepad.prototype.isHistoryEmpty = function() {
    this.assertReady_('isHistoryEmpty');
    return this.firebaseAdapter_.isHistoryEmpty();
  };

  Firepad.prototype.bold = function() {
    this.richTextCodeMirror_.toggleAttribute(ATTR.BOLD);
    this.codeMirror_.focus();
  };

  Firepad.prototype.italic = function() {
    this.richTextCodeMirror_.toggleAttribute(ATTR.ITALIC);
    this.codeMirror_.focus();
  };

  Firepad.prototype.underline = function() {
    this.richTextCodeMirror_.toggleAttribute(ATTR.UNDERLINE);
    this.codeMirror_.focus();
  };

  Firepad.prototype.strike = function() {
    this.richTextCodeMirror_.toggleAttribute(ATTR.STRIKE);
    this.codeMirror_.focus();
  };

  Firepad.prototype.fontSize = function(size) {
    this.richTextCodeMirror_.setAttribute(ATTR.FONT_SIZE, size);
    this.codeMirror_.focus();
  };

  Firepad.prototype.font = function(font) {
    this.richTextCodeMirror_.setAttribute(ATTR.FONT, font);
    this.codeMirror_.focus();
  };

  Firepad.prototype.color = function(color) {
    this.richTextCodeMirror_.setAttribute(ATTR.COLOR, color);
    this.codeMirror_.focus();
  };

  Firepad.prototype.highlight = function() {
    this.richTextCodeMirror_.toggleAttribute(ATTR.BACKGROUND_COLOR, 'rgba(255,255,0,.65)');
    this.codeMirror_.focus();
  };

  Firepad.prototype.align = function(alignment) {
    if (alignment !== 'left' && alignment !== 'center' && alignment !== 'right') {
      throw new Error('align() must be passed "left", "center", or "right".');
    }
    this.richTextCodeMirror_.toggleLineAttribute(ATTR.LINE_ALIGN, alignment);
    this.codeMirror_.focus();
  };

  Firepad.prototype.orderedList = function() {
    this.richTextCodeMirror_.toggleLineAttribute(ATTR.LIST_TYPE, 'o');
    this.codeMirror_.focus();
  };

  Firepad.prototype.unorderedList = function() {
    this.richTextCodeMirror_.toggleLineAttribute(ATTR.LIST_TYPE, 'u');
    this.codeMirror_.focus();
  };

  Firepad.prototype.todo = function() {
  	this.richTextCodeMirror_.toggleTodo();
    this.codeMirror_.focus();
  };

  Firepad.prototype.newline = function() {
    this.richTextCodeMirror_.newline();
  };

  Firepad.prototype.deleteLeft = function() {
    this.richTextCodeMirror_.deleteLeft();
  };

  Firepad.prototype.deleteRight = function() {
    this.richTextCodeMirror_.deleteRight();
  };

  Firepad.prototype.indent = function() {
    this.richTextCodeMirror_.indent();
    this.codeMirror_.focus();
  };

  Firepad.prototype.unindent = function() {
    this.richTextCodeMirror_.unindent();
    this.codeMirror_.focus();
  };

  Firepad.prototype.undo = function() {
    this.codeMirror_.undo();
  };

  Firepad.prototype.redo = function() {
    this.codeMirror_.redo();
  };

  Firepad.prototype.insertEntity = function(type, info, origin) {
    this.richTextCodeMirror_.insertEntityAtCursor(type, info, origin);
  };

  Firepad.prototype.insertEntityAt = function(index, type, info, origin) {
    this.richTextCodeMirror_.insertEntityAt(index, type, info, origin);
  };

  Firepad.prototype.registerEntity = function(type, options) {
    this.entityManager_.register(type, options);
  };
  
  Firepad.prototype.getOption = function(option, def) {
    return (option in this.options_) ? this.options_[option] : def;
  };

  Firepad.prototype.assertReady_ = function(funcName) {
    if (!this.ready_) {
      throw new Error('You must wait for the "ready" event before calling ' + funcName + '.');
    }
    if (this.zombie_) {
      throw new Error('You can\'t use a Firepad after calling dispose()!');
    }
  };

  Firepad.prototype.addToolbar_ = function() {
    this.toolbar = new RichTextToolbar();

    this.toolbar.on('undo', this.undo, this);
    this.toolbar.on('redo', this.redo, this);
    this.toolbar.on('bold', this.bold, this);
    this.toolbar.on('italic', this.italic, this);
    this.toolbar.on('underline', this.underline, this);
    this.toolbar.on('strike', this.strike, this);
    this.toolbar.on('font-size', this.fontSize, this);
    this.toolbar.on('font', this.font, this);
    this.toolbar.on('color', this.color, this);
    this.toolbar.on('left', function() { this.align('left')}, this);
    this.toolbar.on('center', function() { this.align('center')}, this);
    this.toolbar.on('right', function() { this.align('right')}, this);
    this.toolbar.on('ordered-list', this.orderedList, this);
    this.toolbar.on('unordered-list', this.unorderedList, this);
    this.toolbar.on('todo-list', this.todo, this);
    this.toolbar.on('indent-increase', this.indent, this);
    this.toolbar.on('indent-decrease', this.unindent, this);

    this.firepadWrapper_.insertBefore(this.toolbar.element(), this.firepadWrapper_.firstChild);
  };

  Firepad.prototype.registerBuiltinEntities_ = function() {
    var attrs = ['src', 'alt', 'width', 'height', 'style', 'class'];
    this.registerEntity('img', {
      render: function(info) {
        utils.assert(info.src, "image entity should have 'src'!");
        var attrs = ['src', 'alt', 'width', 'height', 'style', 'class'];
        var html = '<img ';
        for(var i = 0; i < attrs.length; i++) {
          var attr = attrs[i];
          if (attr in info) {
            html += ' ' + attr + '="' + info[attr] + '"';
          }
        }
        html += ">";
        return html;
      },
      fromElement: function(element) {
        var info = {};
        for(var i = 0; i < attrs.length; i++) {
          var attr = attrs[i];
          if (element.hasAttribute(attr)) {
            info[attr] = element.getAttribute(attr);
          }
        }
        return info;
      }
    });
  };

  Firepad.prototype.addPoweredByLogo_ = function() {
    var poweredBy = utils.elt('a', null, { 'class': 'powered-by-firepad'} );
    poweredBy.setAttribute('href', 'http://www.firepad.io/');
    poweredBy.setAttribute('target', '_blank');
    this.firepadWrapper_.appendChild(poweredBy)
  };

  Firepad.prototype.initializeKeyMap_ = function() {
    function binder(fn) {
      return function(cm) {
        fn.call(cm.firepad);
      }
    }

    CodeMirror.keyMap["richtext"] = {
      "Ctrl-B": binder(this.bold),
      "Cmd-B": binder(this.bold),
      "Ctrl-I": binder(this.italic),
      "Cmd-I": binder(this.italic),
      "Ctrl-U": binder(this.underline),
      "Cmd-U": binder(this.underline),
      "Ctrl-H": binder(this.highlight),
      "Cmd-H": binder(this.highlight),
      "Enter": binder(this.newline),
      "Delete": binder(this.deleteRight),
      "Backspace": binder(this.deleteLeft),
      "Tab": binder(this.indent),
      "Shift-Tab": binder(this.unindent),
      fallthrough: ['default']
    };
  };

  function colorFromUserId (userId) {
    var a = 1;
    for (var i = 0; i < userId.length; i++) {
      a = 17 * (a+userId.charCodeAt(i)) % 360;
    }
    var hue = a/360;

    return hsl2hex(hue, 1, 0.85);
  }

  function rgb2hex (r, g, b) {
    function digits (n) {
      var m = Math.round(255*n).toString(16);
      return m.length === 1 ? '0'+m : m;
    }
    return '#' + digits(r) + digits(g) + digits(b);
  }

  function hsl2hex (h, s, l) {
    if (s === 0) { return rgb2hex(l, l, l); }
    var var2 = l < 0.5 ? l * (1+s) : (l+s) - (s*l);
    var var1 = 2 * l - var2;
    var hue2rgb = function (hue) {
      if (hue < 0) { hue += 1; }
      if (hue > 1) { hue -= 1; }
      if (6*hue < 1) { return var1 + (var2-var1)*6*hue; }
      if (2*hue < 1) { return var2; }
      if (3*hue < 2) { return var1 + (var2-var1)*6*(2/3 - hue); }
      return var1;
    };
    return rgb2hex(hue2rgb(h+1/3), hue2rgb(h), hue2rgb(h-1/3));
  }

  return Firepad;
})(this);

// Export Text class.
firepad.Firepad.Formatting = firepad.Formatting;
firepad.Firepad.Text = firepad.Text;
firepad.Firepad.Entity = firepad.Entity;
firepad.Firepad.LineFormatting = firepad.LineFormatting;
firepad.Firepad.Line = firepad.Line;

firepad.Firepad.TextOperation = firepad.TextOperation;
