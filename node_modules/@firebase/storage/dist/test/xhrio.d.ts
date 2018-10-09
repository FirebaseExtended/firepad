import { ErrorCode, Headers, XhrIo } from '../src/implementation/xhrio';
export declare type SendHook = (xhrio: TestingXhrIo, url: string, method: string, body?: ArrayBufferView | Blob | string | null, headers?: Headers) => void;
export declare enum State {
    START = 0,
    SENT = 1,
    DONE = 2,
}
export declare type StringHeaders = {
    [name: string]: string;
};
export declare class TestingXhrIo implements XhrIo {
    private state;
    private sendPromise;
    private resolve;
    private sendHook;
    private status;
    private responseText;
    private headers;
    private errorCode;
    constructor(sendHook: SendHook);
    send(url: string, method: string, body?: ArrayBufferView | Blob | string | null, headers?: Headers): Promise<XhrIo>;
    simulateResponse(status: number, body: string, headers: Headers): void;
    getErrorCode(): ErrorCode;
    getStatus(): number;
    getResponseText(): string;
    abort(): void;
    getResponseHeader(header: string): string;
    addUploadProgressListener(listener: any): void;
    removeUploadProgressListener(listener: any): void;
}
