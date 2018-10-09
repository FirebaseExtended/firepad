export declare const base64: {
    byteToCharMap_: any;
    charToByteMap_: any;
    byteToCharMapWebSafe_: any;
    charToByteMapWebSafe_: any;
    ENCODED_VALS_BASE: string;
    readonly ENCODED_VALS: string;
    readonly ENCODED_VALS_WEBSAFE: string;
    HAS_NATIVE_SUPPORT: boolean;
    encodeByteArray(input: any, opt_webSafe?: any): string;
    encodeString(input: any, opt_webSafe: any): any;
    decodeString(input: any, opt_webSafe: any): string;
    decodeStringToByteArray(input: any, opt_webSafe: any): any[];
    init_(): void;
};
/**
 * URL-safe base64 encoding
 * @param {!string} str
 * @return {!string}
 */
export declare const base64Encode: (str: string) => string;
/**
 * URL-safe base64 decoding
 *
 * NOTE: DO NOT use the global atob() function - it does NOT support the
 * base64Url variant encoding.
 *
 * @param {string} str To be decoded
 * @return {?string} Decoded result, if possible
 */
export declare const base64Decode: (str: string) => string;
