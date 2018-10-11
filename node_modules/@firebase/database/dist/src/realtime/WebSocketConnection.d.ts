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
import { Transport } from './Transport';
export declare function setWebSocketImpl(impl: any): void;
/**
 * Create a new websocket connection with the given callbacks.
 * @constructor
 * @implements {Transport}
 */
export declare class WebSocketConnection implements Transport {
    connId: string;
    keepaliveTimer: number | null;
    frames: string[] | null;
    totalFrames: number;
    bytesSent: number;
    bytesReceived: number;
    connURL: string;
    onDisconnect: (a?: boolean) => void;
    onMessage: (msg: Object) => void;
    mySock: any | null;
    private log_;
    private stats_;
    private everConnected_;
    private isClosed_;
    /**
     * @param {string} connId identifier for this transport
     * @param {RepoInfo} repoInfo The info for the websocket endpoint.
     * @param {string=} transportSessionId Optional transportSessionId if this is connecting to an existing transport
     *                                         session
     * @param {string=} lastSessionId Optional lastSessionId if there was a previous connection
     */
    constructor(connId: string, repoInfo: RepoInfo, transportSessionId?: string, lastSessionId?: string);
    /**
     * @param {RepoInfo} repoInfo The info for the websocket endpoint.
     * @param {string=} transportSessionId Optional transportSessionId if this is connecting to an existing transport
     *                                         session
     * @param {string=} lastSessionId Optional lastSessionId if there was a previous connection
     * @return {string} connection url
     * @private
     */
    private static connectionURL_(repoInfo, transportSessionId?, lastSessionId?);
    /**
     *
     * @param onMessage Callback when messages arrive
     * @param onDisconnect Callback with connection lost.
     */
    open(onMessage: (msg: Object) => void, onDisconnect: (a?: boolean) => void): void;
    /**
     * No-op for websockets, we don't need to do anything once the connection is confirmed as open
     */
    start(): void;
    static forceDisallow_: Boolean;
    static forceDisallow(): void;
    static isAvailable(): boolean;
    /**
     * Number of response before we consider the connection "healthy."
     * @type {number}
     */
    static responsesRequiredToBeHealthy: number;
    /**
     * Time to wait for the connection te become healthy before giving up.
     * @type {number}
     */
    static healthyTimeout: number;
    /**
     * Returns true if we previously failed to connect with this transport.
     * @return {boolean}
     */
    static previouslyFailed(): boolean;
    markConnectionHealthy(): void;
    private appendFrame_(data);
    /**
     * @param {number} frameCount The number of frames we are expecting from the server
     * @private
     */
    private handleNewFrameCount_(frameCount);
    /**
     * Attempts to parse a frame count out of some text. If it can't, assumes a value of 1
     * @param {!String} data
     * @return {?String} Any remaining data to be process, or null if there is none
     * @private
     */
    private extractFrameCount_(data);
    /**
     * Process a websocket frame that has arrived from the server.
     * @param mess The frame data
     */
    handleIncomingFrame(mess: {
        [k: string]: any;
    }): void;
    /**
     * Send a message to the server
     * @param {Object} data The JSON object to transmit
     */
    send(data: Object): void;
    private shutdown_();
    private onClosed_();
    /**
     * External-facing close handler.
     * Close the websocket and kill the connection.
     */
    close(): void;
    /**
     * Kill the current keepalive timer and start a new one, to ensure that it always fires N seconds after
     * the last activity.
     */
    resetKeepAlive(): void;
    /**
     * Send a string over the websocket.
     *
     * @param {string} str String to send.
     * @private
     */
    private sendString_(str);
}
