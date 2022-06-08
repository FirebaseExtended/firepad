import { TextOp, TextOptType } from "../src/text-op";

describe("Text Op", () => {
  describe("#isInsert", () => {
    it("should return true for Insert operation", () => {
      const op = new TextOp(TextOptType.Insert, "Hello World", null);
      expect(op.isInsert()).toEqual(true);
    });
  });

  describe("#isDelete", () => {
    it("should return true for Delete operation", () => {
      const op = new TextOp(TextOptType.Delete, 5, null);
      expect(op.isDelete()).toEqual(true);
    });
  });

  describe("#isRetain", () => {
    it("should return true Retain operation", () => {
      const op = new TextOp(TextOptType.Retain, 5, null);
      expect(op.isRetain()).toEqual(true);
    });
  });

  describe("#equals", () => {
    it("should return true if two ops are same", () => {
      const op1 = new TextOp(TextOptType.Insert, "Hello Me", { attr: true });
      const op2 = new TextOp(TextOptType.Insert, "Hello Me", { attr: true });
      expect(op1.equals(op2)).toEqual(true);
    });

    it("should return false if two ops are different", () => {
      const op1 = new TextOp(TextOptType.Insert, "Hello Me", { attr: true });
      const op2 = new TextOp(TextOptType.Delete, 11, null);
      expect(op1.equals(op2)).toEqual(false);
    });
  });

  describe("#attributesEqual", () => {
    it("should return true if two ops have same attributes", () => {
      const op1 = new TextOp(TextOptType.Insert, "Hello Me", { attr: true });
      const op2 = new TextOp(TextOptType.Retain, 12, { attr: true });
      expect(op1.attributesEqual(op2.attributes)).toEqual(true);
    });

    it("should return true if two ops have null attribute", () => {
      const op1 = new TextOp(TextOptType.Delete, 20, null);
      const op2 = new TextOp(TextOptType.Delete, 12, null);
      expect(op1.attributesEqual(op2.attributes)).toEqual(true);
    });

    it("should return false if two ops have different attributes", () => {
      const op1 = new TextOp(TextOptType.Insert, "Hello World", null);
      const op2 = new TextOp(TextOptType.Insert, "Hello World", {
        attr: false,
      });
      expect(op1.attributesEqual(op2.attributes)).toEqual(false);
    });

    it("should return false if two ops have different attribute values", () => {
      const op1 = new TextOp(TextOptType.Insert, "Hello World", { attr: true });
      const op2 = new TextOp(TextOptType.Insert, "Hello World", {
        attr: false,
      });
      expect(op1.attributesEqual(op2.attributes)).toEqual(false);
    });
  });

  describe("#hasEmptyAttributes", () => {
    it("should return true if the op has null attribute", () => {
      const op = new TextOp(TextOptType.Delete, 11, null);
      expect(op.hasEmptyAttributes()).toEqual(true);
    });

    it("should return true if the op has empty attributes", () => {
      const op = new TextOp(TextOptType.Insert, "Hello Me", {});
      expect(op.hasEmptyAttributes()).toEqual(true);
    });

    it("should return false if the op has non-empty attributes", () => {
      const op = new TextOp(TextOptType.Insert, "Hello World", { attr: true });
      expect(op.hasEmptyAttributes()).toEqual(false);
    });
  });

  describe("#toString", () => {
    it("should pretty print Insert operation", () => {
      const text = "Hello World";
      const op = new TextOp(TextOptType.Insert, text, null);
      expect(op.toString()).toEqual(`Insert "${text}"`);
    });

    it("should pretty print Delete operation", () => {
      const chars = 52;
      const op = new TextOp(TextOptType.Delete, chars, null);
      expect(op.toString()).toEqual(`Delete ${chars}`);
    });

    it("should pretty print Retain operation", () => {
      const chars = 34;
      const op = new TextOp(TextOptType.Retain, chars, null);
      expect(op.toString()).toEqual(`Retain ${chars}`);
    });
  });

  describe("#valueOf", () => {
    it("should return text for Insert operation", () => {
      const text = "Hello World";
      const op = new TextOp(TextOptType.Insert, text, null);
      expect(op.valueOf()).toEqual(text);
    });

    it("should return negative character count for Delete operation", () => {
      const chars = 52;
      const op = new TextOp(TextOptType.Delete, chars, null);
      expect(op.valueOf()).toEqual(-chars);
    });

    it("should return character count for Retain operation", () => {
      const chars = 34;
      const op = new TextOp(TextOptType.Retain, chars, null);
      expect(op.valueOf()).toEqual(chars);
    });
  });
});
