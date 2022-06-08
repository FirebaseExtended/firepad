import { TextOp, TextOptType } from "../src/text-op";
import { TextOperation } from "../src/text-operation";

describe("Text Operation", () => {
  describe("#isWrappedOperation", () => {
    it("should return false", () => {
      const operation = new TextOperation();
      expect(operation.isWrappedOperation()).toEqual(false);
    });
  });

  describe("#getOps", () => {
    it("should return shallow copy of the ops list", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";
      const operation = new TextOperation()
        .retain(retainCount, null)
        .insert(insertText, null)
        .delete(deleteCount);
      const ops = [
        new TextOp(TextOptType.Retain, retainCount, null),
        new TextOp(TextOptType.Insert, insertText, null),
        new TextOp(TextOptType.Delete, deleteCount, null),
      ];
      expect(operation.getOps()).toEqual(ops);
    });
  });

  describe("#equals", () => {
    it("should return true if two operation makes the same effect", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";
      const operation1 = new TextOperation()
        .retain(retainCount, null)
        .delete(deleteCount)
        .insert(insertText, null);
      const operation2 = new TextOperation()
        .retain(retainCount, null)
        .insert(insertText, null)
        .delete(deleteCount);
      expect(operation1.equals(operation2)).toEqual(true);
    });

    it("should return false if two operation makes different effect", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";
      const operation1 = new TextOperation()
        .retain(retainCount, null)
        .delete(deleteCount)
        .insert(insertText, null);
      const operation2 = new TextOperation()
        .retain(retainCount, null)
        .delete(deleteCount);
      expect(operation1.equals(operation2)).toEqual(false);
    });

    it("should return false if two operation are to be applied to different document", () => {
      const retainCount = 32,
        deleteCount = 2;
      const operation1 = new TextOperation()
        .retain(retainCount, null)
        .delete(deleteCount);
      const operation2 = new TextOperation()
        .retain(retainCount + 1, null)
        .delete(deleteCount);
      expect(operation1.equals(operation2)).toEqual(false);
    });
  });

  describe("#retain", () => {
    it("should create retain operation", () => {
      const retainCount = 32;
      const operation = new TextOperation().retain(retainCount, null);
      const ops = [new TextOp(TextOptType.Retain, retainCount, null)];
      expect(operation.getOps()).toEqual(ops);
    });

    it("should add characters to last op if last op is also retain", () => {
      const retainCount = 32,
        nextRetainCount = 13;
      const operation = new TextOperation()
        .retain(retainCount, null)
        .retain(nextRetainCount, null);
      const ops = [
        new TextOp(TextOptType.Retain, retainCount + nextRetainCount, null),
      ];
      expect(operation.getOps()).toEqual(ops);
    });

    it("should not create any new op if 0 characters retained", () => {
      const operation = new TextOperation().retain(0, null);
      expect(operation.getOps()).toEqual([]);
    });

    it("should throw error if non-positive number passed as param", () => {
      const fn = () => new TextOperation().retain(-5, null);
      expect(fn).toThrowError();
    });
  });

  describe("#insert", () => {
    it("should create insert operation", () => {
      const insertText = "Hello World";
      const operation = new TextOperation().insert(insertText, null);
      const ops = [new TextOp(TextOptType.Insert, insertText, null)];
      expect(operation.getOps()).toEqual(ops);
    });

    it("should add text to last op if last op is also insert", () => {
      const insertText = "Hello ",
        nextInsertText = "World";
      const operation = new TextOperation()
        .insert(insertText, null)
        .insert(nextInsertText, null);
      const ops = [
        new TextOp(TextOptType.Insert, insertText + nextInsertText, null),
      ];
      expect(operation.getOps()).toEqual(ops);
    });

    it("should add insert op before last op if the last op is delete", () => {
      const insertText = "Hello ",
        nextInsertText = "World",
        deleteCount = 5;
      const operation = new TextOperation()
        .insert(insertText, null)
        .delete(deleteCount)
        .insert(nextInsertText, { attr: true });
      const ops = [
        new TextOp(TextOptType.Insert, insertText, null),
        new TextOp(TextOptType.Insert, nextInsertText, { attr: true }),
        new TextOp(TextOptType.Delete, deleteCount, null),
      ];
      expect(operation.getOps()).toEqual(ops);
    });

    it("should add text to next to last op if the op is insert with same attributes followed by a delete op", () => {
      const insertText = "Hello ",
        nextInsertText = "World",
        deleteCount = 5;
      const operation = new TextOperation()
        .insert(insertText, null)
        .delete(deleteCount)
        .insert(nextInsertText, null);
      const ops = [
        new TextOp(TextOptType.Insert, insertText + nextInsertText, null),
        new TextOp(TextOptType.Delete, deleteCount, null),
      ];
      expect(operation.getOps()).toEqual(ops);
    });

    it("should not create any new op if empty string inserted", () => {
      const operation = new TextOperation().insert("", null);
      expect(operation.getOps()).toEqual([]);
    });
  });

  describe("#delete", () => {
    it("should create delete operation", () => {
      const deleteCount = 32;
      const operation = new TextOperation().delete(deleteCount);
      const ops = [new TextOp(TextOptType.Delete, deleteCount, null)];
      expect(operation.getOps()).toEqual(ops);
    });

    it("should add characters to last op if last op is also delete", () => {
      const deleteCount = 32,
        nextDeleteCount = 13;
      const operation = new TextOperation()
        .delete(deleteCount)
        .delete(nextDeleteCount);
      const ops = [
        new TextOp(TextOptType.Delete, deleteCount + nextDeleteCount, null),
      ];
      expect(operation.getOps()).toEqual(ops);
    });

    it("should convert into number of character deleted if deleted text is passed as param", () => {
      const deleteText = "Hello World";
      const operation = new TextOperation().delete(deleteText);
      const ops = [new TextOp(TextOptType.Delete, deleteText.length, null)];
      expect(operation.getOps()).toEqual(ops);
    });

    it("should not create any new op if 0 characters deleted", () => {
      const operation = new TextOperation().delete(0);
      expect(operation.getOps()).toEqual([]);
    });

    it("should throw error if non-positive number passed as param", () => {
      const fn = () => new TextOperation().delete(-5);
      expect(fn).toThrowError();
    });
  });

  describe("#isNoop", () => {
    it("should return true if there is no ops", () => {
      const operation = new TextOperation();
      expect(operation.isNoop()).toEqual(true);
    });

    it("should return true if the ops does not change document", () => {
      const operation = new TextOperation().retain(5, null).retain(3, null);
      expect(operation.isNoop()).toEqual(true);
    });

    it("should return false if the ops change document", () => {
      const operation = new TextOperation().retain(5, null).delete(3);
      expect(operation.isNoop()).toEqual(false);
    });
  });

  describe("#clone", () => {
    it("should deep clone ops into new text operation", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";
      const operation = new TextOperation()
        .retain(retainCount, null)
        .insert(insertText, null)
        .delete(deleteCount);
      const ops = [
        new TextOp(TextOptType.Retain, retainCount, null),
        new TextOp(TextOptType.Insert, insertText, null),
        new TextOp(TextOptType.Delete, deleteCount, null),
      ];
      expect(operation.clone().getOps()).toEqual(ops);
    });
  });

  describe("#apply", () => {
    it("should apply a text operation to given text content", () => {
      const content = "Hello World";
      const operation = new TextOperation()
        .retain(6, null)
        .insert("Me", null)
        .delete("World");
      expect(operation.apply(content)).toEqual("Hello Me");
    });

    it("should propagate attributes on applying a text operation", () => {
      const content = "Hello World",
        attributes = [];
      const retainCount = 6,
        retainAttrs = { what: "hello" },
        insertText = "Me",
        insertAttrs = { who: "me" };
      const operation = new TextOperation()
        .retain(retainCount, retainAttrs)
        .insert(insertText, insertAttrs)
        .delete(5);
      const composedAttributes = [
        ...Array(retainCount).fill(retainAttrs),
        ...Array(insertText.length).fill(insertAttrs),
      ];
      operation.apply(content, [], attributes);
      expect(attributes).toEqual(composedAttributes);
    });

    it("should throw error if operated over content length", () => {
      const content = "Hello World";
      const operation = new TextOperation().retain(12, null);
      const fn = () => operation.apply(content);
      expect(fn).toThrowError();
    });
  });

  describe("#invert", () => {
    it("should return a text operation that undoes effect of the given one", () => {
      const content = "Hello World";
      const operation = new TextOperation()
        .retain(6, null)
        .insert("Me", null)
        .delete("World");
      const invertedOperation = new TextOperation()
        .retain(6, null)
        .insert("World", null)
        .delete("Me");
      expect(operation.invert(content)).toEqual(invertedOperation);
    });
  });

  describe("#canMergeWith", () => {
    it("should return True if two operation can be applied sequentially", () => {
      const operation = new TextOperation().retain(6, null).insert("Me", null);
      const otherOperation = new TextOperation()
        .retain(8, null)
        .insert("!", null);
      expect(operation.canMergeWith(otherOperation)).toEqual(true);
    });

    it("should return False if two operation can not be applied sequentially", () => {
      const operation = new TextOperation().retain(6, null).insert("Me", null);
      const otherOperation = new TextOperation()
        .retain(6, null)
        .insert("!", null);
      expect(operation.canMergeWith(otherOperation)).toEqual(false);
    });
  });

  describe("#compose", () => {
    it("should return a text operation that produces same effect as two individual ones applied sequentially", () => {
      const content = "Hello World";
      const operation = new TextOperation()
        .retain(6, null)
        .insert("Me", null)
        .delete("World");
      const otherOperation = new TextOperation()
        .retain(6, null)
        .insert("World", null)
        .delete("Me");
      const composedOperation = operation.compose(otherOperation);
      expect(composedOperation.apply(content)).toEqual(content);
    });
  });

  describe("#shouldBeComposedWith", () => {
    it("should return true if either operation has no effect", () => {
      const operation = new TextOperation()
        .retain(6, null)
        .insert("Me", null)
        .delete(5);
      const otherOperation = new TextOperation().retain(12, null);
      expect(operation.shouldBeComposedWith(otherOperation)).toEqual(true);
    });

    it("should return true if insert op from other operation compatible with first one", () => {
      const operation = new TextOperation().retain(6, null).insert("Me", null);
      const otherOperation = new TextOperation()
        .retain(8, null)
        .insert("!", null);
      expect(operation.shouldBeComposedWith(otherOperation)).toEqual(true);
    });

    it("should return true if delete op from other operation compatible with first one", () => {
      const operation = new TextOperation().retain(6, null).delete("Me");
      const otherOperation = new TextOperation().retain(6, null).delete("!");
      expect(operation.shouldBeComposedWith(otherOperation)).toEqual(true);
    });

    it("should return false if two operations are incompatible of each other", () => {
      const operation = new TextOperation().retain(6, null).insert("Me", null);
      const otherOperation = new TextOperation().retain(6, null).delete("!");
      expect(operation.shouldBeComposedWith(otherOperation)).toEqual(false);
    });
  });

  describe("#shouldBeComposedWithInverted", () => {
    it("should return true if either operation has no effect", () => {
      const operation = new TextOperation()
        .retain(6, null)
        .insert("Me", null)
        .delete(5);
      const otherOperation = new TextOperation().retain(12, null);
      expect(operation.shouldBeComposedWithInverted(otherOperation)).toEqual(
        true
      );
    });

    it("should return true if insert op from other operation compatible with first one", () => {
      const operation = new TextOperation().retain(6, null).insert("Me", null);
      const otherOperation = new TextOperation()
        .retain(8, null)
        .insert("!", null);
      expect(operation.shouldBeComposedWithInverted(otherOperation)).toEqual(
        true
      );
    });

    it("should return true if retain op from other operation compatible with first one", () => {
      const operation = new TextOperation().retain(6, null).insert("Me", null);
      const otherOperation = new TextOperation()
        .retain(6, null)
        .insert("!", null);
      expect(operation.shouldBeComposedWithInverted(otherOperation)).toEqual(
        true
      );
    });

    it("should return true if delete op from other operation compatible with first one", () => {
      const operation = new TextOperation().retain(7, null).delete("Me");
      const otherOperation = new TextOperation().retain(6, null).delete("!");
      expect(operation.shouldBeComposedWithInverted(otherOperation)).toEqual(
        true
      );
    });

    it("should return false if two operations are incompatible of each other", () => {
      const operation = new TextOperation().retain(6, null).insert("Me", null);
      const otherOperation = new TextOperation().retain(6, null).delete("!");
      expect(operation.shouldBeComposedWithInverted(otherOperation)).toEqual(
        false
      );
    });
  });

  describe(".transform", () => {
    it("should throw error if two operation came from different document", () => {
      const operation1 = new TextOperation().retain(6, null).insert("Me", null);
      const operation2 = new TextOperation().retain(8, null).insert("!", null);
      const fn = () => TextOperation.transform(operation1, operation2);
      expect(fn).toThrowError();
    });

    it("should transform two operation such that they can be reversed", () => {
      const operation1 = new TextOperation()
        .retain(2, null)
        .insert("Me", null)
        .delete(4)
        .retain(2, null);
      const operation2 = new TextOperation()
        .retain(3, null)
        .insert("!", null)
        .retain(5, null);
      const transformedOperation = new TextOperation()
        .retain(4, null)
        .insert("!", null)
        .retain(2, null);
      expect(TextOperation.transform(operation1, operation2)).toContainEqual(
        transformedOperation
      );
    });
  });

  describe("#transform", () => {
    it("should transform with another operation and return resulting pair", () => {
      const operation = new TextOperation()
        .retain(5, null)
        .insert("Me", null)
        .delete(1);
      const otherOperation = new TextOperation()
        .retain(6, null)
        .insert("!", null);
      expect(operation.transform(otherOperation)).toEqual(
        TextOperation.transform(operation, otherOperation)
      );
    });
  });

  describe("#toString", () => {
    it("should pretty print a text operation", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";
      const operation = new TextOperation()
        .retain(retainCount, null)
        .insert(insertText, null)
        .delete(deleteCount);
      const opString = `Retain ${retainCount}, Insert "${insertText}", Delete ${deleteCount}`;
      expect(operation.toString()).toEqual(opString);
    });
  });

  describe("#toJSON", () => {
    it("should convert text operation into JSON representation", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";
      const operation = new TextOperation()
        .retain(retainCount, null)
        .insert(insertText, null)
        .delete(deleteCount);
      const ops = [retainCount, insertText, -deleteCount];
      expect(operation.toJSON()).toEqual(ops);
    });

    it("should persist attributes of ops", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello",
        attrs = { attr: true };
      const operation = new TextOperation()
        .retain(retainCount, attrs)
        .insert(insertText, null)
        .delete(deleteCount);
      const ops = [attrs, retainCount, insertText, -deleteCount];
      expect(operation.toJSON()).toEqual(ops);
    });

    it("should return 0 character retained if no ops", () => {
      const operation = new TextOperation();
      const ops = [0];
      expect(operation.toJSON()).toEqual(ops);
    });
  });

  describe(".fromJSON", () => {
    it("should convert JSON representation into text operation", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello",
        attrs = { attr: true };
      const operation = new TextOperation()
        .retain(retainCount, attrs)
        .insert(insertText, null)
        .delete(deleteCount);
      const ops = [attrs, retainCount, insertText, -deleteCount];
      expect(TextOperation.fromJSON(ops)).toEqual(operation);
    });
  });
});
