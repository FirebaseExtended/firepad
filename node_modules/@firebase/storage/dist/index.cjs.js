'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var firebase = _interopDefault(require('@firebase/app'));

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
var domainBase = 'https://firebasestorage.googleapis.com';
/**
 * Domain and scheme for object downloads.
 */
var downloadBase = 'https://firebasestorage.googleapis.com';
/**
 * Base URL for non-upload calls to the API.
 */
var apiBaseUrl = '/v0';
/**
 * Base URL for upload calls to the API.
 */
var apiUploadBaseUrl = '/v0';
var configOption = 'storageBucket';
/**
 * 2 minutes
 */
var defaultMaxOperationRetryTime = 2 * 60 * 1000;
/**
 * 10 minutes
 */
var defaultMaxUploadRetryTime = 10 * 60 * 100;
/**
 * This is the value of Number.MIN_SAFE_INTEGER, which is not well supported
 * enough for us to use it directly.
 */
var minSafeInteger = -9007199254740991;

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
var FirebaseStorageError = /** @class */ (function () {
    function FirebaseStorageError(code, message) {
        this.code_ = prependCode(code);
        this.message_ = 'Firebase Storage: ' + message;
        this.serverResponse_ = null;
        this.name_ = 'FirebaseError';
    }
    FirebaseStorageError.prototype.codeProp = function () {
        return this.code;
    };
    FirebaseStorageError.prototype.codeEquals = function (code) {
        return prependCode(code) === this.codeProp();
    };
    FirebaseStorageError.prototype.serverResponseProp = function () {
        return this.serverResponse_;
    };
    FirebaseStorageError.prototype.setServerResponseProp = function (serverResponse) {
        this.serverResponse_ = serverResponse;
    };
    Object.defineProperty(FirebaseStorageError.prototype, "name", {
        get: function () {
            return this.name_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FirebaseStorageError.prototype, "code", {
        get: function () {
            return this.code_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FirebaseStorageError.prototype, "message", {
        get: function () {
            return this.message_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FirebaseStorageError.prototype, "serverResponse", {
        get: function () {
            return this.serverResponse_;
        },
        enumerable: true,
        configurable: true
    });
    return FirebaseStorageError;
}());
var Code = {
    // Shared between all platforms
    UNKNOWN: 'unknown',
    OBJECT_NOT_FOUND: 'object-not-found',
    BUCKET_NOT_FOUND: 'bucket-not-found',
    PROJECT_NOT_FOUND: 'project-not-found',
    QUOTA_EXCEEDED: 'quota-exceeded',
    UNAUTHENTICATED: 'unauthenticated',
    UNAUTHORIZED: 'unauthorized',
    RETRY_LIMIT_EXCEEDED: 'retry-limit-exceeded',
    INVALID_CHECKSUM: 'invalid-checksum',
    CANCELED: 'canceled',
    // JS specific
    INVALID_EVENT_NAME: 'invalid-event-name',
    INVALID_URL: 'invalid-url',
    INVALID_DEFAULT_BUCKET: 'invalid-default-bucket',
    NO_DEFAULT_BUCKET: 'no-default-bucket',
    CANNOT_SLICE_BLOB: 'cannot-slice-blob',
    SERVER_FILE_WRONG_SIZE: 'server-file-wrong-size',
    NO_DOWNLOAD_URL: 'no-download-url',
    INVALID_ARGUMENT: 'invalid-argument',
    INVALID_ARGUMENT_COUNT: 'invalid-argument-count',
    APP_DELETED: 'app-deleted',
    INVALID_ROOT_OPERATION: 'invalid-root-operation',
    INVALID_FORMAT: 'invalid-format',
    INTERNAL_ERROR: 'internal-error'
};
function prependCode(code) {
    return 'storage/' + code;
}
function unknown() {
    var message = 'An unknown error occurred, please check the error payload for ' +
        'server response.';
    return new FirebaseStorageError(Code.UNKNOWN, message);
}
function objectNotFound(path) {
    return new FirebaseStorageError(Code.OBJECT_NOT_FOUND, "Object '" + path + "' does not exist.");
}
function quotaExceeded(bucket) {
    return new FirebaseStorageError(Code.QUOTA_EXCEEDED, "Quota for bucket '" +
        bucket +
        "' exceeded, please view quota on " +
        'https://firebase.google.com/pricing/.');
}
function unauthenticated() {
    var message = 'User is not authenticated, please authenticate using Firebase ' +
        'Authentication and try again.';
    return new FirebaseStorageError(Code.UNAUTHENTICATED, message);
}
function unauthorized(path) {
    return new FirebaseStorageError(Code.UNAUTHORIZED, "User does not have permission to access '" + path + "'.");
}
function retryLimitExceeded() {
    return new FirebaseStorageError(Code.RETRY_LIMIT_EXCEEDED, 'Max retry time for operation exceeded, please try again.');
}
function canceled() {
    return new FirebaseStorageError(Code.CANCELED, 'User canceled the upload/download.');
}
function invalidUrl(url) {
    return new FirebaseStorageError(Code.INVALID_URL, "Invalid URL '" + url + "'.");
}
function invalidDefaultBucket(bucket) {
    return new FirebaseStorageError(Code.INVALID_DEFAULT_BUCKET, "Invalid default bucket '" + bucket + "'.");
}
function cannotSliceBlob() {
    return new FirebaseStorageError(Code.CANNOT_SLICE_BLOB, 'Cannot slice blob for upload. Please retry the upload.');
}
function serverFileWrongSize() {
    return new FirebaseStorageError(Code.SERVER_FILE_WRONG_SIZE, 'Server recorded incorrect upload file size, please retry the upload.');
}
function noDownloadURL() {
    return new FirebaseStorageError(Code.NO_DOWNLOAD_URL, 'The given file does not have any download URLs.');
}
function invalidArgument(index, fnName, message) {
    return new FirebaseStorageError(Code.INVALID_ARGUMENT, 'Invalid argument in `' + fnName + '` at index ' + index + ': ' + message);
}
function invalidArgumentCount(argMin, argMax, fnName, real) {
    var countPart;
    var plural;
    if (argMin === argMax) {
        countPart = argMin;
        plural = argMin === 1 ? 'argument' : 'arguments';
    }
    else {
        countPart = 'between ' + argMin + ' and ' + argMax;
        plural = 'arguments';
    }
    return new FirebaseStorageError(Code.INVALID_ARGUMENT_COUNT, 'Invalid argument count in `' +
        fnName +
        '`: Expected ' +
        countPart +
        ' ' +
        plural +
        ', received ' +
        real +
        '.');
}
function appDeleted() {
    return new FirebaseStorageError(Code.APP_DELETED, 'The Firebase app was deleted.');
}
/**
 * @param name The name of the operation that was invalid.
 */
function invalidRootOperation(name) {
    return new FirebaseStorageError(Code.INVALID_ROOT_OPERATION, "The operation '" +
        name +
        "' cannot be performed on a root reference, create a non-root " +
        "reference using child, such as .child('file.png').");
}
/**
 * @param format The format that was not valid.
 * @param message A message describing the format violation.
 */
function invalidFormat(format, message) {
    return new FirebaseStorageError(Code.INVALID_FORMAT, "String does not match format '" + format + "': " + message);
}
/**
 * @param message A message describing the internal error.
 */
function internalError(message) {
    throw new FirebaseStorageError(Code.INTERNAL_ERROR, 'Internal error: ' + message);
}

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
var StringFormat = {
    RAW: 'raw',
    BASE64: 'base64',
    BASE64URL: 'base64url',
    DATA_URL: 'data_url'
};
function formatValidator(stringFormat) {
    switch (stringFormat) {
        case StringFormat.RAW:
        case StringFormat.BASE64:
        case StringFormat.BASE64URL:
        case StringFormat.DATA_URL:
            return;
        default:
            throw 'Expected one of the event types: [' +
                StringFormat.RAW +
                ', ' +
                StringFormat.BASE64 +
                ', ' +
                StringFormat.BASE64URL +
                ', ' +
                StringFormat.DATA_URL +
                '].';
    }
}
/**
 * @struct
 */
var StringData = /** @class */ (function () {
    function StringData(data, opt_contentType) {
        this.data = data;
        this.contentType = opt_contentType || null;
    }
    return StringData;
}());
function dataFromString(format, string) {
    switch (format) {
        case StringFormat.RAW:
            return new StringData(utf8Bytes_(string));
        case StringFormat.BASE64:
        case StringFormat.BASE64URL:
            return new StringData(base64Bytes_(format, string));
        case StringFormat.DATA_URL:
            return new StringData(dataURLBytes_(string), dataURLContentType_(string));
    }
    // assert(false);
    throw unknown();
}
function utf8Bytes_(string) {
    var b = [];
    for (var i = 0; i < string.length; i++) {
        var c = string.charCodeAt(i);
        if (c <= 127) {
            b.push(c);
        }
        else {
            if (c <= 2047) {
                b.push(192 | (c >> 6), 128 | (c & 63));
            }
            else {
                if ((c & 64512) == 55296) {
                    // The start of a surrogate pair.
                    var valid = i < string.length - 1 &&
                        (string.charCodeAt(i + 1) & 64512) == 56320;
                    if (!valid) {
                        // The second surrogate wasn't there.
                        b.push(239, 191, 189);
                    }
                    else {
                        var hi = c;
                        var lo = string.charCodeAt(++i);
                        c = 65536 | ((hi & 1023) << 10) | (lo & 1023);
                        b.push(240 | (c >> 18), 128 | ((c >> 12) & 63), 128 | ((c >> 6) & 63), 128 | (c & 63));
                    }
                }
                else {
                    if ((c & 64512) == 56320) {
                        // Invalid low surrogate.
                        b.push(239, 191, 189);
                    }
                    else {
                        b.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63));
                    }
                }
            }
        }
    }
    return new Uint8Array(b);
}
function percentEncodedBytes_(string) {
    var decoded;
    try {
        decoded = decodeURIComponent(string);
    }
    catch (e) {
        throw invalidFormat(StringFormat.DATA_URL, 'Malformed data URL.');
    }
    return utf8Bytes_(decoded);
}
function base64Bytes_(format, string) {
    switch (format) {
        case StringFormat.BASE64: {
            var hasMinus = string.indexOf('-') !== -1;
            var hasUnder = string.indexOf('_') !== -1;
            if (hasMinus || hasUnder) {
                var invalidChar = hasMinus ? '-' : '_';
                throw invalidFormat(format, "Invalid character '" +
                    invalidChar +
                    "' found: is it base64url encoded?");
            }
            break;
        }
        case StringFormat.BASE64URL: {
            var hasPlus = string.indexOf('+') !== -1;
            var hasSlash = string.indexOf('/') !== -1;
            if (hasPlus || hasSlash) {
                var invalidChar = hasPlus ? '+' : '/';
                throw invalidFormat(format, "Invalid character '" + invalidChar + "' found: is it base64 encoded?");
            }
            string = string.replace(/-/g, '+').replace(/_/g, '/');
            break;
        }
    }
    var bytes;
    try {
        bytes = atob(string);
    }
    catch (e) {
        throw invalidFormat(format, 'Invalid character found');
    }
    var array = new Uint8Array(bytes.length);
    for (var i = 0; i < bytes.length; i++) {
        array[i] = bytes.charCodeAt(i);
    }
    return array;
}
/**
 * @struct
 */
var DataURLParts = /** @class */ (function () {
    function DataURLParts(dataURL) {
        this.base64 = false;
        this.contentType = null;
        var matches = dataURL.match(/^data:([^,]+)?,/);
        if (matches === null) {
            throw invalidFormat(StringFormat.DATA_URL, "Must be formatted 'data:[<mediatype>][;base64],<data>");
        }
        var middle = matches[1] || null;
        if (middle != null) {
            this.base64 = endsWith(middle, ';base64');
            this.contentType = this.base64
                ? middle.substring(0, middle.length - ';base64'.length)
                : middle;
        }
        this.rest = dataURL.substring(dataURL.indexOf(',') + 1);
    }
    return DataURLParts;
}());
function dataURLBytes_(string) {
    var parts = new DataURLParts(string);
    if (parts.base64) {
        return base64Bytes_(StringFormat.BASE64, parts.rest);
    }
    else {
        return percentEncodedBytes_(parts.rest);
    }
}
function dataURLContentType_(string) {
    var parts = new DataURLParts(string);
    return parts.contentType;
}
function endsWith(s, end) {
    var longEnough = s.length >= end.length;
    if (!longEnough) {
        return false;
    }
    return s.substring(s.length - end.length) === end;
}

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
var TaskEvent = {
    /** Triggered whenever the task changes or progress is updated. */
    STATE_CHANGED: 'state_changed'
};
var InternalTaskState = {
    RUNNING: 'running',
    PAUSING: 'pausing',
    PAUSED: 'paused',
    SUCCESS: 'success',
    CANCELING: 'canceling',
    CANCELED: 'canceled',
    ERROR: 'error'
};
var TaskState = {
    /** The task is currently transferring data. */
    RUNNING: 'running',
    /** The task was paused by the user. */
    PAUSED: 'paused',
    /** The task completed successfully. */
    SUCCESS: 'success',
    /** The task was canceled. */
    CANCELED: 'canceled',
    /** The task failed with an error. */
    ERROR: 'error'
};
function taskStateFromInternalTaskState(state) {
    switch (state) {
        case InternalTaskState.RUNNING:
        case InternalTaskState.PAUSING:
        case InternalTaskState.CANCELING:
            return TaskState.RUNNING;
        case InternalTaskState.PAUSED:
            return TaskState.PAUSED;
        case InternalTaskState.SUCCESS:
            return TaskState.SUCCESS;
        case InternalTaskState.CANCELED:
            return TaskState.CANCELED;
        case InternalTaskState.ERROR:
            return TaskState.ERROR;
        default:
            // TODO(andysoto): assert(false);
            return TaskState.ERROR;
    }
}

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
 * @fileoverview Contains methods for working with objects.
 */
function contains(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
function forEach(obj, f) {
    for (var key in obj) {
        if (contains(obj, key)) {
            f(key, obj[key]);
        }
    }
}
function clone(obj) {
    if (obj == null) {
        return {};
    }
    var c = {};
    forEach(obj, function (key, val) {
        c[key] = val;
    });
    return c;
}

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
 * @fileoverview Implements the promise abstraction interface for external
 * (public SDK) packaging, which just passes through to the firebase-app impl.
 */
/**
 * @template T
 * @param {function((function(T): void),
 *                  (function(!Error): void))} resolver
 */
function make(resolver) {
    return new Promise(resolver);
}
/**
 * @template T
 */
function resolve(value) {
    return Promise.resolve(value);
}
function reject(error) {
    return Promise.reject(error);
}

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
 * @return False if the object is undefined or null, true otherwise.
 */
function isDef(p) {
    return p != null;
}
function isJustDef(p) {
    return p !== void 0;
}
function isFunction(p) {
    return typeof p === 'function';
}
function isObject(p) {
    return typeof p === 'object';
}
function isNonNullObject(p) {
    return isObject(p) && p !== null;
}
function isNonArrayObject(p) {
    return isObject(p) && !Array.isArray(p);
}
function isString(p) {
    return typeof p === 'string' || p instanceof String;
}
function isNumber(p) {
    return typeof p === 'number' || p instanceof Number;
}
function isNativeBlob(p) {
    return isNativeBlobDefined() && p instanceof Blob;
}
function isNativeBlobDefined() {
    return typeof Blob !== 'undefined';
}

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
 * @enum{number}
 */
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["NO_ERROR"] = 0] = "NO_ERROR";
    ErrorCode[ErrorCode["NETWORK_ERROR"] = 1] = "NETWORK_ERROR";
    ErrorCode[ErrorCode["ABORT"] = 2] = "ABORT";
})(ErrorCode || (ErrorCode = {}));

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
 * We use this instead of goog.net.XhrIo because goog.net.XhrIo is hyuuuuge and
 * doesn't work in React Native on Android.
 */
var NetworkXhrIo = /** @class */ (function () {
    function NetworkXhrIo() {
        var _this = this;
        this.sent_ = false;
        this.xhr_ = new XMLHttpRequest();
        this.errorCode_ = ErrorCode.NO_ERROR;
        this.sendPromise_ = make(function (resolve$$1, reject$$1) {
            _this.xhr_.addEventListener('abort', function (event) {
                _this.errorCode_ = ErrorCode.ABORT;
                resolve$$1(_this);
            });
            _this.xhr_.addEventListener('error', function (event) {
                _this.errorCode_ = ErrorCode.NETWORK_ERROR;
                resolve$$1(_this);
            });
            _this.xhr_.addEventListener('load', function (event) {
                resolve$$1(_this);
            });
        });
    }
    /**
     * @override
     */
    NetworkXhrIo.prototype.send = function (url, method, opt_body, opt_headers) {
        var _this = this;
        if (this.sent_) {
            throw internalError('cannot .send() more than once');
        }
        this.sent_ = true;
        this.xhr_.open(method, url, true);
        if (isDef(opt_headers)) {
            var headers = opt_headers;
            forEach(headers, function (key, val) {
                _this.xhr_.setRequestHeader(key, val.toString());
            });
        }
        if (isDef(opt_body)) {
            this.xhr_.send(opt_body);
        }
        else {
            this.xhr_.send();
        }
        return this.sendPromise_;
    };
    /**
     * @override
     */
    NetworkXhrIo.prototype.getErrorCode = function () {
        if (!this.sent_) {
            throw internalError('cannot .getErrorCode() before sending');
        }
        return this.errorCode_;
    };
    /**
     * @override
     */
    NetworkXhrIo.prototype.getStatus = function () {
        if (!this.sent_) {
            throw internalError('cannot .getStatus() before sending');
        }
        try {
            return this.xhr_.status;
        }
        catch (e) {
            return -1;
        }
    };
    /**
     * @override
     */
    NetworkXhrIo.prototype.getResponseText = function () {
        if (!this.sent_) {
            throw internalError('cannot .getResponseText() before sending');
        }
        return this.xhr_.responseText;
    };
    /**
     * Aborts the request.
     * @override
     */
    NetworkXhrIo.prototype.abort = function () {
        this.xhr_.abort();
    };
    /**
     * @override
     */
    NetworkXhrIo.prototype.getResponseHeader = function (header) {
        return this.xhr_.getResponseHeader(header);
    };
    /**
     * @override
     */
    NetworkXhrIo.prototype.addUploadProgressListener = function (listener) {
        if (isDef(this.xhr_.upload)) {
            this.xhr_.upload.addEventListener('progress', listener);
        }
    };
    /**
     * @override
     */
    NetworkXhrIo.prototype.removeUploadProgressListener = function (listener) {
        if (isDef(this.xhr_.upload)) {
            this.xhr_.upload.removeEventListener('progress', listener);
        }
    };
    return NetworkXhrIo;
}());

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
 * Factory-like class for creating XhrIo instances.
 */
var XhrIoPool = /** @class */ (function () {
    function XhrIoPool() {
    }
    XhrIoPool.prototype.createXhrIo = function () {
        return new NetworkXhrIo();
    };
    return XhrIoPool;
}());

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
 * Returns the Object resulting from parsing the given JSON, or null if the
 * given string does not represent a JSON object.
 */
function jsonObjectOrNull(s) {
    var obj;
    try {
        obj = JSON.parse(s);
    }
    catch (e) {
        return null;
    }
    if (isNonArrayObject(obj)) {
        return obj;
    }
    else {
        return null;
    }
}

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
 * @struct
 */
var Location = /** @class */ (function () {
    function Location(bucket, path) {
        this.bucket = bucket;
        this.path_ = path;
    }
    Object.defineProperty(Location.prototype, "path", {
        get: function () {
            return this.path_;
        },
        enumerable: true,
        configurable: true
    });
    Location.prototype.fullServerUrl = function () {
        var encode = encodeURIComponent;
        return '/b/' + encode(this.bucket) + '/o/' + encode(this.path);
    };
    Location.prototype.bucketOnlyServerUrl = function () {
        var encode = encodeURIComponent;
        return '/b/' + encode(this.bucket) + '/o';
    };
    Location.makeFromBucketSpec = function (bucketString) {
        var bucketLocation;
        try {
            bucketLocation = Location.makeFromUrl(bucketString);
        }
        catch (e) {
            // Not valid URL, use as-is. This lets you put bare bucket names in
            // config.
            return new Location(bucketString, '');
        }
        if (bucketLocation.path === '') {
            return bucketLocation;
        }
        else {
            throw invalidDefaultBucket(bucketString);
        }
    };
    Location.makeFromUrl = function (url) {
        var location = null;
        var bucketDomain = '([A-Za-z0-9.\\-]+)';
        function gsModify(loc) {
            if (loc.path.charAt(loc.path.length - 1) === '/') {
                loc.path_ = loc.path_.slice(0, -1);
            }
        }
        var gsPath = '(/(.*))?$';
        var path = '(/([^?#]*).*)?$';
        var gsRegex = new RegExp('^gs://' + bucketDomain + gsPath, 'i');
        var gsIndices = { bucket: 1, path: 3 };
        function httpModify(loc) {
            loc.path_ = decodeURIComponent(loc.path);
        }
        var version = 'v[A-Za-z0-9_]+';
        var httpRegex = new RegExp('^https?://firebasestorage\\.googleapis\\.com/' +
            version +
            '/b/' +
            bucketDomain +
            '/o' +
            path, 'i');
        var httpIndices = { bucket: 1, path: 3 };
        var groups = [
            { regex: gsRegex, indices: gsIndices, postModify: gsModify },
            { regex: httpRegex, indices: httpIndices, postModify: httpModify }
        ];
        for (var i = 0; i < groups.length; i++) {
            var group = groups[i];
            var captures = group.regex.exec(url);
            if (captures) {
                var bucketValue = captures[group.indices.bucket];
                var pathValue = captures[group.indices.path];
                if (!pathValue) {
                    pathValue = '';
                }
                location = new Location(bucketValue, pathValue);
                group.postModify(location);
                break;
            }
        }
        if (location == null) {
            throw invalidUrl(url);
        }
        return location;
    };
    return Location;
}());

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
 * @fileoverview Contains helper methods for manipulating paths.
 */
/**
 * @return Null if the path is already at the root.
 */
function parent(path) {
    if (path.length == 0) {
        return null;
    }
    var index = path.lastIndexOf('/');
    if (index === -1) {
        return '';
    }
    var newPath = path.slice(0, index);
    return newPath;
}
function child(path, childPath) {
    var canonicalChildPath = childPath
        .split('/')
        .filter(function (component) {
        return component.length > 0;
    })
        .join('/');
    if (path.length === 0) {
        return canonicalChildPath;
    }
    else {
        return path + '/' + canonicalChildPath;
    }
}
/**
 * Returns the last component of a path.
 * '/foo/bar' -> 'bar'
 * '/foo/bar/baz/' -> 'baz/'
 * '/a' -> 'a'
 */
function lastComponent(path) {
    var index = path.lastIndexOf('/', path.length - 2);
    if (index === -1) {
        return path;
    }
    else {
        return path.slice(index + 1);
    }
}

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
function makeNormalUrl(urlPart) {
    return domainBase + apiBaseUrl + urlPart;
}
function makeDownloadUrl(urlPart) {
    return downloadBase + apiBaseUrl + urlPart;
}
function makeUploadUrl(urlPart) {
    return domainBase + apiUploadBaseUrl + urlPart;
}
function makeQueryString(params) {
    var encode = encodeURIComponent;
    var queryPart = '?';
    forEach(params, function (key, val) {
        var nextPart = encode(key) + '=' + encode(val);
        queryPart = queryPart + nextPart + '&';
    });
    // Chop off the extra '&' or '?' on the end
    queryPart = queryPart.slice(0, -1);
    return queryPart;
}

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
function noXform_(metadata, value) {
    return value;
}
/**
 * @struct
 */
var Mapping = /** @class */ (function () {
    function Mapping(server, opt_local, opt_writable, opt_xform) {
        this.server = server;
        this.local = opt_local || server;
        this.writable = !!opt_writable;
        this.xform = opt_xform || noXform_;
    }
    return Mapping;
}());
var mappings_ = null;
function xformPath(fullPath) {
    var valid = isString(fullPath);
    if (!valid || fullPath.length < 2) {
        return fullPath;
    }
    else {
        fullPath = fullPath;
        return lastComponent(fullPath);
    }
}
function getMappings() {
    if (mappings_) {
        return mappings_;
    }
    var mappings = [];
    mappings.push(new Mapping('bucket'));
    mappings.push(new Mapping('generation'));
    mappings.push(new Mapping('metageneration'));
    mappings.push(new Mapping('name', 'fullPath', true));
    function mappingsXformPath(metadata, fullPath) {
        return xformPath(fullPath);
    }
    var nameMapping = new Mapping('name');
    nameMapping.xform = mappingsXformPath;
    mappings.push(nameMapping);
    /**
     * Coerces the second param to a number, if it is defined.
     */
    function xformSize(metadata, size) {
        if (isDef(size)) {
            return +size;
        }
        else {
            return size;
        }
    }
    var sizeMapping = new Mapping('size');
    sizeMapping.xform = xformSize;
    mappings.push(sizeMapping);
    mappings.push(new Mapping('timeCreated'));
    mappings.push(new Mapping('updated'));
    mappings.push(new Mapping('md5Hash', null, true));
    mappings.push(new Mapping('cacheControl', null, true));
    mappings.push(new Mapping('contentDisposition', null, true));
    mappings.push(new Mapping('contentEncoding', null, true));
    mappings.push(new Mapping('contentLanguage', null, true));
    mappings.push(new Mapping('contentType', null, true));
    mappings.push(new Mapping('metadata', 'customMetadata', true));
    mappings_ = mappings;
    return mappings_;
}
function addRef(metadata, authWrapper) {
    function generateRef() {
        var bucket = metadata['bucket'];
        var path = metadata['fullPath'];
        var loc = new Location(bucket, path);
        return authWrapper.makeStorageReference(loc);
    }
    Object.defineProperty(metadata, 'ref', { get: generateRef });
}
function fromResource(authWrapper, resource, mappings) {
    var metadata = {};
    metadata['type'] = 'file';
    var len = mappings.length;
    for (var i = 0; i < len; i++) {
        var mapping = mappings[i];
        metadata[mapping.local] = mapping.xform(metadata, resource[mapping.server]);
    }
    addRef(metadata, authWrapper);
    return metadata;
}
function fromResourceString(authWrapper, resourceString, mappings) {
    var obj = jsonObjectOrNull(resourceString);
    if (obj === null) {
        return null;
    }
    var resource = obj;
    return fromResource(authWrapper, resource, mappings);
}
function downloadUrlFromResourceString(metadata, resourceString) {
    var obj = jsonObjectOrNull(resourceString);
    if (obj === null) {
        return null;
    }
    if (!isString(obj['downloadTokens'])) {
        // This can happen if objects are uploaded through GCS and retrieved
        // through list, so we don't want to throw an Error.
        return null;
    }
    var tokens = obj['downloadTokens'];
    if (tokens.length === 0) {
        return null;
    }
    var encode = encodeURIComponent;
    var tokensList = tokens.split(',');
    var urls = tokensList.map(function (token) {
        var bucket = metadata['bucket'];
        var path = metadata['fullPath'];
        var urlPart = '/b/' + encode(bucket) + '/o/' + encode(path);
        var base = makeDownloadUrl(urlPart);
        var queryString = makeQueryString({
            alt: 'media',
            token: token
        });
        return base + queryString;
    });
    return urls[0];
}
function toResourceString(metadata, mappings) {
    var resource = {};
    var len = mappings.length;
    for (var i = 0; i < len; i++) {
        var mapping = mappings[i];
        if (mapping.writable) {
            resource[mapping.server] = metadata[mapping.local];
        }
    }
    return JSON.stringify(resource);
}
function metadataValidator(p) {
    var validType = p && isObject(p);
    if (!validType) {
        throw 'Expected Metadata object.';
    }
    for (var key in p) {
        var val = p[key];
        if (key === 'customMetadata') {
            if (!isObject(val)) {
                throw 'Expected object for \'customMetadata\' mapping.';
            }
        }
        else {
            if (isNonNullObject(val)) {
                throw "Mapping for '" + key + "' cannot be an object.";
            }
        }
    }
}

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
 * @param name Name of the function.
 * @param specs Argument specs.
 * @param passed The actual arguments passed to the function.
 * @throws {fbs.Error} If the arguments are invalid.
 */
function validate(name, specs, passed) {
    var minArgs = specs.length;
    var maxArgs = specs.length;
    for (var i = 0; i < specs.length; i++) {
        if (specs[i].optional) {
            minArgs = i;
            break;
        }
    }
    var validLength = minArgs <= passed.length && passed.length <= maxArgs;
    if (!validLength) {
        throw invalidArgumentCount(minArgs, maxArgs, name, passed.length);
    }
    for (var i = 0; i < passed.length; i++) {
        try {
            specs[i].validator(passed[i]);
        }
        catch (e) {
            if (e instanceof Error) {
                throw invalidArgument(i, name, e.message);
            }
            else {
                throw invalidArgument(i, name, e);
            }
        }
    }
}
/**
 * @struct
 */
var ArgSpec = /** @class */ (function () {
    function ArgSpec(validator, opt_optional) {
        var self = this;
        this.validator = function (p) {
            if (self.optional && !isJustDef(p)) {
                return;
            }
            validator(p);
        };
        this.optional = !!opt_optional;
    }
    return ArgSpec;
}());
function and_(v1, v2) {
    return function (p) {
        v1(p);
        v2(p);
    };
}
function stringSpec(opt_validator, opt_optional) {
    function stringValidator(p) {
        if (!isString(p)) {
            throw 'Expected string.';
        }
    }
    var validator;
    if (opt_validator) {
        validator = and_(stringValidator, opt_validator);
    }
    else {
        validator = stringValidator;
    }
    return new ArgSpec(validator, opt_optional);
}
function uploadDataSpec() {
    function validator(p) {
        var valid = p instanceof Uint8Array ||
            p instanceof ArrayBuffer ||
            (isNativeBlobDefined() && p instanceof Blob);
        if (!valid) {
            throw 'Expected Blob or File.';
        }
    }
    return new ArgSpec(validator);
}
function metadataSpec(opt_optional) {
    return new ArgSpec(metadataValidator, opt_optional);
}
function nonNegativeNumberSpec() {
    function validator(p) {
        var valid = isNumber(p) && p >= 0;
        if (!valid) {
            throw 'Expected a number 0 or greater.';
        }
    }
    return new ArgSpec(validator);
}
function looseObjectSpec(opt_validator, opt_optional) {
    function validator(p) {
        var isLooseObject = p === null || (isDef(p) && p instanceof Object);
        if (!isLooseObject) {
            throw 'Expected an Object.';
        }
        if (opt_validator !== undefined && opt_validator !== null) {
            opt_validator(p);
        }
    }
    return new ArgSpec(validator, opt_optional);
}
function nullFunctionSpec(opt_optional) {
    function validator(p) {
        var valid = p === null || isFunction(p);
        if (!valid) {
            throw 'Expected a Function.';
        }
    }
    return new ArgSpec(validator, opt_optional);
}

function getBlobBuilder() {
    if (typeof BlobBuilder !== 'undefined') {
        return BlobBuilder;
    }
    else if (typeof WebKitBlobBuilder !== 'undefined') {
        return WebKitBlobBuilder;
    }
    else {
        return undefined;
    }
}
/**
 * Concatenates one or more values together and converts them to a Blob.
 *
 * @param var_args The values that will make up the resulting blob.
 * @return The blob.
 */
function getBlob() {
    var var_args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        var_args[_i] = arguments[_i];
    }
    var BlobBuilder = getBlobBuilder();
    if (BlobBuilder !== undefined) {
        var bb = new BlobBuilder();
        for (var i = 0; i < var_args.length; i++) {
            bb.append(var_args[i]);
        }
        return bb.getBlob();
    }
    else {
        if (isNativeBlobDefined()) {
            return new Blob(var_args);
        }
        else {
            throw Error("This browser doesn't seem to support creating Blobs");
        }
    }
}
/**
 * Slices the blob. The returned blob contains data from the start byte
 * (inclusive) till the end byte (exclusive). Negative indices cannot be used.
 *
 * @param blob The blob to be sliced.
 * @param start Index of the starting byte.
 * @param end Index of the ending byte.
 * @return The blob slice or null if not supported.
 */
function sliceBlob(blob, start, end) {
    if (blob.webkitSlice) {
        return blob.webkitSlice(start, end);
    }
    else if (blob.mozSlice) {
        return blob.mozSlice(start, end);
    }
    else if (blob.slice) {
        return blob.slice(start, end);
    }
    return null;
}

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
 * @param opt_elideCopy If true, doesn't copy mutable input data
 *     (e.g. Uint8Arrays). Pass true only if you know the objects will not be
 *     modified after this blob's construction.
 */
var FbsBlob = /** @class */ (function () {
    function FbsBlob(data, opt_elideCopy) {
        var size = 0;
        var blobType = '';
        if (isNativeBlob(data)) {
            this.data_ = data;
            size = data.size;
            blobType = data.type;
        }
        else if (data instanceof ArrayBuffer) {
            if (opt_elideCopy) {
                this.data_ = new Uint8Array(data);
            }
            else {
                this.data_ = new Uint8Array(data.byteLength);
                this.data_.set(new Uint8Array(data));
            }
            size = this.data_.length;
        }
        else if (data instanceof Uint8Array) {
            if (opt_elideCopy) {
                this.data_ = data;
            }
            else {
                this.data_ = new Uint8Array(data.length);
                this.data_.set(data);
            }
            size = data.length;
        }
        this.size_ = size;
        this.type_ = blobType;
    }
    FbsBlob.prototype.size = function () {
        return this.size_;
    };
    FbsBlob.prototype.type = function () {
        return this.type_;
    };
    FbsBlob.prototype.slice = function (startByte, endByte) {
        if (isNativeBlob(this.data_)) {
            var realBlob = this.data_;
            var sliced = sliceBlob(realBlob, startByte, endByte);
            if (sliced === null) {
                return null;
            }
            return new FbsBlob(sliced);
        }
        else {
            var slice = new Uint8Array(this.data_.buffer, startByte, endByte - startByte);
            return new FbsBlob(slice, true);
        }
    };
    FbsBlob.getBlob = function () {
        var var_args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            var_args[_i] = arguments[_i];
        }
        if (isNativeBlobDefined()) {
            var blobby = var_args.map(function (val) {
                if (val instanceof FbsBlob) {
                    return val.data_;
                }
                else {
                    return val;
                }
            });
            return new FbsBlob(getBlob.apply(null, blobby));
        }
        else {
            var uint8Arrays = var_args.map(function (val) {
                if (isString(val)) {
                    return dataFromString(StringFormat.RAW, val).data;
                }
                else {
                    // Blobs don't exist, so this has to be a Uint8Array.
                    return val.data_;
                }
            });
            var finalLength_1 = 0;
            uint8Arrays.forEach(function (array) {
                finalLength_1 += array.byteLength;
            });
            var merged_1 = new Uint8Array(finalLength_1);
            var index_1 = 0;
            uint8Arrays.forEach(function (array) {
                for (var i = 0; i < array.length; i++) {
                    merged_1[index_1++] = array[i];
                }
            });
            return new FbsBlob(merged_1, true);
        }
    };
    FbsBlob.prototype.uploadData = function () {
        return this.data_;
    };
    return FbsBlob;
}());

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
 * Returns true if the object is contained in the array (compared with ===).
 * @template T
 */
function contains$1(array, elem) {
    return array.indexOf(elem) !== -1;
}
/**
 * Returns a shallow copy of the array or array-like object (e.g. arguments).
 * @template T
 */
function clone$1(arraylike) {
    return Array.prototype.slice.call(arraylike);
}
/**
 * Removes the given element from the given array, if it is contained.
 * Directly modifies the passed-in array.
 * @template T
 */
function remove(array, elem) {
    var i = array.indexOf(elem);
    if (i !== -1) {
        array.splice(i, 1);
    }
}

var RequestInfo = /** @class */ (function () {
    function RequestInfo(url, method, 
    /**
     * Returns the value with which to resolve the request's promise. Only called
     * if the request is successful. Throw from this function to reject the
     * returned Request's promise with the thrown error.
     * Note: The XhrIo passed to this function may be reused after this callback
     * returns. Do not keep a reference to it in any way.
     */
    handler, timeout) {
        this.url = url;
        this.method = method;
        this.handler = handler;
        this.timeout = timeout;
        this.urlParams = {};
        this.headers = {};
        this.body = null;
        this.errorHandler = null;
        /**
         * Called with the current number of bytes uploaded and total size (-1 if not
         * computable) of the request body (i.e. used to report upload progress).
         */
        this.progressCallback = null;
        this.successCodes = [200];
        this.additionalRetryCodes = [];
    }
    return RequestInfo;
}());

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
 * Throws the UNKNOWN FirebaseStorageError if cndn is false.
 */
function handlerCheck(cndn) {
    if (!cndn) {
        throw unknown();
    }
}
function metadataHandler(authWrapper, mappings) {
    function handler(xhr, text) {
        var metadata = fromResourceString(authWrapper, text, mappings);
        handlerCheck(metadata !== null);
        return metadata;
    }
    return handler;
}
function downloadUrlHandler(authWrapper, mappings) {
    function handler(xhr, text) {
        var metadata = fromResourceString(authWrapper, text, mappings);
        handlerCheck(metadata !== null);
        return downloadUrlFromResourceString(metadata, text);
    }
    return handler;
}
function sharedErrorHandler(location) {
    function errorHandler(xhr, err) {
        var newErr;
        if (xhr.getStatus() === 401) {
            newErr = unauthenticated();
        }
        else {
            if (xhr.getStatus() === 402) {
                newErr = quotaExceeded(location.bucket);
            }
            else {
                if (xhr.getStatus() === 403) {
                    newErr = unauthorized(location.path);
                }
                else {
                    newErr = err;
                }
            }
        }
        newErr.setServerResponseProp(err.serverResponseProp());
        return newErr;
    }
    return errorHandler;
}
function objectErrorHandler(location) {
    var shared = sharedErrorHandler(location);
    function errorHandler(xhr, err) {
        var newErr = shared(xhr, err);
        if (xhr.getStatus() === 404) {
            newErr = objectNotFound(location.path);
        }
        newErr.setServerResponseProp(err.serverResponseProp());
        return newErr;
    }
    return errorHandler;
}
function getMetadata(authWrapper, location, mappings) {
    var urlPart = location.fullServerUrl();
    var url = makeNormalUrl(urlPart);
    var method = 'GET';
    var timeout = authWrapper.maxOperationRetryTime();
    var requestInfo = new RequestInfo(url, method, metadataHandler(authWrapper, mappings), timeout);
    requestInfo.errorHandler = objectErrorHandler(location);
    return requestInfo;
}
function getDownloadUrl(authWrapper, location, mappings) {
    var urlPart = location.fullServerUrl();
    var url = makeNormalUrl(urlPart);
    var method = 'GET';
    var timeout = authWrapper.maxOperationRetryTime();
    var requestInfo = new RequestInfo(url, method, downloadUrlHandler(authWrapper, mappings), timeout);
    requestInfo.errorHandler = objectErrorHandler(location);
    return requestInfo;
}
function updateMetadata(authWrapper, location, metadata, mappings) {
    var urlPart = location.fullServerUrl();
    var url = makeNormalUrl(urlPart);
    var method = 'PATCH';
    var body = toResourceString(metadata, mappings);
    var headers = { 'Content-Type': 'application/json; charset=utf-8' };
    var timeout = authWrapper.maxOperationRetryTime();
    var requestInfo = new RequestInfo(url, method, metadataHandler(authWrapper, mappings), timeout);
    requestInfo.headers = headers;
    requestInfo.body = body;
    requestInfo.errorHandler = objectErrorHandler(location);
    return requestInfo;
}
function deleteObject(authWrapper, location) {
    var urlPart = location.fullServerUrl();
    var url = makeNormalUrl(urlPart);
    var method = 'DELETE';
    var timeout = authWrapper.maxOperationRetryTime();
    function handler(xhr, text) { }
    var requestInfo = new RequestInfo(url, method, handler, timeout);
    requestInfo.successCodes = [200, 204];
    requestInfo.errorHandler = objectErrorHandler(location);
    return requestInfo;
}
function determineContentType_(metadata, blob) {
    return ((metadata && metadata['contentType']) ||
        (blob && blob.type()) ||
        'application/octet-stream');
}
function metadataForUpload_(location, blob, opt_metadata) {
    var metadata = clone(opt_metadata);
    metadata['fullPath'] = location.path;
    metadata['size'] = blob.size();
    if (!metadata['contentType']) {
        metadata['contentType'] = determineContentType_(null, blob);
    }
    return metadata;
}
function multipartUpload(authWrapper, location, mappings, blob, opt_metadata) {
    var urlPart = location.bucketOnlyServerUrl();
    var headers = {
        'X-Goog-Upload-Protocol': 'multipart'
    };
    function genBoundary() {
        var str = '';
        for (var i = 0; i < 2; i++) {
            str =
                str +
                    Math.random()
                        .toString()
                        .slice(2);
        }
        return str;
    }
    var boundary = genBoundary();
    headers['Content-Type'] = 'multipart/related; boundary=' + boundary;
    var metadata = metadataForUpload_(location, blob, opt_metadata);
    var metadataString = toResourceString(metadata, mappings);
    var preBlobPart = '--' +
        boundary +
        '\r\n' +
        'Content-Type: application/json; charset=utf-8\r\n\r\n' +
        metadataString +
        '\r\n--' +
        boundary +
        '\r\n' +
        'Content-Type: ' +
        metadata['contentType'] +
        '\r\n\r\n';
    var postBlobPart = '\r\n--' + boundary + '--';
    var body = FbsBlob.getBlob(preBlobPart, blob, postBlobPart);
    if (body === null) {
        throw cannotSliceBlob();
    }
    var urlParams = { name: metadata['fullPath'] };
    var url = makeUploadUrl(urlPart);
    var method = 'POST';
    var timeout = authWrapper.maxUploadRetryTime();
    var requestInfo = new RequestInfo(url, method, metadataHandler(authWrapper, mappings), timeout);
    requestInfo.urlParams = urlParams;
    requestInfo.headers = headers;
    requestInfo.body = body.uploadData();
    requestInfo.errorHandler = sharedErrorHandler(location);
    return requestInfo;
}
/**
 * @param current The number of bytes that have been uploaded so far.
 * @param total The total number of bytes in the upload.
 * @param opt_finalized True if the server has finished the upload.
 * @param opt_metadata The upload metadata, should
 *     only be passed if opt_finalized is true.
 * @struct
 */
var ResumableUploadStatus = /** @class */ (function () {
    function ResumableUploadStatus(current, total, finalized, metadata) {
        this.current = current;
        this.total = total;
        this.finalized = !!finalized;
        this.metadata = metadata || null;
    }
    return ResumableUploadStatus;
}());
function checkResumeHeader_(xhr, opt_allowed) {
    var status;
    try {
        status = xhr.getResponseHeader('X-Goog-Upload-Status');
    }
    catch (e) {
        handlerCheck(false);
    }
    var allowed = opt_allowed || ['active'];
    handlerCheck(contains$1(allowed, status));
    return status;
}
function createResumableUpload(authWrapper, location, mappings, blob, opt_metadata) {
    var urlPart = location.bucketOnlyServerUrl();
    var metadata = metadataForUpload_(location, blob, opt_metadata);
    var urlParams = { name: metadata['fullPath'] };
    var url = makeUploadUrl(urlPart);
    var method = 'POST';
    var headers = {
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': blob.size(),
        'X-Goog-Upload-Header-Content-Type': metadata['contentType'],
        'Content-Type': 'application/json; charset=utf-8'
    };
    var body = toResourceString(metadata, mappings);
    var timeout = authWrapper.maxUploadRetryTime();
    function handler(xhr, text) {
        checkResumeHeader_(xhr);
        var url;
        try {
            url = xhr.getResponseHeader('X-Goog-Upload-URL');
        }
        catch (e) {
            handlerCheck(false);
        }
        handlerCheck(isString(url));
        return url;
    }
    var requestInfo = new RequestInfo(url, method, handler, timeout);
    requestInfo.urlParams = urlParams;
    requestInfo.headers = headers;
    requestInfo.body = body;
    requestInfo.errorHandler = sharedErrorHandler(location);
    return requestInfo;
}
/**
 * @param url From a call to fbs.requests.createResumableUpload.
 */
function getResumableUploadStatus(authWrapper, location, url, blob) {
    var headers = { 'X-Goog-Upload-Command': 'query' };
    function handler(xhr, text) {
        var status = checkResumeHeader_(xhr, ['active', 'final']);
        var sizeString;
        try {
            sizeString = xhr.getResponseHeader('X-Goog-Upload-Size-Received');
        }
        catch (e) {
            handlerCheck(false);
        }
        var size = parseInt(sizeString, 10);
        handlerCheck(!isNaN(size));
        return new ResumableUploadStatus(size, blob.size(), status === 'final');
    }
    var method = 'POST';
    var timeout = authWrapper.maxUploadRetryTime();
    var requestInfo = new RequestInfo(url, method, handler, timeout);
    requestInfo.headers = headers;
    requestInfo.errorHandler = sharedErrorHandler(location);
    return requestInfo;
}
/**
 * Any uploads via the resumable upload API must transfer a number of bytes
 * that is a multiple of this number.
 */
var resumableUploadChunkSize = 256 * 1024;
/**
 * @param url From a call to fbs.requests.createResumableUpload.
 * @param chunkSize Number of bytes to upload.
 * @param opt_status The previous status.
 *     If not passed or null, we start from the beginning.
 * @throws fbs.Error If the upload is already complete, the passed in status
 *     has a final size inconsistent with the blob, or the blob cannot be sliced
 *     for upload.
 */
function continueResumableUpload(location, authWrapper, url, blob, chunkSize, mappings, opt_status, opt_progressCallback) {
    // TODO(andysoto): standardize on internal asserts
    // assert(!(opt_status && opt_status.finalized));
    var status = new ResumableUploadStatus(0, 0);
    if (opt_status) {
        status.current = opt_status.current;
        status.total = opt_status.total;
    }
    else {
        status.current = 0;
        status.total = blob.size();
    }
    if (blob.size() !== status.total) {
        throw serverFileWrongSize();
    }
    var bytesLeft = status.total - status.current;
    var bytesToUpload = bytesLeft;
    if (chunkSize > 0) {
        bytesToUpload = Math.min(bytesToUpload, chunkSize);
    }
    var startByte = status.current;
    var endByte = startByte + bytesToUpload;
    var uploadCommand = bytesToUpload === bytesLeft ? 'upload, finalize' : 'upload';
    var headers = {
        'X-Goog-Upload-Command': uploadCommand,
        'X-Goog-Upload-Offset': status.current
    };
    var body = blob.slice(startByte, endByte);
    if (body === null) {
        throw cannotSliceBlob();
    }
    function handler(xhr, text) {
        // TODO(andysoto): Verify the MD5 of each uploaded range:
        // the 'x-range-md5' header comes back with status code 308 responses.
        // We'll only be able to bail out though, because you can't re-upload a
        // range that you previously uploaded.
        var uploadStatus = checkResumeHeader_(xhr, ['active', 'final']);
        var newCurrent = status.current + bytesToUpload;
        var size = blob.size();
        var metadata;
        if (uploadStatus === 'final') {
            metadata = metadataHandler(authWrapper, mappings)(xhr, text);
        }
        else {
            metadata = null;
        }
        return new ResumableUploadStatus(newCurrent, size, uploadStatus === 'final', metadata);
    }
    var method = 'POST';
    var timeout = authWrapper.maxUploadRetryTime();
    var requestInfo = new RequestInfo(url, method, handler, timeout);
    requestInfo.headers = headers;
    requestInfo.body = body.uploadData();
    requestInfo.progressCallback = opt_progressCallback || null;
    requestInfo.errorHandler = sharedErrorHandler(location);
    return requestInfo;
}

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
 * @struct
 */
var Observer = /** @class */ (function () {
    function Observer(nextOrObserver, opt_error, opt_complete) {
        var asFunctions = isFunction(nextOrObserver) ||
            isDef(opt_error) ||
            isDef(opt_complete);
        if (asFunctions) {
            this.next = nextOrObserver;
            this.error = opt_error || null;
            this.complete = opt_complete || null;
        }
        else {
            var observer = nextOrObserver;
            this.next = observer.next || null;
            this.error = observer.error || null;
            this.complete = observer.complete || null;
        }
    }
    return Observer;
}());

var UploadTaskSnapshot = /** @class */ (function () {
    function UploadTaskSnapshot(bytesTransferred, totalBytes, state, metadata, task, ref) {
        this.bytesTransferred = bytesTransferred;
        this.totalBytes = totalBytes;
        this.state = state;
        this.metadata = metadata;
        this.task = task;
        this.ref = ref;
    }
    return UploadTaskSnapshot;
}());

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
 * Returns a function that invokes f with its arguments asynchronously as a
 * microtask, i.e. as soon as possible after the current script returns back
 * into browser code.
 */
function async(f) {
    return function () {
        var argsToForward = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            argsToForward[_i] = arguments[_i];
        }
        resolve(true).then(function () {
            f.apply(null, argsToForward);
        });
    };
}

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
 * Represents a blob being uploaded. Can be used to pause/resume/cancel the
 * upload and manage callbacks for various events.
 */
var UploadTask = /** @class */ (function () {
    /**
     * @param ref The firebaseStorage.Reference object this task came
     *     from, untyped to avoid cyclic dependencies.
     * @param blob The blob to upload.
     */
    function UploadTask(ref, authWrapper, location, mappings, blob, metadata) {
        if (metadata === void 0) { metadata = null; }
        var _this = this;
        this.transferred_ = 0;
        this.needToFetchStatus_ = false;
        this.needToFetchMetadata_ = false;
        this.observers_ = [];
        this.error_ = null;
        this.uploadUrl_ = null;
        this.request_ = null;
        this.chunkMultiplier_ = 1;
        this.resolve_ = null;
        this.reject_ = null;
        this.ref_ = ref;
        this.authWrapper_ = authWrapper;
        this.location_ = location;
        this.blob_ = blob;
        this.metadata_ = metadata;
        this.mappings_ = mappings;
        this.resumable_ = this.shouldDoResumable_(this.blob_);
        this.state_ = InternalTaskState.RUNNING;
        this.errorHandler_ = function (error) {
            _this.request_ = null;
            _this.chunkMultiplier_ = 1;
            if (error.codeEquals(Code.CANCELED)) {
                _this.needToFetchStatus_ = true;
                _this.completeTransitions_();
            }
            else {
                _this.error_ = error;
                _this.transition_(InternalTaskState.ERROR);
            }
        };
        this.metadataErrorHandler_ = function (error) {
            _this.request_ = null;
            if (error.codeEquals(Code.CANCELED)) {
                _this.completeTransitions_();
            }
            else {
                _this.error_ = error;
                _this.transition_(InternalTaskState.ERROR);
            }
        };
        this.promise_ = make(function (resolve$$1, reject$$1) {
            _this.resolve_ = resolve$$1;
            _this.reject_ = reject$$1;
            _this.start_();
        });
        // Prevent uncaught rejections on the internal promise from bubbling out
        // to the top level with a dummy handler.
        this.promise_.then(null, function () { });
    }
    UploadTask.prototype.makeProgressCallback_ = function () {
        var _this = this;
        var sizeBefore = this.transferred_;
        return function (loaded, total) {
            _this.updateProgress_(sizeBefore + loaded);
        };
    };
    UploadTask.prototype.shouldDoResumable_ = function (blob) {
        return blob.size() > 256 * 1024;
    };
    UploadTask.prototype.start_ = function () {
        if (this.state_ !== InternalTaskState.RUNNING) {
            // This can happen if someone pauses us in a resume callback, for example.
            return;
        }
        if (this.request_ !== null) {
            return;
        }
        if (this.resumable_) {
            if (this.uploadUrl_ === null) {
                this.createResumable_();
            }
            else {
                if (this.needToFetchStatus_) {
                    this.fetchStatus_();
                }
                else {
                    if (this.needToFetchMetadata_) {
                        // Happens if we miss the metadata on upload completion.
                        this.fetchMetadata_();
                    }
                    else {
                        this.continueUpload_();
                    }
                }
            }
        }
        else {
            this.oneShotUpload_();
        }
    };
    UploadTask.prototype.resolveToken_ = function (callback) {
        var _this = this;
        this.authWrapper_.getAuthToken().then(function (authToken) {
            switch (_this.state_) {
                case InternalTaskState.RUNNING:
                    callback(authToken);
                    break;
                case InternalTaskState.CANCELING:
                    _this.transition_(InternalTaskState.CANCELED);
                    break;
                case InternalTaskState.PAUSING:
                    _this.transition_(InternalTaskState.PAUSED);
                    break;
                default:
            }
        });
    };
    // TODO(andysoto): assert false
    UploadTask.prototype.createResumable_ = function () {
        var _this = this;
        this.resolveToken_(function (authToken) {
            var requestInfo = createResumableUpload(_this.authWrapper_, _this.location_, _this.mappings_, _this.blob_, _this.metadata_);
            var createRequest = _this.authWrapper_.makeRequest(requestInfo, authToken);
            _this.request_ = createRequest;
            createRequest.getPromise().then(function (url) {
                _this.request_ = null;
                _this.uploadUrl_ = url;
                _this.needToFetchStatus_ = false;
                _this.completeTransitions_();
            }, _this.errorHandler_);
        });
    };
    UploadTask.prototype.fetchStatus_ = function () {
        var _this = this;
        // TODO(andysoto): assert(this.uploadUrl_ !== null);
        var url = this.uploadUrl_;
        this.resolveToken_(function (authToken) {
            var requestInfo = getResumableUploadStatus(_this.authWrapper_, _this.location_, url, _this.blob_);
            var statusRequest = _this.authWrapper_.makeRequest(requestInfo, authToken);
            _this.request_ = statusRequest;
            statusRequest.getPromise().then(function (status) {
                status = status;
                _this.request_ = null;
                _this.updateProgress_(status.current);
                _this.needToFetchStatus_ = false;
                if (status.finalized) {
                    _this.needToFetchMetadata_ = true;
                }
                _this.completeTransitions_();
            }, _this.errorHandler_);
        });
    };
    UploadTask.prototype.continueUpload_ = function () {
        var _this = this;
        var chunkSize = resumableUploadChunkSize * this.chunkMultiplier_;
        var status = new ResumableUploadStatus(this.transferred_, this.blob_.size());
        // TODO(andysoto): assert(this.uploadUrl_ !== null);
        var url = this.uploadUrl_;
        this.resolveToken_(function (authToken) {
            var requestInfo;
            try {
                requestInfo = continueResumableUpload(_this.location_, _this.authWrapper_, url, _this.blob_, chunkSize, _this.mappings_, status, _this.makeProgressCallback_());
            }
            catch (e) {
                _this.error_ = e;
                _this.transition_(InternalTaskState.ERROR);
                return;
            }
            var uploadRequest = _this.authWrapper_.makeRequest(requestInfo, authToken);
            _this.request_ = uploadRequest;
            uploadRequest
                .getPromise()
                .then(function (newStatus) {
                _this.increaseMultiplier_();
                _this.request_ = null;
                _this.updateProgress_(newStatus.current);
                if (newStatus.finalized) {
                    _this.metadata_ = newStatus.metadata;
                    _this.transition_(InternalTaskState.SUCCESS);
                }
                else {
                    _this.completeTransitions_();
                }
            }, _this.errorHandler_);
        });
    };
    UploadTask.prototype.increaseMultiplier_ = function () {
        var currentSize = resumableUploadChunkSize * this.chunkMultiplier_;
        // Max chunk size is 32M.
        if (currentSize < 32 * 1024 * 1024) {
            this.chunkMultiplier_ *= 2;
        }
    };
    UploadTask.prototype.fetchMetadata_ = function () {
        var _this = this;
        this.resolveToken_(function (authToken) {
            var requestInfo = getMetadata(_this.authWrapper_, _this.location_, _this.mappings_);
            var metadataRequest = _this.authWrapper_.makeRequest(requestInfo, authToken);
            _this.request_ = metadataRequest;
            metadataRequest.getPromise().then(function (metadata) {
                _this.request_ = null;
                _this.metadata_ = metadata;
                _this.transition_(InternalTaskState.SUCCESS);
            }, _this.metadataErrorHandler_);
        });
    };
    UploadTask.prototype.oneShotUpload_ = function () {
        var _this = this;
        this.resolveToken_(function (authToken) {
            var requestInfo = multipartUpload(_this.authWrapper_, _this.location_, _this.mappings_, _this.blob_, _this.metadata_);
            var multipartRequest = _this.authWrapper_.makeRequest(requestInfo, authToken);
            _this.request_ = multipartRequest;
            multipartRequest.getPromise().then(function (metadata) {
                _this.request_ = null;
                _this.metadata_ = metadata;
                _this.updateProgress_(_this.blob_.size());
                _this.transition_(InternalTaskState.SUCCESS);
            }, _this.errorHandler_);
        });
    };
    UploadTask.prototype.updateProgress_ = function (transferred) {
        var old = this.transferred_;
        this.transferred_ = transferred;
        // A progress update can make the "transferred" value smaller (e.g. a
        // partial upload not completed by server, after which the "transferred"
        // value may reset to the value at the beginning of the request).
        if (this.transferred_ !== old) {
            this.notifyObservers_();
        }
    };
    UploadTask.prototype.transition_ = function (state) {
        if (this.state_ === state) {
            return;
        }
        switch (state) {
            case InternalTaskState.CANCELING:
                // TODO(andysoto):
                // assert(this.state_ === InternalTaskState.RUNNING ||
                //        this.state_ === InternalTaskState.PAUSING);
                this.state_ = state;
                if (this.request_ !== null) {
                    this.request_.cancel();
                }
                break;
            case InternalTaskState.PAUSING:
                // TODO(andysoto):
                // assert(this.state_ === InternalTaskState.RUNNING);
                this.state_ = state;
                if (this.request_ !== null) {
                    this.request_.cancel();
                }
                break;
            case InternalTaskState.RUNNING:
                // TODO(andysoto):
                // assert(this.state_ === InternalTaskState.PAUSED ||
                //        this.state_ === InternalTaskState.PAUSING);
                var wasPaused = this.state_ === InternalTaskState.PAUSED;
                this.state_ = state;
                if (wasPaused) {
                    this.notifyObservers_();
                    this.start_();
                }
                break;
            case InternalTaskState.PAUSED:
                // TODO(andysoto):
                // assert(this.state_ === InternalTaskState.PAUSING);
                this.state_ = state;
                this.notifyObservers_();
                break;
            case InternalTaskState.CANCELED:
                // TODO(andysoto):
                // assert(this.state_ === InternalTaskState.PAUSED ||
                //        this.state_ === InternalTaskState.CANCELING);
                this.error_ = canceled();
                this.state_ = state;
                this.notifyObservers_();
                break;
            case InternalTaskState.ERROR:
                // TODO(andysoto):
                // assert(this.state_ === InternalTaskState.RUNNING ||
                //        this.state_ === InternalTaskState.PAUSING ||
                //        this.state_ === InternalTaskState.CANCELING);
                this.state_ = state;
                this.notifyObservers_();
                break;
            case InternalTaskState.SUCCESS:
                // TODO(andysoto):
                // assert(this.state_ === InternalTaskState.RUNNING ||
                //        this.state_ === InternalTaskState.PAUSING ||
                //        this.state_ === InternalTaskState.CANCELING);
                this.state_ = state;
                this.notifyObservers_();
                break;
        }
    };
    UploadTask.prototype.completeTransitions_ = function () {
        switch (this.state_) {
            case InternalTaskState.PAUSING:
                this.transition_(InternalTaskState.PAUSED);
                break;
            case InternalTaskState.CANCELING:
                this.transition_(InternalTaskState.CANCELED);
                break;
            case InternalTaskState.RUNNING:
                this.start_();
                break;
            default:
                // TODO(andysoto): assert(false);
                break;
        }
    };
    Object.defineProperty(UploadTask.prototype, "snapshot", {
        get: function () {
            var externalState = taskStateFromInternalTaskState(this.state_);
            return new UploadTaskSnapshot(this.transferred_, this.blob_.size(), externalState, this.metadata_, this, this.ref_);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Adds a callback for an event.
     * @param type The type of event to listen for.
     */
    UploadTask.prototype.on = function (type, nextOrObserver, error, completed) {
        if (nextOrObserver === void 0) { nextOrObserver = undefined; }
        if (error === void 0) { error = undefined; }
        if (completed === void 0) { completed = undefined; }
        function typeValidator(_p) {
            if (type !== TaskEvent.STATE_CHANGED) {
                throw "Expected one of the event types: [" + TaskEvent.STATE_CHANGED + "].";
            }
        }
        var nextOrObserverMessage = 'Expected a function or an Object with one of ' +
            '`next`, `error`, `complete` properties.';
        var nextValidator = nullFunctionSpec(true).validator;
        var observerValidator = looseObjectSpec(null, true).validator;
        function nextOrObserverValidator(p) {
            try {
                nextValidator(p);
                return;
            }
            catch (e) { }
            try {
                observerValidator(p);
                var anyDefined = isJustDef(p['next']) ||
                    isJustDef(p['error']) ||
                    isJustDef(p['complete']);
                if (!anyDefined) {
                    throw '';
                }
                return;
            }
            catch (e) {
                throw nextOrObserverMessage;
            }
        }
        var specs = [
            stringSpec(typeValidator),
            looseObjectSpec(nextOrObserverValidator, true),
            nullFunctionSpec(true),
            nullFunctionSpec(true)
        ];
        validate('on', specs, arguments);
        var self = this;
        function makeBinder(specs) {
            function binder(nextOrObserver, error, opt_complete) {
                if (specs !== null) {
                    validate('on', specs, arguments);
                }
                var observer = new Observer(nextOrObserver, error, completed);
                self.addObserver_(observer);
                return function () {
                    self.removeObserver_(observer);
                };
            }
            return binder;
        }
        function binderNextOrObserverValidator(p) {
            if (p === null) {
                throw nextOrObserverMessage;
            }
            nextOrObserverValidator(p);
        }
        var binderSpecs = [
            looseObjectSpec(binderNextOrObserverValidator),
            nullFunctionSpec(true),
            nullFunctionSpec(true)
        ];
        var typeOnly = !(isJustDef(nextOrObserver) ||
            isJustDef(error) ||
            isJustDef(completed));
        if (typeOnly) {
            return makeBinder(binderSpecs);
        }
        else {
            return makeBinder(null)(nextOrObserver, error, completed);
        }
    };
    /**
     * This object behaves like a Promise, and resolves with its snapshot data
     * when the upload completes.
     * @param onFulfilled The fulfillment callback. Promise chaining works as normal.
     * @param onRejected The rejection callback.
     */
    UploadTask.prototype.then = function (onFulfilled, onRejected) {
        // These casts are needed so that TypeScript can infer the types of the
        // resulting Promise.
        return this.promise_.then(onFulfilled, onRejected);
    };
    /**
     * Equivalent to calling `then(null, onRejected)`.
     */
    UploadTask.prototype.catch = function (onRejected) {
        return this.then(null, onRejected);
    };
    /**
     * Adds the given observer.
     */
    UploadTask.prototype.addObserver_ = function (observer) {
        this.observers_.push(observer);
        this.notifyObserver_(observer);
    };
    /**
     * Removes the given observer.
     */
    UploadTask.prototype.removeObserver_ = function (observer) {
        remove(this.observers_, observer);
    };
    UploadTask.prototype.notifyObservers_ = function () {
        var _this = this;
        this.finishPromise_();
        var observers = clone$1(this.observers_);
        observers.forEach(function (observer) {
            _this.notifyObserver_(observer);
        });
    };
    UploadTask.prototype.finishPromise_ = function () {
        if (this.resolve_ !== null) {
            var triggered = true;
            switch (taskStateFromInternalTaskState(this.state_)) {
                case TaskState.SUCCESS:
                    async(this.resolve_.bind(null, this.snapshot))();
                    break;
                case TaskState.CANCELED:
                case TaskState.ERROR:
                    var toCall = this.reject_;
                    async(toCall.bind(null, this.error_))();
                    break;
                default:
                    triggered = false;
                    break;
            }
            if (triggered) {
                this.resolve_ = null;
                this.reject_ = null;
            }
        }
    };
    UploadTask.prototype.notifyObserver_ = function (observer) {
        var externalState = taskStateFromInternalTaskState(this.state_);
        switch (externalState) {
            case TaskState.RUNNING:
            case TaskState.PAUSED:
                if (observer.next !== null) {
                    async(observer.next.bind(observer, this.snapshot))();
                }
                break;
            case TaskState.SUCCESS:
                if (observer.complete !== null) {
                    async(observer.complete.bind(observer))();
                }
                break;
            case TaskState.CANCELED:
            case TaskState.ERROR:
                if (observer.error !== null) {
                    async(observer.error.bind(observer, this.error_))();
                }
                break;
            default:
                // TODO(andysoto): assert(false);
                if (observer.error !== null) {
                    async(observer.error.bind(observer, this.error_))();
                }
        }
    };
    /**
     * Resumes a paused task. Has no effect on a currently running or failed task.
     * @return True if the operation took effect, false if ignored.
     */
    UploadTask.prototype.resume = function () {
        validate('resume', [], arguments);
        var valid = this.state_ === InternalTaskState.PAUSED ||
            this.state_ === InternalTaskState.PAUSING;
        if (valid) {
            this.transition_(InternalTaskState.RUNNING);
        }
        return valid;
    };
    /**
     * Pauses a currently running task. Has no effect on a paused or failed task.
     * @return True if the operation took effect, false if ignored.
     */
    UploadTask.prototype.pause = function () {
        validate('pause', [], arguments);
        var valid = this.state_ === InternalTaskState.RUNNING;
        if (valid) {
            this.transition_(InternalTaskState.PAUSING);
        }
        return valid;
    };
    /**
     * Cancels a currently running or paused task. Has no effect on a complete or
     * failed task.
     * @return True if the operation took effect, false if ignored.
     */
    UploadTask.prototype.cancel = function () {
        validate('cancel', [], arguments);
        var valid = this.state_ === InternalTaskState.RUNNING ||
            this.state_ === InternalTaskState.PAUSING;
        if (valid) {
            this.transition_(InternalTaskState.CANCELING);
        }
        return valid;
    };
    return UploadTask;
}());

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
 * Provides methods to interact with a bucket in the Firebase Storage service.
 * @param location An fbs.location, or the URL at
 *     which to base this object, in one of the following forms:
 *         gs://<bucket>/<object-path>
 *         http[s]://firebasestorage.googleapis.com/
 *                     <api-version>/b/<bucket>/o/<object-path>
 *     Any query or fragment strings will be ignored in the http[s]
 *     format. If no value is passed, the storage object will use a URL based on
 *     the project ID of the base firebase.App instance.
 */
var Reference = /** @class */ (function () {
    function Reference(authWrapper, location) {
        this.authWrapper = authWrapper;
        if (location instanceof Location) {
            this.location = location;
        }
        else {
            this.location = Location.makeFromUrl(location);
        }
    }
    /**
     * @return The URL for the bucket and path this object references,
     *     in the form gs://<bucket>/<object-path>
     * @override
     */
    Reference.prototype.toString = function () {
        validate('toString', [], arguments);
        return 'gs://' + this.location.bucket + '/' + this.location.path;
    };
    Reference.prototype.newRef = function (authWrapper, location) {
        return new Reference(authWrapper, location);
    };
    Reference.prototype.mappings = function () {
        return getMappings();
    };
    /**
     * @return A reference to the object obtained by
     *     appending childPath, removing any duplicate, beginning, or trailing
     *     slashes.
     */
    Reference.prototype.child = function (childPath) {
        validate('child', [stringSpec()], arguments);
        var newPath = child(this.location.path, childPath);
        var location = new Location(this.location.bucket, newPath);
        return this.newRef(this.authWrapper, location);
    };
    Object.defineProperty(Reference.prototype, "parent", {
        /**
         * @return A reference to the parent of the
         *     current object, or null if the current object is the root.
         */
        get: function () {
            var newPath = parent(this.location.path);
            if (newPath === null) {
                return null;
            }
            var location = new Location(this.location.bucket, newPath);
            return this.newRef(this.authWrapper, location);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Reference.prototype, "root", {
        /**
         * @return An reference to the root of this
         *     object's bucket.
         */
        get: function () {
            var location = new Location(this.location.bucket, '');
            return this.newRef(this.authWrapper, location);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Reference.prototype, "bucket", {
        get: function () {
            return this.location.bucket;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Reference.prototype, "fullPath", {
        get: function () {
            return this.location.path;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Reference.prototype, "name", {
        get: function () {
            return lastComponent(this.location.path);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Reference.prototype, "storage", {
        get: function () {
            return this.authWrapper.service();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Uploads a blob to this object's location.
     * @param data The blob to upload.
     * @return An UploadTask that lets you control and
     *     observe the upload.
     */
    Reference.prototype.put = function (data, metadata) {
        if (metadata === void 0) { metadata = null; }
        validate('put', [uploadDataSpec(), metadataSpec(true)], arguments);
        this.throwIfRoot_('put');
        return new UploadTask(this, this.authWrapper, this.location, this.mappings(), new FbsBlob(data), metadata);
    };
    /**
     * Uploads a string to this object's location.
     * @param string The string to upload.
     * @param opt_format The format of the string to upload.
     * @return An UploadTask that lets you control and
     *     observe the upload.
     */
    Reference.prototype.putString = function (string, format, opt_metadata) {
        if (format === void 0) { format = StringFormat.RAW; }
        validate('putString', [
            stringSpec(),
            stringSpec(formatValidator, true),
            metadataSpec(true)
        ], arguments);
        this.throwIfRoot_('putString');
        var data = dataFromString(format, string);
        var metadata = clone(opt_metadata);
        if (!isDef(metadata['contentType']) && isDef(data.contentType)) {
            metadata['contentType'] = data.contentType;
        }
        return new UploadTask(this, this.authWrapper, this.location, this.mappings(), new FbsBlob(data.data, true), metadata);
    };
    /**
     * Deletes the object at this location.
     * @return A promise that resolves if the deletion succeeds.
     */
    Reference.prototype.delete = function () {
        validate('delete', [], arguments);
        this.throwIfRoot_('delete');
        var self = this;
        return this.authWrapper.getAuthToken().then(function (authToken) {
            var requestInfo = deleteObject(self.authWrapper, self.location);
            return self.authWrapper.makeRequest(requestInfo, authToken).getPromise();
        });
    };
    /**
     *     A promise that resolves with the metadata for this object. If this
     *     object doesn't exist or metadata cannot be retreived, the promise is
     *     rejected.
     */
    Reference.prototype.getMetadata = function () {
        validate('getMetadata', [], arguments);
        this.throwIfRoot_('getMetadata');
        var self = this;
        return this.authWrapper.getAuthToken().then(function (authToken) {
            var requestInfo = getMetadata(self.authWrapper, self.location, self.mappings());
            return self.authWrapper.makeRequest(requestInfo, authToken).getPromise();
        });
    };
    /**
     * Updates the metadata for this object.
     * @param metadata The new metadata for the object.
     *     Only values that have been explicitly set will be changed. Explicitly
     *     setting a value to null will remove the metadata.
     * @return A promise that resolves
     *     with the new metadata for this object.
     *     @see firebaseStorage.Reference.prototype.getMetadata
     */
    Reference.prototype.updateMetadata = function (metadata) {
        validate('updateMetadata', [metadataSpec()], arguments);
        this.throwIfRoot_('updateMetadata');
        var self = this;
        return this.authWrapper.getAuthToken().then(function (authToken) {
            var requestInfo = updateMetadata(self.authWrapper, self.location, metadata, self.mappings());
            return self.authWrapper.makeRequest(requestInfo, authToken).getPromise();
        });
    };
    /**
     * @return A promise that resolves with the download
     *     URL for this object.
     */
    Reference.prototype.getDownloadURL = function () {
        validate('getDownloadURL', [], arguments);
        this.throwIfRoot_('getDownloadURL');
        var self = this;
        return this.authWrapper.getAuthToken().then(function (authToken) {
            var requestInfo = getDownloadUrl(self.authWrapper, self.location, self.mappings());
            return self.authWrapper
                .makeRequest(requestInfo, authToken)
                .getPromise()
                .then(function (url) {
                if (url === null) {
                    throw noDownloadURL();
                }
                return url;
            });
        });
    };
    Reference.prototype.throwIfRoot_ = function (name) {
        if (this.location.path === '') {
            throw invalidRootOperation(name);
        }
    };
    return Reference;
}());

/**
 * A request whose promise always fails.
 * @struct
 * @template T
 */
var FailRequest = /** @class */ (function () {
    function FailRequest(error) {
        this.promise_ = reject(error);
    }
    /** @inheritDoc */
    FailRequest.prototype.getPromise = function () {
        return this.promise_;
    };
    /** @inheritDoc */
    FailRequest.prototype.cancel = function (appDelete) {
        if (appDelete === void 0) { appDelete = false; }
    };
    return FailRequest;
}());

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
 * @struct
 */
var RequestMap = /** @class */ (function () {
    function RequestMap() {
        this.map_ = {};
        this.id_ = minSafeInteger;
    }
    /**
     * Registers the given request with this map.
     * The request is unregistered when it completes.
     * @param r The request to register.
     */
    RequestMap.prototype.addRequest = function (r) {
        var id = this.id_;
        this.id_++;
        this.map_[id] = r;
        var self = this;
        function unmap() {
            delete self.map_[id];
        }
        r.getPromise().then(unmap, unmap);
    };
    /**
     * Cancels all registered requests.
     */
    RequestMap.prototype.clear = function () {
        forEach(this.map_, function (key, val) {
            if (val) {
                val.cancel(true);
            }
        });
        this.map_ = {};
    };
    return RequestMap;
}());

/**
 * @param app If null, getAuthToken always resolves with null.
 * @param service The storage service associated with this auth wrapper.
 *     Untyped to avoid circular type dependencies.
 * @struct
 */
var AuthWrapper = /** @class */ (function () {
    function AuthWrapper(app, maker, requestMaker, service, pool) {
        this.bucket_ = null;
        this.deleted_ = false;
        this.app_ = app;
        if (this.app_ !== null) {
            var options = this.app_.options;
            if (isDef(options)) {
                this.bucket_ = AuthWrapper.extractBucket_(options);
            }
        }
        this.storageRefMaker_ = maker;
        this.requestMaker_ = requestMaker;
        this.pool_ = pool;
        this.service_ = service;
        this.maxOperationRetryTime_ = defaultMaxOperationRetryTime;
        this.maxUploadRetryTime_ = defaultMaxUploadRetryTime;
        this.requestMap_ = new RequestMap();
    }
    AuthWrapper.extractBucket_ = function (config) {
        var bucketString = config[configOption] || null;
        if (bucketString == null) {
            return null;
        }
        var loc = Location.makeFromBucketSpec(bucketString);
        return loc.bucket;
    };
    AuthWrapper.prototype.getAuthToken = function () {
        // TODO(andysoto): remove ifDef checks after firebase-app implements stubs
        // (b/28673818).
        if (this.app_ !== null &&
            isDef(this.app_.INTERNAL) &&
            isDef(this.app_.INTERNAL.getToken)) {
            return this.app_.INTERNAL.getToken().then(function (response) {
                if (response !== null) {
                    return response.accessToken;
                }
                else {
                    return null;
                }
            }, function (_error) {
                return null;
            });
        }
        else {
            return resolve(null);
        }
    };
    AuthWrapper.prototype.bucket = function () {
        if (this.deleted_) {
            throw appDeleted();
        }
        else {
            return this.bucket_;
        }
    };
    /**
     * The service associated with this auth wrapper. Untyped to avoid circular
     * type dependencies.
     */
    AuthWrapper.prototype.service = function () {
        return this.service_;
    };
    /**
     * Returns a new firebaseStorage.Reference object referencing this AuthWrapper
     * at the given Location.
     * @param loc The Location.
     * @return Actually a firebaseStorage.Reference, typing not allowed
     *     because of circular dependency problems.
     */
    AuthWrapper.prototype.makeStorageReference = function (loc) {
        return this.storageRefMaker_(this, loc);
    };
    AuthWrapper.prototype.makeRequest = function (requestInfo, authToken) {
        if (!this.deleted_) {
            var request = this.requestMaker_(requestInfo, authToken, this.pool_);
            this.requestMap_.addRequest(request);
            return request;
        }
        else {
            return new FailRequest(appDeleted());
        }
    };
    /**
     * Stop running requests and prevent more from being created.
     */
    AuthWrapper.prototype.deleteApp = function () {
        this.deleted_ = true;
        this.app_ = null;
        this.requestMap_.clear();
    };
    AuthWrapper.prototype.maxUploadRetryTime = function () {
        return this.maxUploadRetryTime_;
    };
    AuthWrapper.prototype.setMaxUploadRetryTime = function (time) {
        this.maxUploadRetryTime_ = time;
    };
    AuthWrapper.prototype.maxOperationRetryTime = function () {
        return this.maxOperationRetryTime_;
    };
    AuthWrapper.prototype.setMaxOperationRetryTime = function (time) {
        this.maxOperationRetryTime_ = time;
    };
    return AuthWrapper;
}());

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
 * @param f May be invoked
 *     before the function returns.
 * @param callback Get all the arguments passed to the function
 *     passed to f, including the initial boolean.
 */
function start(f, callback, timeout) {
    // TODO(andysoto): make this code cleaner (probably refactor into an actual
    // type instead of a bunch of functions with state shared in the closure)
    var waitSeconds = 1;
    // Would type this as "number" but that doesn't work for Node so ¯\_(ツ)_/¯
    var timeoutId = null;
    var hitTimeout = false;
    var cancelState = 0;
    function canceled() {
        return cancelState === 2;
    }
    var triggeredCallback = false;
    function triggerCallback() {
        if (!triggeredCallback) {
            triggeredCallback = true;
            callback.apply(null, arguments);
        }
    }
    function callWithDelay(millis) {
        timeoutId = setTimeout(function () {
            timeoutId = null;
            f(handler, canceled());
        }, millis);
    }
    function handler(success) {
        var var_args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            var_args[_i - 1] = arguments[_i];
        }
        if (triggeredCallback) {
            return;
        }
        if (success) {
            triggerCallback.apply(null, arguments);
            return;
        }
        var mustStop = canceled() || hitTimeout;
        if (mustStop) {
            triggerCallback.apply(null, arguments);
            return;
        }
        if (waitSeconds < 64) {
            /* TODO(andysoto): don't back off so quickly if we know we're offline. */
            waitSeconds *= 2;
        }
        var waitMillis;
        if (cancelState === 1) {
            cancelState = 2;
            waitMillis = 0;
        }
        else {
            waitMillis = (waitSeconds + Math.random()) * 1000;
        }
        callWithDelay(waitMillis);
    }
    var stopped = false;
    function stop(wasTimeout) {
        if (stopped) {
            return;
        }
        stopped = true;
        if (triggeredCallback) {
            return;
        }
        if (timeoutId !== null) {
            if (!wasTimeout) {
                cancelState = 2;
            }
            clearTimeout(timeoutId);
            callWithDelay(0);
        }
        else {
            if (!wasTimeout) {
                cancelState = 1;
            }
        }
    }
    callWithDelay(0);
    setTimeout(function () {
        hitTimeout = true;
        stop(true);
    }, timeout);
    return stop;
}
/**
 * Stops the retry loop from repeating.
 * If the function is currently "in between" retries, it is invoked immediately
 * with the second parameter as "true". Otherwise, it will be invoked once more
 * after the current invocation finishes iff the current invocation would have
 * triggered another retry.
 */
function stop(id) {
    id(false);
}

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
 * @struct
 * @template T
 */
var NetworkRequest = /** @class */ (function () {
    function NetworkRequest(url, method, headers, body, successCodes, additionalRetryCodes, callback, errorCallback, timeout, progressCallback, pool) {
        this.pendingXhr_ = null;
        this.backoffId_ = null;
        this.resolve_ = null;
        this.reject_ = null;
        this.canceled_ = false;
        this.appDelete_ = false;
        this.url_ = url;
        this.method_ = method;
        this.headers_ = headers;
        this.body_ = body;
        this.successCodes_ = successCodes.slice();
        this.additionalRetryCodes_ = additionalRetryCodes.slice();
        this.callback_ = callback;
        this.errorCallback_ = errorCallback;
        this.progressCallback_ = progressCallback;
        this.timeout_ = timeout;
        this.pool_ = pool;
        var self = this;
        this.promise_ = make(function (resolve$$1, reject$$1) {
            self.resolve_ = resolve$$1;
            self.reject_ = reject$$1;
            self.start_();
        });
    }
    /**
     * Actually starts the retry loop.
     */
    NetworkRequest.prototype.start_ = function () {
        var self = this;
        function doTheRequest(backoffCallback, canceled$$1) {
            if (canceled$$1) {
                backoffCallback(false, new RequestEndStatus(false, null, true));
                return;
            }
            var xhr = self.pool_.createXhrIo();
            self.pendingXhr_ = xhr;
            function progressListener(progressEvent) {
                var loaded = progressEvent.loaded;
                var total = progressEvent.lengthComputable ? progressEvent.total : -1;
                if (self.progressCallback_ !== null) {
                    self.progressCallback_(loaded, total);
                }
            }
            if (self.progressCallback_ !== null) {
                xhr.addUploadProgressListener(progressListener);
            }
            xhr
                .send(self.url_, self.method_, self.body_, self.headers_)
                .then(function (xhr) {
                if (self.progressCallback_ !== null) {
                    xhr.removeUploadProgressListener(progressListener);
                }
                self.pendingXhr_ = null;
                xhr = xhr;
                var hitServer = xhr.getErrorCode() === ErrorCode.NO_ERROR;
                var status = xhr.getStatus();
                if (!hitServer || self.isRetryStatusCode_(status)) {
                    var wasCanceled = xhr.getErrorCode() === ErrorCode.ABORT;
                    backoffCallback(false, new RequestEndStatus(false, null, wasCanceled));
                    return;
                }
                var successCode = contains$1(self.successCodes_, status);
                backoffCallback(true, new RequestEndStatus(successCode, xhr));
            });
        }
        /**
         * @param requestWentThrough True if the request eventually went
         *     through, false if it hit the retry limit or was canceled.
         */
        function backoffDone(requestWentThrough, status) {
            var resolve$$1 = self.resolve_;
            var reject$$1 = self.reject_;
            var xhr = status.xhr;
            if (status.wasSuccessCode) {
                try {
                    var result = self.callback_(xhr, xhr.getResponseText());
                    if (isJustDef(result)) {
                        resolve$$1(result);
                    }
                    else {
                        resolve$$1();
                    }
                }
                catch (e) {
                    reject$$1(e);
                }
            }
            else {
                if (xhr !== null) {
                    var err = unknown();
                    err.setServerResponseProp(xhr.getResponseText());
                    if (self.errorCallback_) {
                        reject$$1(self.errorCallback_(xhr, err));
                    }
                    else {
                        reject$$1(err);
                    }
                }
                else {
                    if (status.canceled) {
                        var err = self.appDelete_
                            ? appDeleted()
                            : canceled();
                        reject$$1(err);
                    }
                    else {
                        var err = retryLimitExceeded();
                        reject$$1(err);
                    }
                }
            }
        }
        if (this.canceled_) {
            backoffDone(false, new RequestEndStatus(false, null, true));
        }
        else {
            this.backoffId_ = start(doTheRequest, backoffDone, this.timeout_);
        }
    };
    /** @inheritDoc */
    NetworkRequest.prototype.getPromise = function () {
        return this.promise_;
    };
    /** @inheritDoc */
    NetworkRequest.prototype.cancel = function (appDelete) {
        this.canceled_ = true;
        this.appDelete_ = appDelete || false;
        if (this.backoffId_ !== null) {
            stop(this.backoffId_);
        }
        if (this.pendingXhr_ !== null) {
            this.pendingXhr_.abort();
        }
    };
    NetworkRequest.prototype.isRetryStatusCode_ = function (status) {
        // The codes for which to retry came from this page:
        // https://cloud.google.com/storage/docs/exponential-backoff
        var isFiveHundredCode = status >= 500 && status < 600;
        var extraRetryCodes = [
            // Request Timeout: web server didn't receive full request in time.
            408,
            // Too Many Requests: you're getting rate-limited, basically.
            429
        ];
        var isExtraRetryCode = contains$1(extraRetryCodes, status);
        var isRequestSpecificRetryCode = contains$1(this.additionalRetryCodes_, status);
        return isFiveHundredCode || isExtraRetryCode || isRequestSpecificRetryCode;
    };
    return NetworkRequest;
}());
/**
 * A collection of information about the result of a network request.
 * @param opt_canceled Defaults to false.
 * @struct
 */
var RequestEndStatus = /** @class */ (function () {
    function RequestEndStatus(wasSuccessCode, xhr, opt_canceled) {
        this.wasSuccessCode = wasSuccessCode;
        this.xhr = xhr;
        this.canceled = !!opt_canceled;
    }
    return RequestEndStatus;
}());
function addAuthHeader_(headers, authToken) {
    if (authToken !== null && authToken.length > 0) {
        headers['Authorization'] = 'Firebase ' + authToken;
    }
}
function addVersionHeader_(headers) {
    var number = typeof firebase !== 'undefined' ? firebase.SDK_VERSION : 'AppManager';
    headers['X-Firebase-Storage-Version'] = 'webjs/' + number;
}
/**
 * @template T
 */
function makeRequest(requestInfo, authToken, pool) {
    var queryPart = makeQueryString(requestInfo.urlParams);
    var url = requestInfo.url + queryPart;
    var headers = clone(requestInfo.headers);
    addAuthHeader_(headers, authToken);
    addVersionHeader_(headers);
    return new NetworkRequest(url, requestInfo.method, headers, requestInfo.body, requestInfo.successCodes, requestInfo.additionalRetryCodes, requestInfo.handler, requestInfo.errorHandler, requestInfo.timeout, requestInfo.progressCallback, pool);
}

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
 * A service that provides firebaseStorage.Reference instances.
 * @param opt_url gs:// url to a custom Storage Bucket
 *
 * @struct
 */
var Service = /** @class */ (function () {
    function Service(app, pool, url) {
        this.bucket_ = null;
        function maker(authWrapper, loc) {
            return new Reference(authWrapper, loc);
        }
        this.authWrapper_ = new AuthWrapper(app, maker, makeRequest, this, pool);
        this.app_ = app;
        if (url != null) {
            this.bucket_ = Location.makeFromBucketSpec(url);
        }
        else {
            var authWrapperBucket = this.authWrapper_.bucket();
            if (authWrapperBucket != null) {
                this.bucket_ = new Location(authWrapperBucket, '');
            }
        }
        this.internals_ = new ServiceInternals(this);
    }
    /**
     * Returns a firebaseStorage.Reference for the given path in the default
     * bucket.
     */
    Service.prototype.ref = function (path) {
        function validator(path) {
            if (/^[A-Za-z]+:\/\//.test(path)) {
                throw 'Expected child path but got a URL, use refFromURL instead.';
            }
        }
        validate('ref', [stringSpec(validator, true)], arguments);
        if (this.bucket_ == null) {
            throw new Error('No Storage Bucket defined in Firebase Options.');
        }
        var ref = new Reference(this.authWrapper_, this.bucket_);
        if (path != null) {
            return ref.child(path);
        }
        else {
            return ref;
        }
    };
    /**
     * Returns a firebaseStorage.Reference object for the given absolute URL,
     * which must be a gs:// or http[s]:// URL.
     */
    Service.prototype.refFromURL = function (url) {
        function validator(p) {
            if (!/^[A-Za-z]+:\/\//.test(p)) {
                throw 'Expected full URL but got a child path, use ref instead.';
            }
            try {
                Location.makeFromUrl(p);
            }
            catch (e) {
                throw 'Expected valid full URL but got an invalid one.';
            }
        }
        validate('refFromURL', [stringSpec(validator, false)], arguments);
        return new Reference(this.authWrapper_, url);
    };
    Object.defineProperty(Service.prototype, "maxUploadRetryTime", {
        get: function () {
            return this.authWrapper_.maxUploadRetryTime();
        },
        enumerable: true,
        configurable: true
    });
    Service.prototype.setMaxUploadRetryTime = function (time) {
        validate('setMaxUploadRetryTime', [nonNegativeNumberSpec()], arguments);
        this.authWrapper_.setMaxUploadRetryTime(time);
    };
    Object.defineProperty(Service.prototype, "maxOperationRetryTime", {
        get: function () {
            return this.authWrapper_.maxOperationRetryTime();
        },
        enumerable: true,
        configurable: true
    });
    Service.prototype.setMaxOperationRetryTime = function (time) {
        validate('setMaxOperationRetryTime', [nonNegativeNumberSpec()], arguments);
        this.authWrapper_.setMaxOperationRetryTime(time);
    };
    Object.defineProperty(Service.prototype, "app", {
        get: function () {
            return this.app_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Service.prototype, "INTERNAL", {
        get: function () {
            return this.internals_;
        },
        enumerable: true,
        configurable: true
    });
    return Service;
}());
/**
 * @struct
 */
var ServiceInternals = /** @class */ (function () {
    function ServiceInternals(service) {
        this.service_ = service;
    }
    /**
     * Called when the associated app is deleted.
     * @see {!fbs.AuthWrapper.prototype.deleteApp}
     */
    ServiceInternals.prototype.delete = function () {
        this.service_.authWrapper_.deleteApp();
        return resolve(undefined);
    };
    return ServiceInternals;
}());

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
 * Type constant for Firebase Storage.
 */
var STORAGE_TYPE = 'storage';
function factory(app, unused, opt_url) {
    return new Service(app, new XhrIoPool(), opt_url);
}
function registerStorage(instance) {
    var namespaceExports = {
        // no-inline
        TaskState: TaskState,
        TaskEvent: TaskEvent,
        StringFormat: StringFormat,
        Storage: Service,
        Reference: Reference
    };
    instance.INTERNAL.registerService(STORAGE_TYPE, factory, namespaceExports, undefined, 
    // Allow multiple storage instances per app.
    true);
}
registerStorage(firebase);

exports.registerStorage = registerStorage;
