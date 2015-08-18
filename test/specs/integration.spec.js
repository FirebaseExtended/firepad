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
    cm.operation(function () {
      randomChange(cm);
    });
  }

  beforeEach(function(done) {
    // Make sure we're connected to Firebase.  This can take a while on slow
    // connections.
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com/.info/connected');
    var connected = false;
    var listener = ref.on('value', function(s) {
      if(s.val() == true){
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
      setTimeout(function() {
        expect(cm2.getValue()).toEqual('3456789');
        done();
      }, 500);
    });
  });

  it('Random text changes', function (done) {
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var cm1 = CodeMirror(hiddenDiv());
    var cm2 = CodeMirror(hiddenDiv());
    var firepad1 = new Firepad(ref, cm1);
    var firepad2 = new Firepad(ref, cm2);

    function step (times) {
      if (times == 0) {
        done();
      }else{
        randomOperation(cm1);
        setTimeout(function() {
          expect(cm1.getValue()).toEqual(cm2.getValue());
          step(times - 1);
        }, 400);
      }
    }

    firepad1.on('ready', function() {
      firepad1.setText('lorem ipsum');
      step(25);
    });
  }, 777 * 25 + 1000);

  it('Performs getHtml responsively', function(done) {
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var cm = CodeMirror(hiddenDiv());
    var firepad = new Firepad(ref, cm);

    firepad.on('ready', function() {
      var html = '<b>bold</b>';
      firepad.setHtml(html);
      expect(firepad.getHtml()).toContain(html);
      done();
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
        if(firepad2.getText() == text2){
          done();
        }else if(firepad2.getText() == text){
          done(new Error("Default text won over edited text"));
        }else{
          done(new Error("Second Firepad got neither default nor edited text: " + JSON.stringify(firepad2.getText())));
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
        if(startedSyncing){
          if(synced == true){
            done();
          }
        }else{
          expect(synced).toBe(false);
          startedSyncing = true;
        }
      });
    });
  });

  it('Performs headless get/set plaintext', function(done){
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var cm = CodeMirror(hiddenDiv());
    var firepadCm = new Firepad(ref, cm);
    var firepadHeadless = new Headless(ref);

    var text = 'Hello from headless firepad!';

    firepadHeadless.setText(text, function() {
      firepadHeadless.getText(function(headlessText) {
        expect(headlessText).toEqual(firepadCm.getText());
        expect(headlessText).toEqual(text);
        done();
      })
    });
  });

  it('Performs headless get/set html', function(done) {
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var cm = CodeMirror(hiddenDiv());
    var firepadCm = new Firepad(ref, cm);
    var firepadHeadless = new Headless(ref);

    var html =
      '<span style="font-size: 24px;">Rich-text editing with <span style="color: red">Firepad!</span></span><br/>\n' +
      '<br/>' +
      '<div style="font-size: 18px">' +
      'Supports:<br/>' +
      '<ul>' +
        '<li>Different ' +
          '<span style="font-family: impact">fonts,</span>' +
          '<span style="font-size: 24px;""> sizes, </span>' +
          '<span style="color: blue">and colors.</span>' +
        '</li>' +
        '<li>' +
          '<b>Bold, </b>' +
          '<i>italic, </i>' +
          '<u>and underline.</u>' +
        '</li>' +
        '<li>Lists' +
          '<ol>' +
            '<li>One</li>' +
            '<li>Two</li>' +
          '</ol>' +
        '</li>' +
        '<li>Undo / redo</li>' +
        '<li>Cursor / selection synchronization.</li>' +
        '<li>And it\'s all fully collaborative!</li>' +
      '</ul>' +
      '</div>';

    firepadHeadless.setHtml(html, function() {
      firepadHeadless.getHtml(function(headlessHtml) {
        expect(headlessHtml).toEqual(firepadCm.getHtml());
        done();
      });
    });
  });

  it('Headless firepad takes a string path as well', function(done) {
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var path = 'https://firepad-test.firebaseio-demo.com/' + ref.key();
    var text = 'Hello from headless firepad!';
    var firepadHeadless = new Headless(path);

    firepadHeadless.setText(text, function() {
      firepadHeadless.getText(function(headlessText) {
        expect(headlessText).toEqual(text);
        done();
      });
    });
  });

  it('Ace editor', function (done) {
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();

    var editor = ace.edit(hiddenDiv().appendChild(document.createElement("div")));

    var text = '// JavaScript in Firepad!\nfunction log(message) {\n  console.log(message);\n}';
    var firepad = Firepad.fromACE(ref, editor);

    firepad.on('ready', function() {
      firepad.setText(text);
      expect(firepad.getText()).toEqual(text);
      done();
    });
  });

});
