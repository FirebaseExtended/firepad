describe('Integration tests', function() {
  var h = helpers;
  var Firepad = firepad.Firepad;

  var _cmDiv;
  function cmDiv() {
    if (!_cmDiv) {
      _cmDiv = document.createElement();
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
      console.log('ready!');
      firepad1.setText('lorem ipsum');
      ready = true;
    });

    waitsFor(function() { return ready; }, "Firepad ready.");

    runs(step);
  });
});