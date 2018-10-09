/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { TPromise } from '../../../base/common/winjs.base.js';
export var NullTelemetryService = new /** @class */ (function () {
    function class_1() {
    }
    class_1.prototype.publicLog = function (eventName, data) {
        return TPromise.wrap(null);
    };
    class_1.prototype.getTelemetryInfo = function () {
        return TPromise.wrap({
            instanceId: 'someValue.instanceId',
            sessionId: 'someValue.sessionId',
            machineId: 'someValue.machineId'
        });
    };
    return class_1;
}());
