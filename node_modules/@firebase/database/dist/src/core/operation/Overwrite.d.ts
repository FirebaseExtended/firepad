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
import { Operation, OperationSource, OperationType } from './Operation';
import { Path } from '../util/Path';
import { Node } from '../snap/Node';
/**
 * @param {!OperationSource} source
 * @param {!Path} path
 * @param {!Node} snap
 * @constructor
 * @implements {Operation}
 */
export declare class Overwrite implements Operation {
    source: OperationSource;
    path: Path;
    snap: Node;
    /** @inheritDoc */
    type: OperationType;
    constructor(source: OperationSource, path: Path, snap: Node);
    operationForChild(childName: string): Overwrite;
}
