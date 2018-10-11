import { Path } from '../util/Path';
/**
 *
 * @enum
 */
export declare enum OperationType {
    OVERWRITE = 0,
    MERGE = 1,
    ACK_USER_WRITE = 2,
    LISTEN_COMPLETE = 3,
}
/**
 * @interface
 */
export interface Operation {
    /**
     * @type {!OperationSource}
     */
    source: OperationSource;
    /**
     * @type {!OperationType}
     */
    type: OperationType;
    /**
     * @type {!Path}
     */
    path: Path;
    /**
     * @param {string} childName
     * @return {?Operation}
     */
    operationForChild(childName: string): Operation | null;
}
/**
 * @param {boolean} fromUser
 * @param {boolean} fromServer
 * @param {?string} queryId
 * @param {boolean} tagged
 * @constructor
 */
export declare class OperationSource {
    fromUser: boolean;
    fromServer: boolean;
    queryId: string | null;
    tagged: boolean;
    constructor(fromUser: boolean, fromServer: boolean, queryId: string | null, tagged: boolean);
    /**
     * @const
     * @type {!OperationSource}
     */
    static User: OperationSource;
    /**
     * @const
     * @type {!OperationSource}
     */
    static Server: OperationSource;
    /**
     * @param {string} queryId
     * @return {!OperationSource}
     */
    static forServerTaggedQuery: (queryId: string) => OperationSource;
}
