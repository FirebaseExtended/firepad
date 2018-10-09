/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import './list.css';
import { range } from '../../../common/arrays.js';
import { List } from './listWidget.js';
var PagedRenderer = /** @class */ (function () {
    function PagedRenderer(renderer, modelProvider) {
        this.renderer = renderer;
        this.modelProvider = modelProvider;
    }
    Object.defineProperty(PagedRenderer.prototype, "templateId", {
        get: function () { return this.renderer.templateId; },
        enumerable: true,
        configurable: true
    });
    PagedRenderer.prototype.renderTemplate = function (container) {
        var data = this.renderer.renderTemplate(container);
        return { data: data, disposable: { dispose: function () { } } };
    };
    PagedRenderer.prototype.renderElement = function (index, _, data) {
        var _this = this;
        data.disposable.dispose();
        var model = this.modelProvider();
        if (model.isResolved(index)) {
            return this.renderer.renderElement(model.get(index), index, data.data);
        }
        var promise = model.resolve(index);
        data.disposable = { dispose: function () { return promise.cancel(); } };
        this.renderer.renderPlaceholder(index, data.data);
        promise.done(function (entry) { return _this.renderer.renderElement(entry, index, data.data); });
    };
    PagedRenderer.prototype.disposeElement = function () {
        // noop
    };
    PagedRenderer.prototype.disposeTemplate = function (data) {
        data.disposable.dispose();
        data.disposable = null;
        this.renderer.disposeTemplate(data.data);
        data.data = null;
    };
    return PagedRenderer;
}());
var PagedList = /** @class */ (function () {
    function PagedList(container, virtualDelegate, renderers, options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        var pagedRenderers = renderers.map(function (r) { return new PagedRenderer(r, function () { return _this.model; }); });
        this.list = new List(container, virtualDelegate, pagedRenderers, options);
    }
    PagedList.prototype.getHTMLElement = function () {
        return this.list.getHTMLElement();
    };
    PagedList.prototype.isDOMFocused = function () {
        return this.list.getHTMLElement() === document.activeElement;
    };
    Object.defineProperty(PagedList.prototype, "onDidFocus", {
        get: function () {
            return this.list.onDidFocus;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PagedList.prototype, "onDidDispose", {
        get: function () {
            return this.list.onDidDispose;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PagedList.prototype, "model", {
        get: function () {
            return this._model;
        },
        set: function (model) {
            this._model = model;
            this.list.splice(0, this.list.length, range(model.length));
        },
        enumerable: true,
        configurable: true
    });
    PagedList.prototype.getFocus = function () {
        return this.list.getFocus();
    };
    PagedList.prototype.dispose = function () {
        this.list.dispose();
    };
    return PagedList;
}());
export { PagedList };
