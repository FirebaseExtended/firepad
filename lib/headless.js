var firepad = firepad || { };

/**
 * Instance of headless Firepad for use in NodeJS. Supports get/set on text/html.
 */
firepad.Headless = (function() {

  var TextOperation   = firepad.TextOperation;
  var FirebaseAdapter = firepad.FirebaseAdapter;
  var EntityManager   = firepad.EntityManager;
  var ParseHtml       = firepad.ParseHtml;

  function Headless(refOrPath) {
    // Allow calling without new.
    if (!(this instanceof Headless)) { return new Headless(refOrPath); }

    if (typeof refOrPath === 'string') {
      if (typeof Firebase !== 'function') {
        var firebase = require('firebase');
      } else {
        var firebase = Firebase;
      }
      var ref = new firebase(refOrPath);
    } else {
      var ref = refOrPath;
    }

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
      var text = doc.apply('');

      // Strip out any special characters from Rich Text formatting
      for (key in firepad.sentinelConstants) {
        text = text.replace(new RegExp(firepad.sentinelConstants[key], 'g'), '');
      }
      callback(text);
    });
  }

  Headless.prototype.setText = function(text, callback) {
    var op = TextOperation().insert(text);
    this.sendOperationWithRetry(op, callback);
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
        callback(firepad.SerializeHtml(doc, self.entityManager));
      });
    });
  }

  Headless.prototype.setHtml = function(html, callback) {
    var self = this;

    self.initializeFakeDom(function() {
      var textPieces = ParseHtml(html, self.entityManager);
      var inserts    = firepad.textPiecesToInserts(true, textPieces);
      var op         = new TextOperation();

      for (var i = 0; i < inserts.length; i++) {
        op.insert(inserts[i].string, inserts[i].attributes);
      }

      self.sendOperationWithRetry(op, callback);
    });
  }

  Headless.prototype.sendOperationWithRetry = function(operation, callback) {
    var self = this;

    self.getDocument(function(doc) {
      var op = operation.clone()['delete'](doc.targetLength);
      self.adapter.sendOperation(op, function(err, committed) {
        if (committed) {
          if (typeof callback !== "undefined") {
            callback(null, committed);
          }
        } else {
          self.sendOperationWithRetry(operation, callback);
        }
      });
    });
  }

  return Headless;
})();
