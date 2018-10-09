/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { inputBackground, inputForeground, inputBorder, foreground, editorBackground, contrastBorder, listFocusBackground, listFocusForeground, listActiveSelectionBackground, listActiveSelectionForeground, listInactiveSelectionForeground, listInactiveSelectionBackground, listInactiveFocusBackground, listHoverBackground, listHoverForeground, listDropBackground, pickerGroupBorder, pickerGroupForeground, widgetShadow, inputValidationInfoBorder, inputValidationInfoBackground, inputValidationWarningBorder, inputValidationWarningBackground, inputValidationErrorBorder, inputValidationErrorBackground, activeContrastBorder, badgeBackground, badgeForeground, progressBarBackground } from './colorRegistry.js';
import { mixin } from '../../../base/common/objects.js';
export function computeStyles(theme, styleMap) {
    var styles = Object.create(null);
    for (var key in styleMap) {
        var value = styleMap[key];
        if (typeof value === 'string') {
            styles[key] = theme.getColor(value);
        }
        else if (typeof value === 'function') {
            styles[key] = value(theme);
        }
    }
    return styles;
}
export function attachStyler(themeService, styleMap, widgetOrCallback) {
    function applyStyles(theme) {
        var styles = computeStyles(themeService.getTheme(), styleMap);
        if (typeof widgetOrCallback === 'function') {
            widgetOrCallback(styles);
        }
        else {
            widgetOrCallback.style(styles);
        }
    }
    applyStyles(themeService.getTheme());
    return themeService.onThemeChange(applyStyles);
}
export function attachBadgeStyler(widget, themeService, style) {
    return attachStyler(themeService, {
        badgeBackground: (style && style.badgeBackground) || badgeBackground,
        badgeForeground: (style && style.badgeForeground) || badgeForeground,
        badgeBorder: contrastBorder
    }, widget);
}
export function attachQuickOpenStyler(widget, themeService, style) {
    return attachStyler(themeService, {
        foreground: (style && style.foreground) || foreground,
        background: (style && style.background) || editorBackground,
        borderColor: style && style.borderColor || contrastBorder,
        widgetShadow: style && style.widgetShadow || widgetShadow,
        progressBarBackground: style && style.progressBarBackground || progressBarBackground,
        pickerGroupForeground: style && style.pickerGroupForeground || pickerGroupForeground,
        pickerGroupBorder: style && style.pickerGroupBorder || pickerGroupBorder,
        inputBackground: (style && style.inputBackground) || inputBackground,
        inputForeground: (style && style.inputForeground) || inputForeground,
        inputBorder: (style && style.inputBorder) || inputBorder,
        inputValidationInfoBorder: (style && style.inputValidationInfoBorder) || inputValidationInfoBorder,
        inputValidationInfoBackground: (style && style.inputValidationInfoBackground) || inputValidationInfoBackground,
        inputValidationWarningBorder: (style && style.inputValidationWarningBorder) || inputValidationWarningBorder,
        inputValidationWarningBackground: (style && style.inputValidationWarningBackground) || inputValidationWarningBackground,
        inputValidationErrorBorder: (style && style.inputValidationErrorBorder) || inputValidationErrorBorder,
        inputValidationErrorBackground: (style && style.inputValidationErrorBackground) || inputValidationErrorBackground,
        listFocusBackground: (style && style.listFocusBackground) || listFocusBackground,
        listFocusForeground: (style && style.listFocusForeground) || listFocusForeground,
        listActiveSelectionBackground: (style && style.listActiveSelectionBackground) || listActiveSelectionBackground,
        listActiveSelectionForeground: (style && style.listActiveSelectionForeground) || listActiveSelectionForeground,
        listFocusAndSelectionBackground: style && style.listFocusAndSelectionBackground || listActiveSelectionBackground,
        listFocusAndSelectionForeground: (style && style.listFocusAndSelectionForeground) || listActiveSelectionForeground,
        listInactiveSelectionBackground: (style && style.listInactiveSelectionBackground) || listInactiveSelectionBackground,
        listInactiveSelectionForeground: (style && style.listInactiveSelectionForeground) || listInactiveSelectionForeground,
        listInactiveFocusBackground: (style && style.listInactiveFocusBackground) || listInactiveFocusBackground,
        listHoverBackground: (style && style.listHoverBackground) || listHoverBackground,
        listHoverForeground: (style && style.listHoverForeground) || listHoverForeground,
        listDropBackground: (style && style.listDropBackground) || listDropBackground,
        listFocusOutline: (style && style.listFocusOutline) || activeContrastBorder,
        listSelectionOutline: (style && style.listSelectionOutline) || activeContrastBorder,
        listHoverOutline: (style && style.listHoverOutline) || activeContrastBorder
    }, widget);
}
export function attachListStyler(widget, themeService, overrides) {
    return attachStyler(themeService, mixin(overrides || Object.create(null), defaultListStyles, false), widget);
}
export var defaultListStyles = {
    listFocusBackground: listFocusBackground,
    listFocusForeground: listFocusForeground,
    listActiveSelectionBackground: listActiveSelectionBackground,
    listActiveSelectionForeground: listActiveSelectionForeground,
    listFocusAndSelectionBackground: listActiveSelectionBackground,
    listFocusAndSelectionForeground: listActiveSelectionForeground,
    listInactiveSelectionBackground: listInactiveSelectionBackground,
    listInactiveSelectionForeground: listInactiveSelectionForeground,
    listInactiveFocusBackground: listInactiveFocusBackground,
    listHoverBackground: listHoverBackground,
    listHoverForeground: listHoverForeground,
    listDropBackground: listDropBackground,
    listFocusOutline: activeContrastBorder,
    listSelectionOutline: activeContrastBorder,
    listHoverOutline: activeContrastBorder
};
