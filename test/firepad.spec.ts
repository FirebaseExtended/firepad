import {
  DatabaseAdapterEvent,
  DatabaseAdapterStateType,
  IDatabaseAdapter,
} from "../src/database-adapter";
import { EditorAdapterStateType, IEditorAdapter } from "../src/editor-adapter";
import { EditorClientEvent } from "../src/editor-client";
import { Firepad, FirepadEvent, IFirepad } from "../src/firepad";
import {
  getDatabaseAdapter,
  getEditorAdapter,
  getEditorClient,
  IDatabaseAdapterMock,
  IEditorAdapterMock,
} from "./factory";

jest.mock("../src/editor-client", () => {
  const { EditorClientEvent } = jest.requireActual("../src/editor-client");
  const { getEditorClient } = require("./factory/editor-client.factory");
  class EditorClientMock {
    constructor(
      databaseAdapter: IDatabaseAdapter,
      editorAdapter: IEditorAdapter
    ) {
      return getEditorClient(databaseAdapter, editorAdapter);
    }
  }
  return {
    __esModule: true,
    EditorClientEvent,
    EditorClient: EditorClientMock,
  };
});

describe("Firepad", () => {
  let databaseAdapter: IDatabaseAdapterMock;
  let editorAdapter: IEditorAdapterMock;
  let firepad: IFirepad;

  beforeAll(() => {
    databaseAdapter = getDatabaseAdapter();
    editorAdapter = getEditorAdapter();

    firepad = new Firepad(
      databaseAdapter as IDatabaseAdapter,
      editorAdapter as IEditorAdapter,
      databaseAdapter.getUser()
    );
  });

  afterAll(() => {
    firepad.dispose();
  });

  describe("#isHistoryEmpty", () => {
    it("should throw error if called before Firepad is Ready", () => {
      const fn = () => firepad.isHistoryEmpty();
      expect(fn).toThrowError();
    });

    it("should return true if no activity done yet by any user", () => {
      databaseAdapter.trigger(DatabaseAdapterEvent.Ready);
      firepad.isHistoryEmpty();
      expect(databaseAdapter.isHistoryEmpty).toHaveBeenCalled();
    });
  });

  describe("#getConfiguration", () => {
    it("should return User Id of current Firepad", () => {
      databaseAdapter.trigger(DatabaseAdapterEvent.Ready);
      expect(firepad.getConfiguration("userId")).toEqual(
        databaseAdapter.getUser().userId
      );
    });

    it("should return User Name of current Firepad", () => {
      databaseAdapter.trigger(DatabaseAdapterEvent.Ready);
      expect(firepad.getConfiguration("userName")).toEqual(
        databaseAdapter.getUser().userName
      );
    });

    it("should return User Color of current Firepad", () => {
      databaseAdapter.trigger(DatabaseAdapterEvent.Ready);
      expect(firepad.getConfiguration("userColor")).toEqual(
        databaseAdapter.getUser().userColor
      );
    });
  });

  describe("#setUserId", () => {
    it("should set User Id", () => {
      const userId = "user123";
      firepad.setUserId(userId);
      expect(databaseAdapter.getUser().userId).toEqual(userId);
    });
  });

  describe("#setUserColor", () => {
    it("should set User Color", () => {
      const userColor = "#ff0023";
      firepad.setUserColor(userColor);
      expect(databaseAdapter.getUser().userColor).toEqual(userColor);
    });
  });

  describe("#setUserName", () => {
    it("should set User Name", () => {
      const userName = "Adam";
      firepad.setUserName(userName);
      expect(databaseAdapter.getUser().userName).toEqual(userName);
    });
  });

  describe("#getText", () => {
    it("should return current content of the Editor adapter", () => {
      expect(firepad.getText()).toEqual(editorAdapter.getText());
    });
  });

  describe("#setText", () => {
    it("should set content to the Editor adapter", () => {
      const content = "Hello World";
      firepad.setText(content);
      expect(editorAdapter.getText()).toEqual(content);
    });
  });

  describe("#clearUndoRedoStack", () => {
    it("clear undo and redo stack from editor client", () => {
      firepad.clearUndoRedoStack();
      expect(getEditorClient().clearUndoRedoStack).toHaveBeenCalled();
    });
  });

  describe("#on", () => {
    let onSyncListenerStub: jest.Mock<void, [boolean]>;
    let onUndoListenerStub: jest.Mock<void, [string]>;
    let onRedoListenerStub: jest.Mock<void, [string]>;
    let onErrorListenerStub: jest.Mock<
      void,
      [Error, string, DatabaseAdapterStateType | EditorAdapterStateType]
    >;

    beforeAll(() => {
      onSyncListenerStub = jest.fn();
      onUndoListenerStub = jest.fn();
      onRedoListenerStub = jest.fn();
      onErrorListenerStub = jest.fn();
      jest.useFakeTimers();
    });

    afterEach(() => {
      onSyncListenerStub.mockClear();
      onUndoListenerStub.mockClear();
      onRedoListenerStub.mockClear();
      onErrorListenerStub.mockClear();
    });

    afterAll(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    it("should listen to Synced event", () => {
      firepad.on(FirepadEvent.Synced, onSyncListenerStub);
      getEditorClient().trigger(EditorClientEvent.Synced, true);
      jest.runAllTimers();
      expect(onSyncListenerStub).toHaveBeenCalledWith(true);
    });

    it("should listen to Undo event", () => {
      firepad.on(FirepadEvent.Undo, onUndoListenerStub);
      getEditorClient().trigger(EditorClientEvent.Undo, "Retain 120");
      jest.runAllTimers();
      expect(onUndoListenerStub).toHaveBeenCalledWith("Retain 120");
    });

    it("should listen to Redo event", () => {
      firepad.on(FirepadEvent.Redo, onRedoListenerStub);
      getEditorClient().trigger(EditorClientEvent.Redo, "Retain 120");
      jest.runAllTimers();
      expect(onRedoListenerStub).toHaveBeenCalledWith("Retain 120");
    });

    it("should listen to Error event", () => {
      const error = new Error("Something went Wrong");
      const state = {
        document: "",
      };

      firepad.on(FirepadEvent.Error, onErrorListenerStub);
      getEditorClient().trigger(
        EditorClientEvent.Error,
        error,
        "Retain 120",
        state
      );
      jest.runAllTimers();
      expect(onErrorListenerStub).toHaveBeenCalledWith(
        error,
        "Retain 120",
        state
      );
    });
  });

  describe("#off", () => {
    let onSyncListenerStub: jest.Mock<void, [boolean]>;

    beforeAll(() => {
      onSyncListenerStub = jest.fn();
      jest.useFakeTimers();
    });

    afterEach(() => {
      onSyncListenerStub.mockClear();
    });

    afterAll(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    it("should remove listener", () => {
      firepad.on(FirepadEvent.Synced, onSyncListenerStub);
      firepad.off(FirepadEvent.Synced, onSyncListenerStub);
      getEditorClient().trigger(EditorClientEvent.Synced, true);
      jest.runAllTimers();
      expect(onSyncListenerStub).not.toHaveBeenCalled();
    });
  });

  describe("#dispose", () => {
    it("should throw error if Firepad already disposed", () => {
      firepad.dispose();
      const fn = () => firepad.clearUndoRedoStack();
      expect(fn).toThrowError();
    });
  });
});
