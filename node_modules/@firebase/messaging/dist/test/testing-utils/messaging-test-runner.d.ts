/// <reference types="mocha" />
/** Runner for tests that require service worker functionality. */
declare const runner: (description: string, callback: (this: Mocha.ISuiteCallbackContext) => void) => void;
export { runner as describe };
