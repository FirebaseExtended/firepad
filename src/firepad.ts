import {
  Cursor,
  DatabaseAdapterEvent,
  EditorClient,
  EditorClientEvent,
  IDatabaseAdapter,
  IEditorClient,
  IEditorAdapter,
} from "@operational-transformation/plaintext-editor";
import mitt, { Emitter, Handler } from "mitt";
import * as Utils from "./utils";

export enum FirepadEvent {
  Ready = "ready",
  Synced = "synced",
  Undo = "undo",
  Redo = "redo",
  Error = "error",
}

export type TFirepadEventArgs = {
  [FirepadEvent.Error]: Object;
  [FirepadEvent.Ready]: boolean;
  [FirepadEvent.Redo]: string;
  [FirepadEvent.Synced]: boolean;
  [FirepadEvent.Undo]: string;
};

export interface IFirepadConstructorOptions {
  /** Unique Identifier for current User */
  userId: string | number;
  /** Unique Hexadecimal color code for current User */
  userColor: string;
  /** Name/Short Name of the current User (optional) */
  userName?: string;
  /** Default content of Firepad (optional) */
  defaultText?: string;
}

export interface IFirepad extends Utils.IDisposable {
  /**
   * Add listener to Firepad.
   * @param event - Event name.
   * @param listener - Event handler callback.
   */
  on<Key extends keyof TFirepadEventArgs>(
    event: Key,
    listener: Handler<TFirepadEventArgs[Key]>
  ): void;
  /**
   * Remove listener to Firepad.
   * @param event - Event name.
   * @param listener - Event handler callback (optional).
   */
  off<Key extends keyof TFirepadEventArgs>(
    event: Key,
    listener?: Handler<TFirepadEventArgs[Key]>
  ): void;
  /**
   * Tests if any operation has been performed in Firepad.
   */
  isHistoryEmpty(): boolean;
  /**
   * Set User Id to Firepad to distinguish user.
   * @param userId - Unique Identifier for current User.
   */
  setUserId(userId: string): void;
  /**
   * Set User Color to identify current User's cursor or selection.
   * @param userColor - Hexadecimal color code.
   */
  setUserColor(userColor: string): void;
  /**
   * Set User Name to mark current user's Cursor.
   * @param userName - Name of current user.
   */
  setUserName(userName: string): void;
  /**
   * Returns current content of Firepad.
   */
  getText(): string;
  /**
   * Sets content into Firepad.
   * @param text - Text content to set
   */
  setText(text: string): void;
  /**
   * Clears undo redo stack of current Editor model.
   */
  clearUndoRedoStack(): void;
  /**
   * Returns current Firepad configuration.
   * @param option - Configuration option (same as constructor).
   */
  getConfiguration(option: keyof IFirepadConstructorOptions): any;
}

export class Firepad implements IFirepad {
  protected readonly _options: IFirepadConstructorOptions;
  protected readonly _editorClient: IEditorClient;
  protected readonly _editorAdapter: IEditorAdapter;
  protected readonly _databaseAdapter: IDatabaseAdapter;

  protected _ready: boolean;
  protected _zombie: boolean;
  protected _emitter: Emitter<TFirepadEventArgs> | null;

  /**
   * Creates modern Firepad.
   * @param databaseAdapter - Database interface wrapped inside Adapter.
   * @param editorAdapter - Editor interface wrapped inside Adapter.
   * @param options - Additional construction options.
   */
  constructor(
    databaseAdapter: IDatabaseAdapter,
    editorAdapter: IEditorAdapter,
    options: IFirepadConstructorOptions
  ) {
    /** If not called with `new` operator */
    if (!new.target) {
      return new Firepad(databaseAdapter, editorAdapter, options);
    }

    this._ready = false;
    this._zombie = false;
    this._options = options;

    this._databaseAdapter = databaseAdapter;
    this._editorAdapter = editorAdapter;
    this._editorClient = new EditorClient(databaseAdapter, editorAdapter);

    this._emitter = mitt();

    this._init();
  }

  protected _init(): void {
    this._databaseAdapter.on(DatabaseAdapterEvent.Ready, () => {
      this._ready = true;

      const { defaultText } = this._options;
      if (defaultText && this.isHistoryEmpty()) {
        this.setText(defaultText);
        this.clearUndoRedoStack();
      }

      this._trigger(FirepadEvent.Ready, true);
    });

    this._editorClient.on(EditorClientEvent.Synced, (synced) => {
      setTimeout(() => {
        this._trigger(FirepadEvent.Synced, synced);
      });
    });

    this._editorClient.on(EditorClientEvent.Undo, (undoOperation) => {
      setTimeout(() => {
        this._trigger(FirepadEvent.Undo, undoOperation);
      });
    });

    this._editorClient.on(EditorClientEvent.Redo, (redoOperation) => {
      setTimeout(() => {
        this._trigger(FirepadEvent.Redo, redoOperation);
      });
    });

    this._editorClient.on(EditorClientEvent.Error, (error) => {
      setTimeout(() => {
        this._trigger(FirepadEvent.Error, error);
      });
    });
  }

  getConfiguration(option: keyof IFirepadConstructorOptions): any {
    return option in this._options ? this._options[option] : null;
  }

  on<Key extends keyof TFirepadEventArgs>(
    event: Key,
    listener: Handler<TFirepadEventArgs[Key]>
  ): void {
    return this._emitter?.on(event, listener);
  }

  off<Key extends keyof TFirepadEventArgs>(
    event: Key,
    listener: Handler<TFirepadEventArgs[Key]>
  ): void {
    return this._emitter?.off(event, listener);
  }

  protected _trigger<Key extends keyof TFirepadEventArgs>(
    event: Key,
    payload: TFirepadEventArgs[Key]
  ): void {
    return this._emitter!.emit(event, payload);
  }

  isHistoryEmpty(): boolean {
    this._assertReady("isHistoryEmpty");
    return this._databaseAdapter.isHistoryEmpty();
  }

  setUserId(userId: string | number): void {
    this._databaseAdapter.setUserId(userId as string);
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

  dispose(): void {
    this._zombie = true;
    this._databaseAdapter.dispose();
    this._editorAdapter.dispose();
    this._editorClient.dispose();

    if (this._emitter) {
      this._trigger(FirepadEvent.Ready, false);
      this._emitter.all.clear();
      this._emitter = null;
    }
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
}
