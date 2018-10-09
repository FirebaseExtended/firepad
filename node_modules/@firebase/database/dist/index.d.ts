import { FirebaseNamespace } from '@firebase/app-types';
import { Database } from './src/api/Database';
import { Query } from './src/api/Query';
import { Reference } from './src/api/Reference';
import { enableLogging } from './src/core/util/util';
import * as types from '@firebase/database-types';
declare const ServerValue: {
    TIMESTAMP: {
        '.sv': string;
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
        database?(databaseURL?: string): types.FirebaseDatabase;
    }
}
