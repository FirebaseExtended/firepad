/**
 * An in-memory storage implementation that matches the API of DOMStorageWrapper
 * (TODO: create interface for both to implement).
 *
 * @constructor
 */
export declare class MemoryStorage {
    private cache_;
    set(key: string, value: any | null): void;
    get(key: string): any;
    remove(key: string): void;
    isInMemoryStorage: boolean;
}
