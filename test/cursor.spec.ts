import { Cursor } from "../src/cursor";
import { TextOperation } from "../src/text-operation";

describe("Cursor", () => {
  describe(".fromJSON", () => {
    it("should create Cursor object from JSON", () => {
      const cursorData = { position: 5, selectionEnd: 9 };
      const cursor = Cursor.fromJSON(cursorData);
      expect(cursor).toEqual(new Cursor(5, 9));
    });
  });

  describe("#equals", () => {
    it("should check for equality with another cursor with same co-ordinates", () => {
      const cursor = new Cursor(5, 9);
      const otherCursor = new Cursor(5, 9);
      expect(cursor.equals(otherCursor)).toEqual(true);
    });

    it("should check for equality with another cursor with different co-ordinates", () => {
      const cursor = new Cursor(5, 9);
      const otherCursor = new Cursor(15, 18);
      expect(cursor.equals(otherCursor)).toEqual(false);
    });

    it("should check for equality with invalid value", () => {
      const cursor = new Cursor(5, 9);
      expect(cursor.equals(null)).toEqual(false);
    });
  });

  describe("#compose", () => {
    it("should return final cursor", () => {
      const cursor = new Cursor(5, 9);
      const nextCursor = new Cursor(15, 18);
      expect(cursor.compose(nextCursor)).toEqual(nextCursor);
    });
  });

  describe("#transform", () => {
    it("should update cursor based on incoming retain operation", () => {
      const cursor = new Cursor(0, 0);
      const operation = new TextOperation().retain(5, null);
      const nextCursor = cursor.transform(operation);
      expect(nextCursor).toEqual(new Cursor(0, 0));
    });

    it("should update cursor based on incoming insert operation", () => {
      const cursor = new Cursor(0, 1);
      const operation = new TextOperation().insert("Hello World", null); // 11 letters inserted.
      const nextCursor = cursor.transform(operation);
      expect(nextCursor).toEqual(new Cursor(11, 12));
    });

    it("should update cursor based on incoming delete operation", () => {
      const cursor = new Cursor(12, 11);
      const operation = new TextOperation().delete("Hello World"); // 11 letters deleted.
      const nextCursor = cursor.transform(operation);
      expect(nextCursor).toEqual(new Cursor(1, 0));
    });
  });

  describe("#toJSON", () => {
    it("should convert Cursor object into JSON", () => {
      const cursor = new Cursor(6, 13);
      expect(cursor.toJSON()).toEqual({ position: 6, selectionEnd: 13 });
    });
  });
});
