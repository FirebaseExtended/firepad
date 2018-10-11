import { CountedSet } from '../core/util/CountedSet';
import { PacketReceiver } from './polling/PacketReceiver';
import { Transport } from './Transport';
import { RepoInfo } from '../core/RepoInfo';
export declare const FIREBASE_LONGPOLL_START_PARAM = "start";
export declare const FIREBASE_LONGPOLL_CLOSE_COMMAND = "close";
export declare const FIREBASE_LONGPOLL_COMMAND_CB_NAME = "pLPCommand";
export declare const FIREBASE_LONGPOLL_DATA_CB_NAME = "pRTLPCB";
export declare const FIREBASE_LONGPOLL_ID_PARAM = "id";
export declare const FIREBASE_LONGPOLL_PW_PARAM = "pw";
export declare const FIREBASE_LONGPOLL_SERIAL_PARAM = "ser";
export declare const FIREBASE_LONGPOLL_CALLBACK_ID_PARAM = "cb";
export declare const FIREBASE_LONGPOLL_SEGMENT_NUM_PARAM = "seg";
export declare const FIREBASE_LONGPOLL_SEGMENTS_IN_PACKET = "ts";
export declare const FIREBASE_LONGPOLL_DATA_PARAM = "d";
export declare const FIREBASE_LONGPOLL_DISCONN_FRAME_PARAM = "disconn";
export declare const FIREBASE_LONGPOLL_DISCONN_FRAME_REQUEST_PARAM = "dframe";
/**
 * This class manages a single long-polling connection.
 *
 * @constructor
 * @implements {Transport}
 */
export declare class BrowserPollConnection implements Transport {
    connId: string;
    repoInfo: RepoInfo;
    transportSessionId: string;
    lastSessionId: string;
    bytesSent: number;
    bytesReceived: number;
    urlFn: (params: object) => string;
    scriptTagHolder: FirebaseIFrameScriptHolder;
    myDisconnFrame: HTMLIFrameElement;
    curSegmentNum: number;
    myPacketOrderer: PacketReceiver;
    id: string;
    password: string;
    private log_;
    private stats_;
    private everConnected_;
    private isClosed_;
    private connectTimeoutTimer_;
    private onDisconnect_;
    /**
     * @param {string} connId An identifier for this connection, used for logging
     * @param {RepoInfo} repoInfo The info for the endpoint to send data to.
     * @param {string=} transportSessionId Optional transportSessionid if we are reconnecting for an existing
     *                                         transport session
     * @param {string=}  lastSessionId Optional lastSessionId if the PersistentConnection has already created a
     *                                     connection previously
     */
    constructor(connId: string, repoInfo: RepoInfo, transportSessionId?: string, lastSessionId?: string);
    /**
     *
     * @param {function(Object)} onMessage Callback when messages arrive
     * @param {function()} onDisconnect Callback with connection lost.
     */
    open(onMessage: (msg: Object) => void, onDisconnect: (a?: boolean) => void): void;
    /**
     * Call this when a handshake has completed successfully and we want to consider the connection established
     */
    start(): void;
    private static forceAllow_;
    /**
     * Forces long polling to be considered as a potential transport
     */
    static forceAllow(): void;
    private static forceDisallow_;
    /**
     * Forces longpolling to not be considered as a potential transport
     */
    static forceDisallow(): void;
    static isAvailable(): boolean;
    /**
     * No-op for polling
     */
    markConnectionHealthy(): void;
    /**
     * Stops polling and cleans up the iframe
     * @private
     */
    private shutdown_();
    /**
     * Triggered when this transport is closed
     * @private
     */
    private onClosed_();
    /**
     * External-facing close handler. RealTime has requested we shut down. Kill our connection and tell the server
     * that we've left.
     */
    close(): void;
    /**
     * Send the JSON object down to the server. It will need to be stringified, base64 encoded, and then
     * broken into chunks (since URLs have a small maximum length).
     * @param {!Object} data The JSON data to transmit.
     */
    send(data: Object): void;
    /**
     * This is how we notify the server that we're leaving.
     * We aren't able to send requests with DHTML on a window close event, but we can
     * trigger XHR requests in some browsers (everything but Opera basically).
     * @param {!string} id
     * @param {!string} pw
     */
    addDisconnectPingFrame(id: string, pw: string): void;
    /**
     * Used to track the bytes received by this client
     * @param {*} args
     * @private
     */
    private incrementIncomingBytes_(args);
}
export interface IFrameElement extends HTMLIFrameElement {
    doc: Document;
}
/*********************************************************************************************
 * A wrapper around an iframe that is used as a long-polling script holder.
 * @constructor
 *********************************************************************************************/
export declare class FirebaseIFrameScriptHolder {
    onDisconnect: () => void;
    urlFn: (a: object) => string;
    /**
     * @type {CountedSet.<number, number>}
     */
    outstandingRequests: CountedSet<number, number>;
    pendingSegs: {
        seg: number;
        ts: number;
        d: any;
    }[];
    currentSerial: number;
    sendNewPolls: boolean;
    uniqueCallbackIdentifier: number;
    myIFrame: IFrameElement;
    alive: boolean;
    myID: string;
    myPW: string;
    commandCB: (command: string, ...args: any[]) => void;
    onMessageCB: (...args: any[]) => void;
    /**
     * @param commandCB - The callback to be called when control commands are recevied from the server.
     * @param onMessageCB - The callback to be triggered when responses arrive from the server.
     * @param onDisconnect - The callback to be triggered when this tag holder is closed
     * @param urlFn - A function that provides the URL of the endpoint to send data to.
     */
    constructor(commandCB: (command: string, ...args: any[]) => void, onMessageCB: (...args: any[]) => void, onDisconnect: () => void, urlFn: (a: object) => string);
    /**
     * Each browser has its own funny way to handle iframes. Here we mush them all together into one object that I can
     * actually use.
     * @private
     * @return {Element}
     */
    private static createIFrame_();
    /**
     * Cancel all outstanding queries and remove the frame.
     */
    close(): void;
    /**
     * Actually start the long-polling session by adding the first script tag(s) to the iframe.
     * @param {!string} id - The ID of this connection
     * @param {!string} pw - The password for this connection
     */
    startLongPoll(id: string, pw: string): void;
    /**
     * This is called any time someone might want a script tag to be added. It adds a script tag when there aren't
     * too many outstanding requests and we are still alive.
     *
     * If there are outstanding packet segments to send, it sends one. If there aren't, it sends a long-poll anyways if
     * needed.
     */
    private newRequest_();
    /**
     * Queue a packet for transmission to the server.
     * @param segnum - A sequential id for this packet segment used for reassembly
     * @param totalsegs - The total number of segments in this packet
     * @param data - The data for this segment.
     */
    enqueueSegment(segnum: number, totalsegs: number, data: any): void;
    /**
     * Add a script tag for a regular long-poll request.
     * @param {!string} url - The URL of the script tag.
     * @param {!number} serial - The serial number of the request.
     * @private
     */
    private addLongPollTag_(url, serial);
    /**
     * Add an arbitrary script tag to the iframe.
     * @param {!string} url - The URL for the script tag source.
     * @param {!function()} loadCB - A callback to be triggered once the script has loaded.
     */
    addTag(url: string, loadCB: () => void): void;
}
