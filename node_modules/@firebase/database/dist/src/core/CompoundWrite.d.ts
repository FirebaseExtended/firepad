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
import { ImmutableTree } from './util/ImmutableTree';
import { Path } from './util/Path';
import { Node, NamedNode } from './snap/Node';
/**
 * This class holds a collection of writes that can be applied to nodes in unison. It abstracts away the logic with
 * dealing with priority writes and multiple nested writes. At any given path there is only allowed to be one write
 * modifying that path. Any write to an existing path or shadowing an existing path will modify that existing write
 * to reflect the write added.
 *
 * @constructor
 * @param {!ImmutableTree.<!Node>} writeTree
 */
export declare class CompoundWrite {
    private writeTree_;
    constructor(writeTree_: ImmutableTree<Node>);
    /**
     * @type {!CompoundWrite}
     */
    static Empty: CompoundWrite;
    /**
     * @param {!Path} path
     * @param {!Node} node
     * @return {!CompoundWrite}
     */
    addWrite(path: Path, node: Node): CompoundWrite;
    /**
     * @param {!Path} path
     * @param {!Object.<string, !Node>} updates
     * @return {!CompoundWrite}
     */
    addWrites(path: Path, updates: {
        [name: string]: Node;
    }): CompoundWrite;
    /**
     * Will remove a write at the given path and deeper paths. This will <em>not</em> modify a write at a higher
     * location, which must be removed by calling this method with that path.
     *
     * @param {!Path} path The path at which a write and all deeper writes should be removed
     * @return {!CompoundWrite} The new CompoundWrite with the removed path
     */
    removeWrite(path: Path): CompoundWrite;
    /**
     * Returns whether this CompoundWrite will fully overwrite a node at a given location and can therefore be
     * considered "complete".
     *
     * @param {!Path} path The path to check for
     * @return {boolean} Whether there is a complete write at that path
     */
    hasCompleteWrite(path: Path): boolean;
    /**
     * Returns a node for a path if and only if the node is a "complete" overwrite at that path. This will not aggregate
     * writes from deeper paths, but will return child nodes from a more shallow path.
     *
     * @param {!Path} path The path to get a complete write
     * @return {?Node} The node if complete at that path, or null otherwise.
     */
    getCompleteNode(path: Path): Node | null;
    /**
     * Returns all children that are guaranteed to be a complete overwrite.
     *
     * @return {!Array.<NamedNode>} A list of all complete children.
     */
    getCompleteChildren(): Array<NamedNode>;
    /**
     * @param {!Path} path
     * @return {!CompoundWrite}
     */
    childCompoundWrite(path: Path): CompoundWrite;
    /**
     * Returns true if this CompoundWrite is empty and therefore does not modify any nodes.
     * @return {boolean} Whether this CompoundWrite is empty
     */
    isEmpty(): boolean;
    /**
     * Applies this CompoundWrite to a node. The node is returned with all writes from this CompoundWrite applied to the
     * node
     * @param {!Node} node The node to apply this CompoundWrite to
     * @return {!Node} The node with all writes applied
     */
    apply(node: Node): Node;
    /**
     * @param {!Path} relativePath
     * @param {!ImmutableTree.<!Node>} writeTree
     * @param {!Node} node
     * @return {!Node}
     * @private
     */
    private static applySubtreeWrite_;
}
