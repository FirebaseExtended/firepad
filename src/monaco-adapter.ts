import * as monaco from "monaco-editor";

import { Cursor, ICursor } from "./cursor";
import {
  CursorWidgetController,
  ICursorWidgetController,
} from "./cursor-widget-controller";
import {
  ClientIDType,
  EditorAdapterEvent,
  EditorEventCallbackType,
  IEditorAdapter,
  IEditorAdapterEvent,
  UndoRedoCallbackType,
} from "./editor-adapter";
import { EventEmitter, EventListenerType, IEventEmitter } from "./emitter";
import { ITextOp } from "./text-op";
import { ITextOperation, TextOperation } from "./text-operation";
import * as Utils from "./utils";

interface IRemoteCursor {
  clientID: ClientIDType;
  decoration: string[];
}

interface ITextModelWithUndoRedo extends monaco.editor.ITextModel {
  undo: UndoRedoCallbackType | null;
  redo: UndoRedoCallbackType | null;
}

export class MonacoAdapter implements IEditorAdapter {
  protected readonly _monaco: monaco.editor.IStandaloneCodeEditor;
  protected readonly _classNames: string[];
  protected readonly _disposables: monaco.IDisposable[];
  protected readonly _remoteCursors: Map<ClientIDType, IRemoteCursor>;
  protected readonly _cursorWidgetController: ICursorWidgetController;

  protected _ignoreChanges: boolean;
  protected _lastDocLines: string[];
  protected _lastCursorRange: monaco.Selection | null;
  protected _emitter: IEventEmitter | null;
  protected _undoCallback: UndoRedoCallbackType | null;
  protected _redoCallback: UndoRedoCallbackType | null;
  protected _originalUndo: UndoRedoCallbackType | null;
  protected _originalRedo: UndoRedoCallbackType | null;
  protected _initiated: boolean;

  /**
   * Wraps a monaco editor in adapter to work with rest of Firepad
   * @param monacoInstance - Monaco Standalone Code Editor instance
   * @param avoidListeners - Whether or not propagate changes from editor (optional, defaults to `True`)
   */
  constructor(
    monacoInstance: monaco.editor.IStandaloneCodeEditor,
    avoidListeners: boolean = true
  ) {
    this._classNames = [];
    this._disposables = [];
    this._monaco = monacoInstance;
    this._lastDocLines = this._monaco.getModel()?.getLinesContent() || [""];
    this._lastCursorRange = this._monaco.getSelection();
    this._remoteCursors = new Map<ClientIDType, IRemoteCursor>();
    this._cursorWidgetController = new CursorWidgetController(this._monaco);

    this._redoCallback = null;
    this._undoCallback = null;
    this._originalRedo = null;
    this._originalUndo = null;
    this._ignoreChanges = false;

    if (!avoidListeners) {
      this._init();
    }
  }

  protected _init(): void {
    this._emitter = new EventEmitter([
      EditorAdapterEvent.Blur,
      EditorAdapterEvent.Change,
      EditorAdapterEvent.CursorActivity,
      EditorAdapterEvent.Error,
      EditorAdapterEvent.Focus,
      EditorAdapterEvent.Redo,
      EditorAdapterEvent.Undo,
    ]);

    this._disposables.push(
      this._cursorWidgetController,
      this._monaco.onDidBlurEditorWidget(() => {
        this._onBlur();
      }),
      this._monaco.onDidFocusEditorWidget(() => {
        this._onFocus();
      }),
      this._monaco.onDidChangeModel((ev: monaco.editor.IModelChangedEvent) => {
        this._onModelChange(ev);
      }),
      this._monaco.onDidChangeModelContent(
        (ev: monaco.editor.IModelContentChangedEvent) => {
          this._onChange(ev);
        }
      ),
      this._monaco.onDidChangeCursorPosition(
        (ev: monaco.editor.ICursorPositionChangedEvent) => {
          this._onCursorActivity(ev);
        }
      )
    );
  }

  dispose(): void {
    this._remoteCursors.clear();
    this._disposables.forEach((disposable) => disposable.dispose());
    this._disposables.splice(0, this._disposables.length);

    if (this._emitter) {
      this._emitter.dispose();
      this._emitter = null;
    }

    const model = this._getModel();
    if (!model) {
      return;
    }

    if (model.undo !== this._originalUndo) {
      model.undo = this._originalUndo;
    }

    if (model.redo !== this._originalRedo) {
      model.redo = this._originalRedo;
    }

    this._originalUndo = null;
    this._originalRedo = null;
  }

  /**
   * Returns the Text Model associated with the Editor
   */
  protected _getModel(): ITextModelWithUndoRedo | null {
    return this._monaco.getModel() as ITextModelWithUndoRedo;
  }

  registerUndo(callback: UndoRedoCallbackType): void {
    const model = this._getModel();

    if (!model) {
      return;
    }

    this._originalUndo = model.undo;
    model.undo = this._undoCallback = callback;
  }

  registerRedo(callback: UndoRedoCallbackType): void {
    const model = this._getModel();

    if (!model) {
      return;
    }

    this._originalRedo = model.redo;
    model.redo = this._redoCallback = callback;
  }

  on(
    event: EditorAdapterEvent,
    listener: EventListenerType<IEditorAdapterEvent>
  ): void {
    return this._emitter?.on(event, listener);
  }

  off(
    event: EditorAdapterEvent,
    listener: EventListenerType<IEditorAdapterEvent>
  ): void {
    return this._emitter?.off(event, listener);
  }

  registerCallbacks(callbacks: EditorEventCallbackType): void {
    Object.entries(callbacks).forEach(([event, listener]) => {
      this.on(
        event as EditorAdapterEvent,
        listener as EventListenerType<IEditorAdapterEvent>
      );
    });
  }

  protected _trigger(
    event: EditorAdapterEvent,
    eventArgs: IEditorAdapterEvent | void,
    ...extraArgs: unknown[]
  ): void {
    return this._emitter?.trigger(event, eventArgs || {}, ...extraArgs);
  }

  getCursor(): ICursor | null {
    const model = this._getModel();

    if (!model) {
      return null;
    }

    let selection = this._monaco.getSelection();

    /** Fallback to last cursor change */
    if (selection == null) {
      selection = this._lastCursorRange!;
    }

    /** Obtain selection indexes */
    const startPos = selection.getStartPosition();
    const endPos = selection.getEndPosition();

    let start = model.getOffsetAt(startPos);
    let end = model.getOffsetAt(endPos);

    /** If Selection is Inversed */
    if (start > end) {
      [start, end] = [end, start];
    }

    /** Return cursor position */
    return new Cursor(start, end);
  }

  setCursor(cursor: ICursor): void {
    const { position, selectionEnd } = cursor.toJSON();

    const model = this._getModel();

    if (!model) {
      return;
    }

    let start = model.getPositionAt(position);
    let end = model.getPositionAt(selectionEnd);

    /** If selection is inversed */
    if (position > selectionEnd) {
      [start, end] = [end, start];
    }

    /** Create Selection in the Editor */
    this._monaco.setSelection(
      new monaco.Range(
        start.lineNumber,
        start.column,
        end.lineNumber,
        end.column
      )
    );
  }

  setOtherCursor(
    clientID: ClientIDType,
    cursor: ICursor,
    userColor: string,
    userName?: string
  ): Utils.IDisposable {
    /** House Keeping */
    Utils.validateTruth(
      typeof cursor === "object" &&
        typeof cursor.toJSON === "function" &&
        typeof userColor === "string" &&
        (typeof clientID === "string" || typeof clientID === "number") &&
        !!userColor.match(/^#[a-fA-F0-9]{3,6}$/)
    );

    /** Extract Positions */
    const { position, selectionEnd } = cursor.toJSON();
    Utils.validateFalse(position < 0 || selectionEnd < 0);

    /** Fetch Client Cursor Information */
    let remoteCursor: IRemoteCursor | void = this._remoteCursors.get(clientID);

    if (!remoteCursor) {
      /** Initialize empty array, if client does not exist */
      remoteCursor = {
        clientID,
        decoration: [],
      };
      this._remoteCursors.set(clientID, remoteCursor);
    } else {
      /** Remove Earlier Decorations, if any, or initialize empty decor */
      remoteCursor.decoration = this._monaco.deltaDecorations(
        remoteCursor.decoration,
        []
      );
    }

    let selectionColor = userColor;
    let className = `remote-client-selection-${userColor.replace("#", "")}`;

    if (position === selectionEnd) {
      /** It's a single cursor */
      selectionColor = "transparent";
      className = className.replace("selection", "cursor");
    }

    /** Generate Style rules and add them to document */
    this._addStyleRule(className, selectionColor, userColor);

    /** Get co-ordinate position in Editor */
    const model = this._getModel();

    if (!model) {
      return {
        dispose: Utils.noop,
      };
    }

    let start = model.getPositionAt(position);
    let end = model.getPositionAt(selectionEnd);

    /** Selection is inverted */
    if (start > end) {
      [start, end] = [end, start];
    }

    /** Find Range of Selection */
    const range = new monaco.Range(
      start.lineNumber,
      start.column,
      end.lineNumber,
      end.column
    );

    /** Add decoration to the Editor */
    remoteCursor.decoration = this._monaco.deltaDecorations(
      remoteCursor.decoration,
      [
        {
          range,
          options: {
            className,
            isWholeLine: false,
            stickiness:
              monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          },
        },
      ]
    );

    this._cursorWidgetController.updateCursor(
      clientID,
      range,
      userColor,
      userName
    );

    return {
      dispose: () => {
        const cursor: IRemoteCursor | void = this._remoteCursors.get(clientID);

        if (!cursor) {
          // Already disposed, nothing to do.
          return;
        }

        // Dispose delta decoration added.
        cursor.decoration = this._monaco.deltaDecorations(
          cursor.decoration,
          []
        );

        // Dont remove the name tooltip like below, else it will cause flicker as you type
        // this._cursorWidgetController.removeCursor(clientID);
      },
    };
  }

  getText(): string {
    const model = this._getModel();

    if (model) {
      return model.getValue();
    }

    return "";
  }

  setText(text: string): void {
    const model = this._getModel();

    if (!model) {
      return;
    }

    model.applyEdits([
      {
        range: model.getFullModelRange(),
        text,
      },
    ]);
  }

  setInitiated(init: boolean): void {
    // Perfomance boost on clearing editor after network calls (do not directly setValue or EOL will get reset and break sync)
    this.setText("");
    this._initiated = init;
  }

  /**
   * Returns content from editor for given range or whole content.
   * @param range - Range of the editor to pick content from (optional).
   */
  protected _getPreviousContentInRange(range?: monaco.Range): string {
    const model = this._getModel();
    const eol = model ? model.getEOL() : Utils.EndOfLineSequence.LF;

    if (!range) {
      return this._lastDocLines.join(eol);
    }

    if (range.isEmpty()) {
      return "";
    }

    let val: string = "";

    const { startLineNumber, startColumn, endLineNumber, endColumn } = range;

    for (let i = startLineNumber; i <= endLineNumber; i++) {
      const line = this._lastDocLines[i - 1];

      if (i === startLineNumber) {
        if (i === endLineNumber) {
          return line.slice(startColumn - 1, endColumn - 1);
        }

        val += line.slice(startColumn - 1) + eol;
      } else if (i === endLineNumber) {
        val += line.slice(0, endColumn - 1);
      } else {
        val += line + eol;
      }
    }

    return val;
  }

  /**
   * Transforms Individual Text Operations into Edit Operations for Monaco.
   * @param ops - List of Individual Text Operations.
   * @param model - Monaco Text Model.
   */
  protected _transformOpsIntoMonacoChanges(
    ops: ITextOp[],
    model: monaco.editor.ITextModel
  ): monaco.editor.IIdentifiedSingleEditOperation[] {
    let index = 0;
    const changes: monaco.editor.IIdentifiedSingleEditOperation[] = [];

    for (const op of ops) {
      /** Retain Operation */
      if (op.isRetain()) {
        index += op.chars!;
        continue;
      }

      if (op.isInsert()) {
        /** Insert Operation */
        const pos = model.getPositionAt(index);
        changes.push({
          range: new monaco.Range(
            pos.lineNumber,
            pos.column,
            pos.lineNumber,
            pos.column
          ),
          text: op.text!,
          forceMoveMarkers: true,
        });
        continue;
      }

      if (op.isDelete()) {
        /** Delete Operation */
        const from = model.getPositionAt(index);
        const to = model.getPositionAt(index + op.chars!);

        changes.push({
          range: new monaco.Range(
            from.lineNumber,
            from.column,
            to.lineNumber,
            to.column
          ),
          text: "",
          forceMoveMarkers: true,
        });

        index += op.chars!;
      }
    }

    return changes;
  }

  /**
   * Applies Edit Operations into Monaco editor model.
   * @param changes - List of Edit Operations.
   */
  protected _applyChangesToMonaco(
    changes: monaco.editor.IIdentifiedSingleEditOperation[]
  ): void {
    let readOnly: boolean;

    // Support for Monaco < 0.19.0
    if (typeof this._monaco.getConfiguration === "function") {
      ({ readOnly } = this._monaco.getConfiguration());
    } else {
      // @ts-ignore - Remove this after monaco upgrade
      readOnly = this._monaco.getOption(monaco.editor.EditorOption.readOnly);
    }

    if (readOnly) {
      this._monaco.updateOptions({ readOnly: false });
    }

    this._monaco.executeEdits("firepad", changes);

    if (readOnly) {
      this._monaco.updateOptions({ readOnly });
    }
  }

  applyOperation(operation: ITextOperation): void {
    if (!operation.isNoop()) {
      this._ignoreChanges = true;
    }

    /** Get Changes List */
    const model = this._getModel();
    if (!model) {
      return;
    }

    const changes: monaco.editor.IIdentifiedSingleEditOperation[] = this._transformOpsIntoMonacoChanges(
      operation.getOps(),
      model
    );

    /** Changes exists to be applied */
    if (changes.length) {
      this._applyChangesToMonaco(changes);
    }

    /** Update Editor Content and Reset Config */
    if (model) {
      this._lastDocLines = model.getLinesContent();
    }

    this._ignoreChanges = false;
  }

  invertOperation(operation: ITextOperation): ITextOperation {
    return operation.invert(this.getText());
  }

  protected _onBlur(): void {
    const currentSelecton = this._monaco.getSelection();

    if (!currentSelecton || currentSelecton.isEmpty()) {
      this._trigger(EditorAdapterEvent.Blur);
    }
  }

  protected _onFocus(): void {
    this._trigger(EditorAdapterEvent.Focus);
  }

  protected _onCursorActivity(
    ev: monaco.editor.ICursorPositionChangedEvent
  ): void {
    if (ev.reason === monaco.editor.CursorChangeReason.RecoverFromMarkers) {
      return;
    }

    this._trigger(EditorAdapterEvent.CursorActivity);
  }

  protected _onChange(
    ev: Pick<monaco.editor.IModelContentChangedEvent, "changes">
  ): void {
    /** Ignore if change is being applied by firepad itself. */
    if (this._ignoreChanges || !this._initiated) {
      return;
    }

    const model = this._getModel()!;
    const content = this._getPreviousContentInRange();
    const contentLength = content.length;

    /** If no change information received */
    if (!ev.changes || ev.changes.length === 0) {
      const op = new TextOperation().retain(contentLength, null);
      this._trigger(EditorAdapterEvent.Change, op, op);
      return;
    }

    const [mainOp, reverseOp] = this._operationFromMonacoChange(
      ev.changes,
      contentLength
    );

    /** Cache current content to use during next change trigger */
    this._lastDocLines = model.getLinesContent();

    this._trigger(EditorAdapterEvent.Change, mainOp, reverseOp);
  }

  protected _onModelChange(_ev: monaco.editor.IModelChangedEvent): void {
    const newModel = this._getModel();

    if (!newModel) {
      return;
    }

    if (this._undoCallback) {
      this._originalUndo = newModel.undo;
      newModel.undo = this._undoCallback;
    }

    if (this._redoCallback) {
      this._originalRedo = newModel.redo;
      newModel.redo = this._redoCallback;
    }

    const oldLinesCount = this._lastDocLines.length;
    const oldLastColumLength = this._lastDocLines[oldLinesCount - 1].length;
    const oldRange = new monaco.Range(
      1,
      1,
      oldLinesCount,
      oldLastColumLength + 1
    );
    const oldValue = this._getPreviousContentInRange();

    this._onChange({
      changes: [
        {
          range: oldRange,
          rangeOffset: 0,
          rangeLength: oldValue.length,
          text: newModel.getValue(),
        },
      ],
    });
  }

  /**
   * Returns Text Operation and it's invert counterpart from Edit Operations in Monaco.
   * @param changes - List of Edit Operations in Monaco.
   * @param contentLength - Size of the content in Editor Model.
   */
  protected _operationFromMonacoChange(
    changes: monaco.editor.IModelContentChange[],
    contentLength: number
  ): [ITextOperation, ITextOperation] {
    /** Text Operation respective of current changes */
    let mainOp: ITextOperation = new TextOperation();

    /** Text Operation respective of invert changes */
    let reverseOp: ITextOperation = new TextOperation();

    if (changes.length > 1) {
      const first = changes[0];
      const last = changes[changes.length - 1];

      if (first.rangeOffset > last.rangeOffset) {
        changes = changes.reverse();
      }
    }

    let skippedChars = 0;

    for (const change of changes) {
      const { range, text, rangeOffset, rangeLength } = <
        Omit<monaco.editor.IModelContentChange, "range"> & {
          range: monaco.Range;
        }
      >change;
      const retain = rangeOffset - skippedChars;

      try {
        mainOp = mainOp.retain(retain, null);
        reverseOp = reverseOp.retain(retain, null);
      } catch (err) {
        this._trigger(EditorAdapterEvent.Error, err, mainOp.toString(), {
          retain,
        });
        throw err;
      }

      if (!text && !range.isEmpty()) {
        mainOp = mainOp.delete(rangeLength);
        reverseOp = reverseOp.insert(
          this._getPreviousContentInRange(range),
          null
        );
      } else if (text && !range.isEmpty()) {
        mainOp = mainOp.delete(rangeLength).insert(text, null);
        reverseOp = reverseOp
          .insert(this._getPreviousContentInRange(range), null)
          .delete(text);
      } else {
        mainOp = mainOp.insert(text, null);
        reverseOp = reverseOp.delete(text);
      }

      skippedChars = skippedChars + retain + rangeLength;
    }

    try {
      mainOp = mainOp.retain(contentLength - skippedChars, null);
      reverseOp = reverseOp.retain(contentLength - skippedChars, null);
    } catch (err) {
      this._trigger(EditorAdapterEvent.Error, err, mainOp.toString(), {
        contentLength,
        skippedChars,
      });
      throw err;
    }
    return [mainOp, reverseOp];
  }

  /**
   * Returns CSS Style rules for Cursor and Selection.
   * @param className - CSS Classname for the Cursor or Selection.
   * @param backgroundColor - Background color for selection, `transparent` for cursor.
   * @param fontColor - Color of cursor.
   * @returns
   */
  protected _getStyles(
    className: string,
    backgroundColor: string,
    fontColor: string
  ): string {
    return `
      .${className} {
        position: relative;
        background-color: ${backgroundColor};
        border-left: 2px solid ${fontColor};
      }
    `;
  }

  /**
   * Adds CSS Style rules into DOM
   * @param className - CSS Classname for the Cursor or Selection.
   * @param backgroundColor - Background color for selection, `transparent` for cursor.
   * @param fontColor - Color of cursor.
   */
  protected _addStyleRule(
    className: string,
    backgroundColor: string,
    fontColor: string
  ): void {
    Utils.validateTruth(document != null, "This package must run on browser!");

    /** Do not re-inject if already exists in DOM */
    if (this._classNames.includes(className)) {
      return;
    }

    const style = this._getStyles(className, backgroundColor, fontColor);
    const styleTextNode = document.createTextNode(style);
    const styleElement = document.createElement("style");
    styleElement.appendChild(styleTextNode);
    document.head.appendChild(styleElement);

    this._classNames.push(className);
  }
}
