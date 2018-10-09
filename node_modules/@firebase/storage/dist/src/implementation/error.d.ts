export declare class FirebaseStorageError implements Error {
    private code_;
    private message_;
    private serverResponse_;
    private name_;
    constructor(code: Code, message: string);
    codeProp(): string;
    codeEquals(code: Code): boolean;
    serverResponseProp(): string | null;
    setServerResponseProp(serverResponse: string | null): void;
    readonly name: string;
    readonly code: string;
    readonly message: string;
    readonly serverResponse: null | string;
}
export declare const errors: {};
/**
 * @enum {string}
 */
export declare type Code = string;
export declare const Code: {
    UNKNOWN: string;
    OBJECT_NOT_FOUND: string;
    BUCKET_NOT_FOUND: string;
    PROJECT_NOT_FOUND: string;
    QUOTA_EXCEEDED: string;
    UNAUTHENTICATED: string;
    UNAUTHORIZED: string;
    RETRY_LIMIT_EXCEEDED: string;
    INVALID_CHECKSUM: string;
    CANCELED: string;
    INVALID_EVENT_NAME: string;
    INVALID_URL: string;
    INVALID_DEFAULT_BUCKET: string;
    NO_DEFAULT_BUCKET: string;
    CANNOT_SLICE_BLOB: string;
    SERVER_FILE_WRONG_SIZE: string;
    NO_DOWNLOAD_URL: string;
    INVALID_ARGUMENT: string;
    INVALID_ARGUMENT_COUNT: string;
    APP_DELETED: string;
    INVALID_ROOT_OPERATION: string;
    INVALID_FORMAT: string;
    INTERNAL_ERROR: string;
};
export declare function prependCode(code: Code): string;
export declare function unknown(): FirebaseStorageError;
export declare function objectNotFound(path: string): FirebaseStorageError;
export declare function bucketNotFound(bucket: string): FirebaseStorageError;
export declare function projectNotFound(project: string): FirebaseStorageError;
export declare function quotaExceeded(bucket: string): FirebaseStorageError;
export declare function unauthenticated(): FirebaseStorageError;
export declare function unauthorized(path: string): FirebaseStorageError;
export declare function retryLimitExceeded(): FirebaseStorageError;
export declare function invalidChecksum(path: string, checksum: string, calculated: string): FirebaseStorageError;
export declare function canceled(): FirebaseStorageError;
export declare function invalidEventName(name: string): FirebaseStorageError;
export declare function invalidUrl(url: string): FirebaseStorageError;
export declare function invalidDefaultBucket(bucket: string): FirebaseStorageError;
export declare function noDefaultBucket(): FirebaseStorageError;
export declare function cannotSliceBlob(): FirebaseStorageError;
export declare function serverFileWrongSize(): FirebaseStorageError;
export declare function noDownloadURL(): FirebaseStorageError;
export declare function invalidArgument(index: number, fnName: string, message: string): FirebaseStorageError;
export declare function invalidArgumentCount(argMin: number, argMax: number, fnName: string, real: number): FirebaseStorageError;
export declare function appDeleted(): FirebaseStorageError;
/**
 * @param name The name of the operation that was invalid.
 */
export declare function invalidRootOperation(name: string): FirebaseStorageError;
/**
 * @param format The format that was not valid.
 * @param message A message describing the format violation.
 */
export declare function invalidFormat(format: string, message: string): FirebaseStorageError;
/**
 * @param message A message describing the internal error.
 */
export declare function internalError(message: string): FirebaseStorageError;
