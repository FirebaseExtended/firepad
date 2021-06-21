import { ICursor } from "../../src/cursor";
import {
  ClientIDType,
  EditorAdapterEvent,
  EditorEventCallbackType,
  IEditorAdapter,
  IEditorAdapterEvent,
} from "../../src/editor-adapter";
import {
  EventEmitter,
  EventListenerType,
  IEventEmitter,
} from "../../src/emitter";
import { ITextOperation } from "../../src/text-operation";
import * as Utils from "../../src/utils";
import { clearMock, resetMock } from "./factory-utils";

Utils.validateFalse(
  jest == null,
  "This factories can only be imported in Test environment"
);

const emitter: IEventEmitter = new EventEmitter();

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

const editorAdapter: IEditorAdapterMock = Object.freeze({
  on: jest.fn<
    void,
    [EditorAdapterEvent, EventListenerType<IEditorAdapterEvent>]
  >((ev, handler) => {
    emitter.on(ev, handler);
  }),
  off: jest.fn<
    void,
    [EditorAdapterEvent, EventListenerType<IEditorAdapterEvent>]
  >((ev, handler) => {
    emitter.off(ev, handler);
  }),
  registerCallbacks: jest.fn<void, [EditorEventCallbackType]>((callbacks) => {
    Object.entries(callbacks).forEach(([event, listener]) => {
      emitter.on(
        event as EditorAdapterEvent,
        listener as EventListenerType<IEditorAdapterEvent>
      );
    });
  }),
  trigger: jest.fn<void, [EditorAdapterEvent, any]>((ev, ...attrs) => {
    emitter.trigger(ev, ...attrs);
  }),
  registerUndo: jest.fn<void, [VoidFunction]>((handler) => {
    emitter.on("undo", handler);
  }),
  registerRedo: jest.fn<void, [VoidFunction]>((handler) => {
    emitter.on("redo", handler);
  }),
  dispose: jest.fn<void, []>(() => {
    emitter.dispose();
  }),
  setInitiated: jest.fn<void, [boolean]>(),
  getCursor: jest.fn<ICursor, []>(() => currentCursor),
  setCursor: jest.fn<void, [ICursor]>((cursor) => {
    currentCursor = cursor;
  }),
  setOtherCursor: jest.fn<
    Utils.IDisposable,
    [ClientIDType, ICursor, string, string | undefined]
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
    let index = 0;
    const contentArray = [...content];
    const ops = operation.getOps();

    for (const op of ops) {
      if (op.isRetain()) {
        index += op.chars;
        continue;
      }

      if (op.isDelete()) {
        contentArray.splice(index, op.chars);
        continue;
      }

      if (op.isInsert()) {
        contentArray.splice(index, 0, ...[...op.text]);
        index += op.text.length;
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
  emitter.dispose();
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
