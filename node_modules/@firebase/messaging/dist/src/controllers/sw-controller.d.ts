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
import './sw-types';
import { FirebaseApp } from '@firebase/app-types';
import { MessagePayload, NotificationDetails } from '../interfaces/message-payload';
import { InternalMessage } from '../models/worker-page-message';
import { BaseController, BgMessageHandler } from './base-controller';
export declare class SwController extends BaseController {
    private bgMessageHandler;
    constructor(app: FirebaseApp);
    onPush(event: PushEvent): void;
    onSubChange(event: PushSubscriptionChangeEvent): void;
    onNotificationClick(event: NotificationEvent): void;
    /**
     * A handler for push events that shows notifications based on the content of
     * the payload.
     *
     * The payload must be a JSON-encoded Object with a `notification` key. The
     * value of the `notification` property will be used as the NotificationOptions
     * object passed to showNotification. Additionally, the `title` property of the
     * notification object will be used as the title.
     *
     * If there is no notification data in the payload then no notification will be
     * shown.
     */
    private onPush_(event);
    private onSubChange_(event);
    private onNotificationClick_(event);
    getNotificationData_(msgPayload: MessagePayload): NotificationDetails | undefined;
    /**
     * Calling setBackgroundMessageHandler will opt in to some specific
     * behaviours.
     * 1.) If a notification doesn't need to be shown due to a window already
     * being visible, then push messages will be sent to the page.
     * 2.) If a notification needs to be shown, and the message contains no
     * notification data this method will be called
     * and the promise it returns will be passed to event.waitUntil.
     * If you do not set this callback then all push messages will let and the
     * developer can handle them in a their own 'push' event callback
     *
     * @param callback The callback to be called when a push message is received
     * and a notification must be shown. The callback will be given the data from
     * the push message.
     */
    setBackgroundMessageHandler(callback: BgMessageHandler): void;
    /**
     * @param url The URL to look for when focusing a client.
     * @return Returns an existing window client or a newly opened WindowClient.
     */
    getWindowClient_(url: string): Promise<WindowClient | null>;
    /**
     * This message will attempt to send the message to a window client.
     * @param client The WindowClient to send the message to.
     * @param message The message to send to the client.
     * @returns Returns a promise that resolves after sending the message. This
     * does not guarantee that the message was successfully received.
     */
    attemptToMessageClient_(client: WindowClient, message: InternalMessage): Promise<void>;
    /**
     * @returns If there is currently a visible WindowClient, this method will
     * resolve to true, otherwise false.
     */
    hasVisibleClients_(): Promise<boolean>;
    /**
     * @param msgPayload The data from the push event that should be sent to all
     * available pages.
     * @returns Returns a promise that resolves once the message has been sent to
     * all WindowClients.
     */
    sendMessageToWindowClients_(msgPayload: MessagePayload): Promise<void>;
    /**
     * This will register the default service worker and return the registration.
     * @return he service worker registration to be used for the push service.
     */
    getSWRegistration_(): Promise<ServiceWorkerRegistration>;
    /**
     * This will return the default VAPID key or the uint8array version of the
     * public VAPID key provided by the developer.
     */
    getPublicVapidKey_(): Promise<Uint8Array>;
}
