import * as types from '@firebase/storage-types';
export declare function registerStorage(instance: any): void;
/**
 * Define extension behavior for `registerStorage`
 */
declare module '@firebase/app-types' {
    interface FirebaseNamespace {
        storage?: {
            (app?: FirebaseApp): types.FirebaseStorage;
            Storage: typeof types.FirebaseStorage;
            StringFormat: {
                BASE64: types.StringFormat;
                BASE64URL: types.StringFormat;
                DATA_URL: types.StringFormat;
                RAW: types.StringFormat;
            };
            TaskEvent: {
                STATE_CHANGED: types.TaskEvent;
            };
            TaskState: {
                CANCELED: types.TaskState;
                ERROR: types.TaskState;
                PAUSED: types.TaskState;
                RUNNING: types.TaskState;
                SUCCESS: types.TaskState;
            };
        };
    }
    interface FirebaseApp {
        storage?(storageBucket?: string): types.FirebaseStorage;
    }
}
