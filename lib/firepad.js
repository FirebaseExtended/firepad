var firepad = firepad || { };

firepad.Firepad = (function(global) {
  if (!firepad.RichTextQuillAdapter) {
    throw new Error("Oops! It looks like you're trying to include lib/firepad.js directly.  This is actually one of many source files that make up firepad.  You want dist/firepad.js instead.");
  }
  var RichTextQuillAdapter = firepad.RichTextQuillAdapter;
  var FirebaseAdapter = firepad.FirebaseAdapter;
  var EditorClient = firepad.EditorClient;
  var utils = firepad.utils;
  var QuillJS = Quill;

  function Firepad(ref, place, options) {
    if (!(this instanceof Firepad)) { return new Firepad(ref, place, options); }

    if (!QuillJS) {
      throw new Error('Couldn\'t find Quill.  Did you forget to include quill.js?');
    }
    if (!(place instanceof QuillJS) || place.getLength() !== 1) {
      throw new Error("Can't initialize Firepad with a Quill instance that already contains text.");
    }

    this.zombie_ = false;
    this.editor_ = place;

    // Provide an easy way to get the firepad instance associated with this CodeMirror instance.
    this.editor_.firepad = this;

    this.options_ = options || { };

    var userId = this.getOption('userId', ref.push().key);
    var userColor = this.getOption('userColor', colorFromUserId(userId));

    this.firebaseAdapter_ = new FirebaseAdapter(ref, userId, userColor);
    this.editorAdapter_ = new RichTextQuillAdapter(place);
    this.client_ = new EditorClient(this.firebaseAdapter_, this.editorAdapter_);

    var self = this;
    this.firebaseAdapter_.on('cursor', function() {
      self.trigger.apply(self, ['cursor'].concat([].slice.call(arguments)));
    });

    this.firebaseAdapter_.on('ready', function() {
      self.ready_ = true;

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
  Firepad.fromQuill = Firepad;

  Firepad.prototype.dispose = function() {
    this.zombie_ = true; // We've been disposed.  No longer valid to do anything.

    this.editor_.firepad = null;

    this.firebaseAdapter_.dispose();
    this.editorAdapter_.detach();
  };

  Firepad.prototype.setUserId = function(userId) {
    this.firebaseAdapter_.setUserId(userId);
  };

  Firepad.prototype.setUserColor = function(color) {
    this.firebaseAdapter_.setColor(color);
  };

  Firepad.prototype.setText = function(textPieces) {
    this.assertReady_('setText');
    this.editor_.setText(textPieces);
    this.editorAdapter_.setCursor({position: 0, selectionEnd: 0});
  };

  Firepad.prototype.isHistoryEmpty = function() {
    this.assertReady_('isHistoryEmpty');
    return this.firebaseAdapter_.isHistoryEmpty();
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
})(this);

// Export adapters
firepad.Firepad.RichTextQuillAdapter = firepad.RichTextQuillAdapter;
