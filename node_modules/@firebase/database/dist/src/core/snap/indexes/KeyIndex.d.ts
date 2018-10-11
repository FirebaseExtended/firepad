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
import { Index } from './Index';
import { Node, NamedNode } from '../Node';
import { ChildrenNode } from '../ChildrenNode';
export declare class KeyIndex extends Index {
    static __EMPTY_NODE: ChildrenNode;
    /**
     * @inheritDoc
     */
    compare(a: NamedNode, b: NamedNode): number;
    /**
     * @inheritDoc
     */
    isDefinedOn(node: Node): boolean;
    /**
     * @inheritDoc
     */
    indexedValueChanged(oldNode: Node, newNode: Node): boolean;
    /**
     * @inheritDoc
     */
    minPost(): any;
    /**
     * @inheritDoc
     */
    maxPost(): NamedNode;
    /**
     * @param {*} indexValue
     * @param {string} name
     * @return {!NamedNode}
     */
    makePost(indexValue: string, name: string): NamedNode;
    /**
     * @return {!string} String representation for inclusion in a query spec
     */
    toString(): string;
}
export declare const KEY_INDEX: KeyIndex;
