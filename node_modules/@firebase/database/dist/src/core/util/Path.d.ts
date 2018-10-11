/**
 * An immutable object representing a parsed path.  It's immutable so that you
 * can pass them around to other functions without worrying about them changing
 * it.
 */
export declare class Path {
    private pieces_;
    private pieceNum_;
    /**
     * Singleton to represent an empty path
     *
     * @const
     */
    static readonly Empty: Path;
    /**
     * @param {string|Array.<string>} pathOrString Path string to parse,
     *      or another path, or the raw tokens array
     * @param {number=} pieceNum
     */
    constructor(pathOrString: string | string[], pieceNum?: number);
    getFront(): string | null;
    /**
     * @return {number} The number of segments in this path
     */
    getLength(): number;
    /**
     * @return {!Path}
     */
    popFront(): Path;
    /**
     * @return {?string}
     */
    getBack(): string | null;
    toString(): string;
    toUrlEncodedString(): string;
    /**
     * Shallow copy of the parts of the path.
     *
     * @param {number=} begin
     * @return {!Array<string>}
     */
    slice(begin?: number): string[];
    /**
     * @return {?Path}
     */
    parent(): Path | null;
    /**
     * @param {string|!Path} childPathObj
     * @return {!Path}
     */
    child(childPathObj: string | Path): Path;
    /**
     * @return {boolean} True if there are no segments in this path
     */
    isEmpty(): boolean;
    /**
     * @param {!Path} outerPath
     * @param {!Path} innerPath
     * @return {!Path} The path from outerPath to innerPath
     */
    static relativePath(outerPath: Path, innerPath: Path): Path;
    /**
     * @param {!Path} left
     * @param {!Path} right
     * @return {number} -1, 0, 1 if left is less, equal, or greater than the right.
     */
    static comparePaths(left: Path, right: Path): number;
    /**
     *
     * @param {Path} other
     * @return {boolean} true if paths are the same.
     */
    equals(other: Path): boolean;
    /**
     *
     * @param {!Path} other
     * @return {boolean} True if this path is a parent (or the same as) other
     */
    contains(other: Path): boolean;
}
/**
 * Dynamic (mutable) path used to count path lengths.
 *
 * This class is used to efficiently check paths for valid
 * length (in UTF8 bytes) and depth (used in path validation).
 *
 * Throws Error exception if path is ever invalid.
 *
 * The definition of a path always begins with '/'.
 */
export declare class ValidationPath {
    private errorPrefix_;
    /** @type {!Array<string>} */
    private parts_;
    /** @type {number} Initialize to number of '/' chars needed in path. */
    private byteLength_;
    /**
     * @param {!Path} path Initial Path.
     * @param {string} errorPrefix_ Prefix for any error messages.
     */
    constructor(path: Path, errorPrefix_: string);
    /** @const {number} Maximum key depth. */
    static readonly MAX_PATH_DEPTH: number;
    /** @const {number} Maximum number of (UTF8) bytes in a Firebase path. */
    static readonly MAX_PATH_LENGTH_BYTES: number;
    /** @param {string} child */
    push(child: string): void;
    pop(): void;
    private checkValid_();
    /**
     * String for use in error messages - uses '.' notation for path.
     *
     * @return {string}
     */
    toErrorString(): string;
}
