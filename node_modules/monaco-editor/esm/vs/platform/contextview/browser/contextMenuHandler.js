/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import './contextMenuHandler.css';
import { $ } from '../../../base/browser/builder.js';
import { combinedDisposable } from '../../../base/common/lifecycle.js';
import { StandardMouseEvent } from '../../../base/browser/mouseEvent.js';
import { ActionRunner } from '../../../base/common/actions.js';
import { Menu } from '../../../base/browser/ui/menu/menu.js';
var ContextMenuHandler = /** @class */ (function () {
    function ContextMenuHandler(element, contextViewService, telemetryService, notificationService) {
        this.setContainer(element);
        this.contextViewService = contextViewService;
        this.telemetryService = telemetryService;
        this.notificationService = notificationService;
        this.menuContainerElement = null;
    }
    ContextMenuHandler.prototype.setContainer = function (container) {
        var _this = this;
        if (this.$el) {
            this.$el.off(['click', 'mousedown']);
            this.$el = null;
        }
        if (container) {
            this.$el = $(container);
            this.$el.on('mousedown', function (e) { return _this.onMouseDown(e); });
        }
    };
    ContextMenuHandler.prototype.showContextMenu = function (delegate) {
        var _this = this;
        delegate.getActions().done(function (actions) {
            if (!actions.length) {
                return; // Don't render an empty context menu
            }
            _this.contextViewService.showContextView({
                getAnchor: function () { return delegate.getAnchor(); },
                canRelayout: false,
                render: function (container) {
                    _this.menuContainerElement = container;
                    var className = delegate.getMenuClassName ? delegate.getMenuClassName() : '';
                    if (className) {
                        container.className += ' ' + className;
                    }
                    var menuDisposables = [];
                    var actionRunner = delegate.actionRunner || new ActionRunner();
                    actionRunner.onDidBeforeRun(_this.onActionRun, _this, menuDisposables);
                    actionRunner.onDidRun(_this.onDidActionRun, _this, menuDisposables);
                    var menu = new Menu(container, actions, {
                        actionItemProvider: delegate.getActionItem,
                        context: delegate.getActionsContext ? delegate.getActionsContext() : null,
                        actionRunner: actionRunner,
                        getKeyBinding: delegate.getKeyBinding
                    });
                    menu.onDidCancel(function () { return _this.contextViewService.hideContextView(true); }, null, menuDisposables);
                    menu.onDidBlur(function () { return _this.contextViewService.hideContextView(true); }, null, menuDisposables);
                    menu.focus(!!delegate.autoSelectFirstItem);
                    return combinedDisposable(menuDisposables.concat([menu]));
                },
                onHide: function (didCancel) {
                    if (delegate.onHide) {
                        delegate.onHide(didCancel);
                    }
                    _this.menuContainerElement = null;
                }
            });
        });
    };
    ContextMenuHandler.prototype.onActionRun = function (e) {
        if (this.telemetryService) {
            /* __GDPR__
                "workbenchActionExecuted" : {
                    "id" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "from": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this.telemetryService.publicLog('workbenchActionExecuted', { id: e.action.id, from: 'contextMenu' });
        }
        this.contextViewService.hideContextView(false);
    };
    ContextMenuHandler.prototype.onDidActionRun = function (e) {
        if (e.error && this.notificationService) {
            this.notificationService.error(e.error);
        }
    };
    ContextMenuHandler.prototype.onMouseDown = function (e) {
        if (!this.menuContainerElement) {
            return;
        }
        var event = new StandardMouseEvent(e);
        var element = event.target;
        while (element) {
            if (element === this.menuContainerElement) {
                return;
            }
            element = element.parentElement;
        }
        this.contextViewService.hideContextView();
    };
    ContextMenuHandler.prototype.dispose = function () {
        this.setContainer(null);
    };
    return ContextMenuHandler;
}());
export { ContextMenuHandler };
