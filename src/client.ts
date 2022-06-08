import {
  EventEmitter,
  EventListenerType,
  IEvent,
  IEventEmitter,
} from "./emitter";
import { ITextOperation } from "./text-operation";
import * as Utils from "./utils";

export enum ClientEvent {
  ApplyOperation = "apply",
  SendOperation = "send",
}

interface IClientStateMachine {
  /**
   * Tests whether the Client State is Synchronized with Server or not.
   */
  isSynchronized(): boolean;
  /**
   * Tests whether the Client State is Waiting for Acknowledgement with Server or not.
   */
  isAwaitingConfirm(): boolean;
  /**
   * Tests whether the Client State is Waiting for Acknowledgement with Server along with pending Operation or not.
   */
  isAwaitingWithBuffer(): boolean;
}

export interface IClient extends IClientStateMachine, Utils.IDisposable {
  /**
   * Add listener to Client.
   * @param event - Event name.
   * @param listener - Event handler callback.
   */
  on(event: ClientEvent, listener: EventListenerType<ITextOperation>): void;
  /**
   * Remove listener to Client.
   * @param event - Event name.
   * @param listener - Event handler callback.
   */
  off(event: ClientEvent, listener: EventListenerType<ITextOperation>): void;
  /**
   * Send operation to remote users.
   * @param operation - Text Operation from Editor Adapter
   */
  applyClient(operation: ITextOperation): void;
  /**
   * Recieve operation from remote user.
   * @param operation - Text Operation recieved from remote user.
   */
  applyServer(operation: ITextOperation): void;
  /**
   * Handle acknowledgement
   */
  serverAck(): void;
  /**
   * Handle retry
   */
  serverRetry(): void;
  /**
   * Send operation to Database adapter.
   * @param operation - Text Operation at client end.
   */
  sendOperation(operation: ITextOperation): void;
  /**
   * Apply operation to Editor adapter
   * @param operation - Text Operation at Server end.
   */
  applyOperation(operation: ITextOperation): void;
}

interface IClientSynchronizationState extends IClientStateMachine {
  /**
   * Send operation to remote users.
   * @param operation - Text Operation from Editor Adapter
   */
  applyClient(
    client: IClient,
    operation: ITextOperation
  ): IClientSynchronizationState;
  /**
   * Recieve operation from remote user.
   * @param operation - Text Operation recieved from remote user.
   */
  applyServer(
    client: IClient,
    operation: ITextOperation
  ): IClientSynchronizationState;
  /**
   * Handle acknowledgement
   */
  serverAck(client: IClient): IClientSynchronizationState;
  /**
   * Handle retry
   */
  serverRetry(client: IClient): IClientSynchronizationState;
}

/**
 * In the `Synchronized` state, there is no pending operation that the client
 * has sent to the server.
 */
class Synchronized implements IClientSynchronizationState {
  constructor() {}

  isSynchronized(): boolean {
    return true;
  }

  isAwaitingConfirm(): boolean {
    return false;
  }

  isAwaitingWithBuffer(): boolean {
    return false;
  }

  applyClient(
    client: IClient,
    operation: ITextOperation
  ): IClientSynchronizationState {
    // When the user makes an edit, send the operation to the server and
    // switch to the 'AwaitingConfirm' state
    client.sendOperation(operation);
    return new AwaitingConfirm(operation);
  }

  applyServer(
    client: IClient,
    operation: ITextOperation
  ): IClientSynchronizationState {
    // When we receive a new operation from the server, the operation can be
    // simply applied to the current document
    client.applyOperation(operation);
    return this;
  }

  serverAck(_client: IClient): IClientSynchronizationState {
    Utils.shouldNotGetCalled("There is no pending operation.");
    return this;
  }

  serverRetry(_client: IClient): IClientSynchronizationState {
    Utils.shouldNotGetCalled("There is no pending operation.");
    return this;
  }
}

// Singleton
const _synchronized = new Synchronized();

/**
 * In the `AwaitingConfirm` state, there's one operation the client has sent
 * to the server and is still waiting for an acknowledgement.
 */
class AwaitingConfirm implements IClientSynchronizationState {
  protected readonly _outstanding: ITextOperation;

  constructor(outstanding: ITextOperation) {
    // Save the pending operation
    this._outstanding = outstanding;
  }

  isSynchronized(): boolean {
    return false;
  }

  isAwaitingConfirm(): boolean {
    return true;
  }

  isAwaitingWithBuffer(): boolean {
    return false;
  }

  applyClient(
    _client: IClient,
    operation: ITextOperation
  ): IClientSynchronizationState {
    // When the user makes an edit, don't send the operation immediately,
    // instead switch to 'AwaitingWithBuffer' state
    return new AwaitingWithBuffer(this._outstanding, operation);
  }

  applyServer(
    client: IClient,
    operation: ITextOperation
  ): IClientSynchronizationState {
    // This is another client's operation. Visualization:
    //
    //                   /\
    // this.outstanding /  \ operation
    //                 /    \
    //                 \    /
    //  pair[1]         \  / pair[0] (new outstanding)
    //  (can be applied  \/
    //  to the client's
    //  current document)

    const pair = this._outstanding.transform(operation);
    client.applyOperation(pair[1]);
    return new AwaitingConfirm(pair[0]);
  }

  serverAck(_client: IClient): IClientSynchronizationState {
    // The client's operation has been acknowledged
    // => switch to synchronized state
    return _synchronized;
  }

  serverRetry(client: IClient): IClientSynchronizationState {
    client.sendOperation(this._outstanding);
    return this;
  }
}

/**
 * In the `AwaitingWithBuffer` state, the client is waiting for an operation
 * to be acknowledged by the server while buffering the edits the user makes
 */
class AwaitingWithBuffer implements IClientSynchronizationState {
  protected readonly _outstanding: ITextOperation;
  protected readonly _buffer: ITextOperation;

  constructor(outstanding: ITextOperation, buffer: ITextOperation) {
    // Save the pending operation and the user's edits since then
    this._outstanding = outstanding;
    this._buffer = buffer;
  }

  isSynchronized(): boolean {
    return false;
  }

  isAwaitingConfirm(): boolean {
    return false;
  }

  isAwaitingWithBuffer(): boolean {
    return true;
  }

  applyClient(
    client: IClient,
    operation: ITextOperation
  ): IClientSynchronizationState {
    // Compose the user's changes onto the buffer
    const newBuffer = this._buffer.compose(operation);
    return new AwaitingWithBuffer(this._outstanding, newBuffer);
  }

  applyServer(
    client: IClient,
    operation: ITextOperation
  ): IClientSynchronizationState {
    // Operation comes from another client
    //
    //                       /\
    //     this.outstanding /  \ operation
    //                     /    \
    //                    /\    /
    //       this.buffer /  \* / pair1[0] (new outstanding)
    //                  /    \/
    //                  \    /
    //          pair2[1] \  / pair2[0] (new buffer)
    // the transformed    \/
    // operation -- can
    // be applied to the
    // client's current
    // document
    //
    // * pair1[1]

    const pair1 = this._outstanding.transform(operation);
    const pair2 = this._buffer.transform(pair1[1]);
    client.applyOperation(pair2[1]);
    return new AwaitingWithBuffer(pair1[0], pair2[0]);
  }

  serverAck(client: IClient): IClientSynchronizationState {
    // The pending operation has been acknowledged
    // => send buffer
    client.sendOperation(this._buffer);
    return new AwaitingConfirm(this._buffer);
  }

  serverRetry(client: IClient): IClientSynchronizationState {
    // Merge with our buffer and resend.
    const outstanding = this._outstanding.compose(this._buffer);
    client.sendOperation(outstanding);
    return new AwaitingConfirm(outstanding);
  }
}

export class Client implements IClient {
  protected readonly _emitter: IEventEmitter;

  protected _state: IClientSynchronizationState;

  constructor() {
    this._state = _synchronized;
    this._emitter = new EventEmitter([
      ClientEvent.ApplyOperation,
      ClientEvent.SendOperation,
    ]);
  }

  dispose(): void {
    this._emitter.dispose();
  }

  isSynchronized(): boolean {
    return this._state.isSynchronized();
  }

  isAwaitingConfirm(): boolean {
    return this._state.isAwaitingConfirm();
  }

  isAwaitingWithBuffer(): boolean {
    return this._state.isAwaitingWithBuffer();
  }

  on(event: ClientEvent, listener: EventListenerType<ITextOperation>): void {
    return this._emitter.on(event, listener as EventListenerType<IEvent>);
  }

  off(event: ClientEvent, listener: EventListenerType<ITextOperation>): void {
    return this._emitter.off(event, listener as EventListenerType<IEvent>);
  }

  protected _trigger(event: ClientEvent, eventArgs: ITextOperation): void {
    return this._emitter.trigger(event, eventArgs);
  }

  protected _setState(state: IClientSynchronizationState): void {
    this._state = state;
  }

  applyClient(operation: ITextOperation): void {
    this._setState(this._state.applyClient(this, operation));
  }

  applyServer(operation: ITextOperation): void {
    this._setState(this._state.applyServer(this, operation));
  }

  serverAck(): void {
    this._setState(this._state.serverAck(this));
  }

  serverRetry(): void {
    this._setState(this._state.serverRetry(this));
  }

  sendOperation(operation: ITextOperation): void {
    this._trigger(ClientEvent.SendOperation, operation);
  }

  applyOperation(operation: ITextOperation): void {
    this._trigger(ClientEvent.ApplyOperation, operation);
  }
}
