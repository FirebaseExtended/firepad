import { Code } from '../util/error';
export declare function isPermanentError(code: Code): boolean;
/**
 * Maps an error Code from a GRPC status identifier like 'NOT_FOUND'.
 *
 * @returns The Code equivalent to the given status string or undefined if
 *     there is no match.
 */
export declare function mapCodeFromRpcStatus(status: string): Code | undefined;
/**
 * Maps an error Code from GRPC status code number, like 0, 1, or 14. These
 * are not the same as HTTP status codes.
 *
 * @returns The Code equivalent to the given GRPC status code. Fails if there
 *     is no match.
 */
export declare function mapCodeFromRpcCode(code: number | undefined): Code;
/**
 * Maps an RPC code from a Code. This is the reverse operation from
 * mapCodeFromRpcCode and should really only be used in tests.
 */
export declare function mapRpcCodeFromCode(code: Code | undefined): number;
/**
 * Converts an HTTP Status Code to the equivalent error code.
 *
 * @param status An HTTP Status Code, like 200, 404, 503, etc.
 * @returns The equivalent Code. Unknown status codes are mapped to
 *     Code.UNKNOWN.
 */
export declare function mapCodeFromHttpStatus(status: number): Code;
