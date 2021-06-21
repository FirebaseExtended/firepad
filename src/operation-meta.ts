import { ICursor } from "./cursor";
import { ITextOperation } from "./text-operation";

export interface IOperationMeta {
  /**
   * Return shallow clone of Operation Metadata
   */
  clone(): IOperationMeta;
  /**
   * Return updated Operation Metadata on Inversion of Operation
   */
  invert(): IOperationMeta;
  /**
   * Return updated Operation Metadata on Composition of Operation
   * @param other - Operation Metadata from other operation
   */
  compose(other: IOperationMeta): IOperationMeta;
  /**
   * Return updated Operation Metadata on Transformation of Operation
   * @param operation - Text Operation.
   */
  transform(operation: ITextOperation): IOperationMeta;
  /**
   * Returns final state of Cursor
   */
  getCursor(): ICursor | null;
}

export class OperationMeta implements IOperationMeta {
  protected readonly _cursorBefore: ICursor | null;
  protected readonly _cursorAfter: ICursor | null;

  /**
   * Creates additional metadata for a Text Operation
   * @param cursorBefore - Cursor position before Text Operation is applied
   * @param cursorAfter - Cursor position after Text Operation is applied
   */
  constructor(cursorBefore: ICursor | null, cursorAfter: ICursor | null) {
    this._cursorBefore = cursorBefore;
    this._cursorAfter = cursorAfter;
  }

  clone(): IOperationMeta {
    return new OperationMeta(this._cursorBefore, this._cursorAfter);
  }

  invert(): IOperationMeta {
    return new OperationMeta(this._cursorAfter, this._cursorBefore);
  }

  compose(other: OperationMeta): IOperationMeta {
    return new OperationMeta(this._cursorBefore, other._cursorAfter);
  }

  transform(operation: ITextOperation): IOperationMeta {
    return new OperationMeta(
      this._cursorBefore ? this._cursorBefore.transform(operation) : null,
      this._cursorAfter ? this._cursorAfter.transform(operation) : null
    );
  }

  getCursor(): ICursor | null {
    return this._cursorAfter;
  }
}
