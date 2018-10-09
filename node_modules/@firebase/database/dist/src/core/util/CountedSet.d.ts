/**
 * Implements a set with a count of elements.
 *
 * @template K, V
 */
export declare class CountedSet<K, V> {
    set: {
        [k: string]: V;
    };
    /**
     * @param {!K} item
     * @param {V} val
     */
    add(item: K, val: V): void;
    /**
     * @param {!K} key
     * @return {boolean}
     */
    contains(key: K): any;
    /**
     * @param {!K} item
     * @return {V}
     */
    get(item: K): V | void;
    /**
     * @param {!K} item
     */
    remove(item: K): void;
    /**
     * Deletes everything in the set
     */
    clear(): void;
    /**
     * True if there's nothing in the set
     * @return {boolean}
     */
    isEmpty(): boolean;
    /**
     * @return {number} The number of items in the set
     */
    count(): number;
    /**
     * Run a function on each k,v pair in the set
     * @param {function(K, V)} fn
     */
    each(fn: (k: K, v: V) => void): void;
    /**
     * Mostly for debugging
     * @return {Array.<K>} The keys present in this CountedSet
     */
    keys(): K[];
}
