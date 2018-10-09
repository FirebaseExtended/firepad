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
import { IndexedFilter } from './IndexedFilter';
import { NamedNode, Node } from '../../../core/snap/Node';
import { NodeFilter } from './NodeFilter';
import { QueryParams } from '../QueryParams';
import { Index } from '../../snap/indexes/Index';
import { Path } from '../../util/Path';
import { CompleteChildSource } from '../CompleteChildSource';
import { ChildChangeAccumulator } from '../ChildChangeAccumulator';
/**
 * Filters nodes by range and uses an IndexFilter to track any changes after filtering the node
 *
 * @constructor
 * @implements {NodeFilter}
 */
export declare class RangedFilter implements NodeFilter {
    /**
     * @type {!IndexedFilter}
     * @const
     * @private
     */
    private indexedFilter_;
    /**
     * @const
     * @type {!Index}
     * @private
     */
    private index_;
    /**
     * @const
     * @type {!NamedNode}
     * @private
     */
    private startPost_;
    /**
     * @const
     * @type {!NamedNode}
     * @private
     */
    private endPost_;
    /**
     * @param {!QueryParams} params
     */
    constructor(params: QueryParams);
    /**
     * @return {!NamedNode}
     */
    getStartPost(): NamedNode;
    /**
     * @return {!NamedNode}
     */
    getEndPost(): NamedNode;
    /**
     * @param {!NamedNode} node
     * @return {boolean}
     */
    matches(node: NamedNode): boolean;
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
     * @param {!QueryParams} params
     * @return {!NamedNode}
     * @private
     */
    private static getStartPost_(params);
    /**
     * @param {!QueryParams} params
     * @return {!NamedNode}
     * @private
     */
    private static getEndPost_(params);
}
