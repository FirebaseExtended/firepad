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
import { AuthWrapper } from './implementation/authwrapper';
import { XhrIoPool } from './implementation/xhriopool';
import { Reference } from './reference';
/**
 * A service that provides firebaseStorage.Reference instances.
 * @param opt_url gs:// url to a custom Storage Bucket
 *
 * @struct
 */
export declare class Service {
    authWrapper_: AuthWrapper;
    private app_;
    private bucket_;
    private internals_;
    constructor(app: FirebaseApp, pool: XhrIoPool, url?: string);
    /**
     * Returns a firebaseStorage.Reference for the given path in the default
     * bucket.
     */
    ref(path?: string): Reference;
    /**
     * Returns a firebaseStorage.Reference object for the given absolute URL,
     * which must be a gs:// or http[s]:// URL.
     */
    refFromURL(url: string): Reference;
    readonly maxUploadRetryTime: number;
    setMaxUploadRetryTime(time: number): void;
    readonly maxOperationRetryTime: number;
    setMaxOperationRetryTime(time: number): void;
    readonly app: FirebaseApp;
    readonly INTERNAL: ServiceInternals;
}
/**
 * @struct
 */
export declare class ServiceInternals {
    service_: Service;
    constructor(service: Service);
    /**
     * Called when the associated app is deleted.
     * @see {!fbs.AuthWrapper.prototype.deleteApp}
     */
    delete(): Promise<void>;
}
