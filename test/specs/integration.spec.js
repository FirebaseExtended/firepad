describe('Integration tests', function() {
  var h = helpers;
  var Firepad = firepad.Firepad;
  var Headless = Firepad.Headless;

  var _cmDiv;
  function cmDiv() {
    if (!_cmDiv) {
      _cmDiv = document.createElement('div');
      _cmDiv.style.display = 'none';
      document.body.appendChild(_cmDiv);
    }
    return _cmDiv;
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

  beforeEach(function() {
    // Make sure we're connected to Firebase.  This can take a while on slow
    // connections.
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com/.info/connected');
    var connected = false;
    var listener = ref.on('value', function(s) {
      connected = s.val() == true;
    });

    waitsFor(function() { return connected; }, 'connected', 10000);

    runs(function() {
      ref.off('value', listener);
    });
  });

  it('Out-of-order edit', function () {
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var cm1 = CodeMirror(cmDiv());
    var cm2 = CodeMirror(cmDiv());
    var firepad1 = new Firepad(ref, cm1);
    var firepad2 = new Firepad(ref, cm2);

    firepad1.on('ready', function() {
      firepad1.setText('XXX3456789XXX');
      cm1.operation(function() {
        cm1.replaceRange('', {line: 0, ch: 10}, {line: 0, ch: 13});
        cm1.replaceRange('', {line: 0, ch: 0},  {line: 0, ch: 3});
      });
    });
    waitsFor(function() { return cm2.getValue() === '3456789' }, 'Got correct end value.');
  });

  it('Random text changes', function () {
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var cm1 = CodeMirror(cmDiv());
    var cm2 = CodeMirror(cmDiv());
    var firepad1 = new Firepad(ref, cm1);
    var firepad2 = new Firepad(ref, cm2);

    var n = 25;

    var done = false;
    function step () {
      if (n == 0) {
        done = true;
        return;
      }

      n--;
      randomOperation(cm1);

      waitsFor(function() { return cm1.getValue() == cm2.getValue(); }, 'firepads to match');
      runs(step);
    }

    var ready = false;
    firepad1.on('ready', function() {
      firepad1.setText('lorem ipsum');
      ready = true;
    });

    waitsFor(function() { return ready; }, 'Firepad ready.');

    runs(step);
  });

  it('Performs getHtml responsively', function() {
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var cm = CodeMirror(cmDiv());
    var firepad = new Firepad(ref, cm);

    waitsFor(function() { return firepad.ready_ }, 'firepad is ready');

    var html = '<b>bold</b>';
    runs(function() {
      firepad.setHtml(html);
      expect(firepad.getHtml()).toContain(html);
    });
  });

  it('Uses defaultText to initialize the pad properly', function() {
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var cm = CodeMirror(cmDiv());
    var cm2 = CodeMirror(cmDiv());
    var text = 'This should be the starting text';
    var text2 = 'this is a new, different text';
    var firepad = new Firepad(ref, cm, { defaultText: text});
    var firepad2 = null;

    waitsFor(function() { return firepad.ready_ }, 'firepad is ready');

    runs(function() {
      expect(firepad.getText()).toEqual(text);
      firepad.setText(text2);
      firepad2 = new Firepad(ref, cm2, { defaultText: text});
    });

    waitsFor(function() { return firepad2.ready_ }, 'firepad2 is ready');

    waitsFor(function() { return firepad2.getText() == text2 }, 'edited text won over default');
  });

  it('Emits sync events as users edit the pad', function() {
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var cm = CodeMirror(cmDiv());
    var firepad = new Firepad(ref, cm, { defaultText: 'XXXXXXXX' });
    var syncHistory = [];

    firepad.on('synced', function(synced) { syncHistory.push(synced); });

    waitsFor(function() { return firepad.ready_ }, 'firepad is ready');

    runs(function() {
      randomOperation(cm);
      setTimeout(function() {
        expect(syncHistory[0]).toBe(false);  // semi-immediately after local edit
      }, 1);
    });

    waitsFor(function() { return syncHistory[syncHistory.length - 1] === true; }, 'synced again.');
  });

  it('Performs Firepad.dispose', function(){
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var cm = CodeMirror(cmDiv());
    var firepad = new Firepad(ref, cm, { defaultText: "It\'s alive." });

    waitsFor(function() { return firepad.ready_ }, 'firepad is ready');

    runs(function() {
      firepad.dispose();
      // We'd like to know all firebase callbacks were removed.
      // This does not prove there was no leak but it shows we tried.
      expect(firepad.firebaseAdapter_.firebaseCallbacks_).toEqual([]);
      expect(function() { firepad.isHistoryEmpty(); }).toThrow();
      expect(function() { firepad.getText(); }).toThrow();
      expect(function() { firepad.setText("I'm a zombie.  Braaaains..."); }).toThrow();
      expect(function() { firepad.getHtml(); }).toThrow();
      expect(function() { firepad.setHtml("<p>I'm a zombie.  Braaaains...</p>"); }).toThrow();
    });
  });

  it('Performs headless get/set plaintext & dispose', function(){
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var cm = CodeMirror(cmDiv());
    var firepadCm = new Firepad(ref, cm);
    var firepadHeadless = new Headless(ref);

    var text = 'Hello from headless firepad!';

    firepadHeadless.setText(text);

    waitsFor(function() { return cm.getValue() == text; }, 'cm matches text');

    runs(function() {
      var headlessText = null;
      firepadHeadless.getText(function(val) {
        headlessText = val;
      });

      waitsFor(function() { return headlessText == text; }, 'firepad headless matches text');
    });

    runs(function() {
      firepadHeadless.dispose();
      // We'd like to know all firebase callbacks were removed.
      // This does not prove there was no leak but it shows we tried.
      expect(firepadHeadless.firebaseAdapter_.firebaseCallbacks_).toEqual([]);
      expect(function() { firepadHeadless.getText(function() {}); }).toThrow();
      expect(function() { firepadHeadless.setText("I'm a zombie.  Braaaains..."); }).toThrow();
    });
  });

  it('Performs headless get/set html & dispose', function() {
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var cm = CodeMirror(cmDiv());
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

    var headlessHtml = null;
    firepadHeadless.setHtml(html, function() {
      firepadHeadless.getHtml(function(val) {
        headlessHtml = val;
      })
    });

    waitsFor(function() { return firepadCm.ready_ }, 'firepad is ready');

    waitsFor(function() { return headlessHtml == firepadCm.getHtml(); }, 'firepad headless html matches cm-firepad html');

    runs(function() {
      firepadHeadless.dispose();
      // We'd like to know all firebase callbacks were removed.
      // This does not prove there was no leak but it shows we tried.
      expect(firepadHeadless.firebaseAdapter_.firebaseCallbacks_).toEqual([]);
      expect(function() { firepadHeadless.getHtml(function() {}); }).toThrow();
      expect(function() { firepadHeadless.setHtml("<p>I'm a zombie.  Braaaains...</p>"); }).toThrow();
    });
  });

  it('Headless firepad takes a string path as well', function() {
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var path = 'https://firepad-test.firebaseio-demo.com/' + ref.key();
    var text = 'Hello from headless firepad!';
    var firepadHeadless = new Headless(path);
    var headlessText = null;

    firepadHeadless.setText(text, function() {
      firepadHeadless.getText(function(val) {
        headlessText = val;
      });
    });

    runs(function() {
      waitsFor(function() { return headlessText == text; }, 'firepad headless matches text');
    });
  });

  it('Safely performs Headless.dispose immediately after construction', function(){
    var ref = new Firebase('https://firepad-test.firebaseio-demo.com').push();
    var firepadHeadless = new Headless(ref);

    runs(function() {
      firepadHeadless.dispose();
    });
  });
});
