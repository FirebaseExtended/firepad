import { SortedMap, SortedMapIterator } from '../util/SortedMap';
import { Node, NamedNode } from './Node';
import { IndexMap } from './IndexMap';
import { Index } from './indexes/Index';
import { Path } from '../util/Path';
export interface ChildrenNodeConstructor {
    new (children_: SortedMap<string, Node>, priorityNode_: Node | null, indexMap_: IndexMap): ChildrenNode;
    EMPTY_NODE: ChildrenNode;
}
/**
 * ChildrenNode is a class for storing internal nodes in a DataSnapshot
 * (i.e. nodes with children).  It implements Node and stores the
 * list of children in the children property, sorted by child name.
 *
 * @constructor
 * @implements {Node}
 */
export declare class ChildrenNode implements Node {
    private readonly children_;
    private readonly priorityNode_;
    private indexMap_;
    private lazyHash_;
    static readonly EMPTY_NODE: ChildrenNode;
    /**
     *
     * @param {!SortedMap.<string, !Node>} children_ List of children
     * of this node..
     * @param {?Node} priorityNode_ The priority of this node (as a snapshot node).
     * @param {!IndexMap} indexMap_
     */
    constructor(children_: SortedMap<string, Node>, priorityNode_: Node | null, indexMap_: IndexMap);
    /** @inheritDoc */
    isLeafNode(): boolean;
    /** @inheritDoc */
    getPriority(): Node;
    /** @inheritDoc */
    updatePriority(newPriorityNode: Node): Node;
    /** @inheritDoc */
    getImmediateChild(childName: string): Node;
    /** @inheritDoc */
    getChild(path: Path): Node;
    /** @inheritDoc */
    hasChild(childName: string): boolean;
    /** @inheritDoc */
    updateImmediateChild(childName: string, newChildNode: Node): Node;
    /** @inheritDoc */
    updateChild(path: Path, newChildNode: Node): Node;
    /** @inheritDoc */
    isEmpty(): boolean;
    /** @inheritDoc */
    numChildren(): number;
    /**
     * @private
     * @type {RegExp}
     */
    private static INTEGER_REGEXP_;
    /** @inheritDoc */
    val(exportFormat?: boolean): object;
    /** @inheritDoc */
    hash(): string;
    /** @inheritDoc */
    getPredecessorChildName(childName: string, childNode: Node, index: Index): string;
    /**
     * @param {!Index} indexDefinition
     * @return {?string}
     */
    getFirstChildName(indexDefinition: Index): string | null;
    /**
     * @param {!Index} indexDefinition
     * @return {?NamedNode}
     */
    getFirstChild(indexDefinition: Index): NamedNode | null;
    /**
     * Given an index, return the key name of the largest value we have, according to that index
     * @param {!Index} indexDefinition
     * @return {?string}
     */
    getLastChildName(indexDefinition: Index): string | null;
    /**
     * @param {!Index} indexDefinition
     * @return {?NamedNode}
     */
    getLastChild(indexDefinition: Index): NamedNode | null;
    /**
     * @inheritDoc
     */
    forEachChild(index: Index, action: (key: string, node: Node) => boolean | void): boolean;
    /**
     * @param {!Index} indexDefinition
     * @return {SortedMapIterator}
     */
    getIterator(indexDefinition: Index): SortedMapIterator<string | NamedNode, Node, NamedNode>;
    /**
     *
     * @param {!NamedNode} startPost
     * @param {!Index} indexDefinition
     * @return {!SortedMapIterator}
     */
    getIteratorFrom(startPost: NamedNode, indexDefinition: Index): SortedMapIterator<string | NamedNode, Node, NamedNode>;
    /**
     * @param {!Index} indexDefinition
     * @return {!SortedMapIterator}
     */
    getReverseIterator(indexDefinition: Index): SortedMapIterator<string | NamedNode, Node, NamedNode>;
    /**
     * @param {!NamedNode} endPost
     * @param {!Index} indexDefinition
     * @return {!SortedMapIterator}
     */
    getReverseIteratorFrom(endPost: NamedNode, indexDefinition: Index): SortedMapIterator<string | NamedNode, Node, NamedNode>;
    /**
     * @inheritDoc
     */
    compareTo(other: ChildrenNode): number;
    /**
     * @inheritDoc
     */
    withIndex(indexDefinition: Index): Node;
    /**
     * @inheritDoc
     */
    isIndexed(index: Index): boolean;
    /**
     * @inheritDoc
     */
    equals(other: Node): boolean;
    /**
     * Returns a SortedMap ordered by index, or null if the default (by-key) ordering can be used
     * instead.
     *
     * @private
     * @param {!Index} indexDefinition
     * @return {?SortedMap.<NamedNode, Node>}
     */
    private resolveIndex_(indexDefinition);
}
/**
 * @constructor
 * @extends {ChildrenNode}
 * @private
 */
export declare class MaxNode extends ChildrenNode {
    constructor();
    compareTo(other: Node): number;
    equals(other: Node): boolean;
    getPriority(): MaxNode;
    getImmediateChild(childName: string): ChildrenNode;
    isEmpty(): boolean;
}
/**
 * Marker that will sort higher than any other snapshot.
 * @type {!MAX_NODE}
 * @const
 */
export declare const MAX_NODE: MaxNode;
/**
 * Document NamedNode extensions
 */
declare module './Node' {
    interface NamedNode {
        MIN: NamedNode;
        MAX: NamedNode;
    }
}
