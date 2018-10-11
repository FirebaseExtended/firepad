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
import { Reference } from '../reference';
import { Service } from '../service';
import { Location } from './location';
import { Request } from './request';
import { RequestInfo } from './requestinfo';
import { requestMaker } from './requestmaker';
import { XhrIoPool } from './xhriopool';
import { FirebaseApp } from '@firebase/app-types';
/**
 * @param app If null, getAuthToken always resolves with null.
 * @param service The storage service associated with this auth wrapper.
 *     Untyped to avoid circular type dependencies.
 * @struct
 */
export declare class AuthWrapper {
    private app_;
    private bucket_;
    /**
    maker
       */
    private storageRefMaker_;
    private requestMaker_;
    private pool_;
    private service_;
    private maxOperationRetryTime_;
    private maxUploadRetryTime_;
    private requestMap_;
    private deleted_;
    constructor(app: FirebaseApp | null, maker: (p1: AuthWrapper, p2: Location) => Reference, requestMaker: requestMaker, service: Service, pool: XhrIoPool);
    private static extractBucket_(config);
    getAuthToken(): Promise<string | null>;
    bucket(): string | null;
    /**
     * The service associated with this auth wrapper. Untyped to avoid circular
     * type dependencies.
     */
    service(): Service;
    /**
     * Returns a new firebaseStorage.Reference object referencing this AuthWrapper
     * at the given Location.
     * @param loc The Location.
     * @return Actually a firebaseStorage.Reference, typing not allowed
     *     because of circular dependency problems.
     */
    makeStorageReference(loc: Location): Reference;
    makeRequest<T>(requestInfo: RequestInfo<T>, authToken: string | null): Request<T>;
    /**
     * Stop running requests and prevent more from being created.
     */
    deleteApp(): void;
    maxUploadRetryTime(): number;
    setMaxUploadRetryTime(time: number): void;
    maxOperationRetryTime(): number;
    setMaxOperationRetryTime(time: number): void;
}
