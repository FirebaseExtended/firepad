export interface Resolver<R> {
    (value?: R | Promise<R>): void;
}
export interface Rejecter {
    (reason?: Error): void;
}
export interface CancelablePromise<T> extends Promise<T> {
    cancel(): void;
}
export declare class Deferred<R> {
    promise: Promise<R>;
    resolve: Resolver<R>;
    reject: Rejecter;
    constructor();
}
/**
 * Takes an array of values and sequences them using the promise (or value)
 * returned by the supplied callback. The callback for each item is called
 * after the promise is resolved for the previous item.
 * The function returns a promise which is resolved after the promise for
 * the last item is resolved.
 */
export declare function sequence<T, R>(values: T[], fn: (value: T, result?: R) => R | Promise<R>, initialValue?: R): Promise<R>;
