import firebase from "firebase";
import * as monaco from "monaco-editor";

import { Cursor } from "./cursor";
import {
  DatabaseAdapterEvent,
  IDatabaseAdapter,
  IDatabaseAdapterEvent,
  UserIDType,
} from "./database-adapter";
import { IEditorAdapter, IEditorAdapterEvent } from "./editor-adapter";
import {
  EditorClient,
  EditorClientEvent,
  IEditorClient,
} from "./editor-client";
import { EventEmitter, EventListenerType, IEventEmitter } from "./emitter";
import { FirebaseAdapter } from "./firebase-adapter";
import { FirepadEvent as FirepadClassicEvent, IFirepad } from "./firepad";
import { MonacoAdapter } from "./monaco-adapter";
import * as Utils from "./utils";

interface IFirepadClassicConstructorOptions {
  /** Unique Identifier for current User */
  userId?: UserIDType;
  /** Unique Hexadecimal color code for current User */
  userColor?: string;
  /** Name/Short Name of the current User */
  userName?: string;
  /** Default content of Firepad */
  defaultText?: string;
}

export default class FirepadClassic implements IFirepad {
  protected readonly _options: IFirepadClassicConstructorOptions;
  protected readonly _editorClient: IEditorClient;
  protected readonly _editorAdapter: IEditorAdapter;
  protected readonly _databaseAdapter: IDatabaseAdapter;

  protected _ready: boolean;
  protected _zombie: boolean;
  protected _emitter: IEventEmitter | null;

  /**
   * Creates a classic Firepad
   * @deprecated
   * @param databaseRef - Firebase database Reference object.
   * @param editor - Editor instance (expected Monaco).
   * @param options - Firepad constructor options (optional).
   */
  constructor(
    databaseRef: firebase.database.Reference,
    editor: monaco.editor.IStandaloneCodeEditor,
    options: IFirepadClassicConstructorOptions = {}
  ) {
    /** If not called with `new` operator */
    if (!new.target) {
      return new FirepadClassic(databaseRef, editor, options);
    }

    this._ready = false;
    this._zombie = false;
    this._options = options;

    options.userId = this._getOptions("userId", () => databaseRef.push().key);
    options.userColor = this._getOptions("userColor", () =>
      Utils.colorFromUserId(options.userId!.toString())
    );
    options.userName = this._getOptions("userName", () => options.userId);
    options.defaultText = this._getOptions("defaultText", () =>
      editor.getValue()
    );

    editor.setValue(""); // Ensure editor is empty before wraping with adapter

    this._databaseAdapter = new FirebaseAdapter(
      databaseRef,
      options.userId!,
      options.userColor!,
      options.userName!
    );
    this._editorAdapter = new MonacoAdapter(editor, false);
    this._editorClient = new EditorClient(
      this._databaseAdapter,
      this._editorAdapter
    );

    this._emitter = new EventEmitter([
      FirepadClassicEvent.Ready,
      FirepadClassicEvent.Synced,
      FirepadClassicEvent.Undo,
      FirepadClassicEvent.Redo,
    ]);

    this.init();
  }

  protected init(): void {
    this._databaseAdapter.on(DatabaseAdapterEvent.Ready, () => {
      this._ready = true;

      const defaultText = this._getOptions("defaultText", () => null);
      if (defaultText && this.isHistoryEmpty()) {
        this.setText(defaultText);
        this.clearUndoRedoStack();
      }

      this._trigger(FirepadClassicEvent.Ready, true);
    });

    this._editorClient.on(
      EditorClientEvent.Synced,
      (synced: boolean | IDatabaseAdapterEvent) => {
        this._trigger(FirepadClassicEvent.Synced, synced);
      }
    );

    this._editorClient.on(
      EditorClientEvent.Undo,
      (undoOperation: string | IEditorAdapterEvent) => {
        this._trigger(FirepadClassicEvent.Undo, undoOperation);
      }
    );

    this._editorClient.on(
      EditorClientEvent.Redo,
      (redoOperation: string | IEditorAdapterEvent) => {
        this._trigger(FirepadClassicEvent.Redo, redoOperation);
      }
    );
  }

  dispose(): void {
    this._databaseAdapter.dispose();
    this._editorAdapter.dispose();
    this._editorClient.dispose();

    if (this._emitter) {
      this._trigger(FirepadClassicEvent.Ready, false);
      this._emitter.dispose();
      this._emitter = null;
    }
  }

  on(event: FirepadClassicEvent, listener: EventListenerType<any>): void {
    return this._emitter?.on(event, listener);
  }

  off(event: FirepadClassicEvent, listener: EventListenerType<any>): void {
    return this._emitter?.off(event, listener);
  }

  protected _trigger(
    event: FirepadClassicEvent,
    eventAttr: any,
    ...extraArgs: any[]
  ): void {
    return this._emitter?.trigger(event, eventAttr, ...extraArgs);
  }

  isHistoryEmpty(): boolean {
    this._assertReady("isHistoryEmpty");
    return this._databaseAdapter.isHistoryEmpty();
  }

  setUserId(userId: string | number): void {
    this._databaseAdapter.setUserId(userId);
    this._options.userId = userId;
  }

  setUserColor(userColor: string): void {
    this._databaseAdapter.setUserColor(userColor);
    this._options.userColor = userColor;
  }

  setUserName(userName: string): void {
    this._databaseAdapter.setUserName(userName);
    this._options.userName = userName;
  }

  getText(): string {
    this._assertReady("getText");
    return this._editorAdapter.getText();
  }

  setText(text: string = ""): void {
    this._assertReady("setText");
    this._editorAdapter.setText(text);
    this._editorAdapter.setCursor(new Cursor(0, 0));
  }

  clearUndoRedoStack(): void {
    this._assertReady("clearUndoRedoStack");
    this._editorClient.clearUndoRedoStack();
  }

  getConfiguration(option: keyof IFirepadClassicConstructorOptions): any {
    return this._getOptions(option, () => null);
  }

  protected _getOptions(
    option: keyof IFirepadClassicConstructorOptions,
    getDefault: () => any
  ) {
    return option in this._options ? this._options[option] : getDefault();
  }

  protected _assertReady(func: string): void {
    Utils.validateTruth(
      this._ready,
      `You must wait for the "ready" event before calling ${func}.`
    );
    Utils.validateFalse(
      this._zombie,
      `You can't use a Firepad after calling dispose()!  [called ${func}]`
    );
  }

  /**
   * Creates a classic Firepad from Monaco editor.
   * @param databaseRef - Firebase database Reference object.
   * @param editor - Monaco Editor instance.
   * @param options - Firepad constructor options (optional).
   */
  static fromMonaco(
    databaseRef: firebase.database.Reference,
    editor: monaco.editor.IStandaloneCodeEditor,
    options?: IFirepadClassicConstructorOptions
  ) {
    return new FirepadClassic(databaseRef, editor, options);
  }
}
