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
import { BrowserPollConnection } from './BrowserPollConnection';
import { WebSocketConnection } from './WebSocketConnection';
import { TransportConstructor } from './Transport';
import { RepoInfo } from '../core/RepoInfo';
/**
 * Currently simplistic, this class manages what transport a Connection should use at various stages of its
 * lifecycle.
 *
 * It starts with longpolling in a browser, and httppolling on node. It then upgrades to websockets if
 * they are available.
 * @constructor
 */
export declare class TransportManager {
    private transports_;
    /**
     * @const
     * @type {!Array.<function(new:Transport, string, RepoInfo, string=)>}
     */
    static readonly ALL_TRANSPORTS: (typeof BrowserPollConnection | typeof WebSocketConnection)[];
    /**
     * @param {!RepoInfo} repoInfo Metadata around the namespace we're connecting to
     */
    constructor(repoInfo: RepoInfo);
    /**
     * @param {!RepoInfo} repoInfo
     * @private
     */
    private initTransports_(repoInfo);
    /**
     * @return {function(new:Transport, !string, !RepoInfo, string=, string=)} The constructor for the
     * initial transport to use
     */
    initialTransport(): TransportConstructor;
    /**
     * @return {?function(new:Transport, function(),function(), string=)} The constructor for the next
     * transport, or null
     */
    upgradeTransport(): TransportConstructor | null;
}
