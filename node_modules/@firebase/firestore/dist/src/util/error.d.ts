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
import * as firestore from '@firebase/firestore-types';
/**
 * Error Codes describing the different ways Firestore can fail. These come
 * directly from GRPC.
 */
export declare type Code = firestore.FirestoreErrorCode;
export declare const Code: {
    OK: firestore.FirestoreErrorCode;
    CANCELLED: firestore.FirestoreErrorCode;
    UNKNOWN: firestore.FirestoreErrorCode;
    INVALID_ARGUMENT: firestore.FirestoreErrorCode;
    DEADLINE_EXCEEDED: firestore.FirestoreErrorCode;
    NOT_FOUND: firestore.FirestoreErrorCode;
    ALREADY_EXISTS: firestore.FirestoreErrorCode;
    PERMISSION_DENIED: firestore.FirestoreErrorCode;
    UNAUTHENTICATED: firestore.FirestoreErrorCode;
    RESOURCE_EXHAUSTED: firestore.FirestoreErrorCode;
    FAILED_PRECONDITION: firestore.FirestoreErrorCode;
    ABORTED: firestore.FirestoreErrorCode;
    OUT_OF_RANGE: firestore.FirestoreErrorCode;
    UNIMPLEMENTED: firestore.FirestoreErrorCode;
    INTERNAL: firestore.FirestoreErrorCode;
    UNAVAILABLE: firestore.FirestoreErrorCode;
    DATA_LOSS: firestore.FirestoreErrorCode;
};
/**
 * An error class used for Firestore-generated errors. Ideally we should be
 * using FirebaseError, but integrating with it is overly arduous at the moment,
 * so we define our own compatible error class (with a `name` of 'FirebaseError'
 * and compatible `code` and `message` fields.)
 */
export declare class FirestoreError extends Error implements firestore.FirestoreError {
    readonly code: Code;
    readonly message: string;
    name: string;
    stack?: string;
    constructor(code: Code, message: string);
}
