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
import { Operation } from '../operation/Operation';
import { ChildChangeAccumulator } from './ChildChangeAccumulator';
import { Change } from './Change';
import { Path } from '../util/Path';
import { ViewCache } from './ViewCache';
import { NodeFilter } from './filter/NodeFilter';
import { WriteTreeRef } from '../WriteTree';
import { Node } from '../snap/Node';
/**
 * @constructor
 * @struct
 */
export declare class ProcessorResult {
    readonly viewCache: ViewCache;
    readonly changes: Change[];
    /**
     * @param {!ViewCache} viewCache
     * @param {!Array.<!Change>} changes
     */
    constructor(viewCache: ViewCache, changes: Change[]);
}
/**
 * @constructor
 */
export declare class ViewProcessor {
    private readonly filter_;
    /**
     * @param {!NodeFilter} filter_
     */
    constructor(filter_: NodeFilter);
    /**
     * @param {!ViewCache} viewCache
     */
    assertIndexed(viewCache: ViewCache): void;
    /**
     * @param {!ViewCache} oldViewCache
     * @param {!Operation} operation
     * @param {!WriteTreeRef} writesCache
     * @param {?Node} completeCache
     * @return {!ProcessorResult}
     */
    applyOperation(oldViewCache: ViewCache, operation: Operation, writesCache: WriteTreeRef, completeCache: Node | null): ProcessorResult;
    /**
     * @param {!ViewCache} oldViewCache
     * @param {!ViewCache} newViewCache
     * @param {!Array.<!Change>} accumulator
     * @private
     */
    private static maybeAddValueEvent_(oldViewCache, newViewCache, accumulator);
    /**
     * @param {!ViewCache} viewCache
     * @param {!Path} changePath
     * @param {!WriteTreeRef} writesCache
     * @param {!CompleteChildSource} source
     * @param {!ChildChangeAccumulator} accumulator
     * @return {!ViewCache}
     * @private
     */
    private generateEventCacheAfterServerEvent_(viewCache, changePath, writesCache, source, accumulator);
    /**
     * @param {!ViewCache} oldViewCache
     * @param {!Path} changePath
     * @param {!Node} changedSnap
     * @param {!WriteTreeRef} writesCache
     * @param {?Node} completeCache
     * @param {boolean} filterServerNode
     * @param {!ChildChangeAccumulator} accumulator
     * @return {!ViewCache}
     * @private
     */
    applyServerOverwrite_(oldViewCache: ViewCache, changePath: Path, changedSnap: Node, writesCache: WriteTreeRef, completeCache: Node | null, filterServerNode: boolean, accumulator: ChildChangeAccumulator): ViewCache;
    /**
     * @param {!ViewCache} oldViewCache
     * @param {!Path} changePath
     * @param {!Node} changedSnap
     * @param {!WriteTreeRef} writesCache
     * @param {?Node} completeCache
     * @param {!ChildChangeAccumulator} accumulator
     * @return {!ViewCache}
     * @private
     */
    applyUserOverwrite_(oldViewCache: ViewCache, changePath: Path, changedSnap: Node, writesCache: WriteTreeRef, completeCache: Node | null, accumulator: ChildChangeAccumulator): ViewCache;
    /**
     * @param {!ViewCache} viewCache
     * @param {string} childKey
     * @return {boolean}
     * @private
     */
    private static cacheHasChild_(viewCache, childKey);
    /**
     * @param {!ViewCache} viewCache
     * @param {!Path} path
     * @param {ImmutableTree.<!Node>} changedChildren
     * @param {!WriteTreeRef} writesCache
     * @param {?Node} serverCache
     * @param {!ChildChangeAccumulator} accumulator
     * @return {!ViewCache}
     * @private
     */
    private applyUserMerge_(viewCache, path, changedChildren, writesCache, serverCache, accumulator);
    /**
     * @param {!Node} node
     * @param {ImmutableTree.<!Node>} merge
     * @return {!Node}
     * @private
     */
    private applyMerge_(node, merge);
    /**
     * @param {!ViewCache} viewCache
     * @param {!Path} path
     * @param {!ImmutableTree.<!Node>} changedChildren
     * @param {!WriteTreeRef} writesCache
     * @param {?Node} serverCache
     * @param {boolean} filterServerNode
     * @param {!ChildChangeAccumulator} accumulator
     * @return {!ViewCache}
     * @private
     */
    private applyServerMerge_(viewCache, path, changedChildren, writesCache, serverCache, filterServerNode, accumulator);
    /**
     * @param {!ViewCache} viewCache
     * @param {!Path} ackPath
     * @param {!ImmutableTree<!boolean>} affectedTree
     * @param {!WriteTreeRef} writesCache
     * @param {?Node} completeCache
     * @param {!ChildChangeAccumulator} accumulator
     * @return {!ViewCache}
     * @private
     */
    private ackUserWrite_(viewCache, ackPath, affectedTree, writesCache, completeCache, accumulator);
    /**
     * @param {!ViewCache} viewCache
     * @param {!Path} path
     * @param {!WriteTreeRef} writesCache
     * @param {!ChildChangeAccumulator} accumulator
     * @return {!ViewCache}
     * @private
     */
    private listenComplete_(viewCache, path, writesCache, accumulator);
    /**
     * @param {!ViewCache} viewCache
     * @param {!Path} path
     * @param {!WriteTreeRef} writesCache
     * @param {?Node} completeServerCache
     * @param {!ChildChangeAccumulator} accumulator
     * @return {!ViewCache}
     * @private
     */
    private revertUserWrite_(viewCache, path, writesCache, completeServerCache, accumulator);
}
