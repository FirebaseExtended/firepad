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
export declare const contains: (obj: any, key: any) => any;
export declare const safeGet: (obj: any, key: any) => any;
/**
 * Enumerates the keys/values in an object, excluding keys defined on the prototype.
 *
 * @param {?Object.<K,V>} obj Object to enumerate.
 * @param {!function(K, V)} fn Function to call for each key and value.
 * @template K,V
 */
export declare const forEach: (obj: any, fn: any) => void;
/**
 * Copies all the (own) properties from one object to another.
 * @param {!Object} objTo
 * @param {!Object} objFrom
 * @return {!Object} objTo
 */
export declare const extend: (objTo: any, objFrom: any) => any;
/**
 * Returns a clone of the specified object.
 * @param {!Object} obj
 * @return {!Object} cloned obj.
 */
export declare const clone: (obj: any) => any;
/**
 * Returns true if obj has typeof "object" and is not null.  Unlike goog.isObject(), does not return true
 * for functions.
 *
 * @param obj {*} A potential object.
 * @returns {boolean} True if it's an object.
 */
export declare const isNonNullObject: (obj: any) => boolean;
export declare const isEmpty: (obj: any) => boolean;
export declare const getCount: (obj: any) => number;
export declare const map: (obj: any, f: any, opt_obj?: any) => {};
export declare const findKey: (obj: any, fn: any, opt_this?: any) => string;
export declare const findValue: (obj: any, fn: any, opt_this?: any) => any;
export declare const getAnyKey: (obj: any) => string;
export declare const getValues: (obj: any) => any[];
/**
 * Tests whether every key/value pair in an object pass the test implemented
 * by the provided function
 *
 * @param {?Object.<K,V>} obj Object to test.
 * @param {!function(K, V)} fn Function to call for each key and value.
 * @template K,V
 */
export declare const every: <V>(obj: Object, fn: (k: string, v?: V) => boolean) => boolean;
