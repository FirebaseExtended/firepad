import { NamedNode, Node } from '../snap/Node';
import { Index } from '../snap/indexes/Index';
import { WriteTreeRef } from '../WriteTree';
import { ViewCache } from './ViewCache';
/**
 * Since updates to filtered nodes might require nodes to be pulled in from "outside" the node, this interface
 * can help to get complete children that can be pulled in.
 * A class implementing this interface takes potentially multiple sources (e.g. user writes, server data from
 * other views etc.) to try it's best to get a complete child that might be useful in pulling into the view.
 *
 * @interface
 */
export interface CompleteChildSource {
    /**
     * @param {!string} childKey
     * @return {?Node}
     */
    getCompleteChild(childKey: string): Node | null;
    /**
     * @param {!Index} index
     * @param {!NamedNode} child
     * @param {boolean} reverse
     * @return {?NamedNode}
     */
    getChildAfterChild(index: Index, child: NamedNode, reverse: boolean): NamedNode | null;
}
/**
 * An implementation of CompleteChildSource that never returns any additional children
 *
 * @private
 * @constructor
 * @implements CompleteChildSource
 */
export declare class NoCompleteChildSource_ implements CompleteChildSource {
    /**
     * @inheritDoc
     */
    getCompleteChild(childKey?: string): Node | null;
    /**
     * @inheritDoc
     */
    getChildAfterChild(index?: Index, child?: NamedNode, reverse?: boolean): NamedNode | null;
}
/**
 * Singleton instance.
 * @const
 * @type {!CompleteChildSource}
 */
export declare const NO_COMPLETE_CHILD_SOURCE: NoCompleteChildSource_;
/**
 * An implementation of CompleteChildSource that uses a WriteTree in addition to any other server data or
 * old event caches available to calculate complete children.
 *
 *
 * @implements CompleteChildSource
 */
export declare class WriteTreeCompleteChildSource implements CompleteChildSource {
    private writes_;
    private viewCache_;
    private optCompleteServerCache_;
    /**
     * @param {!WriteTreeRef} writes_
     * @param {!ViewCache} viewCache_
     * @param {?Node} optCompleteServerCache_
     */
    constructor(writes_: WriteTreeRef, viewCache_: ViewCache, optCompleteServerCache_?: Node | null);
    /**
     * @inheritDoc
     */
    getCompleteChild(childKey: string): Node | null;
    /**
     * @inheritDoc
     */
    getChildAfterChild(index: Index, child: NamedNode, reverse: boolean): NamedNode | null;
}
