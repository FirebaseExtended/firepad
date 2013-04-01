describe('CodeMirrorAdapter', function() {
  var TextOperation     = firepad.TextOperation;
  var CodeMirrorAdapter = firepad.CodeMirrorAdapter;
  var h = helpers;

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

  it("converting between CodeMirror changes and operations", function () {
    var str = 'lorem ipsum';

    var cm1 = CodeMirror(cmDiv(), { value: str });
    cm1.on('change', function (_, change) {
      var pair = CodeMirrorAdapter.operationFromCodeMirrorChange(change, cm1);
      var operation = pair[0];
      CodeMirrorAdapter.applyOperationToCodeMirror(operation, cm2);
    });

    var cm2 = CodeMirror(cmDiv(), { value: str });

    var n = 100;
    expect(n);

    var done = false;
    function step () {
      while (n--) {
        randomOperation(cm1);
        var v1 = cm1.getValue();
        var v2 = cm2.getValue();
        if (v1 !== v2) {
          throw new Error("the contents of both CodeMirror instances should be equal");
        }

        if (n % 10 === 0) {
          setTimeout(step, 10); // give the browser a chance to repaint
          break;
        }
      }
      if (n === 0) { done = true; }
    }
    step();
    waitsFor(function() { return done; }, "Random changes to CodeMirror to finish.");
  });

  it("should trigger the 'change' event when the user makes an edit", function () {
    var cm = CodeMirror(cmDiv(), { value: "lorem ipsum" });
    var cmAdapter = new CodeMirrorAdapter(cm);
    var operations = [];
    var inverses = [];
    cmAdapter.registerCallbacks({
      change: function (operation, inverse) {
        operations.push(operation);
        inverses.push(inverse);
      }
    });
    var edit1 = new TextOperation().retain(11).insert(" dolor");
    CodeMirrorAdapter.applyOperationToCodeMirror(edit1, cm);
    expect(operations.shift()).toEqual(edit1);
    expect(inverses.shift()).toEqual(edit1.invert("lorem ipsum"));

    var edit2 = new TextOperation()['delete'](1).retain(16);
    CodeMirrorAdapter.applyOperationToCodeMirror(edit2, cm);
    expect(operations.shift()).toEqual(edit2);
    expect(inverses.shift()).toEqual(edit2.invert("lorem ipsum dolor"));

    expect(operations.length).toBe(0);
    expect(inverses.length).toBe(0);
  });

  it("applyOperation should apply the operation to CodeMirror, but not trigger an event", function () {
    var doc = "nanana";
    var cm = CodeMirror(cmDiv(), { value: doc });
    var cmAdapter = new CodeMirrorAdapter(cm);
    cmAdapter.registerCallbacks({
      change: function () {
        throw new Error("change shouldn't be called!");
      }
    });
    cmAdapter.applyOperation(new TextOperation().retain(6).insert("nu"));
    expect(cm.getValue()).toBe(cmAdapter.getValue());
    expect(cmAdapter.getValue()).toBe("nanananu");
  });

  it("getValue", function () {
    var doc = "guten tag";
    var cm = CodeMirror(cmDiv(), { value: doc });
    var cmAdapter = new CodeMirrorAdapter(cm);
    CodeMirrorAdapter.applyOperationToCodeMirror(new TextOperation()['delete'](1).insert("G").retain(8), cm);
    expect(cmAdapter.getValue()).toBe("Guten tag");
    cmAdapter.applyOperation(new TextOperation().retain(6)['delete'](1).insert("T").retain(2));
    expect(cmAdapter.getValue()).toBe("Guten Tag");
  });

  it("register undo/redo", function () {
    var cm = CodeMirror(cmDiv(), {});
    var cmAdapter = new CodeMirrorAdapter(cm);
    var undoFn = function () { return "undo!"; };
    var redoFn = function () { return "redo!"; };
    cmAdapter.registerUndo(undoFn);
    cmAdapter.registerRedo(redoFn);
    expect(cm.undo).toBe(undoFn);
    expect(cm.redo).toBe(redoFn);
  });

  it("detach", function () {
    var cm = CodeMirror(cmDiv(), {});
    var cmAdapter = new CodeMirrorAdapter(cm);
    var changes = 0;
    cmAdapter.registerCallbacks({ change: function () { changes += 1; } });
    cm.setValue("42");
    expect(changes).toBe(1);
    cmAdapter.detach();
    cm.setValue("23");
    expect(changes).toBe(1);
  });

  // TODO:
  // * trigger 'cursorActivity' (and ordering with 'change' event)
  // * setCursor
  // * getCursor
  // * setOtherCursor

});