import { NodeFilter } from './NodeFilter';
import { Index } from '../../snap/indexes/Index';
import { Path } from '../../util/Path';
import { CompleteChildSource } from '../CompleteChildSource';
import { ChildChangeAccumulator } from '../ChildChangeAccumulator';
import { Node } from '../../snap/Node';
/**
 * Doesn't really filter nodes but applies an index to the node and keeps track of any changes
 *
 * @constructor
 * @implements {NodeFilter}
 * @param {!Index} index
 */
export declare class IndexedFilter implements NodeFilter {
    private readonly index_;
    constructor(index_: Index);
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
}
