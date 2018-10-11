/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @fileoverview Implementation of an immutable SortedMap using a Left-leaning
 * Red-Black Tree, adapted from the implementation in Mugs
 * (http://mads379.github.com/mugs/) by Mads Hartmann Jensen
 * (mads379@gmail.com).
 *
 * Original paper on Left-leaning Red-Black Trees:
 *   http://www.cs.princeton.edu/~rs/talks/LLRB/LLRB.pdf
 *
 * Invariant 1: No red node has a red child
 * Invariant 2: Every leaf path has the same number of black nodes
 * Invariant 3: Only the left child can be red (left leaning)
 */
export declare type Comparator<K> = (key1: K, key2: K) => number;
/**
 * An iterator over an LLRBNode.
 */
export declare class SortedMapIterator<K, V, T> {
    private isReverse_;
    private resultGenerator_;
    /** @private
     * @type {Array.<!LLRBNode>}
     */
    private nodeStack_;
    /**
     * @template K, V, T
     * @param {LLRBNode|LLRBEmptyNode} node Node to iterate.
     * @param {?K} startKey
     * @param {function(K, K): number} comparator
     * @param {boolean} isReverse_ Whether or not to iterate in reverse
     * @param {(function(K, V):T)=} resultGenerator_
     */
    constructor(node: LLRBNode<K, V> | LLRBEmptyNode<K, V>, startKey: K | null, comparator: Comparator<K>, isReverse_: boolean, resultGenerator_?: ((k: K, v: V) => T) | null);
    getNext(): T;
    hasNext(): boolean;
    peek(): T;
}
/**
 * Represents a node in a Left-leaning Red-Black tree.
 */
export declare class LLRBNode<K, V> {
    key: K;
    value: V;
    color: boolean;
    left: LLRBNode<K, V> | LLRBEmptyNode<K, V>;
    right: LLRBNode<K, V> | LLRBEmptyNode<K, V>;
    /**
     * @template K, V
     * @param {!K} key Key associated with this node.
     * @param {!V} value Value associated with this node.
     * @param {?boolean} color Whether this node is red.
     * @param {?(LLRBNode|LLRBEmptyNode)=} left Left child.
     * @param {?(LLRBNode|LLRBEmptyNode)=} right Right child.
     */
    constructor(key: K, value: V, color: boolean | null, left?: LLRBNode<K, V> | LLRBEmptyNode<K, V> | null, right?: LLRBNode<K, V> | LLRBEmptyNode<K, V> | null);
    static RED: boolean;
    static BLACK: boolean;
    /**
     * Returns a copy of the current node, optionally replacing pieces of it.
     *
     * @param {?K} key New key for the node, or null.
     * @param {?V} value New value for the node, or null.
     * @param {?boolean} color New color for the node, or null.
     * @param {?LLRBNode|LLRBEmptyNode} left New left child for the node, or null.
     * @param {?LLRBNode|LLRBEmptyNode} right New right child for the node, or null.
     * @return {!LLRBNode} The node copy.
     */
    copy(key: K | null, value: V | null, color: boolean | null, left: LLRBNode<K, V> | LLRBEmptyNode<K, V> | null, right: LLRBNode<K, V> | LLRBEmptyNode<K, V> | null): LLRBNode<K, V>;
    /**
     * @return {number} The total number of nodes in the tree.
     */
    count(): number;
    /**
     * @return {boolean} True if the tree is empty.
     */
    isEmpty(): boolean;
    /**
     * Traverses the tree in key order and calls the specified action function
     * for each node.
     *
     * @param {function(!K, !V):*} action Callback function to be called for each
     *   node.  If it returns true, traversal is aborted.
     * @return {*} The first truthy value returned by action, or the last falsey
     *   value returned by action
     */
    inorderTraversal(action: (k: K, v: V) => any): boolean;
    /**
     * Traverses the tree in reverse key order and calls the specified action function
     * for each node.
     *
     * @param {function(!Object, !Object)} action Callback function to be called for each
     * node.  If it returns true, traversal is aborted.
     * @return {*} True if traversal was aborted.
     */
    reverseTraversal(action: (k: K, v: V) => void): boolean;
    /**
     * @return {!Object} The minimum node in the tree.
     * @private
     */
    private min_();
    /**
     * @return {!K} The maximum key in the tree.
     */
    minKey(): K;
    /**
     * @return {!K} The maximum key in the tree.
     */
    maxKey(): K;
    /**
     *
     * @param {!Object} key Key to insert.
     * @param {!Object} value Value to insert.
     * @param {Comparator} comparator Comparator.
     * @return {!LLRBNode} New tree, with the key/value added.
     */
    insert(key: K, value: V, comparator: Comparator<K>): LLRBNode<K, V>;
    /**
     * @private
     * @return {!LLRBNode|LLRBEmptyNode} New tree, with the minimum key removed.
     */
    private removeMin_();
    /**
     * @param {!Object} key The key of the item to remove.
     * @param {Comparator} comparator Comparator.
     * @return {!LLRBNode|LLRBEmptyNode} New tree, with the specified item removed.
     */
    remove(key: K, comparator: Comparator<K>): LLRBNode<K, V> | LLRBEmptyNode<K, V>;
    /**
     * @private
     * @return {boolean} Whether this is a RED node.
     */
    isRed_(): boolean;
    /**
     * @private
     * @return {!LLRBNode} New tree after performing any needed rotations.
     */
    private fixUp_();
    /**
     * @private
     * @return {!LLRBNode} New tree, after moveRedLeft.
     */
    private moveRedLeft_();
    /**
     * @private
     * @return {!LLRBNode} New tree, after moveRedRight.
     */
    private moveRedRight_();
    /**
     * @private
     * @return {!LLRBNode} New tree, after rotateLeft.
     */
    private rotateLeft_();
    /**
     * @private
     * @return {!LLRBNode} New tree, after rotateRight.
     */
    private rotateRight_();
    /**
     * @private
     * @return {!LLRBNode} New tree, after colorFlip.
     */
    private colorFlip_();
    /**
     * For testing.
     *
     * @private
     * @return {boolean} True if all is well.
     */
    private checkMaxDepth_();
    /**
     * @private
     * @return {number} Not sure what this returns exactly. :-).
     */
    check_(): number;
}
/**
 * Represents an empty node (a leaf node in the Red-Black Tree).
 */
export declare class LLRBEmptyNode<K, V> {
    key: K;
    value: V;
    left: LLRBNode<K, V> | LLRBEmptyNode<K, V>;
    right: LLRBNode<K, V> | LLRBEmptyNode<K, V>;
    color: boolean;
    /**
     * Returns a copy of the current node.
     *
     * @return {!LLRBEmptyNode} The node copy.
     */
    copy(key: K | null, value: V | null, color: boolean | null, left: LLRBNode<K, V> | LLRBEmptyNode<K, V> | null, right: LLRBNode<K, V> | LLRBEmptyNode<K, V> | null): LLRBEmptyNode<K, V>;
    /**
     * Returns a copy of the tree, with the specified key/value added.
     *
     * @param {!K} key Key to be added.
     * @param {!V} value Value to be added.
     * @param {Comparator} comparator Comparator.
     * @return {!LLRBNode} New tree, with item added.
     */
    insert(key: K, value: V, comparator: Comparator<K>): LLRBNode<K, V>;
    /**
     * Returns a copy of the tree, with the specified key removed.
     *
     * @param {!K} key The key to remove.
     * @param {Comparator} comparator Comparator.
     * @return {!LLRBEmptyNode} New tree, with item removed.
     */
    remove(key: K, comparator: Comparator<K>): LLRBEmptyNode<K, V>;
    /**
     * @return {number} The total number of nodes in the tree.
     */
    count(): number;
    /**
     * @return {boolean} True if the tree is empty.
     */
    isEmpty(): boolean;
    /**
     * Traverses the tree in key order and calls the specified action function
     * for each node.
     *
     * @param {function(!K, !V):*} action Callback function to be called for each
     * node.  If it returns true, traversal is aborted.
     * @return {boolean} True if traversal was aborted.
     */
    inorderTraversal(action: (k: K, v: V) => any): boolean;
    /**
     * Traverses the tree in reverse key order and calls the specified action function
     * for each node.
     *
     * @param {function(!K, !V)} action Callback function to be called for each
     * node.  If it returns true, traversal is aborted.
     * @return {boolean} True if traversal was aborted.
     */
    reverseTraversal(action: (k: K, v: V) => void): boolean;
    /**
     * @return {null}
     */
    minKey(): null;
    /**
     * @return {null}
     */
    maxKey(): null;
    /**
     * @private
     * @return {number} Not sure what this returns exactly. :-).
     */
    check_(): number;
    /**
     * @private
     * @return {boolean} Whether this node is red.
     */
    isRed_(): boolean;
}
/**
 * An immutable sorted map implementation, based on a Left-leaning Red-Black
 * tree.
 */
export declare class SortedMap<K, V> {
    private comparator_;
    private root_;
    /**
     * Always use the same empty node, to reduce memory.
     * @const
     */
    static EMPTY_NODE: LLRBEmptyNode<{}, {}>;
    /**
     * @template K, V
     * @param {function(K, K):number} comparator_ Key comparator.
     * @param {LLRBNode=} root_ (Optional) Root node for the map.
     */
    constructor(comparator_: Comparator<K>, root_?: LLRBNode<K, V> | LLRBEmptyNode<K, V>);
    /**
     * Returns a copy of the map, with the specified key/value added or replaced.
     * (TODO: We should perhaps rename this method to 'put')
     *
     * @param {!K} key Key to be added.
     * @param {!V} value Value to be added.
     * @return {!SortedMap.<K, V>} New map, with item added.
     */
    insert(key: K, value: V): SortedMap<K, V>;
    /**
     * Returns a copy of the map, with the specified key removed.
     *
     * @param {!K} key The key to remove.
     * @return {!SortedMap.<K, V>} New map, with item removed.
     */
    remove(key: K): SortedMap<K, V>;
    /**
     * Returns the value of the node with the given key, or null.
     *
     * @param {!K} key The key to look up.
     * @return {?V} The value of the node with the given key, or null if the
     * key doesn't exist.
     */
    get(key: K): V | null;
    /**
     * Returns the key of the item *before* the specified key, or null if key is the first item.
     * @param {K} key The key to find the predecessor of
     * @return {?K} The predecessor key.
     */
    getPredecessorKey(key: K): K | null;
    /**
     * @return {boolean} True if the map is empty.
     */
    isEmpty(): boolean;
    /**
     * @return {number} The total number of nodes in the map.
     */
    count(): number;
    /**
     * @return {?K} The minimum key in the map.
     */
    minKey(): K | null;
    /**
     * @return {?K} The maximum key in the map.
     */
    maxKey(): K | null;
    /**
     * Traverses the map in key order and calls the specified action function
     * for each key/value pair.
     *
     * @param {function(!K, !V):*} action Callback function to be called
     * for each key/value pair.  If action returns true, traversal is aborted.
     * @return {*} The first truthy value returned by action, or the last falsey
     *   value returned by action
     */
    inorderTraversal(action: (k: K, v: V) => any): boolean;
    /**
     * Traverses the map in reverse key order and calls the specified action function
     * for each key/value pair.
     *
     * @param {function(!Object, !Object)} action Callback function to be called
     * for each key/value pair.  If action returns true, traversal is aborted.
     * @return {*} True if the traversal was aborted.
     */
    reverseTraversal(action: (k: K, v: V) => void): boolean;
    /**
     * Returns an iterator over the SortedMap.
     * @template T
     * @param {(function(K, V):T)=} resultGenerator
     * @return {SortedMapIterator.<K, V, T>} The iterator.
     */
    getIterator<T>(resultGenerator?: (k: K, v: V) => T): SortedMapIterator<K, V, T>;
    getIteratorFrom<T>(key: K, resultGenerator?: (k: K, v: V) => T): SortedMapIterator<K, V, T>;
    getReverseIteratorFrom<T>(key: K, resultGenerator?: (k: K, v: V) => T): SortedMapIterator<K, V, T>;
    getReverseIterator<T>(resultGenerator?: (k: K, v: V) => T): SortedMapIterator<K, V, T>;
}
