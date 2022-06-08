import * as Utils from "./utils";

export enum TextOptType {
  Insert = "insert",
  Delete = "delete",
  Retain = "retain",
}

export interface ITextOpAttributes {
  [attributeKey: string]: number | boolean | string | symbol;
}

/**
 * Operation are essentially lists of ops. There are three types of ops:
 *
 * **Retain ops:** Advance the cursor position by a given number of characters.
 * Represented by positive ints.
 *
 * **Insert ops:** Insert a given string at the current cursor position.
 * Represented by strings.
 *
 * **Delete ops:** Delete the next n characters. Represented by negative ints.
 */
export interface ITextOp {
  /**
   * Number of characters Retained or Deleted. (`null` in case of Insert)
   */
  chars: number | null;
  /**
   * String to be Inserted. (`null` in case of Retain or Delete)
   */
  text: string | null;
  /**
   * Additional Attributes. (Defaults: `null`)
   */
  attributes: ITextOpAttributes | null;

  /**
   * Tests if it's an Insert Operation.
   */
  isInsert(): boolean;
  /**
   * Tests if it's a Delete Operation.
   */
  isDelete(): boolean;
  /**
   * Tests if it's a Retain Operation.
   */
  isRetain(): boolean;
  /**
   * Tests if two Individual Text Operation equal or not.
   * @param other - Another Text Operation.
   */
  equals(other: ITextOp): boolean;
  /**
   * Tests if two Individual Text Operation have Attributes or not.
   * @param otherAttributes - Another Text Operation Attributes.
   */
  attributesEqual(otherAttributes: ITextOpAttributes | null): boolean;
  /**
   * Tests if this Individual Text Operation has additional Attributes.
   */
  hasEmptyAttributes(): boolean;
  /**
   * Returns String representation of an Individual Text Operation
   */
  toString(): string;
  /**
   * Returns Primitive value of an Individual Text Operation
   */
  valueOf(): string | number | null;
}

export class TextOp implements ITextOp {
  protected readonly _type: TextOptType;

  readonly chars: number | null;
  readonly text: string | null;
  readonly attributes: ITextOpAttributes | null;

  /**
   * Creates an individual Insert Operation
   * @param type - Operation Type - Insert
   * @param charsOrText - Insert string
   * @param attributes - Additional Attributes of the operation
   */
  constructor(
    type: TextOptType.Insert,
    charsOrText: string,
    attributes: ITextOpAttributes | null
  );
  /**
   * Creates an individual Delete Operation
   * @param type - Operation Type - Delete
   * @param charsOrText - Number of characters to delete
   * @param attributes - Additional Attributes of the operation
   */
  constructor(type: TextOptType.Delete, charsOrText: number, attributes: null);
  /**
   * Creates an individual Retain Operation
   * @param type - Operation Type - Retain
   * @param charsOrText - Number of characters to retain
   * @param attributes - Additional Attributes of the operation
   */
  constructor(
    type: TextOptType.Retain,
    charsOrText: number,
    attributes: ITextOpAttributes | null
  );
  constructor(
    type: TextOptType,
    charsOrText: number | string,
    attributes: ITextOpAttributes | null
  ) {
    this._type = type;
    this.chars = null;
    this.text = null;
    this.attributes = null;

    switch (type) {
      case TextOptType.Insert: {
        this.text = charsOrText as string;
        this.attributes = attributes || {};
        break;
      }
      case TextOptType.Delete: {
        this.chars = charsOrText as number;
        break;
      }
      case TextOptType.Retain: {
        this.chars = charsOrText as number;
        this.attributes = attributes || {};
        break;
      }
      default:
        break;
    }
  }

  isInsert(): boolean {
    return this._type === TextOptType.Insert;
  }

  isDelete(): boolean {
    return this._type === TextOptType.Delete;
  }

  isRetain(): boolean {
    return this._type === TextOptType.Retain;
  }

  equals(other: TextOp): boolean {
    return (
      this._type === other._type &&
      this.text === other.text &&
      this.chars === other.chars &&
      this.attributesEqual(other.attributes)
    );
  }

  attributesEqual(otherAttributes: ITextOpAttributes | null): boolean {
    if (otherAttributes == null || this.attributes == null) {
      return this.attributes == otherAttributes;
    }

    for (const attr in this.attributes) {
      if (this.attributes[attr] !== otherAttributes[attr]) {
        return false;
      }
    }

    for (const attr in otherAttributes) {
      if (this.attributes[attr] !== otherAttributes[attr]) {
        return false;
      }
    }

    return true;
  }

  hasEmptyAttributes(): boolean {
    if (this.attributes == null) {
      return true;
    }

    return Object.keys(this.attributes).length === 0;
  }

  toString(): string {
    const text = this.text ? `"${this.text}"` : this.chars;
    return `${Utils.capitalizeFirstLetter(this._type)} ${text}`;
  }

  valueOf(): string | number | null {
    switch (this._type) {
      case TextOptType.Insert: {
        return this.text!;
      }
      case TextOptType.Delete: {
        return -this.chars!;
      }
      case TextOptType.Retain: {
        return this.chars!;
      }
      default:
        break;
    }

    return null;
  }
}
