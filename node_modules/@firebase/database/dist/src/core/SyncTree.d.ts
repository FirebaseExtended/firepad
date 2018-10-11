import { Path } from './util/Path';
import { Query } from '../api/Query';
import { Node } from './snap/Node';
import { Event } from './view/Event';
import { EventRegistration } from './view/EventRegistration';
/**
 * @typedef {{
 *   startListening: function(
 *     !Query,
 *     ?number,
 *     function():string,
 *     function(!string, *):!Array.<!Event>
 *   ):!Array.<!Event>,
 *
 *   stopListening: function(!Query, ?number)
 * }}
 */
export interface ListenProvider {
    startListening(query: Query, tag: number | null, hashFn: () => string, onComplete: (a: string, b?: any) => Event[]): Event[];
    stopListening(a: Query, b: number | null): void;
}
/**
 * SyncTree is the central class for managing event callback registration, data caching, views
 * (query processing), and event generation.  There are typically two SyncTree instances for
 * each Repo, one for the normal Firebase data, and one for the .info data.
 *
 * It has a number of responsibilities, including:
 *  - Tracking all user event callbacks (registered via addEventRegistration() and removeEventRegistration()).
 *  - Applying and caching data changes for user set(), transaction(), and update() calls
 *    (applyUserOverwrite(), applyUserMerge()).
 *  - Applying and caching data changes for server data changes (applyServerOverwrite(),
 *    applyServerMerge()).
 *  - Generating user-facing events for server and user changes (all of the apply* methods
 *    return the set of events that need to be raised as a result).
 *  - Maintaining the appropriate set of server listens to ensure we are always subscribed
 *    to the correct set of paths and queries to satisfy the current set of user event
 *    callbacks (listens are started/stopped using the provided listenProvider).
 *
 * NOTE: Although SyncTree tracks event callbacks and calculates events to raise, the actual
 * events are returned to the caller rather than raised synchronously.
 *
 * @constructor
 */
export declare class SyncTree {
    private listenProvider_;
    /**
     * Tree of SyncPoints.  There's a SyncPoint at any location that has 1 or more views.
     * @type {!ImmutableTree.<!SyncPoint>}
     * @private
     */
    private syncPointTree_;
    /**
     * A tree of all pending user writes (user-initiated set()'s, transaction()'s, update()'s, etc.).
     * @type {!WriteTree}
     * @private
     */
    private pendingWriteTree_;
    private tagToQueryMap_;
    private queryToTagMap_;
    /**
     * @param {!ListenProvider} listenProvider_ Used by SyncTree to start / stop listening
     *   to server data.
     */
    constructor(listenProvider_: ListenProvider);
    /**
     * Apply the data changes for a user-generated set() or transaction() call.
     *
     * @param {!Path} path
     * @param {!Node} newData
     * @param {number} writeId
     * @param {boolean=} visible
     * @return {!Array.<!Event>} Events to raise.
     */
    applyUserOverwrite(path: Path, newData: Node, writeId: number, visible?: boolean): Event[];
    /**
     * Apply the data from a user-generated update() call
     *
     * @param {!Path} path
     * @param {!Object.<string, !Node>} changedChildren
     * @param {!number} writeId
     * @return {!Array.<!Event>} Events to raise.
     */
    applyUserMerge(path: Path, changedChildren: {
        [k: string]: Node;
    }, writeId: number): Event[];
    /**
     * Acknowledge a pending user write that was previously registered with applyUserOverwrite() or applyUserMerge().
     *
     * @param {!number} writeId
     * @param {boolean=} revert True if the given write failed and needs to be reverted
     * @return {!Array.<!Event>} Events to raise.
     */
    ackUserWrite(writeId: number, revert?: boolean): Event[];
    /**
     * Apply new server data for the specified path..
     *
     * @param {!Path} path
     * @param {!Node} newData
     * @return {!Array.<!Event>} Events to raise.
     */
    applyServerOverwrite(path: Path, newData: Node): Event[];
    /**
     * Apply new server data to be merged in at the specified path.
     *
     * @param {!Path} path
     * @param {!Object.<string, !Node>} changedChildren
     * @return {!Array.<!Event>} Events to raise.
     */
    applyServerMerge(path: Path, changedChildren: {
        [k: string]: Node;
    }): Event[];
    /**
     * Apply a listen complete for a query
     *
     * @param {!Path} path
     * @return {!Array.<!Event>} Events to raise.
     */
    applyListenComplete(path: Path): Event[];
    /**
     * Apply new server data for the specified tagged query.
     *
     * @param {!Path} path
     * @param {!Node} snap
     * @param {!number} tag
     * @return {!Array.<!Event>} Events to raise.
     */
    applyTaggedQueryOverwrite(path: Path, snap: Node, tag: number): Event[];
    /**
     * Apply server data to be merged in for the specified tagged query.
     *
     * @param {!Path} path
     * @param {!Object.<string, !Node>} changedChildren
     * @param {!number} tag
     * @return {!Array.<!Event>} Events to raise.
     */
    applyTaggedQueryMerge(path: Path, changedChildren: {
        [k: string]: Node;
    }, tag: number): Event[];
    /**
     * Apply a listen complete for a tagged query
     *
     * @param {!Path} path
     * @param {!number} tag
     * @return {!Array.<!Event>} Events to raise.
     */
    applyTaggedListenComplete(path: Path, tag: number): Event[];
    /**
     * Add an event callback for the specified query.
     *
     * @param {!Query} query
     * @param {!EventRegistration} eventRegistration
     * @return {!Array.<!Event>} Events to raise.
     */
    addEventRegistration(query: Query, eventRegistration: EventRegistration): Event[];
    /**
     * Remove event callback(s).
     *
     * If query is the default query, we'll check all queries for the specified eventRegistration.
     * If eventRegistration is null, we'll remove all callbacks for the specified query/queries.
     *
     * @param {!Query} query
     * @param {?EventRegistration} eventRegistration If null, all callbacks are removed.
     * @param {Error=} cancelError If a cancelError is provided, appropriate cancel events will be returned.
     * @return {!Array.<!Event>} Cancel events, if cancelError was provided.
     */
    removeEventRegistration(query: Query, eventRegistration: EventRegistration | null, cancelError?: Error): Event[];
    /**
     * Returns a complete cache, if we have one, of the data at a particular path. The location must have a listener above
     * it, but as this is only used by transaction code, that should always be the case anyways.
     *
     * Note: this method will *include* hidden writes from transaction with applyLocally set to false.
     * @param {!Path} path The path to the data we want
     * @param {Array.<number>=} writeIdsToExclude A specific set to be excluded
     * @return {?Node}
     */
    calcCompleteEventCache(path: Path, writeIdsToExclude?: number[]): Node | null;
    /**
     * This collapses multiple unfiltered views into a single view, since we only need a single
     * listener for them.
     *
     * @param {!ImmutableTree.<!SyncPoint>} subtree
     * @return {!Array.<!View>}
     * @private
     */
    private collectDistinctViewsForSubTree_(subtree);
    /**
     * @param {!Array.<!Query>} queries
     * @private
     */
    private removeTags_(queries);
    /**
     * Normalizes a query to a query we send the server for listening
     * @param {!Query} query
     * @return {!Query} The normalized query
     * @private
     */
    private static queryForListening_(query);
    /**
     * For a given new listen, manage the de-duplication of outstanding subscriptions.
     *
     * @param {!Query} query
     * @param {!View} view
     * @return {!Array.<!Event>} This method can return events to support synchronous data sources
     * @private
     */
    private setupListener_(query, view);
    /**
     *
     * @param {!View} view
     * @return {{hashFn: function(), onComplete: function(!string, *)}}
     * @private
     */
    private createListenerForView_(view);
    /**
     * Given a query, computes a "queryKey" suitable for use in our queryToTagMap_.
     * @private
     * @param {!Query} query
     * @return {string}
     */
    private static makeQueryKey_(query);
    /**
     * Given a queryKey (created by makeQueryKey), parse it back into a path and queryId.
     * @private
     * @param {!string} queryKey
     * @return {{queryId: !string, path: !Path}}
     */
    private static parseQueryKey_(queryKey);
    /**
     * Return the query associated with the given tag, if we have one
     * @param {!number} tag
     * @return {?string}
     * @private
     */
    private queryKeyForTag_(tag);
    /**
     * Return the tag associated with the given query.
     * @param {!Query} query
     * @return {?number}
     * @private
     */
    private tagForQuery_(query);
    /**
     * Static tracker for next query tag.
     * @type {number}
     * @private
     */
    private static nextQueryTag_;
    /**
     * Static accessor for query tags.
     * @return {number}
     * @private
     */
    private static getNextQueryTag_();
    /**
     * A helper method to apply tagged operations
     *
     * @param {!Path} queryPath
     * @param {!Operation} operation
     * @return {!Array.<!Event>}
     * @private
     */
    private applyTaggedOperation_(queryPath, operation);
    /**
     * A helper method that visits all descendant and ancestor SyncPoints, applying the operation.
     *
     * NOTES:
     * - Descendant SyncPoints will be visited first (since we raise events depth-first).
  
     * - We call applyOperation() on each SyncPoint passing three things:
     *   1. A version of the Operation that has been made relative to the SyncPoint location.
     *   2. A WriteTreeRef of any writes we have cached at the SyncPoint location.
     *   3. A snapshot Node with cached server data, if we have it.
  
     * - We concatenate all of the events returned by each SyncPoint and return the result.
     *
     * @param {!Operation} operation
     * @return {!Array.<!Event>}
     * @private
     */
    private applyOperationToSyncPoints_(operation);
    /**
     * Recursive helper for applyOperationToSyncPoints_
     *
     * @private
     * @param {!Operation} operation
     * @param {ImmutableTree.<!SyncPoint>} syncPointTree
     * @param {?Node} serverCache
     * @param {!WriteTreeRef} writesCache
     * @return {!Array.<!Event>}
     */
    private applyOperationHelper_(operation, syncPointTree, serverCache, writesCache);
    /**
     * Recursive helper for applyOperationToSyncPoints_
     *
     * @private
     * @param {!Operation} operation
     * @param {ImmutableTree.<!SyncPoint>} syncPointTree
     * @param {?Node} serverCache
     * @param {!WriteTreeRef} writesCache
     * @return {!Array.<!Event>}
     */
    private applyOperationDescendantsHelper_(operation, syncPointTree, serverCache, writesCache);
}
