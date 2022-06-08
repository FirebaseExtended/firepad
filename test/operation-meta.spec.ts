import { Cursor } from "../src/cursor";
import { OperationMeta } from "../src/operation-meta";
import { TextOperation } from "../src/text-operation";

describe("Operation Metadata", () => {
  describe("#clone", () => {
    it("should create deep clone of Operation Metadata object", () => {
      const cursorBefore = new Cursor(1, 4);
      const cursorAfter = new Cursor(2, 8);
      const operationMeta = new OperationMeta(cursorBefore, cursorAfter);
      expect(operationMeta.clone()).toEqual(operationMeta);
    });
  });

  describe("#invert", () => {
    it("should swap properties of Operation Metadata object", () => {
      const cursorBefore = new Cursor(1, 4);
      const cursorAfter = new Cursor(2, 8);
      const operationMeta = new OperationMeta(cursorBefore, cursorAfter);
      const invertMeta = new OperationMeta(cursorAfter, cursorBefore);
      expect(operationMeta.invert()).toEqual(invertMeta);
    });
  });

  describe("#compose", () => {
    it("should merge properties of two Operation Metadata object", () => {
      const cursorBefore = new Cursor(1, 4);
      const cursorAfter = new Cursor(2, 8);
      const operationMeta = new OperationMeta(cursorBefore, cursorAfter);
      const cursorBeforeOther = new Cursor(3, 3);
      const cursorAfterOther = new Cursor(4, 9);
      const operationMetaOther = new OperationMeta(
        cursorBeforeOther,
        cursorAfterOther
      );
      const composedMeta = new OperationMeta(cursorBefore, cursorAfterOther);
      expect(operationMeta.compose(operationMetaOther)).toEqual(composedMeta);
    });
  });

  describe("#transform", () => {
    it("should transform properties of Operation Metadata object", () => {
      const cursorBefore = new Cursor(1, 4);
      const cursorAfter = new Cursor(2, 8);
      const operationMeta = new OperationMeta(cursorBefore, cursorAfter);
      const operation = new TextOperation().insert("Hello World", null); // 11 letters inserted.
      const cursorBeforeTransformed = new Cursor(12, 15);
      const cursorAfterTransformed = new Cursor(13, 19);
      const transformedMeta = new OperationMeta(
        cursorBeforeTransformed,
        cursorAfterTransformed
      );
      expect(operationMeta.transform(operation)).toEqual(transformedMeta);
    });

    it("should not throw error for null values", () => {
      const operationMeta = new OperationMeta(null, null);
      const operation = new TextOperation().retain(12, null);
      const fn = () => operationMeta.transform(operation);
      expect(fn).not.toThrowError();
    });
  });

  describe("#getCursor", () => {
    it("should return final position of the Cursor", () => {
      const cursorBefore = new Cursor(1, 4);
      const cursorAfter = new Cursor(2, 8);
      const operationMeta = new OperationMeta(cursorBefore, cursorAfter);
      expect(operationMeta.getCursor()).toEqual(cursorAfter);
    });
  });
});
