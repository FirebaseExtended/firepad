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
/**
 * @constructor
 * @struct
 * @param {!string} type The event type
 * @param {!Node} snapshotNode The data
 * @param {string=} childName The name for this child, if it's a child event
 * @param {Node=} oldSnap Used for intermediate processing of child changed events
 * @param {string=} prevName The name for the previous child, if applicable
 */
export declare class Change {
    type: string;
    snapshotNode: Node;
    childName: string;
    oldSnap: Node;
    prevName: string;
    constructor(type: string, snapshotNode: Node, childName?: string, oldSnap?: Node, prevName?: string);
    /**
     * @param {!Node} snapshot
     * @return {!Change}
     */
    static valueChange(snapshot: Node): Change;
    /**
     * @param {string} childKey
     * @param {!Node} snapshot
     * @return {!Change}
     */
    static childAddedChange(childKey: string, snapshot: Node): Change;
    /**
     * @param {string} childKey
     * @param {!Node} snapshot
     * @return {!Change}
     */
    static childRemovedChange(childKey: string, snapshot: Node): Change;
    /**
     * @param {string} childKey
     * @param {!Node} newSnapshot
     * @param {!Node} oldSnapshot
     * @return {!Change}
     */
    static childChangedChange(childKey: string, newSnapshot: Node, oldSnapshot: Node): Change;
    /**
     * @param {string} childKey
     * @param {!Node} snapshot
     * @return {!Change}
     */
    static childMovedChange(childKey: string, snapshot: Node): Change;
    /** Event type for a child added */
    static CHILD_ADDED: string;
    /** Event type for a child removed */
    static CHILD_REMOVED: string;
    /** Event type for a child changed */
    static CHILD_CHANGED: string;
    /** Event type for a child moved */
    static CHILD_MOVED: string;
    /** Event type for a value change */
    static VALUE: string;
}
