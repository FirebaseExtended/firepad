import { SparseSnapshotTree } from '../SparseSnapshotTree';
import { Node } from '../snap/Node';
/**
 * Generate placeholders for deferred values.
 * @param {?Object} values
 * @return {!Object}
 */
export declare const generateWithValues: (values: {
    [k: string]: any;
}) => {
    [k: string]: any;
};
/**
 * Value to use when firing local events. When writing server values, fire
 * local events with an approximate value, otherwise return value as-is.
 * @param {(Object|string|number|boolean)} value
 * @param {!Object} serverValues
 * @return {!(string|number|boolean)}
 */
export declare const resolveDeferredValue: (value: string | number | boolean | {
    [k: string]: any;
}, serverValues: {
    [k: string]: any;
}) => string | number | boolean;
/**
 * Recursively replace all deferred values and priorities in the tree with the
 * specified generated replacement values.
 * @param {!SparseSnapshotTree} tree
 * @param {!Object} serverValues
 * @return {!SparseSnapshotTree}
 */
export declare const resolveDeferredValueTree: (tree: SparseSnapshotTree, serverValues: Object) => SparseSnapshotTree;
/**
 * Recursively replace all deferred values and priorities in the node with the
 * specified generated replacement values.  If there are no server values in the node,
 * it'll be returned as-is.
 * @param {!Node} node
 * @param {!Object} serverValues
 * @return {!Node}
 */
export declare const resolveDeferredValueSnapshot: (node: Node, serverValues: Object) => Node;
