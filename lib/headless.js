var firepad = firepad || { };

/**
 * Instance of headless Firepad for use in NodeJS. Supports get/set on text/html.
 */
firepad.Headless = (function() {

  var TextOperation   = firepad.TextOperation;
  var FirebaseAdapter = firepad.FirebaseAdapter;
  var EntityManager   = firepad.EntityManager;
  var ParseHtml       = firepad.ParseHtml;

  function Headless(ref) {
    // Allow calling without new.
    if (!(this instanceof Headless)) { return new Headless(ref); }

    this.adapter        = new FirebaseAdapter(ref);
    this.ready          = false;
    this.entityManager  = new EntityManager();
  }

  Headless.prototype.getDocument = function(callback) {
    var self = this;

    if (self.ready) {
      return callback(self.adapter.getDocument());
    }

    self.adapter.on('ready', function() {
      self.ready = true;
      callback(self.adapter.getDocument());
    });
  }

  Headless.prototype.getText = function(callback) {
    this.getDocument(function(doc) {
      callback(doc.apply(''));
    });
  }

  Headless.prototype.setText = function(text, callback) {
    var self = this;

    self.getDocument(function(doc) {
      var op = TextOperation()['delete'](doc.targetLength).insert(text);
      self.adapter.sendOperation(op, callback);
    });
  }

  Headless.prototype.initializeFakeDom = function(callback) {
    if (typeof document === 'object' || typeof firepad.document === 'object') {
      callback();
    } else {
      require('jsdom').env('<head></head><body></body>', function(err, window) {
        if (firepad.document) {
          // Return if we've already made a jsdom to avoid making more than one
          // This would be easier with promises but we want to avoid introducing
          // another dependency for just headless mode.
          window.close();
          return callback();
        }
        firepad.document = window.document;
        callback();
      });
    }
  }

  Headless.prototype.getHtml = function(callback) {
    var self = this;

    self.initializeFakeDom(function() {
      self.getDocument(function(doc) {
        callback(firepad.SerializeHtml(doc, this.entityManager));
      });
    });
  }

  Headless.prototype.setHtml = function(html, callback) {
    var self = this;

    self.initializeFakeDom(function() {
      self.getDocument(function(doc) {
        var textPieces = ParseHtml(html, self.entityManager);
        var inserts    = firepad.textPiecesToInserts(true, textPieces);
        var op         = TextOperation()['delete'](doc.targetLength);

        for (var i = 0; i < inserts.length; i++) {
          op.insert(inserts[i].string, inserts[i].attributes);
        }

        self.adapter.sendOperation(op, callback);
      });
    });

  }

  return Headless;
})();
