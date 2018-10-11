/**
 * A set of functions to clean up event handlers.
 * @type {function()}
 */
export declare let eventCleanupHandlers: any[];
/** Clean up outstanding event handlers */
export declare function eventCleanup(): void;
/**
 * Creates a struct which waits for many events.
 * @param {Array<Array>} pathAndEvents an array of tuples of [Firebase, [event type strings]]
 * @param {string=} helperName
 * @return {{waiter: waiter, watchesInitializedWaiter: watchesInitializedWaiter, unregister: unregister, addExpectedEvents: addExpectedEvents}}
 */
export declare function eventTestHelper(pathAndEvents: any, helperName?: any): {
    promise: Promise<{}>;
    initPromise: Promise<{}>;
    waiter: () => boolean;
    watchesInitializedWaiter: () => boolean;
    unregister: () => void;
    addExpectedEvents: (moreEvents: any) => void;
};
