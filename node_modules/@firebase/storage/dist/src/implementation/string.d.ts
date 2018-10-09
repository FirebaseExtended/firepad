/**
 * @enum {string}
 */
export declare type StringFormat = string;
export declare const StringFormat: {
    RAW: string;
    BASE64: string;
    BASE64URL: string;
    DATA_URL: string;
};
export declare function formatValidator(stringFormat: string): void;
/**
 * @struct
 */
export declare class StringData {
    data: Uint8Array;
    contentType: string | null;
    constructor(data: Uint8Array, opt_contentType?: string | null);
}
export declare function dataFromString(format: StringFormat, string: string): StringData;
export declare function utf8Bytes_(string: string): Uint8Array;
export declare function percentEncodedBytes_(string: string): Uint8Array;
export declare function base64Bytes_(format: StringFormat, string: string): Uint8Array;
export declare function dataURLBytes_(string: string): Uint8Array;
export declare function dataURLContentType_(string: string): string | null;
