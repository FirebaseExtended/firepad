/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import './menu.css';
import * as nls from '../../../../nls.js';
import { Action } from '../../../common/actions.js';
import { ActionBar, ActionsOrientation, Separator, ActionItem, BaseActionItem } from '../actionbar/actionbar.js';
import { addClass, EventType, EventHelper, removeTabIndexAndUpdateFocus, isAncestor } from '../../dom.js';
import { StandardKeyboardEvent } from '../../keyboardEvent.js';
import { $ } from '../../builder.js';
import { RunOnceScheduler } from '../../../common/async.js';
var SubmenuAction = /** @class */ (function (_super) {
    __extends(SubmenuAction, _super);
    function SubmenuAction(label, entries, cssClass) {
        var _this = _super.call(this, !!cssClass ? cssClass : 'submenu', label, '', true) || this;
        _this.entries = entries;
        return _this;
    }
    return SubmenuAction;
}(Action));
export { SubmenuAction };
var Menu = /** @class */ (function () {
    function Menu(container, actions, options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        addClass(container, 'monaco-menu-container');
        container.setAttribute('role', 'presentation');
        var menuContainer = document.createElement('div');
        addClass(menuContainer, 'monaco-menu');
        menuContainer.setAttribute('role', 'presentation');
        container.appendChild(menuContainer);
        var parentData = {
            parent: this
        };
        this.actionBar = new ActionBar(menuContainer, {
            orientation: ActionsOrientation.VERTICAL,
            actionItemProvider: function (action) { return _this.doGetActionItem(action, options, parentData); },
            context: options.context,
            actionRunner: options.actionRunner,
            isMenu: true,
            ariaLabel: options.ariaLabel
        });
        this.actionBar.push(actions, { icon: true, label: true, isMenu: true });
    }
    Menu.prototype.doGetActionItem = function (action, options, parentData) {
        if (action instanceof Separator) {
            return new ActionItem(options.context, action, { icon: true });
        }
        else if (action instanceof SubmenuAction) {
            return new SubmenuActionItem(action, action.entries, parentData, options);
        }
        else {
            var menuItemOptions = {};
            if (options.getKeyBinding) {
                var keybinding = options.getKeyBinding(action);
                if (keybinding) {
                    menuItemOptions.keybinding = keybinding.getLabel();
                }
            }
            return new MenuActionItem(options.context, action, menuItemOptions);
        }
    };
    Object.defineProperty(Menu.prototype, "onDidCancel", {
        get: function () {
            return this.actionBar.onDidCancel;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Menu.prototype, "onDidBlur", {
        get: function () {
            return this.actionBar.onDidBlur;
        },
        enumerable: true,
        configurable: true
    });
    Menu.prototype.focus = function (selectFirst) {
        if (selectFirst === void 0) { selectFirst = true; }
        if (this.actionBar) {
            this.actionBar.focus(selectFirst);
        }
    };
    Menu.prototype.dispose = function () {
        if (this.actionBar) {
            this.actionBar.dispose();
            this.actionBar = null;
        }
        if (this.listener) {
            this.listener.dispose();
            this.listener = null;
        }
    };
    return Menu;
}());
export { Menu };
var MenuActionItem = /** @class */ (function (_super) {
    __extends(MenuActionItem, _super);
    function MenuActionItem(ctx, action, options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        options.isMenu = true;
        _this = _super.call(this, action, action, options) || this;
        _this.options = options;
        _this.options.icon = options.icon !== undefined ? options.icon : false;
        _this.options.label = options.label !== undefined ? options.label : true;
        _this.cssClass = '';
        return _this;
    }
    MenuActionItem.prototype.render = function (container) {
        _super.prototype.render.call(this, container);
        this.$e = $('a.action-menu-item').appendTo(this.builder);
        if (this._action.id === Separator.ID) {
            // A separator is a presentation item
            this.$e.attr({ role: 'presentation' });
        }
        else {
            this.$e.attr({ role: 'menuitem' });
        }
        this.$label = $('span.action-label').appendTo(this.$e);
        if (this.options.label && this.options.keybinding) {
            $('span.keybinding').text(this.options.keybinding).appendTo(this.$e);
        }
        this._updateClass();
        this._updateLabel();
        this._updateTooltip();
        this._updateEnabled();
        this._updateChecked();
    };
    MenuActionItem.prototype._updateLabel = function () {
        if (this.options.label) {
            var label = this.getAction().label;
            if (label) {
                var matches = MenuActionItem.MNEMONIC_REGEX.exec(label);
                if (matches && matches.length === 2) {
                    var mnemonic = matches[1];
                    var ariaLabel = label.replace(MenuActionItem.MNEMONIC_REGEX, mnemonic);
                    this.$e.getHTMLElement().accessKey = mnemonic.toLocaleLowerCase();
                    this.$label.attr('aria-label', ariaLabel);
                }
                else {
                    this.$label.attr('aria-label', label);
                }
                label = label.replace(MenuActionItem.MNEMONIC_REGEX, '$1\u0332');
            }
            this.$label.text(label);
        }
    };
    MenuActionItem.prototype._updateTooltip = function () {
        var title = null;
        if (this.getAction().tooltip) {
            title = this.getAction().tooltip;
        }
        else if (!this.options.label && this.getAction().label && this.options.icon) {
            title = this.getAction().label;
            if (this.options.keybinding) {
                title = nls.localize({ key: 'titleLabel', comment: ['action title', 'action keybinding'] }, "{0} ({1})", title, this.options.keybinding);
            }
        }
        if (title) {
            this.$e.attr({ title: title });
        }
    };
    MenuActionItem.prototype._updateClass = function () {
        if (this.cssClass) {
            this.$e.removeClass(this.cssClass);
        }
        if (this.options.icon) {
            this.cssClass = this.getAction().class;
            this.$label.addClass('icon');
            if (this.cssClass) {
                this.$label.addClass(this.cssClass);
            }
            this._updateEnabled();
        }
        else {
            this.$label.removeClass('icon');
        }
    };
    MenuActionItem.prototype._updateEnabled = function () {
        if (this.getAction().enabled) {
            this.builder.removeClass('disabled');
            this.$e.removeClass('disabled');
            this.$e.attr({ tabindex: 0 });
        }
        else {
            this.builder.addClass('disabled');
            this.$e.addClass('disabled');
            removeTabIndexAndUpdateFocus(this.$e.getHTMLElement());
        }
    };
    MenuActionItem.prototype._updateChecked = function () {
        if (this.getAction().checked) {
            this.$label.addClass('checked');
        }
        else {
            this.$label.removeClass('checked');
        }
    };
    MenuActionItem.MNEMONIC_REGEX = /&&(.)/g;
    return MenuActionItem;
}(BaseActionItem));
var SubmenuActionItem = /** @class */ (function (_super) {
    __extends(SubmenuActionItem, _super);
    function SubmenuActionItem(action, submenuActions, parentData, submenuOptions) {
        var _this = _super.call(this, action, action, { label: true, isMenu: true }) || this;
        _this.submenuActions = submenuActions;
        _this.parentData = parentData;
        _this.submenuOptions = submenuOptions;
        _this.showScheduler = new RunOnceScheduler(function () {
            if (_this.mouseOver) {
                _this.cleanupExistingSubmenu(false);
                _this.createSubmenu(false);
            }
        }, 250);
        _this.hideScheduler = new RunOnceScheduler(function () {
            if ((!isAncestor(document.activeElement, _this.builder.getHTMLElement()) && _this.parentData.submenu === _this.mysubmenu)) {
                _this.parentData.parent.focus(false);
                _this.cleanupExistingSubmenu(true);
            }
        }, 750);
        return _this;
    }
    SubmenuActionItem.prototype.render = function (container) {
        var _this = this;
        _super.prototype.render.call(this, container);
        this.$e.addClass('monaco-submenu-item');
        this.$e.attr('aria-haspopup', 'true');
        $('span.submenu-indicator').text('\u25B6').appendTo(this.$e);
        $(this.builder).on(EventType.KEY_UP, function (e) {
            var event = new StandardKeyboardEvent(e);
            if (event.equals(17 /* RightArrow */)) {
                EventHelper.stop(e, true);
                _this.createSubmenu(true);
            }
        });
        $(this.builder).on(EventType.KEY_DOWN, function (e) {
            var event = new StandardKeyboardEvent(e);
            if (event.equals(17 /* RightArrow */)) {
                EventHelper.stop(e, true);
            }
        });
        $(this.builder).on(EventType.MOUSE_OVER, function (e) {
            if (!_this.mouseOver) {
                _this.mouseOver = true;
                _this.showScheduler.schedule();
            }
        });
        $(this.builder).on(EventType.MOUSE_LEAVE, function (e) {
            _this.mouseOver = false;
        });
        $(this.builder).on(EventType.FOCUS_OUT, function (e) {
            if (!isAncestor(document.activeElement, _this.builder.getHTMLElement())) {
                _this.hideScheduler.schedule();
            }
        });
    };
    SubmenuActionItem.prototype.onClick = function (e) {
        // stop clicking from trying to run an action
        EventHelper.stop(e, true);
        this.createSubmenu(false);
    };
    SubmenuActionItem.prototype.cleanupExistingSubmenu = function (force) {
        if (this.parentData.submenu && (force || (this.parentData.submenu !== this.mysubmenu))) {
            this.parentData.submenu.dispose();
            this.parentData.submenu = null;
            if (this.submenuContainer) {
                this.submenuContainer.dispose();
                this.submenuContainer = null;
            }
        }
    };
    SubmenuActionItem.prototype.createSubmenu = function (selectFirstItem) {
        var _this = this;
        if (selectFirstItem === void 0) { selectFirstItem = true; }
        if (!this.parentData.submenu) {
            this.submenuContainer = $(this.builder).div({ class: 'monaco-submenu menubar-menu-items-holder context-view' });
            $(this.submenuContainer).style({
                'left': $(this.builder).getClientArea().width + "px"
            });
            $(this.submenuContainer).on(EventType.KEY_UP, function (e) {
                var event = new StandardKeyboardEvent(e);
                if (event.equals(15 /* LeftArrow */)) {
                    EventHelper.stop(e, true);
                    _this.parentData.parent.focus();
                    _this.parentData.submenu.dispose();
                    _this.parentData.submenu = null;
                    _this.submenuContainer.dispose();
                    _this.submenuContainer = null;
                }
            });
            $(this.submenuContainer).on(EventType.KEY_DOWN, function (e) {
                var event = new StandardKeyboardEvent(e);
                if (event.equals(15 /* LeftArrow */)) {
                    EventHelper.stop(e, true);
                }
            });
            this.parentData.submenu = new Menu(this.submenuContainer.getHTMLElement(), this.submenuActions, this.submenuOptions);
            this.parentData.submenu.focus(selectFirstItem);
            this.mysubmenu = this.parentData.submenu;
        }
        else {
            this.parentData.submenu.focus(false);
        }
    };
    SubmenuActionItem.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.hideScheduler.dispose();
        if (this.mysubmenu) {
            this.mysubmenu.dispose();
            this.mysubmenu = null;
        }
        if (this.submenuContainer) {
            this.submenuContainer.dispose();
            this.submenuContainer = null;
        }
    };
    return SubmenuActionItem;
}(MenuActionItem));
