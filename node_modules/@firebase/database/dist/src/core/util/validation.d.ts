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
import { Path, ValidationPath } from './Path';
import { RepoInfo } from '../RepoInfo';
/**
 * True for invalid Firebase keys
 * @type {RegExp}
 * @private
 */
export declare const INVALID_KEY_REGEX_: RegExp;
/**
 * True for invalid Firebase paths.
 * Allows '/' in paths.
 * @type {RegExp}
 * @private
 */
export declare const INVALID_PATH_REGEX_: RegExp;
/**
 * Maximum number of characters to allow in leaf value
 * @type {number}
 * @private
 */
export declare const MAX_LEAF_SIZE_: number;
/**
 * @param {*} key
 * @return {boolean}
 */
export declare const isValidKey: (key: any) => boolean;
/**
 * @param {string} pathString
 * @return {boolean}
 */
export declare const isValidPathString: (pathString: string) => boolean;
/**
 * @param {string} pathString
 * @return {boolean}
 */
export declare const isValidRootPathString: (pathString: string) => boolean;
/**
 * @param {*} priority
 * @return {boolean}
 */
export declare const isValidPriority: (priority: any) => boolean;
/**
 * Pre-validate a datum passed as an argument to Firebase function.
 *
 * @param {string} fnName
 * @param {number} argumentNumber
 * @param {*} data
 * @param {!Path} path
 * @param {boolean} optional
 */
export declare const validateFirebaseDataArg: (fnName: string, argumentNumber: number, data: any, path: Path, optional: boolean) => void;
/**
 * Validate a data object client-side before sending to server.
 *
 * @param {string} errorPrefix
 * @param {*} data
 * @param {!Path|!ValidationPath} path_
 */
export declare const validateFirebaseData: (errorPrefix: string, data: any, path_: Path | ValidationPath) => void;
/**
 * Pre-validate paths passed in the firebase function.
 *
 * @param {string} errorPrefix
 * @param {Array<!Path>} mergePaths
 */
export declare const validateFirebaseMergePaths: (errorPrefix: string, mergePaths: Path[]) => void;
/**
 * pre-validate an object passed as an argument to firebase function (
 * must be an object - e.g. for firebase.update()).
 *
 * @param {string} fnName
 * @param {number} argumentNumber
 * @param {*} data
 * @param {!Path} path
 * @param {boolean} optional
 */
export declare const validateFirebaseMergeDataArg: (fnName: string, argumentNumber: number, data: any, path: Path, optional: boolean) => void;
export declare const validatePriority: (fnName: string, argumentNumber: number, priority: any, optional: boolean) => void;
export declare const validateEventType: (fnName: string, argumentNumber: number, eventType: string, optional: boolean) => void;
export declare const validateKey: (fnName: string, argumentNumber: number, key: string, optional: boolean) => void;
export declare const validatePathString: (fnName: string, argumentNumber: number, pathString: string, optional: boolean) => void;
export declare const validateRootPathString: (fnName: string, argumentNumber: number, pathString: string, optional: boolean) => void;
export declare const validateWritablePath: (fnName: string, path: Path) => void;
export declare const validateUrl: (fnName: string, argumentNumber: number, parsedUrl: {
    repoInfo: RepoInfo;
    path: Path;
}) => void;
export declare const validateCredential: (fnName: string, argumentNumber: number, cred: any, optional: boolean) => void;
export declare const validateBoolean: (fnName: string, argumentNumber: number, bool: any, optional: boolean) => void;
export declare const validateString: (fnName: string, argumentNumber: number, string: any, optional: boolean) => void;
export declare const validateObject: (fnName: string, argumentNumber: number, obj: any, optional: boolean) => void;
export declare const validateObjectContainsKey: (fnName: string, argumentNumber: number, obj: any, key: string, optional: boolean, opt_type?: string) => void;
