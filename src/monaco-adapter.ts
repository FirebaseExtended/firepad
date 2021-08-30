import * as monaco from "monaco-editor";

import {
  IPlainTextOperation as ITextOperation,
  PlainTextOperation as TextOperation,
  ITextOperation as ITextOp,
} from "@operational-transformation/plaintext";
import {
  Cursor,
  ICursor,
  EditorAdapterEvent,
  IEditorAdapter,
  TEditorAdapterEventArgs,
  TEditorAdapterCursorParams,
} from "@operational-transformation/plaintext-editor";
import mitt, { Emitter, Handler } from "mitt";
import {
  CursorWidgetController,
  ICursorWidgetController,
} from "./cursor-widget-controller";
import * as Utils from "./utils";

interface IRemoteCursor {
  clientId: string;
  decoration: string[];
}

interface ITextModelWithUndoRedo extends monaco.editor.ITextModel {
  undo: Handler<void> | null;
  redo: Handler<void> | null;
}

export class MonacoAdapter implements IEditorAdapter {
  protected readonly _monaco: monaco.editor.IStandaloneCodeEditor;
  protected readonly _classNames: string[];
  protected readonly _disposables: monaco.IDisposable[];
  protected readonly _remoteCursors: Map<string, IRemoteCursor>;
  protected readonly _cursorWidgetController: ICursorWidgetController;

  protected _ignoreChanges: boolean;
  protected _lastDocLines: string[];
  protected _lastCursorRange: monaco.Selection | null;
  protected _emitter: Emitter<TEditorAdapterEventArgs> | null;
  protected _undoCallback: Handler<void> | null;
  protected _redoCallback: Handler<void> | null;
  protected _originalUndo: Handler<void> | null;
  protected _originalRedo: Handler<void> | null;
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
    this._remoteCursors = new Map<string, IRemoteCursor>();
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

  deregisterUndo(callback?: any): void {
    const model = this._getModel();
    if (!model) {
      return;
    }

    if (model.undo !== this._originalUndo) {
      model.undo = this._originalUndo;
    }

    this._originalUndo = null;
  }

  deregisterRedo(callback?: any): void {
    const model = this._getModel();
    if (!model) {
      return;
    }

    if (model.redo !== this._originalRedo) {
      model.redo = this._originalRedo;
    }

    this._originalRedo = null;
  }

  protected _init(): void {
    this._emitter = mitt();

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
      this._emitter.all.clear();
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

  registerUndo(callback: Handler<void>): void {
    const model = this._getModel();

    if (!model) {
      return;
    }

    this._originalUndo = model.undo;
    model.undo = this._undoCallback = callback;
  }

  registerRedo(callback: Handler<void>): void {
    const model = this._getModel();

    if (!model) {
      return;
    }

    this._originalRedo = model.redo;
    model.redo = this._redoCallback = callback;
  }

  on<Key extends keyof TEditorAdapterEventArgs>(
    event: Key,
    listener: Handler<TEditorAdapterEventArgs[Key]>
  ): void {
    return this._emitter?.on(event, listener);
  }

  off<Key extends keyof TEditorAdapterEventArgs>(
    event: Key,
    listener?: Handler<TEditorAdapterEventArgs[Key]>
  ): void {
    return this._emitter?.off(event, listener);
  }

  protected _trigger<Key extends keyof TEditorAdapterEventArgs>(
    event: Key,
    payload: TEditorAdapterEventArgs[Key]
  ): void {
    return this._emitter!.emit(event, payload);
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

  setOtherCursor({
    clientId,
    cursor,
    userColor,
    userName,
  }: TEditorAdapterCursorParams): Utils.IDisposable {
    /** House Keeping */
    Utils.validateTruth(
      typeof cursor === "object" &&
        typeof cursor!.toJSON === "function" &&
        typeof userColor === "string" &&
        (typeof clientId === "string" || typeof clientId === "number") &&
        !!userColor!.match(/^#[a-fA-F0-9]{3,6}$/)
    );

    /** Extract Positions */
    const { position, selectionEnd } = cursor!.toJSON();
    Utils.validateFalse(position < 0 || selectionEnd < 0);

    /** Fetch Client Cursor Information */
    let remoteCursor: IRemoteCursor | void = this._remoteCursors.get(clientId);

    if (!remoteCursor) {
      /** Initialize empty array, if client does not exist */
      remoteCursor = {
        clientId,
        decoration: [],
      };
      this._remoteCursors.set(clientId, remoteCursor);
    } else {
      /** Remove Earlier Decorations, if any, or initialize empty decor */
      remoteCursor.decoration = this._monaco.deltaDecorations(
        remoteCursor.decoration,
        []
      );
    }

    let selectionColor = userColor!;
    let className = `remote-client-selection-${userColor!.replace("#", "")}`;

    if (position === selectionEnd) {
      /** It's a single cursor */
      selectionColor = "transparent";
      className = className.replace("selection", "cursor");
    }

    /** Generate Style rules and add them to document */
    this._addStyleRule(className, selectionColor, userColor!);

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
      clientId,
      range,
      userColor!,
      userName
    );

    return {
      dispose: () => {
        const cursor: IRemoteCursor | void = this._remoteCursors.get(clientId);

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
    ops: IterableIterator<[number, ITextOp]>,
    model: monaco.editor.ITextModel
  ): monaco.editor.IIdentifiedSingleEditOperation[] {
    let index = 0;
    const changes: monaco.editor.IIdentifiedSingleEditOperation[] = [];
    let opValue: IteratorResult<[number, ITextOp]>;

    while (!(opValue = ops.next()).done) {
      const op: ITextOp = opValue.value[1];

      /** Retain Operation */
      if (op.isRetain()) {
        index += op.characterCount();
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
          text: op.textContent(),
          forceMoveMarkers: true,
        });
        continue;
      }

      if (op.isDelete()) {
        /** Delete Operation */
        const from = model.getPositionAt(index);
        const to = model.getPositionAt(index + op.characterCount());

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

        index += op.characterCount();
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
      operation.entries(),
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
      this._trigger(EditorAdapterEvent.Blur, undefined);
    }
  }

  protected _onFocus(): void {
    this._trigger(EditorAdapterEvent.Focus, undefined);
  }

  protected _onCursorActivity(
    ev: monaco.editor.ICursorPositionChangedEvent
  ): void {
    if (ev.reason === monaco.editor.CursorChangeReason.RecoverFromMarkers) {
      return;
    }

    this._trigger(EditorAdapterEvent.Cursor, undefined);
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
      this._trigger(EditorAdapterEvent.Change, {
        operation: op,
        inverse: op,
      });
      return;
    }

    const [mainOp, reverseOp] = this._operationFromMonacoChange(
      ev.changes,
      contentLength
    );

    /** Cache current content to use during next change trigger */
    this._lastDocLines = model.getLinesContent();

    this._trigger(EditorAdapterEvent.Change, {
      operation: mainOp,
      inverse: reverseOp,
    });
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
        this._trigger(EditorAdapterEvent.Error, {
          err,
          operation: mainOp.toString(),
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
      this._trigger(EditorAdapterEvent.Error, {
        err,
        operation: mainOp.toString(),
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
