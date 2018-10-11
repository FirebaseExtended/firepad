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
import { CompleteFn, ErrorFn, NextFn, Observer, Unsubscribe } from '@firebase/util';
import { BaseController } from './base-controller';
export declare class WindowController extends BaseController {
    private registrationToUse;
    private publicVapidKeyToUse;
    private manifestCheckPromise;
    private messageObserver;
    private tokenRefreshObserver;
    private readonly onMessageInternal;
    private readonly onTokenRefreshInternal;
    /**
     * A service that provides a MessagingService instance.
     */
    constructor(app: FirebaseApp);
    /**
     * This method returns an FCM token if it can be generated.
     * The return promise will reject if the browser doesn't support
     * FCM, if permission is denied for notifications or it's not
     * possible to generate a token.
     *
     * @return Returns a promise that resolves to an FCM token or null if
     * permission isn't granted.
     */
    getToken(): Promise<string | null>;
    /**
     * Request permission if it is not currently granted
     *
     * @return Resolves if the permission was granted, otherwise rejects
     */
    requestPermission(): Promise<void>;
    /**
     * This method allows a developer to override the default service worker and
     * instead use a custom service worker.
     *
     * @param registration The service worker registration that should be used to
     * receive the push messages.
     */
    useServiceWorker(registration: ServiceWorkerRegistration): void;
    /**
     * This method allows a developer to override the default vapid key
     * and instead use a custom VAPID public key.
     *
     * @param publicKey A URL safe base64 encoded string.
     */
    usePublicVapidKey(publicKey: string): void;
    /**
     * @export
     * @param nextOrObserver An observer object or a function triggered on
     * message.
     * @param error A function triggered on message error.
     * @param completed function triggered when the observer is removed.
     * @return The unsubscribe function for the observer.
     */
    onMessage(nextOrObserver: NextFn<object> | Observer<object>, error?: ErrorFn, completed?: CompleteFn): Unsubscribe;
    /**
     * @param nextOrObserver An observer object or a function triggered on token
     * refresh.
     * @param error A function triggered on token refresh error.
     * @param completed function triggered when the observer is removed.
     * @return The unsubscribe function for the observer.
     */
    onTokenRefresh(nextOrObserver: NextFn<object> | Observer<object>, error?: ErrorFn, completed?: CompleteFn): Unsubscribe;
    /**
     * Given a registration, wait for the service worker it relates to
     * become activer
     * @param registration Registration to wait for service worker to become active
     * @return Wait for service worker registration to become active
     */
    waitForRegistrationToActivate_(registration: ServiceWorkerRegistration): Promise<ServiceWorkerRegistration>;
    /**
     * This will register the default service worker and return the registration
     * @return The service worker registration to be used for the push service.
     */
    getSWRegistration_(): Promise<ServiceWorkerRegistration>;
    /**
     * This will return the default VAPID key or the uint8array version of the public VAPID key
     * provided by the developer.
     */
    getPublicVapidKey_(): Promise<Uint8Array>;
    /**
     * This method will set up a message listener to handle
     * events from the service worker that should trigger
     * events in the page.
     */
    setupSWMessageListener_(): void;
}
/**
 * The method checks that a manifest is defined and has the correct GCM
 * sender ID.
 * @return Returns a promise that resolves if the manifest matches
 * our required sender ID
 */
export declare function manifestCheck(): Promise<void>;
