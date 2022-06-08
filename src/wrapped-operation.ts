import { ICursor } from "./cursor";
import { IOperationMeta } from "./operation-meta";
import { ITextOp, ITextOpAttributes } from "./text-op";
import { ITextOperation, TextOperationType } from "./text-operation";

/**
 * A WrappedOperation contains an operation and corresponing metadata (cursor positions).
 */
export interface IWrappedOperation extends ITextOperation {
  /**
   * Returns final state of Cursor
   */
  getCursor(): ICursor | null;
  /**
   * Returns a clone of Text Operation
   */
  getOperation(): ITextOperation;
}

export class WrappedOperation implements IWrappedOperation {
  protected readonly _operation: ITextOperation;
  protected readonly _metadata: IOperationMeta | null;

  /**
   * Wraps Text Operation with additional Operation Metadata.
   * @param operation - Text Operation to wrap.
   * @param metadata - Additional Operation Metadata (optional).
   */
  constructor(
    operation: ITextOperation,
    metadata: IOperationMeta | null = null
  ) {
    this._operation = operation;
    this._metadata = metadata;
  }

  isWrappedOperation(): boolean {
    return true;
  }

  getOps(): ITextOp[] {
    return this._operation.getOps();
  }

  getCursor(): ICursor | null {
    if (!this._metadata) {
      return null;
    }

    return this._metadata.getCursor();
  }

  getOperation(): ITextOperation {
    return this._operation.clone();
  }

  retain(n: number, attributes: ITextOpAttributes | null): WrappedOperation {
    this._operation.retain(n, attributes);
    return this;
  }

  insert(str: string, attributes: ITextOpAttributes | null): WrappedOperation {
    this._operation.insert(str, attributes);
    return this;
  }

  delete(n: string | number): WrappedOperation {
    this._operation.delete(n);
    return this;
  }

  isNoop(): boolean {
    return this._operation.isNoop();
  }

  clone(): WrappedOperation {
    return new WrappedOperation(
      this._operation.clone(),
      this._metadata?.clone()
    );
  }

  apply(
    prevContent: string,
    prevAttributes?: ITextOpAttributes[],
    attributes?: ITextOpAttributes[]
  ): string {
    return this._operation.apply(prevContent, prevAttributes, attributes);
  }

  invert(content: string): WrappedOperation {
    return new WrappedOperation(
      this._operation.invert(content),
      this._metadata?.invert()
    );
  }

  protected _getWrappedOperation(operation: ITextOperation): WrappedOperation {
    if (!operation.isWrappedOperation()) {
      return new WrappedOperation(operation);
    }

    return operation as WrappedOperation;
  }

  equals(other: ITextOperation): boolean {
    const wrappedOther = this._getWrappedOperation(other);
    return this._operation.equals(wrappedOther._operation);
  }

  transform(other: ITextOperation): [WrappedOperation, WrappedOperation] {
    const wrappedOther = this._getWrappedOperation(other);
    const [pair0, pair1] = this._operation.transform(wrappedOther._operation);

    const wrappedPair0 = new WrappedOperation(
      pair0,
      this._metadata?.transform(wrappedOther._operation)
    );
    const wrappedPair1 = new WrappedOperation(
      pair1,
      wrappedOther._metadata?.transform(this._operation)
    );

    return [wrappedPair0, wrappedPair1];
  }

  canMergeWith(other: ITextOperation): boolean {
    const wrappedOther = this._getWrappedOperation(other);
    return this._operation.canMergeWith(wrappedOther._operation);
  }

  protected _composeMeta(
    otherMetadata: IOperationMeta | null
  ): IOperationMeta | null {
    if (!this._metadata) {
      return otherMetadata;
    }

    if (!otherMetadata) {
      return this._metadata;
    }

    return this._metadata.compose(otherMetadata);
  }

  compose(other: ITextOperation): WrappedOperation {
    const wrappedOther = this._getWrappedOperation(other);

    return new WrappedOperation(
      this._operation.compose(wrappedOther._operation),
      this._composeMeta(wrappedOther._metadata)
    );
  }

  shouldBeComposedWith(other: ITextOperation): boolean {
    const wrappedOther = this._getWrappedOperation(other);
    return this._operation.shouldBeComposedWith(wrappedOther._operation);
  }

  shouldBeComposedWithInverted(other: ITextOperation): boolean {
    const wrappedOther = this._getWrappedOperation(other);
    return this._operation.shouldBeComposedWithInverted(
      wrappedOther._operation
    );
  }

  toString(): string {
    return this._operation.toString();
  }

  toJSON(): TextOperationType {
    return this._operation.toJSON();
  }
}
