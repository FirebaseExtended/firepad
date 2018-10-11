import { _FirebaseNamespace } from '@firebase/app-types/private';
import { FirebaseMessaging } from '@firebase/messaging-types';
export declare function registerMessaging(instance: _FirebaseNamespace): void;
/**
 * Define extension behavior of `registerMessaging`
 */
declare module '@firebase/app-types' {
    interface FirebaseNamespace {
        messaging: {
            (app?: FirebaseApp): FirebaseMessaging;
            isSupported(): boolean;
        };
    }
    interface FirebaseApp {
        messaging(): FirebaseMessaging;
    }
}
export declare function isSupported(): boolean;
