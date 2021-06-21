import { Cursor } from "../src/cursor";
import { OperationMeta } from "../src/operation-meta";
import { TextOperation } from "../src/text-operation";
import { IUndoManager, UndoManager } from "../src/undo-manager";
import { IWrappedOperation, WrappedOperation } from "../src/wrapped-operation";

describe("Undo Manager", () => {
  let undoManager: IUndoManager;
  let wrappedOperation: IWrappedOperation;

  beforeAll(() => {
    const operation = new TextOperation().retain(15, null);
    const operationMeta = new OperationMeta(new Cursor(0, 0), new Cursor(4, 9));
    wrappedOperation = new WrappedOperation(operation, operationMeta);
  });

  beforeEach(() => {
    undoManager = new UndoManager();
  });

  afterEach(() => {
    undoManager.dispose();
    undoManager = null;
  });

  describe("#dispose", () => {
    it("should cleanup Undo stack", () => {
      undoManager.add(wrappedOperation);
      undoManager.dispose();
      expect(undoManager.canUndo()).toEqual(false);
    });

    it("should cleanup Redo stack", () => {
      undoManager.add(wrappedOperation);
      undoManager.dispose();
      expect(undoManager.canRedo()).toEqual(false);
    });
  });

  describe("#add", () => {
    it("should add operation to Undo stack in normal state", () => {
      undoManager.add(wrappedOperation);
      expect(undoManager.canUndo()).toEqual(true);
    });

    it("should add operation to Redo stack in undoing state", () => {
      undoManager.add(wrappedOperation);
      undoManager.performUndo(() => {
        undoManager.add(wrappedOperation.invert(""));
      });
      expect(undoManager.canRedo()).toEqual(true);
    });

    it("should add operation to Undo stack in redoing state", () => {
      undoManager.add(wrappedOperation);
      undoManager.performUndo(() => {
        undoManager.add(wrappedOperation.invert(""));
      });
      undoManager.performRedo(() => {
        undoManager.add(wrappedOperation);
      });
      expect(undoManager.canUndo()).toEqual(true);
    });

    it("should compose with last operation if exists and compose set to true", () => {
      const nextOperation = wrappedOperation.clone();
      undoManager = new UndoManager(1);
      undoManager.add(wrappedOperation);
      undoManager.add(nextOperation, true);
      undoManager.performUndo(() => {
        /** Empty Callback */
      });
      expect(undoManager.canUndo()).toEqual(false);
    });

    it("should not add more operations than the limit given", () => {
      undoManager = new UndoManager(1);
      undoManager.add(wrappedOperation);
      undoManager.add(wrappedOperation.invert("Test"));
      undoManager.performUndo(() => {
        /** Empty Callback */
      });
      expect(undoManager.canUndo()).toEqual(false);
    });

    it("should throw error if the limit is set to zero", () => {
      const fn = () => new UndoManager(0);
      expect(fn).toThrowError();
    });
  });

  describe("#last", () => {
    it("should return last operation in Undo stack", () => {
      undoManager.add(wrappedOperation);
      expect(undoManager.last()).toEqual(wrappedOperation);
    });
  });

  describe("#transform", () => {
    it("should transform Undo/Redo stack to incoming operation", () => {
      undoManager.add(wrappedOperation);
      const operation = new TextOperation()
        .retain(15, null)
        .insert("Hello", null);
      undoManager.transform(operation);
      expect(undoManager.last()).not.toEqual(wrappedOperation);
    });
  });

  describe("#isUndoing", () => {
    it("should return true if the manager is undoing an operation", (done) => {
      undoManager.add(wrappedOperation);
      undoManager.performUndo(() => {
        expect(undoManager.isUndoing()).toEqual(true);
        done();
      });
    });
  });

  describe("#isRedoing", () => {
    it("should return true if the manager is redoing an operation", (done) => {
      undoManager.add(wrappedOperation);
      undoManager.performUndo(() => {
        undoManager.add(wrappedOperation.invert(""));
      });
      undoManager.performRedo(() => {
        expect(undoManager.isRedoing()).toEqual(true);
        done();
      });
    });
  });
});
