describe('UndoManager', function() {
  var UndoManager = firepad.UndoManager;
  var TextOperation = firepad.TextOperation;
  var h = helpers;

  function Editor (doc) {
    this.doc = doc;
    this.undoManager = new UndoManager();
  }

  Editor.prototype.doEdit = function (operation, dontCompose) {
    function last (arr) { return arr[arr.length - 1]; }
    var compose = !dontCompose && this.undoManager.undoStack.length > 0 &&
      last(this.undoManager.undoStack).invert(this.doc).shouldBeComposedWith(operation);
    this.undoManager.add(operation.invert(this.doc), compose);
    this.doc = operation.apply(this.doc);
  };

  Editor.prototype.serverEdit = function (operation) {
    this.doc = operation.apply(this.doc);
    this.undoManager.transform(operation);
  };

  it('UndoManager', function() {
    var editor = new Editor("Looremipsum");
    var undoManager = editor.undoManager;
    editor.undo = function () {
      expect(undoManager.isUndoing()).toBe(false);
      undoManager.performUndo(function (operation) {
        expect(undoManager.isUndoing()).toBe(true);
        editor.doEdit(operation);
      });
      expect(undoManager.isUndoing()).toBe(false);
    };
    editor.redo = function () {
      expect(undoManager.isRedoing()).toBe(false);
      undoManager.performRedo(function (operation) {
        expect(undoManager.isRedoing()).toBe(true);
        editor.doEdit(operation);
      });
      expect(undoManager.isRedoing()).toBe(false);
    };

    expect(undoManager.canUndo()).toBe(false);
    expect(undoManager.canRedo()).toBe(false);
    editor.doEdit(new TextOperation().retain(2)['delete'](1).retain(8));
    expect(editor.doc).toBe("Loremipsum");
    expect(undoManager.canUndo()).toBe(true);
    expect(undoManager.canRedo()).toBe(false);
    editor.doEdit(new TextOperation().retain(5).insert(" ").retain(5));
    expect(editor.doc).toBe("Lorem ipsum");
    editor.serverEdit(new TextOperation().retain(6)['delete'](1).insert("I").retain(4));
    expect(editor.doc).toBe("Lorem Ipsum");
    editor.undo();
    expect(editor.doc).toBe("LoremIpsum");
    expect(undoManager.canUndo()).toBe(true);
    expect(undoManager.canRedo()).toBe(true);
    expect(1).toBe(undoManager.undoStack.length);
    expect(1).toBe(undoManager.redoStack.length);
    editor.undo();
    expect(undoManager.canUndo()).toBe(false);
    expect(undoManager.canRedo()).toBe(true);
    expect(editor.doc).toBe("LooremIpsum");
    editor.redo();
    expect(editor.doc).toBe("LoremIpsum");
    editor.doEdit(new TextOperation().retain(10).insert("D"));
    expect(editor.doc).toBe("LoremIpsumD");
    expect(undoManager.canRedo()).toBe(false);
    editor.doEdit(new TextOperation().retain(11).insert("o"));
    editor.doEdit(new TextOperation().retain(12).insert("l"));
    editor.undo();
    expect(editor.doc).toBe("LoremIpsum");
    editor.redo();
    expect(editor.doc).toBe("LoremIpsumDol");
    editor.doEdit(new TextOperation().retain(13).insert("o"));
    editor.undo();
    expect(editor.doc).toBe("LoremIpsumDol");
    editor.doEdit(new TextOperation().retain(13).insert("o"));
    editor.doEdit(new TextOperation().retain(14).insert("r"), true);
    editor.undo();
    expect(editor.doc).toBe("LoremIpsumDolo");
    expect(undoManager.canRedo()).toBe(true);
    editor.serverEdit(new TextOperation().retain(10)['delete'](4));
    editor.redo();
    expect(editor.doc).toBe("LoremIpsumr");
    editor.undo();
    editor.undo();
    expect(editor.doc).toBe("LooremIpsum");
  });

  it('UndoManagerMaxItems', function() {
    var doc = h.randomString(50);
    var undoManager = new UndoManager(42);
    var operation;
    for (var i = 0; i < 100; i++) {
      operation = h.randomOperation(doc);
      doc = operation.apply(doc);
      undoManager.add(operation);
    }
    expect(undoManager.undoStack.length).toBe(42);
  });
});
