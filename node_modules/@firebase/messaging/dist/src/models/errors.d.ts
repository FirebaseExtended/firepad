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
import { ErrorFactory } from '@firebase/util';
export declare const ERROR_CODES: {
    AVAILABLE_IN_WINDOW: string;
    AVAILABLE_IN_SW: string;
    SHOULD_BE_INHERITED: string;
    BAD_SENDER_ID: string;
    INCORRECT_GCM_SENDER_ID: string;
    PERMISSION_DEFAULT: string;
    PERMISSION_BLOCKED: string;
    UNSUPPORTED_BROWSER: string;
    NOTIFICATIONS_BLOCKED: string;
    FAILED_DEFAULT_REGISTRATION: string;
    SW_REGISTRATION_EXPECTED: string;
    GET_SUBSCRIPTION_FAILED: string;
    INVALID_SAVED_TOKEN: string;
    SW_REG_REDUNDANT: string;
    TOKEN_SUBSCRIBE_FAILED: string;
    TOKEN_SUBSCRIBE_NO_TOKEN: string;
    TOKEN_SUBSCRIBE_NO_PUSH_SET: string;
    TOKEN_UNSUBSCRIBE_FAILED: string;
    TOKEN_UPDATE_FAILED: string;
    TOKEN_UPDATE_NO_TOKEN: string;
    USE_SW_BEFORE_GET_TOKEN: string;
    INVALID_DELETE_TOKEN: string;
    DELETE_TOKEN_NOT_FOUND: string;
    DELETE_SCOPE_NOT_FOUND: string;
    BG_HANDLER_FUNCTION_EXPECTED: string;
    NO_WINDOW_CLIENT_TO_MSG: string;
    UNABLE_TO_RESUBSCRIBE: string;
    NO_FCM_TOKEN_FOR_RESUBSCRIBE: string;
    FAILED_TO_DELETE_TOKEN: string;
    NO_SW_IN_REG: string;
    BAD_SCOPE: string;
    BAD_VAPID_KEY: string;
    BAD_SUBSCRIPTION: string;
    BAD_TOKEN: string;
    BAD_PUSH_SET: string;
    FAILED_DELETE_VAPID_KEY: string;
    INVALID_PUBLIC_VAPID_KEY: string;
    USE_PUBLIC_KEY_BEFORE_GET_TOKEN: string;
    PUBLIC_KEY_DECRYPTION_FAILED: string;
};
export declare const ERROR_MAP: {
    [x: string]: string;
};
export declare const errorFactory: ErrorFactory<string>;
