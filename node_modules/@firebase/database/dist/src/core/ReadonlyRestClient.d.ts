import { ServerActions } from './ServerActions';
import { RepoInfo } from './RepoInfo';
import { AuthTokenProvider } from './AuthTokenProvider';
import { Query } from '../api/Query';
/**
 * An implementation of ServerActions that communicates with the server via REST requests.
 * This is mostly useful for compatibility with crawlers, where we don't want to spin up a full
 * persistent connection (using WebSockets or long-polling)
 */
export declare class ReadonlyRestClient extends ServerActions {
    private repoInfo_;
    private onDataUpdate_;
    private authTokenProvider_;
    reportStats(stats: {
        [k: string]: any;
    }): void;
    /** @private {function(...[*])} */
    private log_;
    /**
     * We don't actually need to track listens, except to prevent us calling an onComplete for a listen
     * that's been removed. :-/
     *
     * @private {!Object.<string, !Object>}
     */
    private listens_;
    /**
     * @param {!Query} query
     * @param {?number=} tag
     * @return {string}
     * @private
     */
    static getListenId_(query: Query, tag?: number | null): string;
    /**
     * @param {!RepoInfo} repoInfo_ Data about the namespace we are connecting to
     * @param {function(string, *, boolean, ?number)} onDataUpdate_ A callback for new data from the server
     * @param {AuthTokenProvider} authTokenProvider_
     * @implements {ServerActions}
     */
    constructor(repoInfo_: RepoInfo, onDataUpdate_: (a: string, b: any, c: boolean, d: number | null) => void, authTokenProvider_: AuthTokenProvider);
    /** @inheritDoc */
    listen(query: Query, currentHashFn: () => string, tag: number | null, onComplete: (a: string, b: any) => void): void;
    /** @inheritDoc */
    unlisten(query: Query, tag: number | null): void;
    /** @inheritDoc */
    refreshAuthToken(token: string): void;
    /**
     * Performs a REST request to the given path, with the provided query string parameters,
     * and any auth credentials we have.
     *
     * @param {!string} pathString
     * @param {!Object.<string, *>} queryStringParameters
     * @param {?function(?number, *=)} callback
     * @private
     */
    private restRequest_(pathString, queryStringParameters, callback);
}
