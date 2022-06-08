import { ICursor } from "./cursor";
import { EventListenerType, IEvent } from "./emitter";
import { ITextOperation } from "./text-operation";
import { IDisposable } from "./utils";

export type UserIDType = string | number;

/** Additional State Information about Database Adapter */
export type DatabaseAdapterStateType = {
  /** String representation of the Text Operation */
  operation: string;
  /** String representation of the current Document */
  document: string;
};

/** Event parameters for `error` event on Database Adapter */
export type DatabaseOnErrorFunctionType = (
  /** Original Error event */
  error: Error,
  /** String representation of the Text Operation */
  operation: string,
  /** Additional State Information about Editor Adapter */
  state: DatabaseAdapterStateType
) => void;

export enum DatabaseAdapterEvent {
  Ready = "ready",
  CursorChange = "cursor",
  Operation = "operation",
  Acknowledge = "ack",
  Retry = "retry",
  Error = "error",
  InitialRevision = "initialRevision",
}

export interface IDatabaseAdapterEvent extends IEvent {}

export type DatabaseAdapterCallbackType = {
  [DatabaseAdapterEvent.Error]: DatabaseOnErrorFunctionType;
  [DatabaseAdapterEvent.Retry]: EventListenerType<IDatabaseAdapterEvent>;
  [DatabaseAdapterEvent.Operation]: EventListenerType<ITextOperation>;
  [DatabaseAdapterEvent.Acknowledge]: EventListenerType<IDatabaseAdapterEvent>;
  [DatabaseAdapterEvent.CursorChange]: EventListenerType<string>;
  [DatabaseAdapterEvent.InitialRevision]: EventListenerType<void>;
};

/**
 * Callback to handle transaction of `sendOperation` call.
 * Called with two arguments:
 *
 * * `err` - Error if Transaction fails, else `null`.
 * * `commited` - Whether or not the changes have been commited.
 */
export type SendOperationCallbackType = (
  err: Error | null,
  commited: boolean
) => void;

/**
 * Callback to handle transaction of `sendCursor` call.
 * Called with two arguments:
 *
 * * `err` - Error if Transaction fails, else `null`.
 * * `syncedCursor` - The Cursor that has been synced. (could be `null`)
 */
export type SendCursorCallbackType = (
  err: Error | null,
  syncedCursor: ICursor | null
) => void;

export interface IDatabaseAdapter extends IDisposable {
  /**
   * Tests if any operation has been done yet on the document.
   */
  isHistoryEmpty(): boolean;
  /**
   * Returns current state of the document (could be `null`).
   */
  getDocument(): ITextOperation | null;
  /**
   * Add Unique Identifier against current user to mark Cursor and Operations.
   * @param userId - Unique Identifier for current user.
   */
  setUserId(userId: UserIDType): void;
  /**
   * Set Color to mark current user's Cursor.
   * @param userColor - Color of current user's Cursor.
   */
  setUserColor(userColor: string): void;
  /**
   * Set User Name to mark current user's Cursor.
   * @param userName - Name of current user.
   */
  setUserName(userName: string): void;
  /**
   * Tests if `clientId` matches current user's ID.
   * @param clientId - Unique Identifier for user.
   */
  isCurrentUser(clientId: string): boolean;
  /**
   * Send operation, retrying on connection failure. Takes an optional callback with signature:
   * `function(error, committed)`.
   * An exception will be thrown on transaction failure, which should only happen on
   * catastrophic failure like a security rule violation.
   * @param operation - Text Operation to sent to server.
   * @param callback - Callback handler for the transaction.
   */
  sendOperation(
    operation: ITextOperation,
    callback?: SendOperationCallbackType
  ): void;
  /**
   * Send current user's cursor information to server.
   * @param cursor - Cursor of Current User.
   * @param callback - Callback handler for the transaction.
   */
  sendCursor(cursor: ICursor | null, callback?: SendCursorCallbackType): void;
  /**
   * Add listener to Database Adapter.
   * @param event - Event name.
   * @param listener - Event handler callback.
   */
  on(
    event: DatabaseAdapterEvent,
    listener: EventListenerType<IDatabaseAdapterEvent>
  ): void;
  /**
   * Remove listener to Database Adapter.
   * @param event - Event name.
   * @param listener - Event handler callback.
   */
  off(
    event: DatabaseAdapterEvent,
    listener: EventListenerType<IDatabaseAdapterEvent>
  ): void;
  /**
   * Add multiple listener to Database Adapter.
   * @param callback - Map of Database Events and Callbacks.
   */
  registerCallbacks(callback: DatabaseAdapterCallbackType): void;
}
