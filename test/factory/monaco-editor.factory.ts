import { editor } from "monaco-editor";
import * as Utils from "../../src/utils";
import { clearMock, resetMock } from "./factory-utils";

Utils.validateFalse(
  jest == null,
  "This factories can only be imported in Test environment"
);

let content: string = "";

const monacoEditor: Partial<editor.IStandaloneCodeEditor> = Object.freeze({
  getValue: jest.fn<string, []>(() => content),
});

afterEach(() => {
  clearMock(monacoEditor);
});

afterAll(() => {
  resetMock(monacoEditor);
});

/**
 * Returns a mock implementation of IStandaloneCodeEditor interface.
 * Useful for testing Monaco Adapter, Firepad.fromMonaco and related helper functions.
 */
export function getMonacoEditor(): editor.IStandaloneCodeEditor {
  return monacoEditor as editor.IStandaloneCodeEditor;
}
