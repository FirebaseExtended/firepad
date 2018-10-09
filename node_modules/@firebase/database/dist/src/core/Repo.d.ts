import { Path } from './util/Path';
import { PersistentConnection } from './PersistentConnection';
import { FirebaseApp } from '@firebase/app-types';
import { RepoInfo } from './RepoInfo';
import { Database } from '../api/Database';
import { Query } from '../api/Query';
import { EventRegistration } from './view/EventRegistration';
/**
 * A connection to a single data repository.
 */
export declare class Repo {
    repoInfo_: RepoInfo;
    app: FirebaseApp;
    dataUpdateCount: number;
    private infoSyncTree_;
    private serverSyncTree_;
    private stats_;
    private statsListener_;
    private eventQueue_;
    private nextWriteId_;
    private server_;
    private statsReporter_;
    private transactions_init_;
    private infoData_;
    private abortTransactions_;
    private rerunTransactions_;
    private interceptServerDataCallback_;
    private __database;
    private onDisconnect_;
    /**
     * TODO: This should be @private but it's used by test_access.js and internal.js
     * @type {?PersistentConnection}
     */
    persistentConnection_: PersistentConnection | null;
    /**
     * @param {!RepoInfo} repoInfo_
     * @param {boolean} forceRestClient
     * @param {!FirebaseApp} app
     */
    constructor(repoInfo_: RepoInfo, forceRestClient: boolean, app: FirebaseApp);
    /**
     * @return {string}  The URL corresponding to the root of this Firebase.
     */
    toString(): string;
    /**
     * @return {!string} The namespace represented by the repo.
     */
    name(): string;
    /**
     * @return {!number} The time in milliseconds, taking the server offset into account if we have one.
     */
    serverTime(): number;
    /**
     * Generate ServerValues using some variables from the repo object.
     * @return {!Object}
     */
    generateServerValues(): Object;
    /**
     * Called by realtime when we get new messages from the server.
     *
     * @private
     * @param {string} pathString
     * @param {*} data
     * @param {boolean} isMerge
     * @param {?number} tag
     */
    private onDataUpdate_(pathString, data, isMerge, tag);
    /**
     * TODO: This should be @private but it's used by test_access.js and internal.js
     * @param {?function(!string, *):*} callback
     * @private
     */
    interceptServerData_(callback: ((a: string, b: any) => any) | null): void;
    /**
     * @param {!boolean} connectStatus
     * @private
     */
    private onConnectStatus_(connectStatus);
    /**
     * @param {!Object} updates
     * @private
     */
    private onServerInfoUpdate_(updates);
    /**
     *
     * @param {!string} pathString
     * @param {*} value
     * @private
     */
    private updateInfo_(pathString, value);
    /**
     * @return {!number}
     * @private
     */
    private getNextWriteId_();
    /**
     * @param {!Path} path
     * @param {*} newVal
     * @param {number|string|null} newPriority
     * @param {?function(?Error, *=)} onComplete
     */
    setWithPriority(path: Path, newVal: any, newPriority: number | string | null, onComplete: ((status: Error | null, errorReason?: string) => void) | null): void;
    /**
     * @param {!Path} path
     * @param {!Object} childrenToMerge
     * @param {?function(?Error, *=)} onComplete
     */
    update(path: Path, childrenToMerge: {
        [k: string]: any;
    }, onComplete: ((status: Error | null, errorReason?: string) => void) | null): void;
    /**
     * Applies all of the changes stored up in the onDisconnect_ tree.
     * @private
     */
    private runOnDisconnectEvents_();
    /**
     * @param {!Path} path
     * @param {?function(?Error, *=)} onComplete
     */
    onDisconnectCancel(path: Path, onComplete: ((status: Error | null, errorReason?: string) => void) | null): void;
    /**
     * @param {!Path} path
     * @param {*} value
     * @param {?function(?Error, *=)} onComplete
     */
    onDisconnectSet(path: Path, value: any, onComplete: ((status: Error | null, errorReason?: string) => void) | null): void;
    /**
     * @param {!Path} path
     * @param {*} value
     * @param {*} priority
     * @param {?function(?Error, *=)} onComplete
     */
    onDisconnectSetWithPriority(path: Path, value: any, priority: any, onComplete: ((status: Error | null, errorReason?: string) => void) | null): void;
    /**
     * @param {!Path} path
     * @param {*} childrenToMerge
     * @param {?function(?Error, *=)} onComplete
     */
    onDisconnectUpdate(path: Path, childrenToMerge: {
        [k: string]: any;
    }, onComplete: ((status: Error | null, errorReason?: string) => void) | null): void;
    /**
     * @param {!Query} query
     * @param {!EventRegistration} eventRegistration
     */
    addEventCallbackForQuery(query: Query, eventRegistration: EventRegistration): void;
    /**
     * @param {!Query} query
     * @param {?EventRegistration} eventRegistration
     */
    removeEventCallbackForQuery(query: Query, eventRegistration: EventRegistration): void;
    interrupt(): void;
    resume(): void;
    stats(showDelta?: boolean): void;
    statsIncrementCounter(metric: string): void;
    /**
     * @param {...*} var_args
     * @private
     */
    private log_(...var_args);
    /**
     * @param {?function(?Error, *=)} callback
     * @param {!string} status
     * @param {?string=} errorReason
     */
    callOnCompleteCallback(callback: ((status: Error | null, errorReason?: string) => void) | null, status: string, errorReason?: string | null): void;
    readonly database: Database;
}
