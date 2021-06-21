import { Cursor } from "../src/cursor";
import { OperationMeta } from "../src/operation-meta";
import { TextOp, TextOptType } from "../src/text-op";
import { TextOperation } from "../src/text-operation";
import { WrappedOperation } from "../src/wrapped-operation";

describe("Wrapped Operation", () => {
  describe("#isWrappedOperation", () => {
    it("should return false", () => {
      const operation = new WrappedOperation(new TextOperation());
      expect(operation.isWrappedOperation()).toEqual(true);
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
      const wrappedOperation = new WrappedOperation(operation);
      const ops = [
        new TextOp(TextOptType.Retain, retainCount, null),
        new TextOp(TextOptType.Insert, insertText, null),
        new TextOp(TextOptType.Delete, deleteCount, null),
      ];
      expect(wrappedOperation.getOps()).toEqual(ops);
    });
  });

  describe("#getCursor", () => {
    it("should return final position of the cursor after the operation", () => {
      const cursorAfter = new Cursor(4, 9);
      const operationMeta = new OperationMeta(null, cursorAfter);
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";
      const operation = new WrappedOperation(new TextOperation(), operationMeta)
        .retain(retainCount, null)
        .insert(insertText, null)
        .delete(deleteCount);
      expect((operation as WrappedOperation).getCursor()).toEqual(cursorAfter);
    });

    it("should return null if the operation does not contain operation metadata", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";
      const operation = new WrappedOperation(new TextOperation())
        .retain(retainCount, null)
        .insert(insertText, null)
        .delete(deleteCount);
      expect((operation as WrappedOperation).getCursor()).toEqual(null);
    });
  });

  describe("#equals", () => {
    it("should return true if a text operation makes the same effect", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";
      const operation1 = new WrappedOperation(new TextOperation())
        .retain(retainCount, null)
        .delete(deleteCount)
        .insert(insertText, null);
      const operation2 = new TextOperation()
        .retain(retainCount, null)
        .insert(insertText, null)
        .delete(deleteCount);
      expect(operation1.equals(operation2)).toEqual(true);
    });

    it("should return true if another wrapped operation makes the same effect", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";
      const operation1 = new WrappedOperation(new TextOperation())
        .retain(retainCount, null)
        .delete(deleteCount)
        .insert(insertText, null);
      const operation2 = new WrappedOperation(new TextOperation())
        .retain(retainCount, null)
        .insert(insertText, null)
        .delete(deleteCount);
      expect(operation1.equals(operation2)).toEqual(true);
    });

    it("should return false if two operation makes different effect", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";
      const operation1 = new WrappedOperation(new TextOperation())
        .retain(retainCount, null)
        .delete(deleteCount)
        .insert(insertText, null);
      const operation2 = new WrappedOperation(new TextOperation())
        .retain(retainCount, null)
        .delete(deleteCount);
      expect(operation1.equals(operation2)).toEqual(false);
    });
  });

  describe("#retain", () => {
    it("should create retain operation", () => {
      const retainCount = 32;
      const operation = new WrappedOperation(new TextOperation()).retain(
        retainCount,
        null
      );
      const ops = [new TextOp(TextOptType.Retain, retainCount, null)];
      expect(operation.getOps()).toEqual(ops);
    });

    it("should add characters to last op if last op is also retain", () => {
      const retainCount = 32,
        nextRetainCount = 13;
      const operation = new WrappedOperation(new TextOperation())
        .retain(retainCount, null)
        .retain(nextRetainCount, null);
      const ops = [
        new TextOp(TextOptType.Retain, retainCount + nextRetainCount, null),
      ];
      expect(operation.getOps()).toEqual(ops);
    });

    it("should not create any new op if 0 characters retained", () => {
      const operation = new WrappedOperation(new TextOperation()).retain(
        0,
        null
      );
      expect(operation.getOps()).toEqual([]);
    });

    it("should throw error if non-positive number passed as param", () => {
      const fn = () =>
        new WrappedOperation(new TextOperation()).retain(-5, null);
      expect(fn).toThrowError();
    });
  });

  describe("#insert", () => {
    it("should create insert operation", () => {
      const insertText = "Hello World";
      const operation = new WrappedOperation(new TextOperation()).insert(
        insertText,
        null
      );
      const ops = [new TextOp(TextOptType.Insert, insertText, null)];
      expect(operation.getOps()).toEqual(ops);
    });

    it("should add text to last op if last op is also insert", () => {
      const insertText = "Hello ",
        nextInsertText = "World";
      const operation = new WrappedOperation(new TextOperation())
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
      const operation = new WrappedOperation(new TextOperation())
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
      const operation = new WrappedOperation(new TextOperation())
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
      const operation = new WrappedOperation(new TextOperation()).insert(
        "",
        null
      );
      expect(operation.getOps()).toEqual([]);
    });
  });

  describe("#delete", () => {
    it("should create delete operation", () => {
      const deleteCount = 32;
      const operation = new WrappedOperation(new TextOperation()).delete(
        deleteCount
      );
      const ops = [new TextOp(TextOptType.Delete, deleteCount, null)];
      expect(operation.getOps()).toEqual(ops);
    });

    it("should add characters to last op if last op is also delete", () => {
      const deleteCount = 32,
        nextDeleteCount = 13;
      const operation = new WrappedOperation(new TextOperation())
        .delete(deleteCount)
        .delete(nextDeleteCount);
      const ops = [
        new TextOp(TextOptType.Delete, deleteCount + nextDeleteCount, null),
      ];
      expect(operation.getOps()).toEqual(ops);
    });

    it("should convert into number of character deleted if deleted text is passed as param", () => {
      const deleteText = "Hello World";
      const operation = new WrappedOperation(new TextOperation()).delete(
        deleteText
      );
      const ops = [new TextOp(TextOptType.Delete, deleteText.length, null)];
      expect(operation.getOps()).toEqual(ops);
    });

    it("should not create any new op if 0 characters deleted", () => {
      const operation = new WrappedOperation(new TextOperation()).delete(0);
      expect(operation.getOps()).toEqual([]);
    });

    it("should throw error if non-positive number passed as param", () => {
      const fn = () => new WrappedOperation(new TextOperation()).delete(-5);
      expect(fn).toThrowError();
    });
  });

  describe("#isNoop", () => {
    it("should return true if there is no ops", () => {
      const operation = new WrappedOperation(new TextOperation());
      expect(operation.isNoop()).toEqual(true);
    });

    it("should return true if the ops does not change document", () => {
      const operation = new WrappedOperation(new TextOperation())
        .retain(5, null)
        .retain(3, null);
      expect(operation.isNoop()).toEqual(true);
    });

    it("should return false if the ops change document", () => {
      const operation = new WrappedOperation(new TextOperation())
        .retain(5, null)
        .delete(3);
      expect(operation.isNoop()).toEqual(false);
    });
  });

  describe("#getOperation", () => {
    it("should return text operation from deep cloned ops", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";
      const wrappedOperation = new WrappedOperation(new TextOperation())
        .retain(retainCount, null)
        .insert(insertText, null)
        .delete(deleteCount);
      const textOperation = new TextOperation()
        .retain(retainCount, null)
        .insert(insertText, null)
        .delete(deleteCount);
      expect((wrappedOperation as WrappedOperation).getOperation()).toEqual(
        textOperation
      );
    });
  });

  describe("#clone", () => {
    it("should deep clone ops into new wrapped operation", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";
      const operation = new WrappedOperation(new TextOperation())
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

    it("should shallow clone metadata into new wrapped operation", () => {
      const cursorAfter = new Cursor(4, 9);
      const operationMeta = new OperationMeta(null, cursorAfter);
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";
      const operation = new WrappedOperation(new TextOperation(), operationMeta)
        .retain(retainCount, null)
        .insert(insertText, null)
        .delete(deleteCount);
      expect((operation.clone() as WrappedOperation).getCursor()).toEqual(
        cursorAfter
      );
    });
  });

  describe("#apply", () => {
    it("should apply a wrapped operation to given text content", () => {
      const content = "Hello World";
      const operation = new WrappedOperation(new TextOperation())
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
      const operation = new WrappedOperation(new TextOperation())
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
      const operation = new WrappedOperation(new TextOperation()).retain(
        12,
        null
      );
      const fn = () => operation.apply(content);
      expect(fn).toThrowError();
    });
  });

  describe("#invert", () => {
    it("should return a wrapped operation that undoes effect of the given one", () => {
      const content = "Hello World";
      const operation = new WrappedOperation(new TextOperation())
        .retain(6, null)
        .insert("Me", null)
        .delete("World");
      const invertedOperation = new WrappedOperation(new TextOperation())
        .retain(6, null)
        .insert("World", null)
        .delete("Me");
      expect(operation.invert(content)).toEqual(invertedOperation);
    });

    it("should return a wrapped operation that undoes positions of cursors", () => {
      const content = "Hello World";
      const cursorBefore = new Cursor(4, 9);
      const operationMeta = new OperationMeta(cursorBefore, null);
      const operation = new WrappedOperation(new TextOperation(), operationMeta)
        .retain(6, null)
        .insert("Me", null)
        .delete("World");
      const invertedOperationMeta = new OperationMeta(null, cursorBefore);
      const invertedOperation = new WrappedOperation(
        new TextOperation(),
        invertedOperationMeta
      )
        .retain(6, null)
        .insert("World", null)
        .delete("Me");
      expect(operation.invert(content)).toEqual(invertedOperation);
    });
  });

  describe("#transform", () => {
    it("should transform two operation such that they can be reversed", () => {
      const operation1 = new WrappedOperation(new TextOperation())
        .retain(2, null)
        .insert("Me", null)
        .delete(4)
        .retain(2, null);
      const operation2 = new WrappedOperation(new TextOperation())
        .retain(3, null)
        .insert("!", null)
        .retain(5, null);
      const transformedOperation = new WrappedOperation(new TextOperation())
        .retain(4, null)
        .insert("!", null)
        .retain(2, null);
      expect(operation1.transform(operation2)).toContainEqual(
        transformedOperation
      );
    });

    it("should transform cursor positions of two operation such that they can be reversed", () => {
      const operationMeta1 = new OperationMeta(
        new Cursor(0, 0),
        new Cursor(2, 4)
      );
      const operation1 = new WrappedOperation(
        new TextOperation(),
        operationMeta1
      )
        .retain(2, null)
        .insert("Me", null)
        .delete(4)
        .retain(2, null);
      const operationMeta2 = new OperationMeta(
        new Cursor(3, 3),
        new Cursor(4, 4)
      );
      const operation2 = new WrappedOperation(
        new TextOperation(),
        operationMeta2
      )
        .retain(3, null)
        .insert("!", null)
        .retain(5, null);
      const transformedOperation = operation1.transform(operation2);
      expect(transformedOperation[1].getCursor()).toEqual(new Cursor(4, 4));
    });
  });

  describe("#canMergeWith", () => {
    it("should return True if two operation can be applied sequentially", () => {
      const operation = new WrappedOperation(new TextOperation())
        .retain(6, null)
        .insert("Me", null);
      const otherOperation = new WrappedOperation(new TextOperation())
        .retain(8, null)
        .insert("!", null);
      expect(operation.canMergeWith(otherOperation)).toEqual(true);
    });
  });

  describe("#compose", () => {
    it("should return a wrapped operation that produces same effect as two individual ones applied sequentially", () => {
      const content = "Hello World";
      const operation = new WrappedOperation(new TextOperation())
        .retain(6, null)
        .insert("Me", null)
        .delete("World");
      const otherOperation = new WrappedOperation(new TextOperation())
        .retain(6, null)
        .insert("World", null)
        .delete("Me");
      const composedOperation = operation.compose(otherOperation);
      expect(composedOperation.apply(content)).toEqual(content);
    });

    it("should return a wrapped operation that combines cursor movement of two individual ones applied sequentially", () => {
      const operationMeta = new OperationMeta(
        new Cursor(2, 9),
        new Cursor(3, 5)
      );
      const operation = new WrappedOperation(new TextOperation(), operationMeta)
        .retain(6, null)
        .insert("Me", null)
        .delete("World");
      const cursorAfter = new Cursor(4, 7);
      const otherOperationMeta = new OperationMeta(
        new Cursor(3, 9),
        cursorAfter
      );
      const otherOperation = new WrappedOperation(
        new TextOperation(),
        otherOperationMeta
      )
        .retain(6, null)
        .insert("World", null)
        .delete("Me");
      const composedOperation = operation.compose(otherOperation);
      expect(composedOperation.getCursor()).toEqual(cursorAfter);
    });

    it("should keep metadata of current operation if the next one does not have any", () => {
      const cursorAfter = new Cursor(4, 7);
      const operationMeta = new OperationMeta(new Cursor(2, 9), cursorAfter);
      const operation = new WrappedOperation(new TextOperation(), operationMeta)
        .retain(6, null)
        .insert("Me", null)
        .delete("World");
      const otherOperation = new WrappedOperation(new TextOperation())
        .retain(6, null)
        .insert("World", null)
        .delete("Me");
      const composedOperation = operation.compose(otherOperation);
      expect(composedOperation.getCursor()).toEqual(cursorAfter);
    });
  });

  describe("#shouldBeComposedWith", () => {
    it("should return true if either operation has no effect", () => {
      const operation = new WrappedOperation(new TextOperation())
        .retain(6, null)
        .insert("Me", null)
        .delete(5);
      const otherOperation = new WrappedOperation(new TextOperation()).retain(
        12,
        null
      );
      expect(operation.shouldBeComposedWith(otherOperation)).toEqual(true);
    });

    it("should return true if insert op from other operation compatible with first one", () => {
      const operation = new WrappedOperation(new TextOperation())
        .retain(6, null)
        .insert("Me", null);
      const otherOperation = new WrappedOperation(new TextOperation())
        .retain(8, null)
        .insert("!", null);
      expect(operation.shouldBeComposedWith(otherOperation)).toEqual(true);
    });

    it("should return true if delete op from other operation compatible with first one", () => {
      const operation = new WrappedOperation(new TextOperation())
        .retain(6, null)
        .delete("Me");
      const otherOperation = new WrappedOperation(new TextOperation())
        .retain(6, null)
        .delete("!");
      expect(operation.shouldBeComposedWith(otherOperation)).toEqual(true);
    });

    it("should return false if two operations are incompatible of each other", () => {
      const operation = new WrappedOperation(new TextOperation())
        .retain(6, null)
        .insert("Me", null);
      const otherOperation = new WrappedOperation(new TextOperation())
        .retain(6, null)
        .delete("!");
      expect(operation.shouldBeComposedWith(otherOperation)).toEqual(false);
    });
  });

  describe("#shouldBeComposedWithInverted", () => {
    it("should return true if either operation has no effect", () => {
      const operation = new WrappedOperation(new TextOperation())
        .retain(6, null)
        .insert("Me", null)
        .delete(5);
      const otherOperation = new TextOperation().retain(12, null);
      expect(operation.shouldBeComposedWithInverted(otherOperation)).toEqual(
        true
      );
    });

    it("should return true if insert op from other operation compatible with first one", () => {
      const operation = new WrappedOperation(new TextOperation())
        .retain(6, null)
        .insert("Me", null);
      const otherOperation = new WrappedOperation(new TextOperation())
        .retain(8, null)
        .insert("!", null);
      expect(operation.shouldBeComposedWithInverted(otherOperation)).toEqual(
        true
      );
    });

    it("should return true if retain op from other operation compatible with first one", () => {
      const operation = new WrappedOperation(new TextOperation())
        .retain(6, null)
        .insert("Me", null);
      const otherOperation = new WrappedOperation(new TextOperation())
        .retain(6, null)
        .insert("!", null);
      expect(operation.shouldBeComposedWithInverted(otherOperation)).toEqual(
        true
      );
    });

    it("should return true if delete op from other operation compatible with first one", () => {
      const operation = new WrappedOperation(new TextOperation())
        .retain(7, null)
        .delete("Me");
      const otherOperation = new WrappedOperation(new TextOperation())
        .retain(6, null)
        .delete("!");
      expect(operation.shouldBeComposedWithInverted(otherOperation)).toEqual(
        true
      );
    });

    it("should return false if two operations are incompatible of each other", () => {
      const operation = new WrappedOperation(new TextOperation())
        .retain(6, null)
        .insert("Me", null);
      const otherOperation = new WrappedOperation(new TextOperation())
        .retain(6, null)
        .delete("!");
      expect(operation.shouldBeComposedWithInverted(otherOperation)).toEqual(
        false
      );
    });
  });

  describe("#toString", () => {
    it("should pretty print a text operation", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";
      const operation = new WrappedOperation(new TextOperation())
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
      const operation = new WrappedOperation(new TextOperation())
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
      const operation = new WrappedOperation(new TextOperation())
        .retain(retainCount, attrs)
        .insert(insertText, null)
        .delete(deleteCount);
      const ops = [attrs, retainCount, insertText, -deleteCount];
      expect(operation.toJSON()).toEqual(ops);
    });

    it("should return 0 character retained if no ops", () => {
      const operation = new WrappedOperation(new TextOperation());
      const ops = [0];
      expect(operation.toJSON()).toEqual(ops);
    });
  });
});
