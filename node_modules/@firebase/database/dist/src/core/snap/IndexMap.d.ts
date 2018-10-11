import { NamedNode, Node } from './Node';
import { SortedMap } from '../util/SortedMap';
import { Index } from './indexes/Index';
/**
 *
 * @param {Object.<string, FallbackType|SortedMap.<NamedNode, Node>>} indexes
 * @param {Object.<string, Index>} indexSet
 * @constructor
 */
export declare class IndexMap {
    private indexes_;
    private indexSet_;
    /**
     * The default IndexMap for nodes without a priority
     * @type {!IndexMap}
     * @const
     */
    static readonly Default: IndexMap;
    constructor(indexes_: {
        [k: string]: SortedMap<NamedNode, Node> | object;
    }, indexSet_: {
        [k: string]: Index;
    });
    /**
     *
     * @param {!string} indexKey
     * @return {?SortedMap.<NamedNode, Node>}
     */
    get(indexKey: string): SortedMap<NamedNode, Node> | null;
    /**
     * @param {!Index} indexDefinition
     * @return {boolean}
     */
    hasIndex(indexDefinition: Index): boolean;
    /**
     * @param {!Index} indexDefinition
     * @param {!SortedMap.<string, !Node>} existingChildren
     * @return {!IndexMap}
     */
    addIndex(indexDefinition: Index, existingChildren: SortedMap<string, Node>): IndexMap;
    /**
     * Ensure that this node is properly tracked in any indexes that we're maintaining
     * @param {!NamedNode} namedNode
     * @param {!SortedMap.<string, !Node>} existingChildren
     * @return {!IndexMap}
     */
    addToIndexes(namedNode: NamedNode, existingChildren: SortedMap<string, Node>): IndexMap;
    /**
     * Create a new IndexMap instance with the given value removed
     * @param {!NamedNode} namedNode
     * @param {!SortedMap.<string, !Node>} existingChildren
     * @return {!IndexMap}
     */
    removeFromIndexes(namedNode: NamedNode, existingChildren: SortedMap<string, Node>): IndexMap;
}
