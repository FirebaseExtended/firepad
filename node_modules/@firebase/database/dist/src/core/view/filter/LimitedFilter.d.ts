import { Node } from '../../snap/Node';
import { NodeFilter } from './NodeFilter';
import { Index } from '../../snap/indexes/Index';
import { IndexedFilter } from './IndexedFilter';
import { QueryParams } from '../QueryParams';
import { Path } from '../../util/Path';
import { CompleteChildSource } from '../CompleteChildSource';
import { ChildChangeAccumulator } from '../ChildChangeAccumulator';
/**
 * Applies a limit and a range to a node and uses RangedFilter to do the heavy lifting where possible
 *
 * @constructor
 * @implements {NodeFilter}
 */
export declare class LimitedFilter implements NodeFilter {
    /**
     * @const
     * @type {RangedFilter}
     * @private
     */
    private readonly rangedFilter_;
    /**
     * @const
     * @type {!Index}
     * @private
     */
    private readonly index_;
    /**
     * @const
     * @type {number}
     * @private
     */
    private readonly limit_;
    /**
     * @const
     * @type {boolean}
     * @private
     */
    private readonly reverse_;
    /**
     * @param {!QueryParams} params
     */
    constructor(params: QueryParams);
    /**
     * @inheritDoc
     */
    updateChild(snap: Node, key: string, newChild: Node, affectedPath: Path, source: CompleteChildSource, optChangeAccumulator: ChildChangeAccumulator | null): Node;
    /**
     * @inheritDoc
     */
    updateFullNode(oldSnap: Node, newSnap: Node, optChangeAccumulator: ChildChangeAccumulator | null): Node;
    /**
     * @inheritDoc
     */
    updatePriority(oldSnap: Node, newPriority: Node): Node;
    /**
     * @inheritDoc
     */
    filtersNodes(): boolean;
    /**
     * @inheritDoc
     */
    getIndexedFilter(): IndexedFilter;
    /**
     * @inheritDoc
     */
    getIndex(): Index;
    /**
     * @param {!Node} snap
     * @param {string} childKey
     * @param {!Node} childSnap
     * @param {!CompleteChildSource} source
     * @param {?ChildChangeAccumulator} changeAccumulator
     * @return {!Node}
     * @private
     */
    private fullLimitUpdateChild_(snap, childKey, childSnap, source, changeAccumulator);
}
