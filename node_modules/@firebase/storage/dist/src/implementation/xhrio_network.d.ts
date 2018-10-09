import * as XhrIoExports from './xhrio';
import { Headers, XhrIo } from './xhrio';
/**
 * We use this instead of goog.net.XhrIo because goog.net.XhrIo is hyuuuuge and
 * doesn't work in React Native on Android.
 */
export declare class NetworkXhrIo implements XhrIo {
    private xhr_;
    private errorCode_;
    private sendPromise_;
    private sent_;
    constructor();
    /**
     * @override
     */
    send(url: string, method: string, opt_body?: ArrayBufferView | Blob | string | null, opt_headers?: Headers): Promise<XhrIo>;
    /**
     * @override
     */
    getErrorCode(): XhrIoExports.ErrorCode;
    /**
     * @override
     */
    getStatus(): number;
    /**
     * @override
     */
    getResponseText(): string;
    /**
     * Aborts the request.
     * @override
     */
    abort(): void;
    /**
     * @override
     */
    getResponseHeader(header: string): string | null;
    /**
     * @override
     */
    addUploadProgressListener(listener: (p1: Event) => void): void;
    /**
     * @override
     */
    removeUploadProgressListener(listener: (p1: Event) => void): void;
}
