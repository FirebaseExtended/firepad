import * as monaco from "monaco-editor";

import { CursorWidget, ICursorWidget } from "./cursor-widget";
import { ClientIDType } from "./editor-adapter";
import { IDisposable } from "./utils";

export interface ICursorWidgetController extends IDisposable {
  /**
   * Add Cursor Widget for the first time for new User.
   * @param clientId - Unique Identifier for remote User.
   * @param range - Position of the Widget.
   * @param userColor - Border Color of the Widget.
   * @param userName - User's name to show up in Widget. (optional, default is set to User ID).
   */
  addCursor(
    clientId: ClientIDType,
    range: monaco.Range,
    userColor: string,
    userName?: string
  ): void;
  /**
   * Update Cursor Widget for existing User, or add a new Cursor Widget if new User.
   * @param clientId - Unique Identifier for remote User.
   * @param range - Position of the Widget.
   * @param userColor - Border Color of the Widget.
   * @param userName - User's name to show up in Widget. (optional, default is set to User ID).
   */
  updateCursor(
    clientId: ClientIDType,
    range: monaco.Range,
    userColor: string,
    userName?: string
  ): void;
  /**
   * Dispose Cursor Widget for existing User.
   * @param clientId - Unique Identifier for remote User.
   */
  removeCursor(clientId: ClientIDType): void;
}

export class CursorWidgetController implements ICursorWidgetController {
  protected readonly _cursors: Map<ClientIDType, ICursorWidget>;
  protected readonly _editor: monaco.editor.IStandaloneCodeEditor;
  protected readonly _tooltipDuration: number;

  constructor(editor: monaco.editor.IStandaloneCodeEditor) {
    this._editor = editor;
    this._tooltipDuration = 1000;
    this._cursors = new Map<ClientIDType, ICursorWidget>();
  }

  addCursor(
    clientId: ClientIDType,
    range: monaco.Range,
    userColor: string,
    userName?: string
  ): void {
    const cursorWidget = new CursorWidget({
      codeEditor: this._editor,
      widgetId: clientId,
      color: userColor,
      range,
      label: userName || clientId.toString(),
      tooltipDuration: this._tooltipDuration,
      onDisposed: () => {
        this.removeCursor(clientId);
      },
    });

    this._cursors.set(clientId, cursorWidget);
  }

  removeCursor(clientId: ClientIDType): void {
    const cursorWidget = this._cursors.get(clientId);

    if (!cursorWidget) {
      /** Already disposed, nothing to do here. */
      return;
    }

    cursorWidget.dispose();
    this._cursors.delete(clientId);
  }

  updateCursor(
    clientId: ClientIDType,
    range: monaco.Range,
    userColor: string,
    userName?: string
  ): void {
    const cursorWidget = this._cursors.get(clientId);

    if (cursorWidget) {
      /** Widget already present, simple update should suffice. */
      cursorWidget.updatePosition(range);
      cursorWidget.updateContent(userName);
      return;
    }

    this.addCursor(clientId, range, userColor, userName);
  }

  dispose(): void {
    this._cursors.forEach((cursorWidget: ICursorWidget) =>
      cursorWidget.dispose()
    );
    this._cursors.clear();
  }
}
