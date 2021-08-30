import {
  EditorClientEvent,
  IDatabaseAdapter,
  IEditorAdapter,
  IEditorClient,
} from "@operational-transformation/plaintext-editor";
import mitt from "mitt";
import * as Utils from "../../src/utils";

Utils.validateFalse(
  jest == null,
  "This factories can only be imported in Test environment"
);

const emitter = mitt();
const clearUndoRedoStackStub = jest.fn<void, []>();

let databaseAdapter: IDatabaseAdapter;
let editorAdapter: IEditorAdapter;

export interface IEditorClientMock extends IEditorClient {
  /** Trigger an event to lest event listeners */
  trigger(event: EditorClientEvent, ...eventAttributes: any[]): void;
}

// @ts-expect-error
const editorClient: IEditorClientMock = new Proxy(emitter, {
  get: function (target, prop, receiver) {
    if (prop === "clearUndoRedoStack") {
      return clearUndoRedoStackStub;
    }
    return Reflect.get(target, prop, receiver);
  },
}) as IEditorClientMock;

afterEach(() => {
  clearUndoRedoStackStub.mockClear();
});

/**
 * Returns a mock implementation of IEditorClient interface.
 * Useful for testing Firepad and related helper functions.
 */
export function getEditorClient(
  _databaseAdapter?: IDatabaseAdapter,
  _editorAdapter?: IEditorAdapter
): IEditorClientMock {
  databaseAdapter ||= _databaseAdapter;
  editorAdapter ||= _editorAdapter;
  return editorClient;
}
