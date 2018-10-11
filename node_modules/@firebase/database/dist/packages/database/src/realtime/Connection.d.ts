import { RepoInfo } from '../core/RepoInfo';
/**
 * Creates a new real-time connection to the server using whichever method works
 * best in the current browser.
 *
 * @constructor
 */
export declare class Connection {
    id: string;
    private repoInfo_;
    private onMessage_;
    private onReady_;
    private onDisconnect_;
    private onKill_;
    lastSessionId: string;
    connectionCount: number;
    pendingDataMessages: any[];
    sessionId: string;
    private conn_;
    private healthyTimeout_;
    private isHealthy_;
    private log_;
    private primaryResponsesRequired_;
    private rx_;
    private secondaryConn_;
    private secondaryResponsesRequired_;
    private state_;
    private transportManager_;
    private tx_;
    /**
     * @param {!string} id - an id for this connection
     * @param {!RepoInfo} repoInfo_ - the info for the endpoint to connect to
     * @param {function(Object)} onMessage_ - the callback to be triggered when a server-push message arrives
     * @param {function(number, string)} onReady_ - the callback to be triggered when this connection is ready to send messages.
     * @param {function()} onDisconnect_ - the callback to be triggered when a connection was lost
     * @param {function(string)} onKill_ - the callback to be triggered when this connection has permanently shut down.
     * @param {string=} lastSessionId - last session id in persistent connection. is used to clean up old session in real-time server
     */
    constructor(id: string, repoInfo_: RepoInfo, onMessage_: (a: Object) => void, onReady_: (a: number, b: string) => void, onDisconnect_: () => void, onKill_: (a: string) => void, lastSessionId?: string);
    /**
     * Starts a connection attempt
     * @private
     */
    private start_();
    /**
     * @return {!string}
     * @private
     */
    private nextTransportId_();
    private disconnReceiver_(conn);
    private connReceiver_(conn);
    /**
     *
     * @param {Object} dataMsg An arbitrary data message to be sent to the server
     */
    sendRequest(dataMsg: object): void;
    tryCleanupConnection(): void;
    private onSecondaryControl_(controlData);
    private onSecondaryMessageReceived_(parsedData);
    private upgradeIfSecondaryHealthy_();
    private proceedWithUpgrade_();
    private onPrimaryMessageReceived_(parsedData);
    private onDataMessage_(message);
    private onPrimaryResponse_();
    private onControl_(controlData);
    /**
     *
     * @param {Object} handshake The handshake data returned from the server
     * @private
     */
    private onHandshake_(handshake);
    private tryStartUpgrade_();
    private startUpgrade_(conn);
    private onReset_(host);
    private onConnectionEstablished_(conn, timestamp);
    private sendPingOnPrimaryIfNecessary_();
    private onSecondaryConnectionLost_();
    /**
     *
     * @param {boolean} everConnected Whether or not the connection ever reached a server. Used to determine if
     * we should flush the host cache
     * @private
     */
    private onConnectionLost_(everConnected);
    /**
     *
     * @param {string} reason
     * @private
     */
    private onConnectionShutdown_(reason);
    private sendData_(data);
    /**
     * Cleans up this connection, calling the appropriate callbacks
     */
    close(): void;
    /**
     *
     * @private
     */
    private closeConnections_();
}
