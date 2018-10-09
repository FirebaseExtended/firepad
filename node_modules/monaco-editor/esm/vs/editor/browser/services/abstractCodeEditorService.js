/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { Emitter } from '../../../base/common/event.js';
var AbstractCodeEditorService = /** @class */ (function () {
    function AbstractCodeEditorService() {
        this._codeEditors = Object.create(null);
        this._diffEditors = Object.create(null);
        this._onCodeEditorAdd = new Emitter();
        this._onCodeEditorRemove = new Emitter();
        this._onDiffEditorAdd = new Emitter();
        this._onDiffEditorRemove = new Emitter();
    }
    AbstractCodeEditorService.prototype.addCodeEditor = function (editor) {
        this._codeEditors[editor.getId()] = editor;
        this._onCodeEditorAdd.fire(editor);
    };
    Object.defineProperty(AbstractCodeEditorService.prototype, "onCodeEditorAdd", {
        get: function () {
            return this._onCodeEditorAdd.event;
        },
        enumerable: true,
        configurable: true
    });
    AbstractCodeEditorService.prototype.removeCodeEditor = function (editor) {
        if (delete this._codeEditors[editor.getId()]) {
            this._onCodeEditorRemove.fire(editor);
        }
    };
    AbstractCodeEditorService.prototype.listCodeEditors = function () {
        var _this = this;
        return Object.keys(this._codeEditors).map(function (id) { return _this._codeEditors[id]; });
    };
    AbstractCodeEditorService.prototype.addDiffEditor = function (editor) {
        this._diffEditors[editor.getId()] = editor;
        this._onDiffEditorAdd.fire(editor);
    };
    AbstractCodeEditorService.prototype.removeDiffEditor = function (editor) {
        if (delete this._diffEditors[editor.getId()]) {
            this._onDiffEditorRemove.fire(editor);
        }
    };
    AbstractCodeEditorService.prototype.listDiffEditors = function () {
        var _this = this;
        return Object.keys(this._diffEditors).map(function (id) { return _this._diffEditors[id]; });
    };
    AbstractCodeEditorService.prototype.getFocusedCodeEditor = function () {
        var editorWithWidgetFocus = null;
        var editors = this.listCodeEditors();
        for (var i = 0; i < editors.length; i++) {
            var editor = editors[i];
            if (editor.hasTextFocus()) {
                // bingo!
                return editor;
            }
            if (editor.hasWidgetFocus()) {
                editorWithWidgetFocus = editor;
            }
        }
        return editorWithWidgetFocus;
    };
    return AbstractCodeEditorService;
}());
export { AbstractCodeEditorService };
