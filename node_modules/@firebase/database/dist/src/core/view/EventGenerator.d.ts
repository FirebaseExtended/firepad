/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Node } from '../snap/Node';
import { Change } from './Change';
import { Query } from '../../api/Query';
import { EventRegistration } from './EventRegistration';
import { Event } from './Event';
/**
 * An EventGenerator is used to convert "raw" changes (Change) as computed by the
 * CacheDiffer into actual events (Event) that can be raised.  See generateEventsForChanges()
 * for details.
 *
 * @constructor
 */
export declare class EventGenerator {
    private query_;
    private index_;
    /**
     *
     * @param {!Query} query_
     */
    constructor(query_: Query);
    /**
     * Given a set of raw changes (no moved events and prevName not specified yet), and a set of
     * EventRegistrations that should be notified of these changes, generate the actual events to be raised.
     *
     * Notes:
     *  - child_moved events will be synthesized at this time for any child_changed events that affect
     *    our index.
     *  - prevName will be calculated based on the index ordering.
     *
     * @param {!Array.<!Change>} changes
     * @param {!Node} eventCache
     * @param {!Array.<!EventRegistration>} eventRegistrations
     * @return {!Array.<!Event>}
     */
    generateEventsForChanges(changes: Change[], eventCache: Node, eventRegistrations: EventRegistration[]): Event[];
    /**
     * Given changes of a single change type, generate the corresponding events.
     *
     * @param {!Array.<!Event>} events
     * @param {!string} eventType
     * @param {!Array.<!Change>} changes
     * @param {!Array.<!EventRegistration>} registrations
     * @param {!Node} eventCache
     * @private
     */
    private generateEventsForType_(events, eventType, changes, registrations, eventCache);
    /**
     * @param {!Change} change
     * @param {!Node} eventCache
     * @return {!Change}
     * @private
     */
    private materializeSingleChange_(change, eventCache);
    /**
     * @param {!Change} a
     * @param {!Change} b
     * @return {number}
     * @private
     */
    private compareChanges_(a, b);
}
