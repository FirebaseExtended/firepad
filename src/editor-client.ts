import { Client, ClientEvent, IClient } from "./client";
import { Cursor, CursorType, ICursor } from "./cursor";
import { IDatabaseAdapter } from "./database-adapter";
import { IEditorAdapter } from "./editor-adapter";
import {
  EventEmitter,
  EventListenerType,
  IEvent,
  IEventEmitter,
} from "./emitter";
import { OperationMeta } from "./operation-meta";
import { IRemoteClient, RemoteClient } from "./remote-client";
import { ITextOperation } from "./text-operation";
import { IUndoManager, UndoManager } from "./undo-manager";
import { IDisposable } from "./utils";
import { IWrappedOperation, WrappedOperation } from "./wrapped-operation";

export enum EditorClientEvent {
  Undo = "undo",
  Redo = "redo",
  Error = "error",
  Synced = "synced",
}

export interface IEditorClientEvent extends IEvent {}

export interface IEditorClient extends IDisposable {
  /**
   * Add listener to Editor Client.
   * @param event - Event name.
   * @param listener - Event handler callback.
   */
  on(
    event: EditorClientEvent,
    listener: EventListenerType<IEditorClientEvent>
  ): void;
  /**
   * Remove listener to Editor Client.
   * @param event - Event name.
   * @param listener - Event handler callback.
   */
  off(
    event: EditorClientEvent,
    listener: EventListenerType<IEditorClientEvent>
  ): void;
  /**
   * Clears undo redo stack of current Editor model.
   */
  clearUndoRedoStack(): void;
}

export class EditorClient implements IEditorClient {
  protected readonly _client: IClient;
  protected readonly _databaseAdapter: IDatabaseAdapter;
  protected readonly _editorAdapter: IEditorAdapter;
  protected readonly _emitter: IEventEmitter;
  protected readonly _remoteClients: Map<string, IRemoteClient>;
  protected readonly _undoManager: IUndoManager;

  protected _cursor: ICursor | null;
  protected _focused: boolean;
  protected _sendCursorTimeout: NodeJS.Timeout | null;

  /**
   * Provides a channel of communication between database server and editor wrapped inside adapter
   * @param databaseAdapter - Database connector wrapped with Adapter interface
   * @param editorAdapter - Editor instance wrapped with Adapter interface
   */
  constructor(
    databaseAdapter: IDatabaseAdapter,
    editorAdapter: IEditorAdapter
  ) {
    this._focused = false;
    this._cursor = null;
    this._sendCursorTimeout = null;

    this._client = new Client();
    this._databaseAdapter = databaseAdapter;
    this._editorAdapter = editorAdapter;
    this._undoManager = new UndoManager();
    this._remoteClients = new Map<string, IRemoteClient>();
    this._emitter = new EventEmitter([
      EditorClientEvent.Error,
      EditorClientEvent.Undo,
      EditorClientEvent.Redo,
      EditorClientEvent.Synced,
    ]);

    this._init();
  }

  protected _init(): void {
    this._editorAdapter.registerCallbacks({
      change: (operation: ITextOperation, inverse: ITextOperation) => {
        this._onChange(operation, inverse);
      },
      cursorActivity: () => {
        this._onCursorActivity();
      },
      blur: () => {
        this._onBlur();
      },
      focus: () => {
        this._onFocus();
      },
      error: (err, operation, state) => {
        this._trigger(EditorClientEvent.Error, err, operation, state);
      },
    });

    this._editorAdapter.registerUndo(() => {
      this._undo();
    });

    this._editorAdapter.registerRedo(() => {
      this._redo();
    });

    this._databaseAdapter.registerCallbacks({
      ack: () => {
        this._client.serverAck();
        this._updateCursor();
        this._sendCursor(this._cursor);
        this._emitSynced();
      },
      retry: () => {
        this._client.serverRetry();
      },
      operation: (operation: ITextOperation) => {
        this._client.applyServer(operation);
      },
      initialRevision: () => {
        this._editorAdapter.setInitiated(true);
      },
      cursor: (
        clientId: string,
        cursor: CursorType | null,
        userColor?: string,
        userName?: string
      ) => {
        if (
          this._databaseAdapter.isCurrentUser(clientId) ||
          !this._client.isSynchronized()
        ) {
          return;
        }

        const client = this._getClientObject(clientId);

        if (!cursor) {
          client.removeCursor();
          return;
        }

        if (userColor) {
          client.setColor(userColor);
        }

        if (userName) {
          client.setUserName(userName);
        }

        client.updateCursor(Cursor.fromJSON(cursor));
      },
      error: (err, operation, state) => {
        this._trigger(EditorClientEvent.Error, err, operation, state);
      },
    });

    this._client.on(ClientEvent.ApplyOperation, (operation: ITextOperation) => {
      this._applyOperation(operation);
    });

    this._client.on(ClientEvent.SendOperation, (operation: ITextOperation) => {
      this._sendOperation(operation);
    });
  }

  dispose(): void {
    if (this._sendCursorTimeout) {
      clearTimeout(this._sendCursorTimeout);
      this._sendCursorTimeout = null;
    }

    this._emitter.dispose();
    this._client.dispose();
    this._undoManager.dispose();
    this._remoteClients.clear();
  }

  on(
    event: EditorClientEvent,
    listener: EventListenerType<IEditorClientEvent>
  ): void {
    return this._emitter.on(event, listener);
  }

  off(
    event: EditorClientEvent,
    listener: EventListenerType<IEditorClientEvent>
  ): void {
    return this._emitter.off(event, listener);
  }

  protected _trigger(
    event: EditorClientEvent,
    eventArgs: IEditorClientEvent,
    ...extraArgs: unknown[]
  ): void {
    return this._emitter.trigger(event, eventArgs, ...extraArgs);
  }

  protected _emitSynced() {
    this._trigger(EditorClientEvent.Synced, this._client.isSynchronized());
  }

  protected _getClientObject(clientId: string): IRemoteClient {
    let client = this._remoteClients.get(clientId);

    if (client) {
      return client;
    }

    client = new RemoteClient(clientId, this._editorAdapter);
    this._remoteClients.set(clientId, client);

    return client;
  }

  protected _onChange(operation: ITextOperation, inverse: ITextOperation) {
    const cursorBefore = this._cursor;
    this._updateCursor();

    const compose =
      this._undoManager.canUndo() &&
      inverse.shouldBeComposedWithInverted(this._undoManager.last()!);

    const inverseMeta = new OperationMeta(this._cursor, cursorBefore);
    this._undoManager.add(new WrappedOperation(inverse, inverseMeta), compose);
    this._client.applyClient(operation);
  }

  clearUndoRedoStack(): void {
    this._undoManager.dispose();
  }

  protected _applyUnredo(wrappedOperation: IWrappedOperation) {
    this._undoManager.add(
      this._editorAdapter.invertOperation(wrappedOperation)
    );

    const operation = wrappedOperation.getOperation();
    this._editorAdapter.applyOperation(operation);

    this._cursor = wrappedOperation.getCursor();
    if (this._cursor) {
      this._editorAdapter.setCursor(this._cursor);
    }

    this._client.applyClient(operation);
  }

  protected _undo() {
    if (!this._undoManager.canUndo()) {
      return;
    }

    this._undoManager.performUndo((operation: IWrappedOperation) => {
      this._applyUnredo(operation);
      this._trigger(EditorClientEvent.Undo, operation.toString());
    });
  }

  protected _redo() {
    if (!this._undoManager.canRedo()) {
      return;
    }

    this._undoManager.performRedo((operation: IWrappedOperation) => {
      this._applyUnredo(operation);
      this._trigger(EditorClientEvent.Redo, operation.toString());
    });
  }

  protected _sendOperation(operation: ITextOperation): void {
    this._databaseAdapter.sendOperation(operation);
  }

  protected _applyOperation(operation: ITextOperation): void {
    this._editorAdapter.applyOperation(operation);
    this._updateCursor();
    this._undoManager.transform(new WrappedOperation(operation));
    this._emitSynced();
  }

  protected _sendCursor(cursor: ICursor | null) {
    if (this._sendCursorTimeout) {
      clearTimeout(this._sendCursorTimeout);
      this._sendCursorTimeout = null;
    }

    if (this._client.isAwaitingWithBuffer()) {
      this._sendCursorTimeout = setTimeout(() => {
        this._sendCursor(cursor);
      }, 3);
      return;
    }

    this._databaseAdapter.sendCursor(cursor);
  }

  protected _updateCursor() {
    this._cursor = this._editorAdapter.getCursor();
  }

  protected _onCursorActivity() {
    const oldCursor = this._cursor;
    this._updateCursor();

    if (oldCursor == null && oldCursor == this._cursor) {
      /** Empty Cursor */
      return;
    }

    this._sendCursor(this._cursor);
  }

  protected _onBlur() {
    this._cursor = null;
    this._sendCursor(null);
    this._focused = false;
  }

  protected _onFocus() {
    this._focused = true;
    this._onCursorActivity();
  }
}
