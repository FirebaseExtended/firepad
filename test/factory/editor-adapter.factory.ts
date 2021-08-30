import {
  IPlainTextOperation as ITextOperation,
  ITextOperation as ITextOp,
} from "@operational-transformation/plaintext";
import {
  ICursor,
  EditorAdapterEvent,
  IEditorAdapter,
} from "@operational-transformation/plaintext-editor";
import mitt, { Handler } from "mitt";
import * as Utils from "../../src/utils";
import { clearMock, resetMock } from "./factory-utils";

Utils.validateFalse(
  jest == null,
  "This factories can only be imported in Test environment"
);

const emitter = mitt();

export interface IEditorAdapterMock extends Partial<IEditorAdapter> {
  /** Trigger an event to lest event listeners */
  trigger(event: EditorAdapterEvent, ...eventAttributes: any[]): void;
  /** Disposes cursor inside editor Adapter */
  disposeCursor(): void;
  /** Returns original editor instance */
  getEditor(): any;
}

const disposeRemoteCursorStub = jest.fn<void, []>();
let currentCursor: ICursor | null = null;
let content: string = "";
let editorInstance: any;

// @ts-expect-error
const editorAdapter: IEditorAdapterMock = Object.freeze({
  on: jest.fn<void, [EditorAdapterEvent, Handler<unknown>]>((ev, handler) => {
    emitter.on(ev, handler);
  }),
  off: jest.fn<void, [EditorAdapterEvent, Handler<unknown>]>((ev, handler) => {
    emitter.off(ev, handler);
  }),
  trigger: jest.fn<void, [EditorAdapterEvent, any]>((ev, ...attrs) => {
    emitter.emit(ev, ...attrs);
  }),
  registerUndo: jest.fn<void, [VoidFunction]>((handler) => {
    emitter.on("undo", handler);
  }),
  registerRedo: jest.fn<void, [VoidFunction]>((handler) => {
    emitter.on("redo", handler);
  }),
  dispose: jest.fn<void, []>(() => {
    emitter.all.clear();
  }),
  setInitiated: jest.fn<void, [boolean]>(),
  getCursor: jest.fn<ICursor, []>(() => currentCursor),
  setCursor: jest.fn<void, [ICursor]>((cursor) => {
    currentCursor = cursor;
  }),
  setOtherCursor: jest.fn<
    Utils.IDisposable,
    [string | number, ICursor, string, string | undefined]
  >(() => ({
    dispose: disposeRemoteCursorStub,
  })),
  disposeCursor: disposeRemoteCursorStub,
  getEditor: jest.fn<any, []>(() => editorInstance),
  getText: jest.fn<string, []>(() => content),
  setText: jest.fn<void, [string]>((text) => {
    content = text;
  }),
  applyOperation: jest.fn<void, [ITextOperation]>((operation) => {
    const contentArray = [...content];
    const ops = operation.entries();

    let index = 0;
    let opValue: IteratorResult<[number, ITextOp]>;

    while (!(opValue = ops.next()).done) {
      const op: ITextOp = opValue.value[1];

      switch (true) {
        case op.isDelete():
          contentArray.splice(index, op.characterCount());
          break;

        case op.isInsert():
          contentArray.splice(index, 0, ...[...op.textContent()]);
          index += op.textContent().length;
          break;

        case op.isRetain():
          index += op.characterCount();
          break;
      }
    }

    content = contentArray.join("");
  }),
  invertOperation: jest.fn<ITextOperation, [ITextOperation]>((operation) =>
    operation.invert(content)
  ),
});

afterEach(() => {
  clearMock(editorAdapter);
});

afterAll(() => {
  emitter.all.clear();
  resetMock(editorAdapter);
});

/**
 * Returns a mock implementation of IEditorAdapter interface.
 * Useful for testing Editor Client, Firepad and related helper functions.
 */
export function getEditorAdapter(editor: any = null): IEditorAdapterMock {
  if (!editorInstance) {
    editorInstance = editor;
  }

  return editorAdapter;
}
