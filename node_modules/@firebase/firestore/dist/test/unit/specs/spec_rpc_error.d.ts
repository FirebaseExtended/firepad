import { Code } from '../../../src/util/error';
/**
 * An error encountered making RPCs.
 */
export declare class RpcError extends Error {
    code: number;
    constructor(code: Code | number, message: string);
}
