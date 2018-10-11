/**
 * Immutable class holding a blob (binary data).
 * This class is directly exposed in the public API.
 *
 * Note that while you can't hide the constructor in JavaScript code, we are
 * using the hack above to make sure no-one outside this module can call it.
 */
export declare class Blob {
    private _binaryString;
    private constructor();
    static fromBase64String(base64: string): Blob;
    static fromUint8Array(array: Uint8Array): Blob;
    toBase64(): string;
    toUint8Array(): Uint8Array;
    toString(): string;
    isEqual(other: Blob): boolean;
    /**
     * Actually private to JS consumers of our API, so this function is prefixed
     * with an underscore.
     */
    _compareTo(other: Blob): number;
}
export declare let PublicBlob: typeof Blob;
