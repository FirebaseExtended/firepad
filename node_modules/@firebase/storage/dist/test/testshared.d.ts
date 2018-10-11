import { FirebaseApp } from '@firebase/app-types';
import { Code, FirebaseStorageError } from '../src/implementation/error';
import { Headers, XhrIo } from '../src/implementation/xhrio';
import { XhrIoPool } from '../src/implementation/xhriopool';
import { SendHook } from './xhrio';
export declare const authToken = "totally-legit-auth-token";
export declare const bucket = "mybucket";
export declare const fakeApp: FirebaseApp;
export declare const fakeAppNoAuth: FirebaseApp;
export declare function makeFakeApp(token: Object | null, bucket_arg?: string): FirebaseApp;
export declare function makePool(sendHook: SendHook): XhrIoPool;
/**
 * Returns something that looks like an fbs.XhrIo with the given headers
 * and status.
 */
export declare function fakeXhrIo(headers: Headers, status?: number): XhrIo;
/**
 * Binds ignoring types. Used to test calls involving improper arguments.
 */
export declare function bind(f: Function, ctx: any, ...args: any[]): () => void;
export declare function assertThrows(f: () => void, code: Code): FirebaseStorageError;
export declare function assertUint8ArrayEquals(arr1: Uint8Array, arr2: Uint8Array): void;
export declare function assertObjectIncludes(included: {
    [name: string]: any;
}, obj: {
    [name: string]: any;
}): void;
