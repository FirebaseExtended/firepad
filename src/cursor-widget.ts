/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the Monaco Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */

import * as monaco from "monaco-editor";

import { ClientIDType } from "./editor-adapter";
import * as Utils from "./utils";

type OnDisposed = Utils.VoidFunctionType;

export interface ICursorWidgetConstructorOptions {
  codeEditor: monaco.editor.ICodeEditor;
  widgetId: ClientIDType;
  color: string;
  label: string;
  range: monaco.Range;
  tooltipDuration?: number;
  opacity?: string;
  onDisposed: OnDisposed;
}

export interface ICursorWidget
  extends monaco.editor.IContentWidget,
    Utils.IDisposable {
  /**
   * Update Widget position according to the Cursor position.
   * @param range - Current Position of the Cursor.
   */
  updatePosition(range: monaco.Range): void;
  /**
   * Update Widget content when Username changes.
   * @param userName - New Username of the current User.
   */
  updateContent(userName?: string): void;

  /**
   * Returns whether the widget was disposed or not.
   */
  isDisposed(): boolean;
}

/**
 * This class implements a Monaco Content Widget to render a remote user's
 * name in a tooltip.
 */
export class CursorWidget implements ICursorWidget {
  protected readonly _id: string;
  protected readonly _editor: monaco.editor.ICodeEditor;
  protected readonly _domNode: HTMLElement;
  protected readonly _tooltipDuration: number;
  protected readonly _scrollListener: monaco.IDisposable | null;
  protected readonly _onDisposed: OnDisposed;

  protected _tooltipNode: HTMLElement;
  protected _color: string;
  protected _content: string;
  protected _opacity: string;
  protected _position: monaco.editor.IContentWidgetPosition | null;
  protected _hideTimer: any;
  protected _disposed: boolean;

  static readonly WIDGET_NODE_CLASSNAME = "firepad-remote-cursor";
  static readonly TOOLTIP_NODE_CLASSNAME = "firepad-remote-cursor-message";

  constructor({
    codeEditor,
    widgetId,
    color,
    label,
    range,
    tooltipDuration = 1000,
    opacity = "1.0",
    onDisposed,
  }: ICursorWidgetConstructorOptions) {
    this._editor = codeEditor;
    this._tooltipDuration = tooltipDuration;
    this._id = `monaco-remote-cursor-${widgetId}`;
    this._onDisposed = onDisposed;
    this._color = color;
    this._content = label;
    this._opacity = opacity;

    this._domNode = this._createWidgetNode();

    // we only need to listen to scroll positions to update the
    // tooltip location on scrolling.
    this._scrollListener = this._editor.onDidScrollChange(() => {
      this._updateTooltipPosition();
    });

    this.updatePosition(range);

    this._hideTimer = null;
    this._editor.addContentWidget(this);

    this._disposed = false;
  }

  getId(): string {
    return this._id;
  }

  getDomNode(): HTMLElement {
    return this._domNode;
  }

  getPosition(): monaco.editor.IContentWidgetPosition | null {
    return this._position;
  }

  updatePosition(range: monaco.Range): void {
    this._updatePosition(range);
    setTimeout(() => this._showTooltip(), 0);
  }

  updateContent(userName?: string): void {
    if (typeof userName !== "string" || userName === this._content) {
      return;
    }
    this._tooltipNode.textContent = userName;
  }

  dispose(): void {
    if (this._disposed) {
      return;
    }

    this._editor.removeContentWidget(this);
    if (this._scrollListener !== null) {
      this._scrollListener.dispose();
    }

    this._disposed = true;
    this._onDisposed();
  }

  isDisposed(): boolean {
    return this._disposed;
  }

  protected _updatePosition(range: monaco.Range): void {
    this._position = {
      position: range.getEndPosition(),
      preference: [
        monaco.editor.ContentWidgetPositionPreference.ABOVE,
        monaco.editor.ContentWidgetPositionPreference.BELOW,
      ],
    };

    this._editor.layoutContentWidget(this);
  }

  protected _showTooltip(): void {
    this._updateTooltipPosition();

    if (this._hideTimer !== null) {
      clearTimeout(this._hideTimer);
    } else {
      this._setTooltipVisible(true);
    }

    this._hideTimer = setTimeout(() => {
      this._setTooltipVisible(false);
      this._hideTimer = null;
    }, this._tooltipDuration);
  }

  protected _updateTooltipPosition(): void {
    const distanceFromTop =
      this._domNode.offsetTop - this._editor.getScrollTop();
    if (distanceFromTop - this._tooltipNode.offsetHeight < 5) {
      this._tooltipNode.style.top = `${this._tooltipNode.offsetHeight + 2}px`;
    } else {
      this._tooltipNode.style.top = `-${this._tooltipNode.offsetHeight}px`;
    }

    this._tooltipNode.style.left = "0";
  }

  protected _setTooltipVisible(visible: boolean): void {
    if (visible) {
      this._tooltipNode.style.display = "block";
    } else {
      this._tooltipNode.style.display = "none";
    }
  }

  protected _colorWithCSSVars(property: string): string {
    const varName = `--color-${property}-${CursorWidget.WIDGET_NODE_CLASSNAME}`;
    return `var(${varName}, ${this._color})`;
  }

  protected _getTextColor(): string {
    const rgb = Utils.hexToRgb(this._color);
    const brightness = Math.round(
      (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000
    );

    return brightness >= 125 ? "#000000" : "#ffffff";
  }

  protected _createTooltipNode(): HTMLElement {
    const tooltipNode = document.createElement("div");

    tooltipNode.style.borderColor = this._colorWithCSSVars("border");
    tooltipNode.style.backgroundColor = this._colorWithCSSVars("bg");
    tooltipNode.style.color = this._getTextColor();
    tooltipNode.style.opacity = this._opacity;
    tooltipNode.style.borderRadius = "2px";
    tooltipNode.style.fontSize = "12px";
    tooltipNode.style.padding = "2px 8px";
    tooltipNode.style.whiteSpace = "nowrap";

    tooltipNode.textContent = this._content;

    const className = `${
      CursorWidget.TOOLTIP_NODE_CLASSNAME
    }-${this._color.replace("#", "")}`;
    tooltipNode.classList.add(className, CursorWidget.TOOLTIP_NODE_CLASSNAME);

    return tooltipNode;
  }

  protected _createWidgetNode(): HTMLElement {
    Utils.validateTruth(document != null, "This package must run on browser!");

    const widgetNode = document.createElement("div");
    widgetNode.style.height = "20px";
    widgetNode.style.paddingBottom = "0px";
    widgetNode.style.transition = "all 0.1s linear";

    this._tooltipNode = this._createTooltipNode();
    widgetNode.appendChild(this._tooltipNode);

    widgetNode.classList.add(
      "monaco-editor-overlaymessage",
      CursorWidget.WIDGET_NODE_CLASSNAME
    );

    return widgetNode;
  }
}
