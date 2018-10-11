import { FirestoreError } from '../util/error';
import { Stream } from './connection';
/**
 * Provides a simple helper class that implements the Stream interface to
 * bridge to other implementations that are streams but do not implement the
 * interface. The stream callbacks are invoked with the callOn... methods.
 */
export declare class StreamBridge<I, O> implements Stream<I, O> {
    private wrappedOnOpen;
    private wrappedOnClose;
    private wrappedOnMessage;
    private sendFn;
    private closeFn;
    constructor(args: {
        sendFn: (msg: I) => void;
        closeFn: () => void;
    });
    onOpen(callback: () => void): void;
    onClose(callback: (err?: FirestoreError) => void): void;
    onMessage(callback: (msg: O) => void): void;
    close(): void;
    send(msg: I): void;
    callOnOpen(): void;
    callOnClose(err?: FirestoreError): void;
    callOnMessage(msg: O): void;
}
