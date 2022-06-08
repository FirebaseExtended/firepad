import { ITextOp, ITextOpAttributes, TextOp, TextOptType } from "./text-op";
import * as Utils from "./utils";

/**
 * JSON Representation of a Text Operation
 */
export type TextOperationType = (string | number | ITextOpAttributes)[];

export interface ITextOperation {
  /**
   * Tests if the operation is wrapped with additional Metadata
   */
  isWrappedOperation(): boolean;
  /**
   * Returns shallow clone of Individual Text Operations.
   */
  getOps(): ITextOp[];
  /**
   * Checks if two TextOperations are equivalent and equal
   * @param other - Another TextOperation object
   */
  equals(other: ITextOperation): boolean;
  /**
   * Skip over a given number of characters.
   * @param n - Number of Characters to Skip.
   * @param attributes - Additional Attributes for Retain.
   */
  retain(n: number, attributes: ITextOpAttributes | null): ITextOperation;
  /**
   * Insert a string at the current position.
   * @param str - String to be Inserted.
   * @param attributes - Additional Attributes for Insert.
   */
  insert(str: string, attributes: ITextOpAttributes | null): ITextOperation;
  /**
   * Delete a string at the current position.
   * @param n - Number of Characters or String to be Deleted.
   */
  delete(n: number | string): ITextOperation;
  /**
   * Tests whether this operation has no effect.
   */
  isNoop(): boolean;
  /**
   * Returns Shallow copy of current operation.
   */
  clone(): ITextOperation;
  /**
   * Apply an operation to a string, returning a new string. Throws an error if
   * there's a mismatch between the input string and the operation.
   * @param prevContent - Text Content of Editor before applying the operation
   * @param prevAttributes - Text Operation attributes before applying
   * @param attributes - Text Operation attributes after applying (propagated)
   */
  apply(
    prevContent: string,
    prevAttributes?: ITextOpAttributes[],
    attributes?: ITextOpAttributes[]
  ): string;
  /**
   * Computes the inverse of an operation. The inverse of an operation is the
   * operation that reverts the effects of the operation, e.g. when you have an
   * operation 'insert("hello "); skip(6);' then the inverse is 'delete("hello ");
   * skip(6);'. The inverse should be used for implementing undo.
   * @param content - Text Content of Editor before applying the operation
   */
  invert(content: string): ITextOperation;
  /**
   * Transform of `A` takes another concurrent operation `B` and
   * produces two operations `A'` and `B'` (in an array) such that
   * `apply(apply(S, A), B') = apply(apply(S, B), A')`.
   * @param operation - Concurrent Operation to be composed with.
   */
  transform(operation: ITextOperation): [ITextOperation, ITextOperation];
  /**
   * Compose merges two consecutive operations into one operation, that
   * preserves the changes of both. Or, in other words, for each input string S
   * and a pair of consecutive operations A and B,
   * apply(apply(S, A), B) = apply(S, compose(A, B)) must hold.
   * @param operation - Consecutive Operation to be composed with.
   */
  compose(operation: ITextOperation): ITextOperation;
  /**
   * When you use ctrl-z to undo your latest changes, you expect the program not
   * to undo every single keystroke but to undo your last sentence you wrote at
   * a stretch or the deletion you did by holding the backspace key down. This
   * This can be implemented by composing operations on the undo stack. This
   * method can help decide whether two operations should be composed. It
   * returns true if the operations are consecutive insert operations or both
   * operations delete text at the same position. You may want to include other
   * factors like the time since the last change in your decision.
   * @param other - Other Operation.
   */
  shouldBeComposedWith(other: ITextOperation): boolean;
  /**
   * Decides whether two operations should be composed with each other
   * if they were inverted, that is
   * `shouldBeComposedWith(A, B) = shouldBeComposedWithInverted(B', A')`.
   * @param other - Other Operation
   */
  shouldBeComposedWithInverted(other: ITextOperation): boolean;
  /**
   * Tests whether next operation can be chained with current one, i.e.,
   * checks if the `targetLength` of current operation is equal with the `baseLength`
   * of next operation.
   * @param other - Subsequent Operation
   */
  canMergeWith(other: ITextOperation): boolean;
  /**
   * Returns String representation of a Text Operation
   */
  toString(): string;
  /**
   * Returns JSON representation of a Text Operation
   */
  toJSON(): TextOperationType;
}

export class TextOperation implements ITextOperation {
  protected readonly _ops: ITextOp[];

  protected _baseLength: number;
  protected _targetLength: number;

  constructor() {
    // When an operation is applied to an input string, you can think of this as
    // if an imaginary cursor runs over the entire string and skips over some
    // parts, deletes some parts and inserts characters at some positions. These
    // actions (skip/delete/insert) are stored as an array in the "ops" property.
    this._ops = [];
    // An operation's baseLength is the length of every string the operation
    // can be applied to.
    this._baseLength = 0;
    // The targetLength is the length of every string that results from applying
    // the operation on a valid input string.
    this._targetLength = 0;
  }

  isWrappedOperation(): boolean {
    return false;
  }

  getOps(): ITextOp[] {
    return Array.from(this._ops);
  }

  equals(other: TextOperation): boolean {
    if (this._baseLength !== other._baseLength) {
      return false;
    }

    if (this._targetLength !== other._targetLength) {
      return false;
    }

    if (this._ops.length !== other._ops.length) {
      return false;
    }

    return this._ops.every((op, index) => op.equals(other._ops[index]));
  }

  /**
   * Returns nth last op from the ops array.
   * @param n - Reverse Index of the item.
   */
  protected _last(n: number = 0): ITextOp | null {
    return this._ops.length > n ? this._ops[this._ops.length - n - 1] : null;
  }

  // After an operation is constructed, the user of the library can specify the
  // actions of an operation (skip/insert/delete) with these three builder
  // methods. They all return the operation for convenient chaining.

  retain(n: number, attributes: ITextOpAttributes | null): TextOperation {
    Utils.validateNonNegativeInteger(n, "retain expects a positive integer.");

    if (n === 0) {
      return this;
    }

    this._baseLength += n;
    this._targetLength += n;

    attributes ||= {};
    const prevOp = this._last();

    if (prevOp && prevOp.isRetain() && prevOp.attributesEqual(attributes)) {
      // The last op is a retain op with the same attributes => we can merge them into one op.
      prevOp.chars! += n;
    } else {
      // Create a new op.
      this._ops.push(new TextOp(TextOptType.Retain, n, attributes));
    }

    return this;
  }

  insert(str: string, attributes: ITextOpAttributes | null): TextOperation {
    Utils.validateString(str, "insert expects a string.");

    if (str === "") {
      return this;
    }

    this._targetLength += str.length;

    attributes ||= {};
    const prevOp = this._last();
    const prevPrevOp = this._last(1);

    if (prevOp && prevOp.isInsert() && prevOp.attributesEqual(attributes)) {
      // Merge insert op.
      prevOp.text += str;
    } else if (prevOp && prevOp.isDelete()) {
      // It doesn't matter when an operation is applied whether the operation
      // is delete(3), insert("something") or insert("something"), delete(3).
      // Here we enforce that in this case, the insert op always comes first.
      // This makes all operations that have the same effect when applied to
      // a document of the right length equal in respect to the `equals` method.
      if (
        prevPrevOp &&
        prevPrevOp.isInsert() &&
        prevPrevOp.attributesEqual(attributes)
      ) {
        prevPrevOp.text += str;
      } else {
        this._ops[this._ops.length - 1] = new TextOp(
          TextOptType.Insert,
          str,
          attributes
        );
        this._ops.push(prevOp);
      }
    } else {
      this._ops.push(new TextOp(TextOptType.Insert, str, attributes));
    }

    return this;
  }

  delete(n: number | string): TextOperation {
    let num: number = n as number;

    if (typeof n === "string") {
      num = n.length;
    }

    Utils.validateNonNegativeInteger(
      num,
      "delete expects a positive integer or string."
    );

    if (num === 0) {
      return this;
    }

    this._baseLength += num;

    const prevOp = this._last();

    if (prevOp && prevOp.isDelete()) {
      prevOp.chars! += num;
    } else {
      this._ops.push(new TextOp(TextOptType.Delete, num, null));
    }

    return this;
  }

  isNoop(): boolean {
    if (this._ops.length === 0) {
      return true;
    }

    return this._ops.every((op) => op.isRetain() && op.hasEmptyAttributes());
  }

  clone(): TextOperation {
    const ops = this._ops;
    const clone = new TextOperation();

    for (const op of ops) {
      if (op.isRetain()) {
        clone.retain(op.chars!, op.attributes);
      } else if (op.isInsert()) {
        clone.insert(op.text!, op.attributes);
      } else {
        clone.delete(op.chars!);
      }
    }

    return clone;
  }

  apply(
    prevContent: string,
    prevAttributes: ITextOpAttributes[] = [],
    attributes: ITextOpAttributes[] = []
  ): string {
    Utils.validateEquality(
      prevContent.length,
      this._baseLength,
      "The operation's base length must be equal to the string's length."
    );

    const contentSlices: string[] = [];
    let cursorPosition: number = 0;

    for (const op of this._ops) {
      if (op.isRetain()) {
        const nextCursorPosition = cursorPosition + op.chars!;

        Utils.validateLessOrEqual(
          nextCursorPosition,
          prevContent.length,
          "Operation can't retain more characters than are left in the string."
        );

        // Copy skipped part of the retained string
        contentSlices.push(
          prevContent.slice(cursorPosition, nextCursorPosition)
        );

        // Copy (and potentially update) attributes for each char in retained string
        for (let k = 0; k < op.chars!; k++) {
          const currAttributes: ITextOpAttributes =
            prevAttributes[cursorPosition + k] || {};
          const updatedAttributes: ITextOpAttributes = {};

          for (const attr in currAttributes) {
            updatedAttributes[attr] = currAttributes[attr];

            Utils.validateInEquality(updatedAttributes[attr], false);
          }

          for (const attr in op.attributes) {
            if (op.attributes[attr] === false) {
              delete updatedAttributes[attr];
            } else {
              updatedAttributes[attr] = op.attributes[attr];
            }

            Utils.validateInEquality(updatedAttributes[attr], false);
          }

          attributes.push(updatedAttributes);
        }

        cursorPosition = nextCursorPosition;
      } else if (op.isInsert()) {
        // Insert string.
        contentSlices.push(op.text!);

        // Insert attributes for each char
        for (let k = 0; k < op.text!.length; k++) {
          const insertAttributes: ITextOpAttributes = {};

          for (const attr in op.attributes) {
            insertAttributes[attr] = op.attributes[attr];
            Utils.validateInEquality(insertAttributes[attr], false);
          }

          attributes.push(insertAttributes);
        }
      } else {
        // Skip cursor position on delete
        cursorPosition += op.chars!;
      }
    }

    Utils.validateEquality(
      cursorPosition,
      prevContent.length,
      "The operation didn't operate on the whole string."
    );

    const content = contentSlices.join("");

    Utils.validateEquality(content.length, attributes.length);

    return content;
  }

  invert(content: string): TextOperation {
    const inverse = new TextOperation();
    let cursorPosition = 0;

    for (const op of this._ops) {
      if (op.isRetain()) {
        inverse.retain(op.chars!, op.attributes);
        cursorPosition += op.chars!;
      } else if (op.isInsert()) {
        inverse.delete(op.text!.length);
      } else {
        inverse.insert(
          content.slice(cursorPosition, cursorPosition + op.chars!),
          op.attributes
        );
        cursorPosition += op.chars!;
      }
    }

    return inverse;
  }

  canMergeWith(other: TextOperation): boolean {
    return this._targetLength === other._baseLength;
  }

  protected static _nextTextOp(
    opIterator: IterableIterator<[number, ITextOp]>
  ): ITextOp | null {
    const opIteratorResult: [number, ITextOp] | void = opIterator.next().value;
    return opIteratorResult ? opIteratorResult[1] : null;
  }

  compose(otherOperation: TextOperation): TextOperation {
    Utils.validateTruth(
      this.canMergeWith(otherOperation),
      "The base length of the second operation has to be the target length of the first operation"
    );

    const operation = new TextOperation();

    const opIterator1 = this.clone().getOps().entries();
    const opIterator2 = otherOperation.clone().getOps().entries();

    let op1: ITextOp | null = TextOperation._nextTextOp(opIterator1);
    let op2: ITextOp | null = TextOperation._nextTextOp(opIterator2);

    while (true) {
      // Dispatch on the type of op1 and op2
      if (op1 == null && op2 == null) {
        // end condition: both ops1 and ops2 have been processed
        break;
      }

      if (op1 && op1.isDelete()) {
        operation.delete(op1.chars!);
        op1 = TextOperation._nextTextOp(opIterator1);
        continue;
      }

      if (op2 && op2.isInsert()) {
        operation.insert(op2.text!, op2.attributes);
        op2 = TextOperation._nextTextOp(opIterator2);
        continue;
      }

      Utils.validateFalse(
        op1 == null,
        "Cannot compose operations: first operation is too short."
      );
      Utils.validateFalse(
        op2 == null,
        "Cannot compose operations: first operation is too long."
      );

      if (op1 == null || op2 == null) {
        /** Above guard rules will throw error anyway, this unreachable code is to provide type support of subequent operations. */
        break;
      }

      if (op1.isRetain() && op2.isRetain()) {
        const attributes = this._composeAttributes(
          op1.attributes,
          op2.attributes,
          false
        );

        if (op1.chars! > op2.chars!) {
          operation.retain(op2.chars!, attributes);
          op1.chars! -= op2.chars!;

          op2 = TextOperation._nextTextOp(opIterator2);
        } else if (op1.chars === op2.chars) {
          operation.retain(op1.chars!, attributes);

          op1 = TextOperation._nextTextOp(opIterator1);
          op2 = TextOperation._nextTextOp(opIterator2);
        } else {
          operation.retain(op1.chars!, attributes);
          op2.chars! -= op1.chars!;

          op1 = TextOperation._nextTextOp(opIterator1);
        }
        continue;
      }

      if (op1!.isInsert() && op2!.isDelete()) {
        if (op1.text!.length > op2.chars!) {
          op1.text = op1.text!.slice(op2.chars!);

          op2 = TextOperation._nextTextOp(opIterator2);
        } else if (op1.text!.length === op2.chars) {
          op1 = TextOperation._nextTextOp(opIterator1);
          op2 = TextOperation._nextTextOp(opIterator2);
        } else {
          op2.chars! -= op1.text!.length;

          op1 = TextOperation._nextTextOp(opIterator1);
        }
        continue;
      }

      if (op1.isInsert() && op2.isRetain()) {
        const attributes = this._composeAttributes(
          op1.attributes,
          op2.attributes,
          true
        );

        if (op1.text!.length > op2.chars!) {
          operation.insert(op1.text!.slice(0, op2.chars!), attributes);
          op1.text = op1.text!.slice(op2.chars!);

          op2 = TextOperation._nextTextOp(opIterator2);
        } else if (op1.text!.length === op2.chars) {
          operation.insert(op1.text!, attributes);

          op1 = TextOperation._nextTextOp(opIterator1);
          op2 = TextOperation._nextTextOp(opIterator2);
        } else {
          operation.insert(op1.text!, attributes);
          op2.chars! -= op1.text!.length;

          op1 = TextOperation._nextTextOp(opIterator1);
        }
        continue;
      }

      if (op1.isRetain() && op2.isDelete()) {
        if (op1.chars! > op2.chars!) {
          operation.delete(op2.chars!);
          op1.chars! -= op2.chars!;

          op2 = TextOperation._nextTextOp(opIterator2);
        } else if (op1.chars === op2.chars) {
          operation.delete(op2.chars!);

          op1 = TextOperation._nextTextOp(opIterator1);
          op2 = TextOperation._nextTextOp(opIterator2);
        } else {
          operation.delete(op1.chars!);
          op2.chars! -= op1.chars!;

          op1 = TextOperation._nextTextOp(opIterator1);
        }
        continue;
      }

      Utils.shouldNotBeComposedOrApplied(
        `This should not happen:\nop1: ${op1}\nop2: ${op2}`
      );
    }

    return operation;
  }

  protected _composeAttributes(
    first: ITextOpAttributes | null,
    second: ITextOpAttributes | null,
    firstOpIsInsert: boolean
  ): ITextOpAttributes {
    const merged: ITextOpAttributes = {};

    for (const attr in first) {
      merged[attr] = first[attr];
    }

    for (const attr in second) {
      if (firstOpIsInsert && second[attr] === false) {
        delete merged[attr];
      } else {
        merged[attr] = second[attr];
      }
    }

    return merged;
  }

  protected _getSimpleOp(operation: TextOperation): ITextOp | null {
    const ops = operation.getOps();

    switch (ops.length) {
      case 1: {
        return ops[0];
      }
      case 2: {
        if (ops[0].isRetain()) {
          return ops[1];
        }

        if (ops[1].isRetain()) {
          return ops[0];
        }

        break;
      }
      case 3: {
        if (ops[0].isRetain() && ops[2].isRetain()) {
          return ops[1];
        }

        break;
      }
      default: {
        break;
      }
    }
    return null;
  }

  protected _getStartIndex(operation: TextOperation): number {
    const ops = operation.getOps();

    if (!ops) {
      return 0;
    }

    const firstOp = ops[0];

    if (firstOp && firstOp.isRetain()) {
      return firstOp.chars!;
    }

    return 0;
  }

  shouldBeComposedWith(other: TextOperation): boolean {
    if (this.isNoop() || other.isNoop()) {
      return true;
    }

    const startA = this._getStartIndex(this);
    const startB = this._getStartIndex(other);

    const simpleA = this._getSimpleOp(this);
    const simpleB = this._getSimpleOp(other);

    if (simpleA == null || simpleB == null) {
      return false;
    }

    if (simpleA.isInsert() && simpleB.isInsert()) {
      return startA + simpleA.text!.length === startB;
    }

    if (simpleA.isDelete() && simpleB.isDelete()) {
      // there are two possibilities to delete: with backspace and with the
      // delete key.
      return startB + simpleB.chars! === startA || startA === startB;
    }

    return false;
  }

  shouldBeComposedWithInverted(other: TextOperation): boolean {
    if (this.isNoop() || other.isNoop()) {
      return true;
    }

    const startA = this._getStartIndex(this);
    const startB = this._getStartIndex(other);

    const simpleA = this._getSimpleOp(this);
    const simpleB = this._getSimpleOp(other);

    if (simpleA == null || simpleB == null) {
      return false;
    }

    if (simpleA.isInsert() && simpleB.isInsert()) {
      return startA + simpleA.text!.length === startB || startA === startB;
    }

    if (simpleA.isDelete() && simpleB.isDelete()) {
      return startB + simpleB.chars! === startA;
    }

    return false;
  }

  protected static _transformAttributes(
    attributes1: ITextOpAttributes | null,
    attributes2: ITextOpAttributes | null
  ): [ITextOpAttributes, ITextOpAttributes] {
    const attributes1prime: ITextOpAttributes = {};
    const attributes2prime: ITextOpAttributes = {};

    const allAttrs: ITextOpAttributes = {};

    for (const attr in attributes1) {
      allAttrs[attr] = true;
    }

    for (const attr in attributes2) {
      allAttrs[attr] = true;
    }

    for (const attr in allAttrs) {
      const attr1 = attributes1![attr];
      const attr2 = attributes2![attr];

      Utils.validateTruth(attr1 != null || attr2 != null);

      if (attr1 == null) {
        // Only modified by attributes2; keep it.
        attributes2prime[attr] = attr2;
      } else if (attr2 == null) {
        // only modified by attributes1; keep it
        attributes1prime[attr] = attr1;
      } else if (attr1 === attr2) {
        // Both set it to the same value.  Nothing to do.
      } else {
        // attr1 and attr2 are different. Prefer attr1.
        attributes1prime[attr] = attr1;
      }
    }

    return [attributes1prime, attributes2prime];
  }

  /**
   * Transform takes two operations A and B that happened concurrently and
   * produces two operations A' and B' (in an array) such that
   * `apply(apply(S, A), B') = apply(apply(S, B), A')`. This function is the
   * heart of OT.
   */
  static transform(
    operation1: TextOperation,
    operation2: TextOperation
  ): [TextOperation, TextOperation] {
    Utils.validateEquality(
      operation1._baseLength,
      operation2._baseLength,
      "Both operations have to have the same base length"
    );

    const operation1prime = new TextOperation();
    const operation2prime = new TextOperation();

    const opIterator1 = operation1.clone().getOps().entries();
    const opIterator2 = operation2.clone().getOps().entries();

    let op1: ITextOp | null = TextOperation._nextTextOp(opIterator1);
    let op2: ITextOp | null = TextOperation._nextTextOp(opIterator2);

    while (true) {
      // At every iteration of the loop, the imaginary cursor that both
      // operation1 and operation2 have that operates on the input string must
      // have the same position in the input string.
      if (op1 == null && op2 == null) {
        // end condition: both ops1 and ops2 have been processed
        break;
      }

      // next two cases: one or both ops are insert ops
      // => insert the string in the corresponding prime operation, skip it in
      // the other one. If both op1 and op2 are insert ops, prefer op1.
      if (op1 && op1.isInsert()) {
        operation1prime.insert(op1.text!, op1.attributes);
        operation2prime.retain(op1.text!.length, op1.attributes);
        op1 = TextOperation._nextTextOp(opIterator1);
        continue;
      }

      if (op2 && op2.isInsert()) {
        operation1prime.retain(op2.text!.length, op2.attributes);
        operation2prime.insert(op2.text!, op2.attributes);
        op2 = TextOperation._nextTextOp(opIterator2);
        continue;
      }

      Utils.validateFalse(
        op1 == null,
        "Cannot transform operations: first operation is too short."
      );
      Utils.validateFalse(
        op2 == null,
        "Cannot transform operations: first operation is too long."
      );

      if (op1 == null || op2 == null) {
        /** Above guard rules will throw error anyway, this unreachable code is to provide type support of subequent operations. */
        break;
      }

      if (op1.isRetain() && op2.isRetain()) {
        // Simple case: retain/retain
        let cursorPosition: number = 0;
        const attributesPrime = TextOperation._transformAttributes(
          op1.attributes,
          op2.attributes
        );

        if (op1.chars! > op2.chars!) {
          cursorPosition = op2.chars!;
          op1.chars! -= op2.chars!;

          op2 = TextOperation._nextTextOp(opIterator2);
        } else if (op1.chars === op2.chars) {
          cursorPosition = op2.chars!;

          op1 = TextOperation._nextTextOp(opIterator1);
          op2 = TextOperation._nextTextOp(opIterator2);
        } else {
          cursorPosition = op1.chars!;
          op2.chars! -= op1.chars!;

          op1 = TextOperation._nextTextOp(opIterator1);
        }

        operation1prime.retain(cursorPosition, attributesPrime[0]);
        operation2prime.retain(cursorPosition, attributesPrime[1]);
        continue;
      }

      if (op1.isDelete() && op2.isDelete()) {
        // Both operations delete the same string at the same position. We don't
        // need to produce any operations, we just skip over the delete ops and
        // handle the case that one operation deletes more than the other.
        if (op1.chars! > op2.chars!) {
          op1.chars! -= op2.chars!;

          op2 = TextOperation._nextTextOp(opIterator2);
        } else if (op1.chars === op2.chars) {
          op1 = TextOperation._nextTextOp(opIterator1);
          op2 = TextOperation._nextTextOp(opIterator2);
        } else {
          op2.chars! -= op1.chars!;

          op1 = TextOperation._nextTextOp(opIterator1);
        }
        continue;
      }

      if (op1.isDelete() && op2.isRetain()) {
        let cursorPosition: number = 0;

        if (op1.chars! > op2.chars!) {
          cursorPosition = op2.chars!;
          op1.chars! -= op2.chars!;

          op2 = TextOperation._nextTextOp(opIterator2);
        } else if (op1.chars === op2.chars) {
          cursorPosition = op2.chars!;

          op1 = TextOperation._nextTextOp(opIterator1);
          op2 = TextOperation._nextTextOp(opIterator2);
        } else {
          cursorPosition = op1.chars!;
          op2.chars! -= op1.chars!;

          op1 = TextOperation._nextTextOp(opIterator1);
        }

        operation1prime.delete(cursorPosition);
        continue;
      }

      if (op1.isRetain() && op2.isDelete()) {
        let cursorPosition: number = 0;

        if (op1.chars! > op2.chars!) {
          cursorPosition = op2.chars!;
          op1.chars! -= op2.chars!;

          op2 = TextOperation._nextTextOp(opIterator2);
        } else if (op1.chars === op2.chars) {
          cursorPosition = op1.chars!;

          op1 = TextOperation._nextTextOp(opIterator1);
          op2 = TextOperation._nextTextOp(opIterator2);
        } else {
          cursorPosition = op1.chars!;
          op2.chars! -= op1.chars!;

          op1 = TextOperation._nextTextOp(opIterator1);
        }

        operation2prime.delete(cursorPosition);
        continue;
      }

      Utils.shouldNotBeComposedOrApplied(
        `The two operations aren't compatible:\nop1: ${op1}\nop2: ${op2}`
      );
    }

    return [operation1prime, operation2prime];
  }

  // convenience method to write transform(a, b) as a.transform(b)
  transform(operation: TextOperation): [TextOperation, TextOperation] {
    return TextOperation.transform(this, operation);
  }

  toString(): string {
    return this._ops.map((op) => op.toString()).join(", ");
  }

  toJSON(): TextOperationType {
    const ops: TextOperationType = [];

    for (const op of this._ops) {
      if (!op.hasEmptyAttributes()) {
        ops.push(op.attributes!);
      }

      ops.push(op.valueOf()!);
    }

    // Empty array will be treated as null by Firebase.
    if (ops.length === 0) {
      ops.push(0);
    }

    return ops;
  }

  /**
   * Converts JSON representation of TextOperation into TextOperation object.
   */
  static fromJSON(ops: TextOperationType): TextOperation {
    const t = new TextOperation();
    let attributes: ITextOpAttributes = {};

    for (const op of ops) {
      if (typeof op === "object") {
        attributes = op;
        continue;
      }

      if (typeof op === "string") {
        t.insert(op, attributes);
        attributes = {};
        continue;
      }

      Utils.validateInteger(op);

      if (op < 0) {
        t.delete(-op);
        attributes = {};
        continue;
      }

      t.retain(op, attributes);
      attributes = {};
    }

    return t;
  }
}
