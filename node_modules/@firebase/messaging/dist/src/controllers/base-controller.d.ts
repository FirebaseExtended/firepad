/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { FirebaseApp } from '@firebase/app-types';
import { FirebaseServiceInternals } from '@firebase/app-types/private';
import { FirebaseMessaging } from '@firebase/messaging-types';
import { CompleteFn, ErrorFn, NextFn, Observer, Unsubscribe } from '@firebase/util';
import { MessagePayload } from '../interfaces/message-payload';
import { IidModel } from '../models/iid-model';
import { TokenDetailsModel } from '../models/token-details-model';
import { VapidDetailsModel } from '../models/vapid-details-model';
export declare type BgMessageHandler = (payload: MessagePayload) => Promise<any> | void;
export declare const TOKEN_EXPIRATION_MILLIS: number;
export declare abstract class BaseController implements FirebaseMessaging {
    app: FirebaseApp;
    INTERNAL: FirebaseServiceInternals;
    private readonly messagingSenderId;
    private readonly tokenDetailsModel;
    private readonly vapidDetailsModel;
    private readonly iidModel;
    /**
     * An interface of the Messaging Service API
     */
    constructor(app: FirebaseApp);
    /**
     * @export
     */
    getToken(): Promise<string | null>;
    /**
     * manageExistingToken is triggered if there's an existing FCM token in the
     * database and it can take 3 different actions:
     * 1) Retrieve the existing FCM token from the database.
     * 2) If VAPID details have changed: Delete the existing token and create a
     * new one with the new VAPID key.
     * 3) If the database cache is invalidated: Send a request to FCM to update
     * the token, and to check if the token is still valid on FCM-side.
     */
    private manageExistingToken(swReg, pushSubscription, publicVapidKey, tokenDetails);
    private updateToken(swReg, pushSubscription, publicVapidKey, tokenDetails);
    private getNewToken(swReg, pushSubscription, publicVapidKey);
    /**
     * This method deletes tokens that the token manager looks after,
     * unsubscribes the token from FCM  and then unregisters the push
     * subscription if it exists. It returns a promise that indicates
     * whether or not the unsubscribe request was processed successfully.
     */
    deleteToken(token: string): Promise<boolean>;
    /**
     * This method will delete the token from the client database, and make a
     * call to FCM to remove it from the server DB. Does not temper with the
     * push subscription.
     */
    private deleteTokenFromDB(token);
    abstract getSWRegistration_(): Promise<ServiceWorkerRegistration>;
    abstract getPublicVapidKey_(): Promise<Uint8Array>;
    /**
     * Gets a PushSubscription for the current user.
     */
    getPushSubscription(swRegistration: ServiceWorkerRegistration, publicVapidKey: Uint8Array): Promise<PushSubscription>;
    requestPermission(): Promise<void>;
    useServiceWorker(registration: ServiceWorkerRegistration): void;
    usePublicVapidKey(b64PublicKey: string): void;
    onMessage(nextOrObserver: NextFn<object> | Observer<object>, error?: ErrorFn, completed?: CompleteFn): Unsubscribe;
    onTokenRefresh(nextOrObserver: NextFn<object> | Observer<object>, error?: ErrorFn, completed?: CompleteFn): Unsubscribe;
    setBackgroundMessageHandler(callback: BgMessageHandler): void;
    /**
     * This method is required to adhere to the Firebase interface.
     * It closes any currently open indexdb database connections.
     */
    delete(): Promise<void>;
    /**
     * Returns the current Notification Permission state.
     */
    getNotificationPermission_(): NotificationPermission;
    getTokenDetailsModel(): TokenDetailsModel;
    getVapidDetailsModel(): VapidDetailsModel;
    getIidModel(): IidModel;
}
