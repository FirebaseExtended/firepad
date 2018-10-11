import { ServerActions } from './ServerActions';
import { AuthTokenProvider } from './AuthTokenProvider';
import { RepoInfo } from './RepoInfo';
import { Query } from '../api/Query';
/**
 * Firebase connection.  Abstracts wire protocol and handles reconnecting.
 *
 * NOTE: All JSON objects sent to the realtime connection must have property names enclosed
 * in quotes to make sure the closure compiler does not minify them.
 */
export declare class PersistentConnection extends ServerActions {
    private repoInfo_;
    private onDataUpdate_;
    private onConnectStatus_;
    private onServerInfoUpdate_;
    private authTokenProvider_;
    private authOverride_;
    id: number;
    private log_;
    /** @private {Object} */
    private interruptReasons_;
    private listens_;
    private outstandingPuts_;
    private outstandingPutCount_;
    private onDisconnectRequestQueue_;
    private connected_;
    private reconnectDelay_;
    private maxReconnectDelay_;
    private securityDebugCallback_;
    lastSessionId: string | null;
    /** @private {number|null} */
    private establishConnectionTimer_;
    /** @private {boolean} */
    private visible_;
    private requestCBHash_;
    private requestNumber_;
    /** @private {?{
     *   sendRequest(Object),
     *   close()
     * }} */
    private realtime_;
    /** @private {string|null} */
    private authToken_;
    private forceTokenRefresh_;
    private invalidAuthTokenCount_;
    private firstConnection_;
    private lastConnectionAttemptTime_;
    private lastConnectionEstablishedTime_;
    /**
     * @private
     */
    private static nextPersistentConnectionId_;
    /**
     * Counter for number of connections created. Mainly used for tagging in the logs
     * @type {number}
     * @private
     */
    private static nextConnectionId_;
    /**
     * @implements {ServerActions}
     * @param {!RepoInfo} repoInfo_ Data about the namespace we are connecting to
     * @param {function(string, *, boolean, ?number)} onDataUpdate_ A callback for new data from the server
     * @param onConnectStatus_
     * @param onServerInfoUpdate_
     * @param authTokenProvider_
     * @param authOverride_
     */
    constructor(repoInfo_: RepoInfo, onDataUpdate_: (a: string, b: any, c: boolean, d: number | null) => void, onConnectStatus_: (a: boolean) => void, onServerInfoUpdate_: (a: any) => void, authTokenProvider_: AuthTokenProvider, authOverride_?: Object | null);
    /**
     * @param {!string} action
     * @param {*} body
     * @param {function(*)=} onResponse
     * @protected
     */
    protected sendRequest(action: string, body: any, onResponse?: (a: any) => void): void;
    /**
     * @inheritDoc
     */
    listen(query: Query, currentHashFn: () => string, tag: number | null, onComplete: (a: string, b: any) => void): void;
    /**
     * @param {!{onComplete(),
     *           hashFn():!string,
     *           query: !Query,
     *           tag: ?number}} listenSpec
     * @private
     */
    private sendListen_(listenSpec);
    /**
     * @param {*} payload
     * @param {!Query} query
     * @private
     */
    private static warnOnListenWarnings_(payload, query);
    /**
     * @inheritDoc
     */
    refreshAuthToken(token: string): void;
    /**
     * @param {!string} credential
     * @private
     */
    private reduceReconnectDelayIfAdminCredential_(credential);
    /**
     * Attempts to authenticate with the given credentials. If the authentication attempt fails, it's triggered like
     * a auth revoked (the connection is closed).
     */
    tryAuth(): void;
    /**
     * @inheritDoc
     */
    unlisten(query: Query, tag: number | null): void;
    private sendUnlisten_(pathString, queryId, queryObj, tag);
    /**
     * @inheritDoc
     */
    onDisconnectPut(pathString: string, data: any, onComplete?: (a: string, b: string) => void): void;
    /**
     * @inheritDoc
     */
    onDisconnectMerge(pathString: string, data: any, onComplete?: (a: string, b: string) => void): void;
    /**
     * @inheritDoc
     */
    onDisconnectCancel(pathString: string, onComplete?: (a: string, b: string) => void): void;
    private sendOnDisconnect_(action, pathString, data, onComplete);
    /**
     * @inheritDoc
     */
    put(pathString: string, data: any, onComplete?: (a: string, b: string) => void, hash?: string): void;
    /**
     * @inheritDoc
     */
    merge(pathString: string, data: any, onComplete: (a: string, b: string | null) => void, hash?: string): void;
    putInternal(action: string, pathString: string, data: any, onComplete: (a: string, b: string | null) => void, hash?: string): void;
    private sendPut_(index);
    /**
     * @inheritDoc
     */
    reportStats(stats: {
        [k: string]: any;
    }): void;
    /**
     * @param {*} message
     * @private
     */
    private onDataMessage_(message);
    private onDataPush_(action, body);
    private onReady_(timestamp, sessionId);
    private scheduleConnect_(timeout);
    /**
     * @param {boolean} visible
     * @private
     */
    private onVisible_(visible);
    private onOnline_(online);
    private onRealtimeDisconnect_();
    private establishConnection_();
    /**
     * @param {string} reason
     */
    interrupt(reason: string): void;
    /**
     * @param {string} reason
     */
    resume(reason: string): void;
    private handleTimestamp_(timestamp);
    private cancelSentTransactions_();
    /**
     * @param {!string} pathString
     * @param {Array.<*>=} query
     * @private
     */
    private onListenRevoked_(pathString, query?);
    /**
     * @param {!string} pathString
     * @param {!string} queryId
     * @return {{queries:Array.<Query>, onComplete:function(string)}}
     * @private
     */
    private removeListen_(pathString, queryId);
    private onAuthRevoked_(statusCode, explanation);
    private onSecurityDebugPacket_(body);
    private restoreState_();
    /**
     * Sends client stats for first connection
     * @private
     */
    private sendConnectStats_();
    /**
     * @return {boolean}
     * @private
     */
    private shouldReconnect_();
}
