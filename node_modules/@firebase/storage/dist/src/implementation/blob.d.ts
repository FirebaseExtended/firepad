/**
 * @param opt_elideCopy If true, doesn't copy mutable input data
 *     (e.g. Uint8Arrays). Pass true only if you know the objects will not be
 *     modified after this blob's construction.
 */
export declare class FbsBlob {
    private data_;
    private size_;
    private type_;
    constructor(data: Blob | Uint8Array | ArrayBuffer, opt_elideCopy?: boolean);
    size(): number;
    type(): string;
    slice(startByte: number, endByte: number): FbsBlob | null;
    static getBlob(...var_args: (string | FbsBlob)[]): FbsBlob | null;
    uploadData(): Blob | Uint8Array;
}
