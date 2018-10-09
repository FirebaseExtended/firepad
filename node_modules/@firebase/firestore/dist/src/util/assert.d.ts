/**
 * Unconditionally fails, throwing an Error with the given message.
 *
 * Returns any so it can be used in expressions:
 * @example
 * let futureVar = fail('not implemented yet');
 */
export declare function fail(failure: string): never;
/**
 * Fails if the given assertion condition is false, throwing an Error with the
 * given message if it did.
 */
export declare function assert(assertion: boolean, message: string): void;
