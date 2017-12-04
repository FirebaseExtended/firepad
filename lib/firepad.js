var firepad = firepad || { };

firepad.Firepad = (function(CodeMirror) {
  var FirebaseAdapter = firepad.FirebaseAdapter;
  var EditorClient = firepad.EditorClient;
  var EntityManager = firepad.EntityManager;
  var ATTR = firepad.AttributeConstants;
  var utils = firepad.utils;
  var LIST_TYPE = firepad.LineFormatting.LIST_TYPE;

  function Firepad(ref, place, options) {
    if (!(this instanceof Firepad)) { return new Firepad(ref, place, options); }

    if (!CodeMirror && !ace) {
      throw new Error('Couldn\'t find CodeMirror or ACE.  Did you forget to include codemirror.js or ace.js?');
    }

    this.zombie_ = false;

    if (CodeMirror && place instanceof CodeMirror) {
      this.codeMirror_ = this.editor_ = place;
      var curValue = this.codeMirror_.getValue();
      if (curValue !== '') {
        throw new Error("Can't initialize Firepad with a CodeMirror instance that already contains text.");
      }
    } else {
      this.codeMirror_ = this.editor_ = new CodeMirror(place);
    }

    var editorWrapper = this.codeMirror_.getWrapperElement();
    this.firepadWrapper_ = utils.elt("div", null, { 'class': 'firepad' });
    editorWrapper.parentNode.replaceChild(this.firepadWrapper_, editorWrapper);
    this.firepadWrapper_.appendChild(editorWrapper);

    // Don't allow drag/drop because it causes issues.  See https://github.com/firebase/firepad/issues/36
    utils.on(editorWrapper, 'dragstart', utils.stopEvent);

    // Provide an easy way to get the firepad instance associated with this CodeMirror instance.
    this.editor_.firepad = this;

    this.options_ = options || { };

    this.imageInsertionUI = this.getOption('imageInsertionUI', true);

    // Now that we've mucked with CodeMirror, refresh it.
    if (this.codeMirror_)
      this.codeMirror_.refresh();

    var userId = this.getOption('userId', ref.push().key);
    var userColor = this.getOption('userColor', colorFromUserId(userId));

    this.entityManager_ = new EntityManager();

    this.firebaseAdapter_ = new FirebaseAdapter(ref, userId, userColor);
    this.client_ = new EditorClient(this.firebaseAdapter_, this.editorAdapter_);

    var self = this;
    this.firebaseAdapter_.on('cursor', function() {
      self.trigger.apply(self, ['cursor'].concat([].slice.call(arguments)));
    });

    if (this.codeMirror_) {
      this.richTextCodeMirror_.on('newLine', function() {
        self.trigger.apply(self, ['newLine'].concat([].slice.call(arguments)));
      });
    }

    this.firebaseAdapter_.on('ready', function() {
      self.ready_ = true;

      if (this.ace_) {
        this.editorAdapter_.grabDocumentState();
      }

      var defaultText = self.getOption('defaultText', null);
      if (defaultText && self.isHistoryEmpty()) {
        self.setText(defaultText);
      }

      self.trigger('ready');
    });

    this.client_.on('synced', function(isSynced) { self.trigger('synced', isSynced)} );
  }
  utils.makeEventEmitter(Firepad);

  // For readability, these are the primary "constructors", even though right now they're just aliases for Firepad.
  Firepad.fromCodeMirror = Firepad;

  Firepad.prototype.dispose = function() {
    this.zombie_ = true; // We've been disposed.  No longer valid to do anything.

    // Unwrap the editor.
    var editorWrapper = this.codeMirror_.getWrapperElement();
    this.firepadWrapper_.removeChild(editorWrapper);
    this.firepadWrapper_.parentNode.replaceChild(editorWrapper, this.firepadWrapper_);

    this.editor_.firepad = null;

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
    this.assertReady_('setText');
    if (this.ace_) {
      return this.ace_.getSession().getDocument().setValue(textPieces);
    } else {
      // HACK: Hide CodeMirror during setText to prevent lots of extra renders.
      this.codeMirror_.getWrapperElement().setAttribute('style', 'display: none');
      this.codeMirror_.setValue("");
      this.insertText(0, textPieces);
      this.codeMirror_.getWrapperElement().setAttribute('style', '');
      this.codeMirror_.refresh();
    }
    this.editorAdapter_.setCursor({position: 0, selectionEnd: 0});
  };

  Firepad.prototype.insertTextAtCursor = function(textPieces) {
    this.insertText(this.codeMirror_.indexFromPos(this.codeMirror_.getCursor()), textPieces);
  };

  Firepad.prototype.insertText = function(index, textPieces) {
    utils.assert(!this.ace_, "Not supported for ace yet.");
    this.assertReady_('insertText');

    // Wrap it in an array if it's not already.
    if(Object.prototype.toString.call(textPieces) !== '[object Array]') {
      textPieces = [textPieces];
    }

    var self = this;
    self.codeMirror_.operation(function() {
      // HACK: We should check if we're actually at the beginning of a line; but checking for index == 0 is sufficient
      // for the setText() case.
      var atNewLine = index === 0;
      var inserts = firepad.textPiecesToInserts(atNewLine, textPieces);

      for (var i = 0; i < inserts.length; i++) {
        var string     = inserts[i].string;
        var attributes = inserts[i].attributes;
        self.richTextCodeMirror_.insertText(index, string, attributes);
        index += string.length;
      }
    });
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

  Firepad.prototype.getHtml = function() {
    return this.getHtmlFromRange(null, null);
  };

  Firepad.prototype.getHtmlFromSelection = function() {
    var startPos = this.codeMirror_.getCursor('start'), endPos = this.codeMirror_.getCursor('end');
    var startIndex = this.codeMirror_.indexFromPos(startPos), endIndex = this.codeMirror_.indexFromPos(endPos);
    return this.getHtmlFromRange(startIndex, endIndex);
  };

  Firepad.prototype.getHtmlFromRange = function(start, end) {
    this.assertReady_('getHtmlFromRange');
    var doc = (start != null && end != null) ?
      this.getOperationForSpan(start, end) :
      this.getOperationForSpan(0, this.codeMirror_.getValue().length);
    return firepad.SerializeHtml(doc, this.entityManager_);
  };

  Firepad.prototype.insertHtml = function (index, html) {
    var lines = firepad.ParseHtml(html, this.entityManager_);
    this.insertText(index, lines);
  };

  Firepad.prototype.insertHtmlAtCursor = function (html) {
    this.insertHtml(this.codeMirror_.indexFromPos(this.codeMirror_.getCursor()), html);
  };

  Firepad.prototype.setHtml = function (html) {
    var lines = firepad.ParseHtml(html, this.entityManager_);
    this.setText(lines);
  };

  Firepad.prototype.isHistoryEmpty = function() {
    this.assertReady_('isHistoryEmpty');
    return this.firebaseAdapter_.isHistoryEmpty();
  };

  Firepad.prototype.undo = function() {
    this.codeMirror_.undo();
  };

  Firepad.prototype.redo = function() {
    this.codeMirror_.redo();
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
      throw new Error('You can\'t use a Firepad after calling dispose()!  [called ' + funcName + ']');
    }
  };

  Firepad.prototype.makeImageDialog_ = function() {
    this.makeDialog_('img', 'Insert image url');
  };

  Firepad.prototype.makeDialog_ = function(id, placeholder) {
   var self = this;

   var hideDialog = function() {
     var dialog = document.getElementById('overlay');
     dialog.style.visibility = "hidden";
     self.firepadWrapper_.removeChild(dialog);
   };

   var cb = function() {
     var dialog = document.getElementById('overlay');
     dialog.style.visibility = "hidden";
     var src = document.getElementById(id).value;
     if (src !== null)
       self.insertEntity(id, { 'src': src });
     self.firepadWrapper_.removeChild(dialog);
   };

   var input = utils.elt('input', null, { 'class':'firepad-dialog-input', 'id':id, 'type':'text', 'placeholder':placeholder, 'autofocus':'autofocus' });

   var submit = utils.elt('a', 'Submit', { 'class': 'firepad-btn', 'id':'submitbtn' });
   utils.on(submit, 'click', utils.stopEventAnd(cb));

   var cancel = utils.elt('a', 'Cancel', { 'class': 'firepad-btn' });
   utils.on(cancel, 'click', utils.stopEventAnd(hideDialog));

   var buttonsdiv = utils.elt('div', [submit, cancel], { 'class':'firepad-btn-group' });

   var div = utils.elt('div', [input, buttonsdiv], { 'class':'firepad-dialog-div' });
   var dialog = utils.elt('div', [div], { 'class': 'firepad-dialog', id:'overlay' });

   this.firepadWrapper_.appendChild(dialog);
  };

  Firepad.prototype.initializeKeyMap_ = function() {
    function binder(fn) {
      return function(cm) {
        // HACK: CodeMirror will often call our key handlers within a cm.operation(), and that
        // can mess us up (we rely on events being triggered synchronously when we make CodeMirror
        // edits).  So to escape any cm.operation(), we do a setTimeout.
        setTimeout(function() {
          fn.call(cm.firepad);
        }, 0);
      }
    }

  };

  function colorFromUserId (userId) {
    var a = 1;
    for (var i = 0; i < userId.length; i++) {
      a = 17 * (a+userId.charCodeAt(i)) % 360;
    }
    var hue = a/360;

    return hsl2hex(hue, 1, 0.75);
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
});

// Export Text classes
firepad.Firepad.Formatting = firepad.Formatting;
firepad.Firepad.Text = firepad.Text;
firepad.Firepad.Entity = firepad.Entity;
firepad.Firepad.LineFormatting = firepad.LineFormatting;
firepad.Firepad.Line = firepad.Line;
firepad.Firepad.TextOperation = firepad.TextOperation;
firepad.Firepad.Headless = firepad.Headless;
