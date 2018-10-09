import { FirebaseNamespace } from '@firebase/app-types';
import { Database } from './src/api/Database';
import { Query } from './src/api/Query';
import { Reference } from './src/api/Reference';
import { enableLogging } from './src/core/util/util';
import * as INTERNAL from './src/api/internal';
import * as TEST_ACCESS from './src/api/test_access';
import './src/nodePatches';
import * as types from '@firebase/database-types';
/**
 * A one off register function which returns a database based on the app and
 * passed database URL.
 *
 * @param app A valid FirebaseApp-like object
 * @param url A valid Firebase databaseURL
 */
declare const ServerValue: {
    TIMESTAMP: {
        '.sv': string;
    };
};
export declare function initStandalone(app: any, url: any, version?: string): {
    instance: Database;
    namespace: {
        Reference: typeof Reference;
        Query: typeof Query;
        Database: typeof Database;
        enableLogging: (logger_?: boolean | ((a: string) => void), persistent?: boolean) => void;
        INTERNAL: typeof INTERNAL;
        ServerValue: {
            TIMESTAMP: {
                '.sv': string;
            };
        };
        TEST_ACCESS: typeof TEST_ACCESS;
    };
};
export declare function registerDatabase(instance: FirebaseNamespace): void;
export { Database, Query, Reference, enableLogging, ServerValue };
export { DataSnapshot } from './src/api/DataSnapshot';
export { OnDisconnect } from './src/api/onDisconnect';
declare module '@firebase/app-types' {
    interface FirebaseNamespace {
        database?: {
            (app?: FirebaseApp): types.FirebaseDatabase;
            enableLogging: typeof types.enableLogging;
            ServerValue: types.ServerValue;
            Database: typeof types.FirebaseDatabase;
        };
    }
    interface FirebaseApp {
        database?(): types.FirebaseDatabase;
    }
}
