describe('Integration tests', function() {
  var h = helpers;
  var Firepad = firepad.Firepad;
  var Headless = Firepad.Headless;

  var _hiddenDiv;
  function hiddenDiv() {
    if (!_hiddenDiv) {
      _hiddenDiv = document.createElement('div');
      _hiddenDiv.style.display = 'none';
      document.body.appendChild(_hiddenDiv);
    }
    return _hiddenDiv;
  }

  function waitFor(check, callback) {
    var iid = setInterval(function() {
      if(check()){
        clearInterval(iid);
        callback();
      }
    }, 15);
  }

  function randomEdit (cm) {
    var length = cm.getValue().length;
    var start = h.randomInt(length);
    var startPos = cm.posFromIndex(start);
    var end = start + h.randomInt(Math.min(10, length - start));
    var endPos = cm.posFromIndex(end);
    var newContent = Math.random() > 0.5 ? '' : h.randomString(h.randomInt(12));
    cm.replaceRange(newContent, startPos, endPos);
  }

  function randomChange (cm) {
    var n = 1 + h.randomInt(4);
    while (n--) {
      randomEdit(cm);
    }
  }

  function randomOperation (cm) {
    cm.operation(function() {
      randomChange(cm);
    });
  }

  beforeEach(function(done) {
    // Make sure we're connected to Firebase.  This can take a while on slow
    // connections.
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com/.info/connected');
    var connected = false;
    var listener = ref.on('value', function(s) {
      if (s.val() == true) {
        done();
        ref.off('value', listener);
      }
    });
  });

  it('Out-of-order edit', function (done) {
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var cm1 = CodeMirror(hiddenDiv());
    var cm2 = CodeMirror(hiddenDiv());
    var firepad1 = new Firepad(ref, cm1);
    var firepad2 = new Firepad(ref, cm2);

    firepad1.on('ready', function() {
      firepad1.setText('XXX3456789XXX');
      cm1.operation(function() {
        cm1.replaceRange('', {line: 0, ch: 10}, {line: 0, ch: 13});
        cm1.replaceRange('', {line: 0, ch: 0},  {line: 0, ch: 3});
      });
      cm2.on('change', function() {
        if (cm2.getValue() === '3456789') {
          expect(cm2.getValue()).toEqual('3456789');
          done();
        }
      });
    });
  });

  it('Random text changes', function(done) {
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var cm1 = CodeMirror(hiddenDiv());
    var cm2 = CodeMirror(hiddenDiv());
    var firepad1 = new Firepad(ref, cm1);
    var firepad2 = new Firepad(ref, cm2);

    function step(times) {
      if (times == 0) {
        expect(cm1.getValue()).toEqual(cm2.getValue());
        done();
      } else {
        randomOperation(cm1);
        waitFor(function() {
          return cm1.getValue() === cm2.getValue();
        }, function() {
          step(times - 1);
        });
      }
    }

    firepad1.on('ready', function() {
      firepad1.setText('lorem ipsum');
      step(25);
    });
  });

  it('Uses defaultText to initialize the pad properly', function(done) {
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var cm = CodeMirror(hiddenDiv());
    var cm2 = CodeMirror(hiddenDiv());
    var text = 'This should be the starting text';
    var text2 = 'this is a new, different text';
    var firepad = new Firepad(ref, cm, { defaultText: text});

    firepad.on('ready', function() {
      expect(firepad.getText()).toEqual(text);
      firepad.setText(text2);
      var firepad2 = new Firepad(ref, cm2, { defaultText: text});
      firepad2.on('ready', function() {
        if (firepad2.getText() == text2) {
          done();
        } else if (firepad2.getText() == text) {
          done(new Error('Default text won over edited text'));
        } else {
          done(new Error('Second Firepad got neither default nor edited text: ' + JSON.stringify(firepad2.getText())));
        }
      });
    });
  });

  it('Emits sync events as users edit the pad', function(done) {
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var cm = CodeMirror(hiddenDiv());
    var firepad = new Firepad(ref, cm, { defaultText: 'XXXXXXXX' });
    var startedSyncing = false;
    
    firepad.on('ready', function() {
      randomOperation(cm);
      firepad.on('synced', function(synced) {
        if (startedSyncing) {
          if (synced == true) {
            done();
          }
        } else {
          expect(synced).toBe(false);
          startedSyncing = true;
        }
      });
    });
  });

  it('Performs Firepad.dispose', function(done){
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var cm = CodeMirror(hiddenDiv());
    var firepad = new Firepad(ref, cm, { defaultText: "It\'s alive." });

    firepad.on('ready', function() {
      firepad.dispose();
      // We'd like to know all firebase callbacks were removed.
      // This does not prove there was no leak but it shows we tried.
      expect(firepad.firebaseAdapter_.firebaseCallbacks_).toEqual([]);
      expect(function() { firepad.isHistoryEmpty(); }).toThrow();
      expect(function() { firepad.getText(); }).toThrow();
      expect(function() { firepad.setText("I'm a zombie.  Braaaains..."); }).toThrow();
      expect(function() { firepad.getHtml(); }).toThrow();
      expect(function() { firepad.setHtml("<p>I'm a zombie.  Braaaains...</p>"); }).toThrow();
      done();
    });
  });

  it('Safely performs Firepad.dispose immediately after construction', function(){
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var cm = CodeMirror(hiddenDiv());
    var firepad = new Firepad(ref, cm);

    expect(function() {
      firepad.dispose();
    }).not.toThrow();
  });
});
