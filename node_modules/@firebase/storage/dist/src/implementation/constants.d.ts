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
/**
 * @fileoverview Constants used in the Firebase Storage library.
 */
/**
 * Domain and scheme for API calls.
 */
export declare const domainBase: string;
/**
 * Domain and scheme for object downloads.
 */
export declare const downloadBase: string;
/**
 * Base URL for non-upload calls to the API.
 */
export declare const apiBaseUrl: string;
/**
 * Base URL for upload calls to the API.
 */
export declare const apiUploadBaseUrl: string;
export declare function setDomainBase(domainBase: string): void;
export declare const configOption: string;
/**
 * 1 minute
 */
export declare const shortMaxOperationRetryTime: number;
/**
 * 2 minutes
 */
export declare const defaultMaxOperationRetryTime: number;
/**
 * 10 minutes
 */
export declare const defaultMaxUploadRetryTime: number;
/**
 * This is the value of Number.MIN_SAFE_INTEGER, which is not well supported
 * enough for us to use it directly.
 */
export declare const minSafeInteger: number;
