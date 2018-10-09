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
import { OnDisconnect } from './onDisconnect';
import { TransactionResult } from './TransactionResult';
import { Query } from './Query';
import { Repo } from '../core/Repo';
import { Path } from '../core/util/Path';
import { Database } from './Database';
import { DataSnapshot } from './DataSnapshot';
export interface ReferenceConstructor {
    new (repo: Repo, path: Path): Reference;
}
export declare class Reference extends Query {
    then: (a?: any) => Promise<any>;
    catch: (a?: Error) => Promise<any>;
    /**
     * Call options:
     *   new Reference(Repo, Path) or
     *   new Reference(url: string, string|RepoManager)
     *
     * Externally - this is the firebase.database.Reference type.
     *
     * @param {!Repo} repo
     * @param {(!Path)} path
     * @extends {Query}
     */
    constructor(repo: Repo, path: Path);
    /** @return {?string} */
    getKey(): string | null;
    /**
     * @param {!(string|Path)} pathString
     * @return {!Reference}
     */
    child(pathString: string | Path): Reference;
    /** @return {?Reference} */
    getParent(): Reference | null;
    /** @return {!Reference} */
    getRoot(): Reference;
    /** @return {!Database} */
    databaseProp(): Database;
    /**
     * @param {*} newVal
     * @param {function(?Error)=} onComplete
     * @return {!Promise}
     */
    set(newVal: any, onComplete?: (a: Error | null) => void): Promise<any>;
    /**
     * @param {!Object} objectToMerge
     * @param {function(?Error)=} onComplete
     * @return {!Promise}
     */
    update(objectToMerge: Object, onComplete?: (a: Error | null) => void): Promise<any>;
    /**
     * @param {*} newVal
     * @param {string|number|null} newPriority
     * @param {function(?Error)=} onComplete
     * @return {!Promise}
     */
    setWithPriority(newVal: any, newPriority: string | number | null, onComplete?: (a: Error | null) => void): Promise<any>;
    /**
     * @param {function(?Error)=} onComplete
     * @return {!Promise}
     */
    remove(onComplete?: (a: Error | null) => void): Promise<any>;
    /**
     * @param {function(*):*} transactionUpdate
     * @param {(function(?Error, boolean, ?DataSnapshot))=} onComplete
     * @param {boolean=} applyLocally
     * @return {!Promise}
     */
    transaction(transactionUpdate: (a: any) => any, onComplete?: (a: Error | null, b: boolean, c: DataSnapshot | null) => void, applyLocally?: boolean): Promise<TransactionResult>;
    /**
     * @param {string|number|null} priority
     * @param {function(?Error)=} onComplete
     * @return {!Promise}
     */
    setPriority(priority: string | number | null, onComplete?: (a: Error | null) => void): Promise<any>;
    /**
     * @param {*=} value
     * @param {function(?Error)=} onComplete
     * @return {!Reference}
     */
    push(value?: any, onComplete?: (a: Error | null) => void): Reference;
    /**
     * @return {!OnDisconnect}
     */
    onDisconnect(): OnDisconnect;
    readonly database: Database;
    readonly key: string | null;
    readonly parent: Reference | null;
    readonly root: Reference;
}
