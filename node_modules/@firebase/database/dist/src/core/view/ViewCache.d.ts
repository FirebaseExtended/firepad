import { CacheNode } from './CacheNode';
import { Node } from '../snap/Node';
/**
 * Stores the data we have cached for a view.
 *
 * serverSnap is the cached server data, eventSnap is the cached event data (server data plus any local writes).
 *
 * @constructor
 */
export declare class ViewCache {
    private readonly eventCache_;
    private readonly serverCache_;
    /**
     *
     * @param {!CacheNode} eventCache_
     * @param {!CacheNode} serverCache_
     */
    constructor(eventCache_: CacheNode, serverCache_: CacheNode);
    /**
     * @const
     * @type {ViewCache}
     */
    static Empty: ViewCache;
    /**
     * @param {!Node} eventSnap
     * @param {boolean} complete
     * @param {boolean} filtered
     * @return {!ViewCache}
     */
    updateEventSnap(eventSnap: Node, complete: boolean, filtered: boolean): ViewCache;
    /**
     * @param {!Node} serverSnap
     * @param {boolean} complete
     * @param {boolean} filtered
     * @return {!ViewCache}
     */
    updateServerSnap(serverSnap: Node, complete: boolean, filtered: boolean): ViewCache;
    /**
     * @return {!CacheNode}
     */
    getEventCache(): CacheNode;
    /**
     * @return {?Node}
     */
    getCompleteEventSnap(): Node | null;
    /**
     * @return {!CacheNode}
     */
    getServerCache(): CacheNode;
    /**
     * @return {?Node}
     */
    getCompleteServerSnap(): Node | null;
}
