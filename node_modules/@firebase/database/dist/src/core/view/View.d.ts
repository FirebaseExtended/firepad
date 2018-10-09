import { ViewCache } from './ViewCache';
import { Operation } from '../operation/Operation';
import { Change } from './Change';
import { Query } from '../../api/Query';
import { EventRegistration } from './EventRegistration';
import { Node } from '../snap/Node';
import { Path } from '../util/Path';
import { WriteTreeRef } from '../WriteTree';
import { Event } from './Event';
/**
 * A view represents a specific location and query that has 1 or more event registrations.
 *
 * It does several things:
 *  - Maintains the list of event registrations for this location/query.
 *  - Maintains a cache of the data visible for this location/query.
 *  - Applies new operations (via applyOperation), updates the cache, and based on the event
 *    registrations returns the set of events to be raised.
 * @constructor
 */
export declare class View {
    private query_;
    private processor_;
    private viewCache_;
    private eventRegistrations_;
    private eventGenerator_;
    /**
     *
     * @param {!Query} query_
     * @param {!ViewCache} initialViewCache
     */
    constructor(query_: Query, initialViewCache: ViewCache);
    /**
     * @return {!Query}
     */
    getQuery(): Query;
    /**
     * @return {?Node}
     */
    getServerCache(): Node | null;
    /**
     * @param {!Path} path
     * @return {?Node}
     */
    getCompleteServerCache(path: Path): Node | null;
    /**
     * @return {boolean}
     */
    isEmpty(): boolean;
    /**
     * @param {!EventRegistration} eventRegistration
     */
    addEventRegistration(eventRegistration: EventRegistration): void;
    /**
     * @param {?EventRegistration} eventRegistration If null, remove all callbacks.
     * @param {Error=} cancelError If a cancelError is provided, appropriate cancel events will be returned.
     * @return {!Array.<!Event>} Cancel events, if cancelError was provided.
     */
    removeEventRegistration(eventRegistration: EventRegistration | null, cancelError?: Error): Event[];
    /**
     * Applies the given Operation, updates our cache, and returns the appropriate events.
     *
     * @param {!Operation} operation
     * @param {!WriteTreeRef} writesCache
     * @param {?Node} completeServerCache
     * @return {!Array.<!Event>}
     */
    applyOperation(operation: Operation, writesCache: WriteTreeRef, completeServerCache: Node | null): Event[];
    /**
     * @param {!EventRegistration} registration
     * @return {!Array.<!Event>}
     */
    getInitialEvents(registration: EventRegistration): Event[];
    /**
     * @private
     * @param {!Array.<!Change>} changes
     * @param {!Node} eventCache
     * @param {EventRegistration=} eventRegistration
     * @return {!Array.<!Event>}
     */
    generateEventsForChanges_(changes: Change[], eventCache: Node, eventRegistration?: EventRegistration): Event[];
}
