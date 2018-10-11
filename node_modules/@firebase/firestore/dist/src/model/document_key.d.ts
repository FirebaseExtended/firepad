import { ResourcePath } from './path';
export declare class DocumentKey {
    readonly path: ResourcePath;
    constructor(path: ResourcePath);
    isEqual(other: DocumentKey | null): boolean;
    toString(): string;
    static EMPTY: DocumentKey;
    static comparator(k1: DocumentKey, k2: DocumentKey): number;
    static isDocumentKey(path: ResourcePath): boolean;
    /**
     * Creates and returns a new document key with the given segments.
     *
     * @param path The segments of the path to the document
     * @return A new instance of DocumentKey
     */
    static fromSegments(segments: string[]): DocumentKey;
    /**
     * Creates and returns a new document key using '/' to split the string into
     * segments.
     *
     * @param path The slash-separated path string to the document
     * @return A new instance of DocumentKey
     */
    static fromPathString(path: string): DocumentKey;
}
