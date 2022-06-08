import { Cursor } from "../src/cursor";
import {
  DatabaseAdapterEvent,
  IDatabaseAdapter,
} from "../src/database-adapter";
import { EditorAdapterEvent, IEditorAdapter } from "../src/editor-adapter";
import {
  EditorClient,
  EditorClientEvent,
  IEditorClient,
  IEditorClientEvent,
} from "../src/editor-client";
import { EventListenerType } from "../src/emitter";
import { TextOperation } from "../src/text-operation";
import {
  getDatabaseAdapter,
  getEditorAdapter,
  IDatabaseAdapterMock,
  IEditorAdapterMock,
} from "./factory";

describe("Editor Client", () => {
  let databaseAdapter: IDatabaseAdapterMock;
  let editorAdapter: IEditorAdapterMock;
  let editorClient: IEditorClient;
  let eventListenerStub: EventListenerType<IEditorClientEvent>;

  beforeAll(() => {
    databaseAdapter = getDatabaseAdapter();
    editorAdapter = getEditorAdapter();
    eventListenerStub = jest.fn<void, [IEditorClientEvent]>();
  });

  beforeEach(() => {
    editorClient = new EditorClient(
      databaseAdapter as IDatabaseAdapter,
      editorAdapter as IEditorAdapter
    );
  });

  afterEach(() => {
    editorClient.dispose();
  });

  describe("#on", () => {
    it("should attach event listener to emitter for valid event", () => {
      const fn = () =>
        editorClient.on(EditorClientEvent.Synced, eventListenerStub);
      expect(fn).not.toThrowError();
    });
  });

  describe("#off", () => {
    it("should detach event listener to emitter for valid event", () => {
      const fn = () =>
        editorClient.off(EditorClientEvent.Synced, eventListenerStub);
      expect(fn).not.toThrowError();
    });
  });

  describe("_editorAdapter", () => {
    describe("#onBlur", () => {
      it("should send null as cursor to Database adapter", () => {
        editorAdapter.trigger(EditorAdapterEvent.Blur);
        expect(databaseAdapter.sendCursor).toHaveBeenCalledWith(null);
      });
    });

    describe("#onFocus", () => {
      it("should not make any Database call if cursor position is same as before", () => {
        editorAdapter.trigger(EditorAdapterEvent.Focus);
        expect(databaseAdapter.sendCursor).not.toHaveBeenCalled();
      });

      it("should send cursor to Database adapter", () => {
        const cursor = new Cursor(4, 9);
        editorAdapter.setCursor(cursor);
        editorAdapter.trigger(EditorAdapterEvent.Focus);
        expect(databaseAdapter.sendCursor).toHaveBeenCalledWith(cursor);
      });
    });

    describe("#onCursorActivity", () => {
      it("should send cursor to Database adapter", () => {
        const cursor = new Cursor(6, 7);
        editorAdapter.setCursor(cursor);
        editorAdapter.trigger(EditorAdapterEvent.CursorActivity);
        expect(databaseAdapter.sendCursor).toHaveBeenCalledWith(cursor);
      });

      it("should postpone sending if an operation is pending on client", () => {
        const initialContent = "";
        const operation = new TextOperation().insert("Hello World", null);
        const invertOperation = operation.invert(initialContent);
        editorAdapter.trigger(
          EditorAdapterEvent.Change,
          operation,
          invertOperation
        );
        editorAdapter.trigger(EditorAdapterEvent.Undo);
        editorAdapter.setCursor(new Cursor(10, 12));
        editorAdapter.trigger(EditorAdapterEvent.CursorActivity);
        expect(databaseAdapter.sendCursor).not.toHaveBeenCalled();

        databaseAdapter.trigger(DatabaseAdapterEvent.Acknowledge);
        databaseAdapter.trigger(DatabaseAdapterEvent.Acknowledge);
      });
    });

    describe("#onChange", () => {
      it("should send operation to Database adapter", () => {
        const initialContent = "";
        const operation = new TextOperation().insert("Hello World", null);
        const invertOperation = operation.invert(initialContent);
        editorAdapter.trigger(
          EditorAdapterEvent.Change,
          operation,
          invertOperation
        );
        databaseAdapter.trigger(DatabaseAdapterEvent.Acknowledge);
        expect(databaseAdapter.sendOperation).toHaveBeenCalledWith(operation);
      });
    });

    describe("#onError", () => {
      it("should bubble up error message with additional attributes", (done) => {
        const err = "Something Went Wrong";
        const operation = new TextOperation().retain(100, null);
        const state = {
          retain: 20,
        };

        editorClient.on(EditorClientEvent.Error, (...args) => {
          expect(args).toEqual([err, operation, state]);
          done();
        });

        editorAdapter.trigger(EditorAdapterEvent.Error, err, operation, state);
      });
    });

    describe("#registerUndo", () => {
      it("should trigger undo event with stringified invert operation", (done) => {
        const initialContent = "";
        const operation = new TextOperation().insert("Hello World", null);
        const invertOperation = operation.invert(initialContent);
        editorClient.on(EditorClientEvent.Undo, (arg) => {
          expect(arg).toEqual(invertOperation.toString());
          done();
        });
        editorAdapter.trigger(
          EditorAdapterEvent.Change,
          operation,
          invertOperation
        );
        databaseAdapter.trigger(DatabaseAdapterEvent.Acknowledge);
        editorAdapter.trigger(EditorAdapterEvent.Undo);
        databaseAdapter.trigger(DatabaseAdapterEvent.Acknowledge);
      });

      it("should apply invert operation to editor adapter", () => {
        const initialContent = "";
        const operation = new TextOperation().insert("Hello World", null);
        const invertOperation = operation.invert(initialContent);
        editorAdapter.trigger(
          EditorAdapterEvent.Change,
          operation,
          invertOperation
        );
        databaseAdapter.trigger(DatabaseAdapterEvent.Acknowledge);
        editorAdapter.trigger(EditorAdapterEvent.Undo);
        databaseAdapter.trigger(DatabaseAdapterEvent.Acknowledge);
        expect(editorAdapter.applyOperation).toHaveBeenCalledWith(
          invertOperation
        );
      });
    });

    describe("#registerRedo", () => {
      it("should trigger redo event with stringified invert of invert operation", (done) => {
        const initialContent = "";
        const operation = new TextOperation().insert("Hello World", null);
        const invertOperation = operation.invert(initialContent);
        editorAdapter.trigger(
          EditorAdapterEvent.Change,
          operation,
          invertOperation
        );
        databaseAdapter.trigger(DatabaseAdapterEvent.Acknowledge);
        editorAdapter.trigger(EditorAdapterEvent.Undo);
        databaseAdapter.trigger(DatabaseAdapterEvent.Acknowledge);
        const currentContent = editorAdapter.getText();
        editorClient.on(EditorClientEvent.Redo, (arg) => {
          expect(arg).toEqual(
            invertOperation.invert(currentContent).toString()
          );
          done();
        });
        editorAdapter.trigger(EditorAdapterEvent.Redo);
        databaseAdapter.trigger(DatabaseAdapterEvent.Acknowledge);
      });

      it("should apply invert of invert operation to editor adapter", () => {
        const initialContent = "";
        const operation = new TextOperation().insert("Hello World", null);
        const invertOperation = operation.invert(initialContent);
        editorAdapter.trigger(
          EditorAdapterEvent.Change,
          operation,
          invertOperation
        );
        databaseAdapter.trigger(DatabaseAdapterEvent.Acknowledge);
        editorAdapter.trigger(EditorAdapterEvent.Undo);
        databaseAdapter.trigger(DatabaseAdapterEvent.Acknowledge);
        const currentContent = editorAdapter.getText();
        editorAdapter.trigger(EditorAdapterEvent.Redo);
        databaseAdapter.trigger(DatabaseAdapterEvent.Acknowledge);
        expect(editorAdapter.applyOperation).toHaveBeenCalledWith(
          invertOperation.invert(currentContent)
        );
      });
    });
  });

  describe("#databaseAdapter", () => {
    describe("#onAck", () => {
      it("should emit Synced event once Acknowledgement from Database is received", (done) => {
        editorClient.on(EditorClientEvent.Synced, (isSynced) => {
          expect(isSynced).toEqual(true);
          done();
        });

        const initialContent = "";
        const operation = new TextOperation().insert("Hello World", null);
        const invertOperation = operation.invert(initialContent);
        editorAdapter.trigger(
          EditorAdapterEvent.Change,
          operation,
          invertOperation
        );
        databaseAdapter.trigger(DatabaseAdapterEvent.Acknowledge);
      });

      it("should send current cursor position to Database adapter", () => {
        const initialContent = "";
        const operation = new TextOperation().insert("Hello World", null);
        const invertOperation = operation.invert(initialContent);
        editorAdapter.trigger(
          EditorAdapterEvent.Change,
          operation,
          invertOperation
        );
        databaseAdapter.trigger(DatabaseAdapterEvent.Acknowledge);
        expect(databaseAdapter.sendCursor).toHaveBeenCalled();
      });
    });

    describe("#onOperation", () => {
      it("should apply operation to Editor adapter", () => {
        const initialContent = "";
        editorAdapter.setText(initialContent);
        const operation = new TextOperation().insert("Hello World", null);
        databaseAdapter.trigger(DatabaseAdapterEvent.Operation, operation);
        expect(editorAdapter.applyOperation).toHaveBeenCalledWith(operation);
      });
    });

    describe("#onRetry", () => {
      it("should resend operation to Database adapter", () => {
        const initialContent = "";
        const operation = new TextOperation().insert("Hello World", null);
        const invertOperation = operation.invert(initialContent);
        editorAdapter.trigger(
          EditorAdapterEvent.Change,
          operation,
          invertOperation
        );
        databaseAdapter.trigger(DatabaseAdapterEvent.Retry);
        expect(databaseAdapter.sendOperation).toHaveBeenNthCalledWith(
          2,
          operation
        );
      });
    });

    describe("#onInitialRevision", () => {
      it("should mark Editor adapter ready for handle onChange", () => {
        databaseAdapter.trigger(DatabaseAdapterEvent.InitialRevision);
        expect(editorAdapter.setInitiated).toHaveBeenCalledWith(true);
      });
    });

    describe("#onCursor", () => {
      it("should update cursor position in Editor adapter for remote users", () => {
        const clientId = "SomeOtherClient";
        const cursor = new Cursor(5, 9);
        const userColor = "#00f0f3";
        const userName = "User";
        databaseAdapter.trigger(
          DatabaseAdapterEvent.CursorChange,
          clientId,
          cursor.toJSON(),
          userColor,
          userName
        );
        expect(editorAdapter.setOtherCursor).toHaveBeenCalledWith(
          clientId,
          cursor,
          userColor,
          userName
        );
      });

      it("should remove cursor from Editor adapter for remote users", () => {
        const clientId = "SomeOtherClient";
        databaseAdapter.trigger(
          DatabaseAdapterEvent.CursorChange,
          clientId,
          null
        );
        expect(editorAdapter.disposeCursor).toHaveBeenCalled();
      });
    });

    describe("#onError", () => {
      it("should bubble up error message with additional attributes", (done) => {
        const err = "Something Went Wrong";
        const operation = new TextOperation().retain(100, null);
        const state = {
          operation: operation.toString(),
          document: "",
        };

        editorClient.on(EditorClientEvent.Error, (...args) => {
          expect(args).toEqual([err, operation, state]);
          done();
        });

        databaseAdapter.trigger(
          DatabaseAdapterEvent.Error,
          err,
          operation,
          state
        );
      });
    });
  });

  describe("#clearUndoRedoStack", () => {
    it("should clean up undo stack", () => {
      const initialContent = "";
      const operation = new TextOperation().insert("Hello World", null);
      const invertOperation = operation.invert(initialContent);
      editorClient.on(EditorClientEvent.Undo, eventListenerStub);
      editorAdapter.trigger(
        EditorAdapterEvent.Change,
        operation,
        invertOperation
      );
      databaseAdapter.trigger(DatabaseAdapterEvent.Acknowledge);
      editorClient.clearUndoRedoStack();
      editorAdapter.trigger(EditorAdapterEvent.Undo);
      expect(eventListenerStub).not.toHaveBeenCalled();
    });

    it("should clean up redo stack", () => {
      const initialContent = "";
      const operation = new TextOperation().insert("Hello World", null);
      const invertOperation = operation.invert(initialContent);
      editorClient.on(EditorClientEvent.Redo, eventListenerStub);
      editorAdapter.trigger(
        EditorAdapterEvent.Change,
        operation,
        invertOperation
      );
      databaseAdapter.trigger(DatabaseAdapterEvent.Acknowledge);
      editorAdapter.trigger(EditorAdapterEvent.Undo);
      databaseAdapter.trigger(DatabaseAdapterEvent.Acknowledge);
      editorClient.clearUndoRedoStack();
      editorAdapter.trigger(EditorAdapterEvent.Redo);
      expect(eventListenerStub).not.toHaveBeenCalled();
    });
  });

  describe("#dispose", () => {
    it("should not allow any syncing after client have been disposed", () => {
      editorClient.dispose();
      const initialContent = "";
      const operation = new TextOperation().insert("Hello World", null);
      const invertOperation = operation.invert(initialContent);
      editorAdapter.trigger(
        EditorAdapterEvent.Change,
        operation,
        invertOperation
      );
      expect(databaseAdapter.sendOperation).not.toHaveBeenCalled();
    });
  });
});
