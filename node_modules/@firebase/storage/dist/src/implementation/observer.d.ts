declare type NextFn<T> = (value: T) => void;
declare type ErrorFn = (error: Error) => void;
declare type CompleteFn = () => void;
declare type Unsubscribe = () => void;
declare type Subscribe<T> = (next: NextFn<T> | {
    [name: string]: string | null;
}, error?: ErrorFn, complete?: CompleteFn) => Unsubscribe;
export { NextFn, ErrorFn, CompleteFn, Unsubscribe, Subscribe };
/**
 * @struct
 */
export declare class Observer<T> {
    next: NextFn<T> | null;
    error: ErrorFn | null;
    complete: CompleteFn | null;
    constructor(nextOrObserver: NextFn<T> | {
        [name: string]: string | null;
    } | null, opt_error?: ErrorFn | null, opt_complete?: CompleteFn | null);
}
