var firepad = firepad || { };

firepad.Firepad = (function(global) {
  var RichTextCodeMirrorAdapter = firepad.RichTextCodeMirrorAdapter;
  var RichTextCodeMirror = firepad.RichTextCodeMirror;
  var RichTextToolbar = firepad.RichTextToolbar;
  var FirebaseAdapter = firepad.FirebaseAdapter;
  var EditorClient = firepad.EditorClient;
  var AttributeConstants = firepad.AttributeConstants;
  var utils = firepad.utils;
  var CodeMirror = global.CodeMirror;

  function Firepad(ref, place, options) {
    if (!(this instanceof Firepad)) { return new Firepad(ref, place, options); }

    if (!CodeMirror) {
      throw new Error('Couldn\'t find CodeMirror.  Did you forget to include codemirror.js?');
    }

    if (place instanceof CodeMirror) {
      this.codeMirror_ = place;
      var curValue = this.codeMirror_.getValue();
      if (curValue !== '') {
        throw new Error("Can't initialize Firepad with a CodeMirror instance that already contains text.");
      }
    } else {
      this.codeMirror_ = new CodeMirror(place);
    }

    var cmWrapper = this.codeMirror_.getWrapperElement();
    this.firepadWrapper_ = utils.elt("div", null, { 'class': 'firepad' });
    cmWrapper.parentNode.replaceChild(this.firepadWrapper_, cmWrapper);
    this.firepadWrapper_.appendChild(cmWrapper);

    // Provide an easy way to get the firepad instance associated with this CodeMirror instance.
    this.codeMirror_.firepad = this;

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
    this.codeMirror_.refresh();

    var userId = this.getOption('userId', ref.push().name());
    var userColor = this.getOption('userColor', colorFromUserId(userId));

    this.richTextCodeMirror_ = new RichTextCodeMirror(this.codeMirror_, { cssPrefix: 'firepad-' });
    this.firebaseAdapter_ = new FirebaseAdapter(ref, userId, userColor);
    this.cmAdapter_ = new RichTextCodeMirrorAdapter(this.richTextCodeMirror_);
    this.client_ = new EditorClient(this.firebaseAdapter_, this.cmAdapter_);

    var self = this;
    this.firebaseAdapter_.on('ready', function() {
      self.ready_ = true;
      self.trigger('ready');
    });
  }
  utils.makeEventEmitter(Firepad);

  // For readability, this is the primary "constructor", even though right now they're just aliases for Firepad.
  Firepad.fromCodeMirror = Firepad;

  Firepad.prototype.dispose = function() {
    this.zombie_ = true; // We've been disposed.  No longer valid to do anything.

    // Unwrap CodeMirror.
    var cmWrapper = this.codeMirror_.getWrapperElement();
    this.firepadWrapper_.removeChild(cmWrapper);
    this.firepadWrapper_.parentNode.replaceChild(cmWrapper, this.firepadWrapper_);

    this.codeMirror_.firepad = null;

    if (this.codeMirror_.getOption('keyMap') === 'richtext') {
      this.codeMirror_.setOption('keyMap', 'default');
    }

    this.firebaseAdapter_.dispose();
    this.cmAdapter_.detach();
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
    return this.codeMirror_.getValue();
  };

  Firepad.prototype.setText = function(textPieces) {
    this.assertReady_('setText');
    // Wrap it in an array if it's not already.
    if(Object.prototype.toString.call(textPieces) !== '[object Array]') {
      textPieces = [textPieces];
    }

    // TODO: Batch this all into a single operation.
    this.codeMirror_.setValue("");
    var end = 0;
    for(var i = 0; i < textPieces.length; i++) {
      var text, attributes;
      if (textPieces[i] instanceof firepad.Text) {
        text = textPieces[i].text;
        attributes = textPieces[i].formatting.attributes;
      } else {
        text = textPieces[i];
        attributes = null;
      }

      this.richTextCodeMirror_.insertText(end, text, attributes);
      end += text.length;
    }
  };

  Firepad.prototype.getHtml = function() {
    var doc = this.firebaseAdapter_.getDocument();
    var html = '';
    var c = AttributeConstants;
    for(var i = 0; i < doc.ops.length; i++) {
      var op = doc.ops[i], attrs = op.attributes;
      utils.assert(op.isInsert());
      var prefix = '', suffix = '';
      for(var attr in attrs) {
        var value = attrs[attr];
        var start, end;
        if (attr === c.BOLD || attr === c.ITALIC || attr === c.UNDERLINE) {
          utils.assert(value === true);
          start = end = attr;
        } else if (attr === c.FONT_SIZE) {
          start = 'font size="' + value + '"';
          end = 'font';
        } else if (attr === c.FONT) {
          start = 'font face="' + value + '"';
          end = 'font';
        } else if (attr === c.COLOR) {
          start = 'font color="' + value + '"';
          end = 'font';
        } else {
          utils.assert(false, "Encountered unknown attribute while rendering html: " + attr);
        }
        prefix += '<' + start + '>';
        suffix = '</' + end + '>' + suffix;
      }

      html += prefix + this.textToHtml_(op.text) + suffix;
    }

    return html;
  };

  Firepad.prototype.textToHtml_ = function(text) {
    return text.replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br/>');
  };

  Firepad.prototype.setHtml = function(html) {
    throw new Error('Not implemented yet.  Sorry!');
  };

  Firepad.prototype.isHistoryEmpty = function() {
    this.assertReady_('isHistoryEmpty');
    return this.firebaseAdapter_.isHistoryEmpty();
  };

  Firepad.prototype.bold = function() {
    this.richTextCodeMirror_.toggleAttribute(AttributeConstants.BOLD);
    this.codeMirror_.focus();
  };

  Firepad.prototype.italic = function() {
    this.richTextCodeMirror_.toggleAttribute(AttributeConstants.ITALIC);
    this.codeMirror_.focus();
  };

  Firepad.prototype.underline = function() {
    this.richTextCodeMirror_.toggleAttribute(AttributeConstants.UNDERLINE);
    this.codeMirror_.focus();
  };

  Firepad.prototype.fontSize = function(size) {
    this.richTextCodeMirror_.setAttribute(AttributeConstants.FONT_SIZE, size);
    this.codeMirror_.focus();
  };

  Firepad.prototype.font = function(font) {
    this.richTextCodeMirror_.setAttribute(AttributeConstants.FONT, font);
    this.codeMirror_.focus();
  };

  Firepad.prototype.color = function(color) {
    this.richTextCodeMirror_.setAttribute(AttributeConstants.COLOR, color);
    this.codeMirror_.focus();
  };

  Firepad.prototype.orderedList = function() {
    this.richTextCodeMirror_.toggleLineAttribute(AttributeConstants.LIST_TYPE, 'o');
    this.codeMirror_.focus();
  };

  Firepad.prototype.unorderedList = function() {
    this.richTextCodeMirror_.toggleLineAttribute(AttributeConstants.LIST_TYPE, 'u');
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
    var toolbar = new RichTextToolbar();

    toolbar.on('bold', this.bold, this);
    toolbar.on('italic', this.italic, this);
    toolbar.on('underline', this.underline, this);
    toolbar.on('font-size', this.fontSize, this);
    toolbar.on('font', this.font, this);
    toolbar.on('color', this.color, this);
    toolbar.on('ordered-list', this.orderedList, this);
    toolbar.on('unordered-list', this.unorderedList, this);

    this.firepadWrapper_.insertBefore(toolbar.element(), this.firepadWrapper_.firstChild);
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
      "Enter": binder(this.newline),
      "Delete": binder(this.deleteRight),
      "Backspace": binder(this.deleteLeft),
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