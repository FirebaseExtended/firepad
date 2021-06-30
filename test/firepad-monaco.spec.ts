import { editor } from "monaco-editor";
import { fromMonaco } from "../src/firepad-monaco";
import { getDatabaseAdapter, getEditorAdapter } from "./factory";
import { getMonacoEditor } from "./factory/monaco-editor.factory";

jest.mock("../src/firebase-adapter", () => {
  const { getDatabaseAdapter } = require("./factory/database-adapter.factory");
  class FirebaseAdapterMock {
    constructor(
      databaseRef: string | firebase.database.Reference,
      userId: number | string,
      userColor: string,
      userName: string
    ) {
      return getDatabaseAdapter(databaseRef, { userId, userColor, userName });
    }
  }
  return {
    __esModule: true,
    FirebaseAdapter: FirebaseAdapterMock,
  };
});

jest.mock("../src/monaco-adapter", () => {
  const { getEditorAdapter } = require("./factory/editor-adapter.factory");
  class MonacoAdapterMock {
    constructor(monacoInstance: editor.IStandaloneCodeEditor) {
      return getEditorAdapter(monacoInstance);
    }
  }
  return {
    __esModule: true,
    MonacoAdapter: MonacoAdapterMock,
  };
});

describe("fromMonaco", () => {
  let databaseRef: string;
  let monacoEditor: editor.IStandaloneCodeEditor;

  beforeAll(() => {
    databaseRef = ".root/firepad";
    monacoEditor = getMonacoEditor();
  });

  it("should allow passing additional configuration object", () => {
    const userId = "user";
    fromMonaco(databaseRef, monacoEditor, { userId });
    expect(getDatabaseAdapter().getUser().userId).toEqual(userId);
  });

  it("should create database adapter from Firebase reference", () => {
    fromMonaco(databaseRef, monacoEditor);
    expect(getDatabaseAdapter().getDatabaseRef()).toEqual(databaseRef);
  });

  it("should create editor adapter from Monaco instance", () => {
    fromMonaco(databaseRef, monacoEditor);
    expect(getEditorAdapter().getEditor()).toEqual(monacoEditor);
  });
});
