import { ITextOp } from "./text-op";
import { ITextOperation } from "./text-operation";

/**
 * JSON Representation of a Cursor Object
 *
 * If `position` and `selectionEnd` are equal that means
 * a single cursor; otherwise, it's a selection between
 * two points.
 */
export type CursorType = {
  /** Starting Position of the Cursor/Selection */
  position: number;
  /** Final Position of the Selection */
  selectionEnd: number;
};

export interface ICursor {
  /**
   * Checks if two Cursor are at same position.
   * @param other - Another Cursor Object (could be null).
   */
  equals(other: ICursor | null): boolean;
  /**
   * Return the more current cursor information.
   * @param other - Another Cursor Object.
   */
  compose(other: ICursor): ICursor;
  /**
   * Update the cursor with respect to an operation.
   * @param operation - Text Operation.
   */
  transform(operation: ITextOperation): ICursor;
  /**
   * Returns JSON representation of the Cursor.
   */
  toJSON(): CursorType;
}

/**
 * A cursor has a `position` and a `selectionEnd`. Both are zero-based indexes
 * into the document. When nothing is selected, `selectionEnd` is equal to
 * `position`. When there is a selection, `position` is always the side of the
 * selection that would move if you pressed an arrow key.
 */
export class Cursor implements ICursor {
  protected readonly _position: number;
  protected readonly _selectionEnd: number;

  /**
   * Creates a Cursor object
   * @param position - Starting position of the Cursor
   * @param selectionEnd - Ending position of the Cursor
   */
  constructor(position: number, selectionEnd: number) {
    this._position = position;
    this._selectionEnd = selectionEnd;
  }

  /**
   * Converts a JSON representation of Cursor into Cursor Object
   */
  static fromJSON({ position, selectionEnd }: CursorType): Cursor {
    return new Cursor(position, selectionEnd);
  }

  equals(other: Cursor | null): boolean {
    if (other == null) {
      return false;
    }

    return (
      this._position === other._position &&
      this._selectionEnd === other._selectionEnd
    );
  }

  compose(other: Cursor): Cursor {
    return other;
  }

  protected _transformIndex(ops: ITextOp[], index: number) {
    let newIndex = index;

    for (const op of ops) {
      if (op.isRetain()) {
        index -= op.chars!;
      } else if (op.isInsert()) {
        newIndex += op.text!.length;
      } else {
        newIndex -= Math.min(index, op.chars!);
        index -= op.chars!;
      }

      if (index < 0) {
        break;
      }
    }

    return newIndex;
  }

  transform(operation: ITextOperation): Cursor {
    const ops: ITextOp[] = operation.getOps();
    const newPosition: number = this._transformIndex(ops, this._position);

    if (this._position === this._selectionEnd) {
      return new Cursor(newPosition, newPosition);
    }

    return new Cursor(
      newPosition,
      this._transformIndex(ops, this._selectionEnd)
    );
  }

  toJSON(): CursorType {
    return {
      position: this._position,
      selectionEnd: this._selectionEnd,
    };
  }
}
