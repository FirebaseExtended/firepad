/**
 * A class that holds metadata about a Repo object
 *
 * @constructor
 */
export declare class RepoInfo {
    secure: boolean;
    namespace: string;
    webSocketOnly: boolean;
    persistenceKey: string;
    host: string;
    domain: string;
    internalHost: string;
    /**
     * @param {string} host Hostname portion of the url for the repo
     * @param {boolean} secure Whether or not this repo is accessed over ssl
     * @param {string} namespace The namespace represented by the repo
     * @param {boolean} webSocketOnly Whether to prefer websockets over all other transports (used by Nest).
     * @param {string=} persistenceKey Override the default session persistence storage key
     */
    constructor(host: string, secure: boolean, namespace: string, webSocketOnly: boolean, persistenceKey?: string);
    needsQueryParam(): boolean;
    isCacheableHost(): boolean;
    isDemoHost(): boolean;
    isCustomHost(): boolean;
    updateHost(newHost: string): void;
    /**
     * Returns the websocket URL for this repo
     * @param {string} type of connection
     * @param {Object} params list
     * @return {string} The URL for this repo
     */
    connectionURL(type: string, params: {
        [k: string]: string;
    }): string;
    /** @return {string} */
    toString(): string;
    /** @return {string} */
    toURLString(): string;
}
