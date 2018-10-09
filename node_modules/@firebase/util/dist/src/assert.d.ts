/**
 * Throws an error if the provided assertion is falsy
 * @param {*} assertion The assertion to be tested for falsiness
 * @param {!string} message The message to display if the check fails
 */
export declare const assert: (assertion: any, message: any) => void;
/**
 * Returns an Error object suitable for throwing.
 * @param {string} message
 * @return {!Error}
 */
export declare const assertionError: (message: any) => Error;
