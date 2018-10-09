import { RequestInfo } from './requestinfo';
import { Headers, XhrIo } from './xhrio';
import { XhrIoPool } from './xhriopool';
/**
 * @template T
 */
export interface Request<T> {
    getPromise(): Promise<T>;
    /**
     * Cancels the request. IMPORTANT: the promise may still be resolved with an
     * appropriate value (if the request is finished before you call this method,
     * but the promise has not yet been resolved), so don't just assume it will be
     * rejected if you call this function.
     * @param appDelete True if the cancelation came from the app being deleted.
     */
    cancel(appDelete?: boolean): void;
}
/**
 * A collection of information about the result of a network request.
 * @param opt_canceled Defaults to false.
 * @struct
 */
export declare class RequestEndStatus {
    wasSuccessCode: boolean;
    xhr: XhrIo | null;
    /**
     * True if the request was canceled.
     */
    canceled: boolean;
    constructor(wasSuccessCode: boolean, xhr: XhrIo | null, opt_canceled?: boolean);
}
export declare function addAuthHeader_(headers: Headers, authToken: string | null): void;
export declare function addVersionHeader_(headers: Headers): void;
/**
 * @template T
 */
export declare function makeRequest<T>(requestInfo: RequestInfo<T>, authToken: string | null, pool: XhrIoPool): Request<T>;
