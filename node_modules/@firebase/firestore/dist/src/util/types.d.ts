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
import { AnyJs } from './misc';
export declare type StringMap = {
    [key: string]: string;
};
/**
 * Minimum safe integer in Javascript because of floating point precision.
 * Added to not rely on ES6 features.
 */
export declare let MIN_SAFE_INTEGER: number;
/**
 * Maximum safe integer in Javascript because of floating point precision.
 * Added to not rely on ES6 features.
 */
export declare let MAX_SAFE_INTEGER: number;
/**
 * Returns whether an number is an integer, uses native implementation if
 * available.
 * Added to not rely on ES6 features.
 * @param value The value to test for being an integer
 */
export declare let isInteger: (value: AnyJs) => boolean;
/**
 * Returns whether a variable is either undefined or null.
 */
export declare function isNullOrUndefined(value: AnyJs): boolean;
/**
 * Returns whether a value is an integer and in the safe integer range
 * @param value The value to test for being an integer and in the safe range
 */
export declare function isSafeInteger(value: AnyJs): boolean;
/**
 * Safely checks if the number is NaN.
 */
export declare function safeIsNaN(value: AnyJs): boolean;
