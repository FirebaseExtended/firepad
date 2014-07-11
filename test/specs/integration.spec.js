describe('Integration tests', function() {
  var h = helpers;
  var Firepad = firepad.Firepad;
  var Headless = Firepad.Headless;

  var _cmDiv;
  function cmDiv() {
    if (!_cmDiv) {
      _cmDiv = document.createElement("div");
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

  it("Out-of-order edit", function () {
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

  it("Random text changes.", function () {
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

    waitsFor(function() { return ready; }, "Firepad ready.");

    runs(step);
  });

  it("Performs getHtml responsively", function() {
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

  it("Performs headless get/set plaintext", function(){
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
      })

      waitsFor(function() { return headlessText == text; }, 'firepad headless matches text');
    });
  });

  it("Performs headless get/set html", function() {
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
          '<span style="font-size: 24px;"> sizes, </span>' +
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
      '</div>'

    var headlessHtml = null;
    firepadHeadless.setHtml(html, function() {
      firepadHeadless.getHtml(function(val) {
        headlessHtml = val;
      })
    });

    waitsFor(function() { return headlessHtml == firepadCm.getHtml(); }, 'firepad headless html matches cm-firepad html');
  });
});
