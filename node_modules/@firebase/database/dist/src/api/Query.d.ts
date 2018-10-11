import { Path } from '../core/util/Path';
import { Repo } from '../core/Repo';
import { QueryParams } from '../core/view/QueryParams';
import { Reference } from './Reference';
import { DataSnapshot } from './DataSnapshot';
export interface SnapshotCallback {
    (a: DataSnapshot, b?: string): any;
}
/**
 * A Query represents a filter to be applied to a firebase location.  This object purely represents the
 * query expression (and exposes our public API to build the query).  The actual query logic is in ViewBase.js.
 *
 * Since every Firebase reference is a query, Firebase inherits from this object.
 */
export declare class Query {
    repo: Repo;
    path: Path;
    private queryParams_;
    private orderByCalled_;
    static __referenceConstructor: new (repo: Repo, path: Path) => Query;
    constructor(repo: Repo, path: Path, queryParams_: QueryParams, orderByCalled_: boolean);
    /**
     * Validates start/end values for queries.
     * @param {!QueryParams} params
     * @private
     */
    private static validateQueryEndpoints_(params);
    /**
     * Validates that limit* has been called with the correct combination of parameters
     * @param {!QueryParams} params
     * @private
     */
    private static validateLimit_(params);
    /**
     * Validates that no other order by call has been made
     * @param {!string} fnName
     * @private
     */
    private validateNoPreviousOrderByCall_(fnName);
    /**
     * @return {!QueryParams}
     */
    getQueryParams(): QueryParams;
    /**
     * @return {!Reference}
     */
    getRef(): Reference;
    /**
     * @param {!string} eventType
     * @param {!function(DataSnapshot, string=)} callback
     * @param {(function(Error)|Object)=} cancelCallbackOrContext
     * @param {Object=} context
     * @return {!function(DataSnapshot, string=)}
     */
    on(eventType: string, callback: SnapshotCallback, cancelCallbackOrContext?: ((a: Error) => any) | Object, context?: Object): SnapshotCallback;
    /**
     * @param {!function(!DataSnapshot)} callback
     * @param {?function(Error)} cancelCallback
     * @param {?Object} context
     * @protected
     */
    protected onValueEvent(callback: (a: DataSnapshot) => void, cancelCallback: ((a: Error) => void) | null, context: Object | null): void;
    /**
     * @param {!Object.<string, !function(!DataSnapshot, ?string)>} callbacks
     * @param {?function(Error)} cancelCallback
     * @param {?Object} context
     * @protected
     */
    onChildEvent(callbacks: {
        [k: string]: SnapshotCallback;
    }, cancelCallback: ((a: Error) => any) | null, context: Object | null): void;
    /**
     * @param {string=} eventType
     * @param {(function(!DataSnapshot, ?string=))=} callback
     * @param {Object=} context
     */
    off(eventType?: string, callback?: SnapshotCallback, context?: Object): void;
    /**
     * Attaches a listener, waits for the first event, and then removes the listener
     * @param {!string} eventType
     * @param {!function(!DataSnapshot, string=)} userCallback
     * @param cancelOrContext
     * @param context
     * @return {!firebase.Promise}
     */
    once(eventType: string, userCallback?: SnapshotCallback, cancelOrContext?: ((a: Error) => void) | Object, context?: Object): Promise<DataSnapshot>;
    /**
     * Set a limit and anchor it to the start of the window.
     * @param {!number} limit
     * @return {!Query}
     */
    limitToFirst(limit: number): Query;
    /**
     * Set a limit and anchor it to the end of the window.
     * @param {!number} limit
     * @return {!Query}
     */
    limitToLast(limit: number): Query;
    /**
     * Given a child path, return a new query ordered by the specified grandchild path.
     * @param {!string} path
     * @return {!Query}
     */
    orderByChild(path: string): Query;
    /**
     * Return a new query ordered by the KeyIndex
     * @return {!Query}
     */
    orderByKey(): Query;
    /**
     * Return a new query ordered by the PriorityIndex
     * @return {!Query}
     */
    orderByPriority(): Query;
    /**
     * Return a new query ordered by the ValueIndex
     * @return {!Query}
     */
    orderByValue(): Query;
    /**
     * @param {number|string|boolean|null} value
     * @param {?string=} name
     * @return {!Query}
     */
    startAt(value?: number | string | boolean | null, name?: string | null): Query;
    /**
     * @param {number|string|boolean|null} value
     * @param {?string=} name
     * @return {!Query}
     */
    endAt(value?: number | string | boolean | null, name?: string | null): Query;
    /**
     * Load the selection of children with exactly the specified value, and, optionally,
     * the specified name.
     * @param {number|string|boolean|null} value
     * @param {string=} name
     * @return {!Query}
     */
    equalTo(value: number | string | boolean | null, name?: string): Query;
    /**
     * @return {!string} URL for this location.
     */
    toString(): string;
    toJSON(): string;
    /**
     * An object representation of the query parameters used by this Query.
     * @return {!Object}
     */
    queryObject(): Object;
    /**
     * @return {!string}
     */
    queryIdentifier(): string;
    /**
     * Return true if this query and the provided query are equivalent; otherwise, return false.
     * @param {Query} other
     * @return {boolean}
     */
    isEqual(other: Query): boolean;
    /**
     * Helper used by .on and .once to extract the context and or cancel arguments.
     * @param {!string} fnName The function name (on or once)
     * @param {(function(Error)|Object)=} cancelOrContext
     * @param {Object=} context
     * @return {{cancel: ?function(Error), context: ?Object}}
     * @private
     */
    private static getCancelAndContextArgs_(fnName, cancelOrContext?, context?);
    readonly ref: Reference;
}
