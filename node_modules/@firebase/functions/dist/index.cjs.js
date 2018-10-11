'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var tslib_1 = require('tslib');
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
 * Standard error codes for different ways a request can fail, as defined by:
 * https://github.com/googleapis/googleapis/blob/master/google/rpc/code.proto
 *
 * This map is used primarily to convert from a backend error code string to
 * a client SDK error code string, and make sure it's in the supported set.
 */
var errorCodeMap = {
    OK: 'ok',
    CANCELLED: 'cancelled',
    UNKNOWN: 'unknown',
    INVALID_ARGUMENT: 'invalid-argument',
    DEADLINE_EXCEEDED: 'deadline-exceeded',
    NOT_FOUND: 'not-found',
    ALREADY_EXISTS: 'already-exists',
    PERMISSION_DENIED: 'permission-denied',
    UNAUTHENTICATED: 'unauthenticated',
    RESOURCE_EXHAUSTED: 'resource-exhausted',
    FAILED_PRECONDITION: 'failed-precondition',
    ABORTED: 'aborted',
    OUT_OF_RANGE: 'out-of-range',
    UNIMPLEMENTED: 'unimplemented',
    INTERNAL: 'internal',
    UNAVAILABLE: 'unavailable',
    DATA_LOSS: 'data-loss'
};
/**
 * An explicit error that can be thrown from a handler to send an error to the
 * client that called the function.
 */
var HttpsErrorImpl = /** @class */ (function (_super) {
    tslib_1.__extends(HttpsErrorImpl, _super);
    function HttpsErrorImpl(code, message, details) {
        var _this = _super.call(this, message) || this;
        // This is a workaround for a bug in TypeScript when extending Error:
        // tslint:disable-next-line
        // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(_this, HttpsErrorImpl.prototype);
        _this.code = code;
        _this.details = details;
        return _this;
    }
    return HttpsErrorImpl;
}(Error));
/**
 * Takes an HTTP status code and returns the corresponding ErrorCode.
 * This is the standard HTTP status code -> error mapping defined in:
 * https://github.com/googleapis/googleapis/blob/master/google/rpc/code.proto
 *
 * @param status An HTTP status code.
 * @return The corresponding ErrorCode, or ErrorCode.UNKNOWN if none.
 */
function codeForHTTPStatus(status) {
    // Make sure any successful status is OK.
    if (status >= 200 && status < 300) {
        return 'ok';
    }
    switch (status) {
        case 0:
            // This can happen if the server returns 500.
            return 'internal';
        case 400:
            return 'invalid-argument';
        case 401:
            return 'unauthenticated';
        case 403:
            return 'permission-denied';
        case 404:
            return 'not-found';
        case 409:
            return 'aborted';
        case 429:
            return 'resource-exhausted';
        case 499:
            return 'cancelled';
        case 500:
            return 'internal';
        case 501:
            return 'unimplemented';
        case 503:
            return 'unavailable';
        case 504:
            return 'deadline-exceeded';
    }
    return 'unknown';
}
/**
 * Takes an HTTP response and returns the corresponding Error, if any.
 */
function _errorForResponse(status, bodyJSON, serializer) {
    var code = codeForHTTPStatus(status);
    // Start with reasonable defaults from the status code.
    var description = code;
    var details = undefined;
    // Then look through the body for explicit details.
    try {
        var errorJSON = bodyJSON.error;
        if (errorJSON) {
            var status_1 = errorJSON.status;
            if (typeof status_1 === 'string') {
                if (!errorCodeMap[status_1]) {
                    // They must've included an unknown error code in the body.
                    return new HttpsErrorImpl('internal', 'internal');
                }
                code = errorCodeMap[status_1];
            }
            // TODO(klimt): Add better default descriptions for error enums.
            // The default description needs to be updated for the new code.
            description = status_1;
            var message = errorJSON.message;
            if (typeof message === 'string') {
                description = message;
            }
            details = errorJSON.details;
            if (details !== undefined) {
                details = serializer.decode(details);
            }
        }
    }
    catch (e) {
        // If we couldn't parse explicit error data, that's fine.
    }
    if (code === 'ok') {
        // Technically, there's an edge case where a developer could explicitly
        // return an error code of OK, and we will treat it as success, but that
        // seems reasonable.
        return null;
    }
    return new HttpsErrorImpl(code, description, details);
}

/**
 * Helper class to get metadata that should be included with a function call.
 */
var ContextProvider = /** @class */ (function () {
    function ContextProvider(app) {
        this.app = app;
    }
    ContextProvider.prototype.getAuthToken = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var token, e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.app.INTERNAL.getToken()];
                    case 1:
                        token = _a.sent();
                        if (!token) {
                            return [2 /*return*/, undefined];
                        }
                        return [2 /*return*/, token.accessToken];
                    case 2:
                        e_1 = _a.sent();
                        // If there's any error when trying to get the auth token, leave it off.
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ContextProvider.prototype.getInstanceIdToken = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var messaging, token, e_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // HACK: Until we have a separate instanceId package, this is a quick way
                        // to load in the messaging instance for this app.
                        if (!this.app.messaging) {
                            return [2 /*return*/, undefined];
                        }
                        messaging = this.app.messaging();
                        return [4 /*yield*/, messaging.getToken()];
                    case 1:
                        token = _a.sent();
                        if (!token) {
                            return [2 /*return*/, undefined];
                        }
                        return [2 /*return*/, token];
                    case 2:
                        e_2 = _a.sent();
                        // We don't warn on this, because it usually means messaging isn't set up.
                        // console.warn('Failed to retrieve instance id token.', e);
                        // If there's any error when trying to get the token, leave it off.
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ContextProvider.prototype.getContext = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var authToken, instanceIdToken;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAuthToken()];
                    case 1:
                        authToken = _a.sent();
                        return [4 /*yield*/, this.getInstanceIdToken()];
                    case 2:
                        instanceIdToken = _a.sent();
                        return [2 /*return*/, { authToken: authToken, instanceIdToken: instanceIdToken }];
                }
            });
        });
    };
    return ContextProvider;
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
var LONG_TYPE = 'type.googleapis.com/google.protobuf.Int64Value';
var UNSIGNED_LONG_TYPE = 'type.googleapis.com/google.protobuf.UInt64Value';
function mapValues(o, f) {
    var result = {};
    for (var key in o) {
        if (o.hasOwnProperty(key)) {
            result[key] = f(o[key]);
        }
    }
    return result;
}
var Serializer = /** @class */ (function () {
    function Serializer() {
    }
    // Takes data and encodes it in a JSON-friendly way, such that types such as
    // Date are preserved.
    Serializer.prototype.encode = function (data) {
        var _this = this;
        if (data === null || data === undefined) {
            return null;
        }
        if (data instanceof Number) {
            data = data.valueOf();
        }
        if (typeof data === 'number' && isFinite(data)) {
            // Any number in JS is safe to put directly in JSON and parse as a double
            // without any loss of precision.
            return data;
        }
        if (data === true || data === false) {
            return data;
        }
        if (Object.prototype.toString.call(data) === '[object String]') {
            return data;
        }
        if (Array.isArray(data)) {
            return data.map(function (x) { return _this.encode(x); });
        }
        if (typeof data === 'function' || typeof data === 'object') {
            return mapValues(data, function (x) { return _this.encode(x); });
        }
        // If we got this far, the data is not encodable.
        throw new Error('Data cannot be encoded in JSON: ' + data);
    };
    // Takes data that's been encoded in a JSON-friendly form and returns a form
    // with richer datatypes, such as Dates, etc.
    Serializer.prototype.decode = function (json) {
        var _this = this;
        if (json === null) {
            return json;
        }
        if (json['@type']) {
            switch (json['@type']) {
                case LONG_TYPE:
                // Fall through and handle this the same as unsigned.
                case UNSIGNED_LONG_TYPE: {
                    // Technically, this could work return a valid number for malformed
                    // data if there was a number followed by garbage. But it's just not
                    // worth all the extra code to detect that case.
                    var value = parseFloat(json.value);
                    if (isNaN(value)) {
                        throw new Error('Data cannot be decoded from JSON: ' + json);
                    }
                    return value;
                }
                default: {
                    throw new Error('Data cannot be decoded from JSON: ' + json);
                }
            }
        }
        if (Array.isArray(json)) {
            return json.map(function (x) { return _this.decode(x); });
        }
        if (typeof json === 'function' || typeof json === 'object') {
            return mapValues(json, function (x) { return _this.decode(x); });
        }
        // Anything else is safe to return.
        return json;
    };
    return Serializer;
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
 * The main class for the Firebase Functions SDK.
 */
var Service = /** @class */ (function () {
    /**
     * Creates a new Functions service for the given app and (optional) region.
     * @param app_ The FirebaseApp to use.
     * @param region_ The region to call functions in.
     */
    function Service(app_, region_) {
        if (region_ === void 0) { region_ = 'us-central1'; }
        this.app_ = app_;
        this.region_ = region_;
        this.serializer = new Serializer();
        this.emulatorOrigin = null;
        this.contextProvider = new ContextProvider(app_);
    }
    Object.defineProperty(Service.prototype, "app", {
        get: function () {
            return this.app_;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the URL for a callable with the given name.
     * @param name The name of the callable.
     */
    Service.prototype._url = function (name) {
        var projectId = this.app_.options.projectId;
        var region = this.region_;
        if (this.emulatorOrigin !== null) {
            var origin = this.emulatorOrigin;
            return origin + "/" + projectId + "/" + region + "/" + name;
        }
        return "https://" + region + "-" + projectId + ".cloudfunctions.net/" + name;
    };
    /**
     * Changes this instance to point to a Cloud Functions emulator running
     * locally. See https://firebase.google.com/docs/functions/local-emulator
     *
     * @param origin The origin of the local emulator, such as
     * "http://localhost:5005".
     */
    Service.prototype.useFunctionsEmulator = function (origin) {
        this.emulatorOrigin = origin;
    };
    /**
     * Returns a reference to the callable https trigger with the given name.
     * @param name The name of the trigger.
     */
    Service.prototype.httpsCallable = function (name) {
        var _this = this;
        var callable = function (data) {
            return _this.call(name, data);
        };
        return callable;
    };
    /**
     * Does an HTTP POST and returns the completed response.
     * @param url The url to post to.
     * @param body The JSON body of the post.
     * @param headers The HTTP headers to include in the request.
     * @return A Promise that will succeed when the request finishes.
     */
    Service.prototype.postJSON = function (url, body, headers) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var response, e_1, json, e_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        headers.append('Content-Type', 'application/json');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetch(url, {
                                method: 'POST',
                                body: JSON.stringify(body),
                                headers: headers
                            })];
                    case 2:
                        response = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        // This could be an unhandled error on the backend, or it could be a
                        // network error. There's no way to no, since an unhandled error on the
                        // backend will fail to set the proper CORS header, and thus will be
                        // treated as a network error by fetch.
                        return [2 /*return*/, {
                                status: 0,
                                json: null
                            }];
                    case 4:
                        json = null;
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, response.json()];
                    case 6:
                        json = _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        e_2 = _a.sent();
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, {
                            status: response.status,
                            json: json
                        }];
                }
            });
        });
    };
    /**
     * Calls a callable function asynchronously and returns the result.
     * @param name The name of the callable trigger.
     * @param data The data to pass as params to the function.s
     */
    Service.prototype.call = function (name, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var url, body, headers, context, response, error, responseData, decodedData;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this._url(name);
                        // Encode any special types, such as dates, in the input data.
                        data = this.serializer.encode(data);
                        body = { data: data };
                        headers = new Headers();
                        return [4 /*yield*/, this.contextProvider.getContext()];
                    case 1:
                        context = _a.sent();
                        if (context.authToken) {
                            headers.append('Authorization', 'Bearer ' + context.authToken);
                        }
                        if (context.instanceIdToken) {
                            headers.append('Firebase-Instance-ID-Token', context.instanceIdToken);
                        }
                        return [4 /*yield*/, this.postJSON(url, body, headers)];
                    case 2:
                        response = _a.sent();
                        error = _errorForResponse(response.status, response.json, this.serializer);
                        if (error) {
                            throw error;
                        }
                        if (!response.json) {
                            throw new HttpsErrorImpl('internal', 'Response is not valid JSON object.');
                        }
                        responseData = response.json.data;
                        // TODO(klimt): For right now, allow "result" instead of "data", for
                        // backwards compatibility.
                        if (typeof responseData === 'undefined') {
                            responseData = response.json.result;
                        }
                        if (typeof responseData === 'undefined') {
                            // Consider the response malformed.
                            throw new HttpsErrorImpl('internal', 'Response is missing data field.');
                        }
                        decodedData = this.serializer.decode(responseData);
                        return [2 /*return*/, { data: decodedData }];
                }
            });
        });
    };
    return Service;
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
 * Type constant for Firebase Functions.
 */
var FUNCTIONS_TYPE = 'functions';
function factory(app, unused, region) {
    return new Service(app, region);
}
function registerFunctions(instance) {
    var namespaceExports = {
        // no-inline
        Functions: Service
    };
    instance.INTERNAL.registerService(FUNCTIONS_TYPE, factory, namespaceExports, 
    // We don't need to wait on any AppHooks.
    undefined, 
    // Allow multiple functions instances per app.
    true);
}
registerFunctions(firebase);

exports.registerFunctions = registerFunctions;
