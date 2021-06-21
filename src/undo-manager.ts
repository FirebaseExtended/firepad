import { ITextOperation, TextOperation } from "./text-operation";
import * as Utils from "./utils";
import { IWrappedOperation } from "./wrapped-operation";

enum UndoManagerState {
  Normal = "normal",
  Undoing = "undoing",
  Redoing = "redoing",
}

type UndoManagerCallbackType = (operation?: IWrappedOperation) => void;

export interface IUndoManager extends Utils.IDisposable {
  /**
   * Add an operation to the undo or redo stack, depending on the current state
   * of the UndoManager. The operation added must be the inverse of the last
   * edit. When `compose` is true, compose the operation with the last operation
   * unless the last operation was alread pushed on the redo stack or was hidden
   * by a newer operation on the undo stack.
   */
  add(operation: ITextOperation, compose?: boolean): void;
  /**
   * Returns last entry in the undo stack if exists.
   */
  last(): ITextOperation | null;
  /**
   * Transform the undo and redo stacks against a operation by another client.
   */
  transform(operation: ITextOperation): void;
  /**
   * Perform an undo by calling a function with the latest operation on the undo
   * stack. The function is expected to call the `add` method with the inverse
   * of the operation, which pushes the inverse on the redo stack.
   */
  performUndo(callback: UndoManagerCallbackType): void;
  /**
   * Perform a redo by calling a function with the latest operation on the redo
   * stack. The function is expected to call the `add` method with the inverse
   * of the operation, which pushes the inverse on the undo stack.
   */
  performRedo(callback: UndoManagerCallbackType): void;
  /**
   * Is the undo stack not empty?
   */
  canUndo(): boolean;
  /**
   * Is the redo stack not empty?
   */
  canRedo(): boolean;
  /**
   * Whether the UndoManager is currently performing an undo.
   */
  isUndoing(): boolean;
  /**
   * Whether the UndoManager is currently performing a redo.
   */
  isRedoing(): boolean;
}

export class UndoManager implements IUndoManager {
  protected readonly _maxItems: number;

  protected _state: UndoManagerState;
  protected _compose: boolean;
  protected _undoStack: IWrappedOperation[];
  protected _redoStack: IWrappedOperation[];

  /**
   * Default value `(50)` for maximum number of operation to hold in Undo/Redo stack
   */
  protected static readonly MAX_ITEM_IN_STACK: number = 50;

  /**
   * Creates an Undo/Redo Stack manager
   * @param maxItems - Maximum number of operation to hold in Undo/Redo stack (optional, defaults to `50`)
   */
  constructor(maxItems: number = UndoManager.MAX_ITEM_IN_STACK) {
    Utils.validateGreater(maxItems, 0);

    this._maxItems = maxItems;

    this._undoStack = [];
    this._redoStack = [];
    this._compose = true;
    this._state = UndoManagerState.Normal;
  }

  dispose(): void {
    Utils.validateEquality(
      this._state,
      UndoManagerState.Normal,
      "Cannot dispose UndoManager while an undo/redo is in-progress"
    );

    this._undoStack = [];
    this._redoStack = [];
  }

  protected _addOnNormalState(
    operation: IWrappedOperation,
    compose: boolean
  ): void {
    let toPushOperation: IWrappedOperation = operation;

    if (this._compose && compose && this._undoStack.length > 0) {
      toPushOperation = operation.compose(
        this._undoStack.pop()!
      ) as IWrappedOperation;
    }

    this._undoStack.push(toPushOperation);

    if (this._undoStack.length > this._maxItems) {
      this._undoStack.shift();
    }

    this._compose = true;
    this._redoStack = [];
  }

  protected _addOnUndoingState(operation: IWrappedOperation): void {
    this._redoStack.push(operation);
    this._compose = false;
  }

  protected _addOnRedoingState(operation: IWrappedOperation): void {
    this._undoStack.push(operation);
    this._compose = true;
  }

  add(operation: ITextOperation, compose: boolean = false): void {
    switch (this._state) {
      case UndoManagerState.Undoing: {
        return this._addOnUndoingState(operation as IWrappedOperation);
      }
      case UndoManagerState.Redoing: {
        return this._addOnRedoingState(operation as IWrappedOperation);
      }
      case UndoManagerState.Normal: {
        return this._addOnNormalState(operation as IWrappedOperation, compose);
      }
      default:
        break;
    }
  }

  last(): ITextOperation | null {
    if (this._undoStack.length === 0) {
      return null;
    }

    return this._undoStack[this._undoStack.length - 1].clone();
  }

  protected _transformStack(
    stack: ITextOperation[],
    operation: TextOperation
  ): IWrappedOperation[] {
    const newStack: ITextOperation[] = [];
    const reverseStack: TextOperation[] = [
      ...stack,
    ].reverse() as TextOperation[];

    for (const stackOp of reverseStack) {
      const pair = stackOp.transform(operation);

      if (!pair[0].isNoop()) {
        newStack.push(pair[0]);
      }

      operation = pair[1] as TextOperation;
    }

    return newStack.reverse() as IWrappedOperation[];
  }

  transform(operation: TextOperation): void {
    this._undoStack = this._transformStack(this._undoStack, operation);
    this._redoStack = this._transformStack(this._redoStack, operation);
  }

  performUndo(callback: UndoManagerCallbackType): void {
    this._state = UndoManagerState.Undoing;

    Utils.validateInEquality(this._undoStack.length, 0, "undo not possible");

    callback(this._undoStack.pop());
    this._state = UndoManagerState.Normal;
  }

  performRedo(callback: UndoManagerCallbackType): void {
    this._state = UndoManagerState.Redoing;

    Utils.validateInEquality(this._redoStack.length, 0, "redo not possible");

    callback(this._redoStack.pop());
    this._state = UndoManagerState.Normal;
  }

  canUndo(): boolean {
    return this._undoStack.length !== 0;
  }

  canRedo(): boolean {
    return this._redoStack.length !== 0;
  }

  isUndoing(): boolean {
    return this._state === UndoManagerState.Undoing;
  }

  isRedoing(): boolean {
    return this._state === UndoManagerState.Redoing;
  }
}
