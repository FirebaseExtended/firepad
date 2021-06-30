import { IDatabaseAdapter } from "../../src/database-adapter";
import { IEditorAdapter } from "../../src/editor-adapter";
import { EventEmitter, IEventEmitter } from "../../src/emitter";
import * as Utils from "../../src/utils";

Utils.validateFalse(
  jest == null,
  "This factories can only be imported in Test environment"
);

const emitter: IEventEmitter = new EventEmitter();
const clearUndoRedoStackStub = jest.fn<void, []>();

let databaseAdapter: IDatabaseAdapter;
let editorAdapter: IEditorAdapter;

export interface IEditorClientMock extends IEventEmitter {
  clearUndoRedoStack(): void;
}

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
