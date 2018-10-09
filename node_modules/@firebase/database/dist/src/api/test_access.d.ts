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
import { RepoInfo } from '../core/RepoInfo';
import { PersistentConnection } from '../core/PersistentConnection';
import { Connection } from '../realtime/Connection';
import { Query } from './Query';
export declare const DataConnection: typeof PersistentConnection;
export declare const RealTimeConnection: typeof Connection;
/**
 * @param {function(): string} newHash
 * @return {function()}
 */
export declare const hijackHash: (newHash: () => string) => () => void;
/**
 * @type {function(new:RepoInfo, !string, boolean, !string, boolean): undefined}
 */
export declare const ConnectionTarget: typeof RepoInfo;
/**
 * @param {!Query} query
 * @return {!string}
 */
export declare const queryIdentifier: (query: Query) => string;
/**
 * @param {!Query} firebaseRef
 * @return {!Object}
 */
export declare const listens: (firebaseRef: Query) => any;
/**
 * Forces the RepoManager to create Repos that use ReadonlyRestClient instead of PersistentConnection.
 *
 * @param {boolean} forceRestClient
 */
export declare const forceRestClient: (forceRestClient: boolean) => void;
