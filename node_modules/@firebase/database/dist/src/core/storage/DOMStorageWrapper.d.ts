/**
 * Wraps a DOM Storage object and:
 * - automatically encode objects as JSON strings before storing them to allow us to store arbitrary types.
 * - prefixes names with "firebase:" to avoid collisions with app data.
 *
 * We automatically (see storage.js) create two such wrappers, one for sessionStorage,
 * and one for localStorage.
 *
 * @constructor
 */
export declare class DOMStorageWrapper {
    private domStorage_;
    private prefix_;
    /**
     * @param {Storage} domStorage_ The underlying storage object (e.g. localStorage or sessionStorage)
     */
    constructor(domStorage_: Storage);
    /**
     * @param {string} key The key to save the value under
     * @param {?Object} value The value being stored, or null to remove the key.
     */
    set(key: string, value: any | null): void;
    /**
     * @param {string} key
     * @return {*} The value that was stored under this key, or null
     */
    get(key: string): any;
    /**
     * @param {string} key
     */
    remove(key: string): void;
    isInMemoryStorage: boolean;
    /**
     * @param {string} name
     * @return {string}
     */
    prefixedName_(name: string): string;
    toString(): string;
}
