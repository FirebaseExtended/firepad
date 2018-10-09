import '../../index';
import { Reference } from '../../src/api/Reference';
import { Query } from '../../src/api/Query';
import { RepoInfo } from '../../src/core/RepoInfo';
export declare const TEST_PROJECT: any;
/**
 * Fake Firebase App Authentication functions for testing.
 * @param {!FirebaseApp} app
 * @return {!FirebaseApp}
 */
export declare function patchFakeAuthFunctions(app: any): any;
/**
 * Gets or creates a root node to the test namespace. All calls sharing the
 * value of opt_i will share an app context.
 * @param {number=} i
 * @param {string=} ref
 * @return {Reference}
 */
export declare function getRootNode(i?: number, ref?: string): any;
/**
 * Create multiple refs to the same top level
 * push key - each on it's own Firebase.Context.
 * @param {int=} numNodes
 * @return {Reference|Array<Reference>}
 */
export declare function getRandomNode(numNodes?: any): Reference | Array<Reference>;
export declare function getQueryValue(query: Query): Promise<any>;
export declare function pause(milliseconds: number): Promise<{}>;
export declare function getPath(query: Query): string;
export declare function shuffle(arr: any, randFn?: () => number): void;
export declare function testAuthTokenProvider(app: any): {
    setToken: (token: any) => Promise<void>;
    setNextToken: (token: any) => void;
};
export declare function getFreshRepo(url: any, path?: any): any;
export declare function getFreshRepoFromReference(ref: any): any;
export declare function getSnap(path: any): any;
export declare function getVal(path: any): any;
export declare function canCreateExtraConnections(): boolean;
export declare function buildObjFromKey(key: any): {};
export declare function testRepoInfo(url: any): RepoInfo;
