describe('AnnotationList', function() {
  var AnnotationList = firepad.AnnotationList;
  var Span = firepad.Span;
  var h = helpers;

  var n = 500;

  function TestAnnotation(a) {
    this.a = a;
  }

  TestAnnotation.prototype.equals = function(other) {
    return this.a === other.a;
  };

  var oldSpans, newSpans;
  function changeHandler(oldS, newS) {
    oldSpans = oldS;
    newSpans = newS;
  }

  function testSpan(span, pos, length) {
    if (arguments.length === 2) { // 'pos' is actually a span.
      length = pos.length;
      pos = pos.pos;
    }
    expect(span.pos).toBe(pos);
    expect(span.length).toBe(length);
  }

  it('Insert1', function() {
    var list = new AnnotationList(changeHandler);

    // Insert into empty list.
    list.insertAnnotatedSpan(new Span(0, 5), new TestAnnotation('a'));
    expect(oldSpans.length).toBe(0);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 0, 5);
    expect(newSpans[0].annotation.equals(new TestAnnotation('a'))).toBe(true);

    // Merge beginning.
    list.insertAnnotatedSpan(new Span(0, 6), new TestAnnotation('a'));
    expect(oldSpans.length).toBe(1);
    testSpan(oldSpans[0], 0, 5);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 0, 11);

    // Merge end.
    list.insertAnnotatedSpan(new Span(11, 7), new TestAnnotation('a'));
    expect(oldSpans.length).toBe(1);
    testSpan(oldSpans[0], 0, 11);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 0, 18);

    // Merge middle.
    list.insertAnnotatedSpan(new Span(5, 8), new TestAnnotation('a'));
    expect(oldSpans.length).toBe(1);
    testSpan(oldSpans[0], 0, 18);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 0, 26);
    expect(newSpans[0].annotation.equals(new TestAnnotation('a'))).toBe(true);

    expect(list.count() === 1).toBe(true);
  });

  it('Insert2', function() {
    var list = new AnnotationList(changeHandler);

    // Insert into empty list.
    list.insertAnnotatedSpan(new Span(0, 5), new TestAnnotation('a'));
    expect(oldSpans.length).toBe(0);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 0, 5);
    expect(newSpans[0].annotation.equals(new TestAnnotation('a'))).toBe(true);

    // Prepend with different annotation.
    list.insertAnnotatedSpan(new Span(0, 6), new TestAnnotation('b'));
    expect(oldSpans.length).toBe(0);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 0, 6);
    expect(newSpans[0].annotation.equals(new TestAnnotation('b'))).toBe(true);

    // Append with different annotation.
    list.insertAnnotatedSpan(new Span(11, 7), new TestAnnotation('b'));
    expect(oldSpans.length).toBe(0);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 11, 7);
    expect(newSpans[0].annotation.equals(new TestAnnotation('b'))).toBe(true);

    // Insert on boundary with same annotation as predecessor.
    list.insertAnnotatedSpan(new Span(6, 8), new TestAnnotation('b'));
    expect(oldSpans.length).toBe(1);
    testSpan(oldSpans[0], 0, 6);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 0, 14);
    expect(newSpans[0].annotation.equals(new TestAnnotation('b'))).toBe(true);

    // Insert on boundary with same annotation as successor.
    list.insertAnnotatedSpan(new Span(14, 9), new TestAnnotation('a'));
    expect(oldSpans.length).toBe(1);
    testSpan(oldSpans[0], 14, 5);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 14, 14);
    expect(newSpans[0].annotation.equals(new TestAnnotation('a'))).toBe(true);

    // Insert in middle of node, with different annotation.
    list.insertAnnotatedSpan(new Span(3, 10), new TestAnnotation('c'));
    expect(oldSpans.length).toBe(1);
    testSpan(oldSpans[0], 0, 14);
    expect(newSpans.length).toBe(3);
    testSpan(newSpans[0], 0, 3);
    expect(newSpans[0].annotation.equals(new TestAnnotation('b'))).toBe(true);
    testSpan(newSpans[1], 3, 10);
    expect(newSpans[1].annotation.equals(new TestAnnotation('c'))).toBe(true);
    testSpan(newSpans[2], 13, 11);
    expect(newSpans[2].annotation.equals(new TestAnnotation('b'))).toBe(true);

    expect(list.count()).toBe(5);
  });

  it('BadInserts', function() {
    var list = new AnnotationList(changeHandler);

    expect(function() {
      list.insertAnnotatedSpan(new Span(1, 1), new TestAnnotation('a'));
    }).toThrow();

    list.insertAnnotatedSpan(new Span(0, 1), new TestAnnotation('a'));

    expect(function() {
      list.insertAnnotatedSpan(new Span(3, 1), new TestAnnotation('a'));
    }).toThrow();

  });

  it('Remove1', function() {
    var list = new AnnotationList(changeHandler);

    // Insert into empty list.
    list.insertAnnotatedSpan(new Span(0, 20), new TestAnnotation('a'));
    expect(oldSpans.length).toBe(0);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 0, 20);
    expect(newSpans[0].annotation.equals(new TestAnnotation('a'))).toBe(true);

    // Remove beginning.
    list.removeSpan(new Span(0, 5));
    expect(oldSpans.length).toBe(1);
    testSpan(oldSpans[0], 0, 20);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 0, 15);

    // Remove end.
    list.removeSpan(new Span(9, 6));
    expect(oldSpans.length).toBe(1);
    testSpan(oldSpans[0], 0, 15);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 0, 9);

    // Remove middle.
    list.removeSpan(new Span(5, 1));
    expect(oldSpans.length).toBe(1);
    testSpan(oldSpans[0], 0, 9);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 0, 8);
    expect(list.count()).toBe(1);

    // Remove all.
    list.removeSpan(new Span(0, 8));
    expect(oldSpans.length).toBe(1);
    testSpan(oldSpans[0], 0, 8);
    expect(newSpans.length).toBe(0);
    expect(list.count()).toBe(0);

  });

  it('Remove2', function() {
    var list = new AnnotationList(changeHandler);

    // Insert into empty list.
    list.insertAnnotatedSpan(new Span(0, 10), new TestAnnotation('a'));
    list.insertAnnotatedSpan(new Span(10, 10), new TestAnnotation('b'));
    expect(list.count()).toBe(2);

    // Remove end of first span.
    list.removeSpan(new Span(8, 2));
    expect(oldSpans.length).toBe(1);
    testSpan(oldSpans[0], 0, 10);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 0, 8);
    expect(newSpans[0].annotation.equals(new TestAnnotation('a'))).toBe(true);

    // Remove beginning of second span.
    list.removeSpan(new Span(8, 3));
    expect(oldSpans.length).toBe(1);
    testSpan(oldSpans[0], 8, 10);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 8, 7);
    expect(newSpans[0].annotation.equals(new TestAnnotation('b'))).toBe(true);

    // Remove part of first and second span.
    list.removeSpan(new Span(5, 8));
    expect(oldSpans.length).toBe(2);
    testSpan(oldSpans[0], 0, 8);
    testSpan(oldSpans[1], 8, 7);
    expect(newSpans.length).toBe(2);
    testSpan(newSpans[0], 0, 5);
    expect(newSpans[0].annotation.equals(new TestAnnotation('a'))).toBe(true);
    testSpan(newSpans[1], 5, 2);
    expect(newSpans[1].annotation.equals(new TestAnnotation('b'))).toBe(true);

    expect(list.count()).toBe(2);

  });

  it('Remove3', function() {
    var list = new AnnotationList(changeHandler);

    // Insert into empty list.
    list.insertAnnotatedSpan(new Span(0, 10), new TestAnnotation('a'));
    list.insertAnnotatedSpan(new Span(10, 10), new TestAnnotation('b'));
    expect(list.count()).toBe(2);

    // Remove end of first span.
    list.removeSpan(new Span(8, 2));
    expect(oldSpans.length).toBe(1);
    testSpan(oldSpans[0], 0, 10);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 0, 8);
    expect(newSpans[0].annotation.equals(new TestAnnotation('a'))).toBe(true);

    // Remove beginning of second span.
    list.removeSpan(new Span(8, 3));
    expect(oldSpans.length).toBe(1);
    testSpan(oldSpans[0], 8, 10);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 8, 7);
    expect(newSpans[0].annotation.equals(new TestAnnotation('b'))).toBe(true);

    // Remove part of first and second span.
    list.removeSpan(new Span(5, 8));
    expect(oldSpans.length).toBe(2);
    testSpan(oldSpans[0], 0, 8);
    testSpan(oldSpans[1], 8, 7);
    expect(newSpans.length).toBe(2);
    testSpan(newSpans[0], 0, 5);
    expect(newSpans[0].annotation.equals(new TestAnnotation('a'))).toBe(true);
    testSpan(newSpans[1], 5, 2);
    expect(newSpans[1].annotation.equals(new TestAnnotation('b'))).toBe(true);

    expect(list.count()).toBe(2);

  });

  it('Remove4', function() {
    var list = new AnnotationList(changeHandler);

    // Insert into empty list.
    list.insertAnnotatedSpan(new Span(0, 10), new TestAnnotation('a'));
    list.insertAnnotatedSpan(new Span(10, 10), new TestAnnotation('b'));
    list.insertAnnotatedSpan(new Span(20, 10), new TestAnnotation('a'));
    list.insertAnnotatedSpan(new Span(30, 10), new TestAnnotation('b'));
    expect(list.count()).toBe(4);

    // remove half of 2nd and 3rd spans.
    list.removeSpan(new Span(15, 10));
    expect(oldSpans.length).toBe(2);
    testSpan(oldSpans[0], 10, 10);
    testSpan(oldSpans[1], 20, 10);
    expect(newSpans.length).toBe(2);
    testSpan(newSpans[0], 10, 5);
    testSpan(newSpans[1], 15, 5);

    // remove remaining 3rd span.
    list.removeSpan(new Span(15, 5));
    expect(oldSpans.length).toBe(3);
    testSpan(oldSpans[0], 10, 5);
    testSpan(oldSpans[1], 15, 5);
    testSpan(oldSpans[2], 20, 10);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 10, 15);
    expect(newSpans[0].annotation.equals(new TestAnnotation('b'))).toBe(true);

    expect(list.count()).toBe(2);

  });


  it('Remove5', function() {
    var removes = [
      {span: new Span(8, 12), resultLength: 18},  // part of first, all of 2nd
      {span: new Span(8, 14), resultLength: 16},  // part of first, all of 2nd, part of 3rd
      {span: new Span(10, 10), resultLength: 20}, // all of 2nd
      {span: new Span(10, 12), resultLength: 18}  // all of 2nd, part of 3rd
    ];

    for(var i = 0; i < removes.length; i++) {
      var list = new AnnotationList(changeHandler);
      list.insertAnnotatedSpan(new Span(0, 10), new TestAnnotation('a'));
      list.insertAnnotatedSpan(new Span(10, 10), new TestAnnotation('b'));
      list.insertAnnotatedSpan(new Span(20, 10), new TestAnnotation('a'));
      expect(list.count()).toBe(3);

      list.removeSpan(removes[i].span);

      expect(oldSpans.length).toBe(3);
      testSpan(oldSpans[0], 0, 10);
      testSpan(oldSpans[1], 10, 10);
      testSpan(oldSpans[2], 20, 10);

      expect(newSpans.length).toBe(1);
      testSpan(newSpans[0], 0, removes[i].resultLength);

      expect(list.count()).toBe(1);
    }

  });

  it('Remove6', function() {
    function verify(opts) {
      var list = new AnnotationList(changeHandler);
      list.insertAnnotatedSpan(new Span(0, 10), new TestAnnotation('a'));
      list.insertAnnotatedSpan(new Span(10, 10), new TestAnnotation('b'));
      list.insertAnnotatedSpan(new Span(20, 10), new TestAnnotation('c'));
      expect(list.count()).toBe(3);

      list.removeSpan(opts.span);

      expect(oldSpans.length).toBe(opts.oldSpans.length);
      for(var i = 0; i < opts.oldSpans.length; i++) {
        testSpan(opts.oldSpans[i], oldSpans[i]);
      }
      expect(newSpans.length).toBe(opts.newSpans.length);
      for(i = 0; i < opts.newSpans.length; i++) {
        testSpan(opts.newSpans[i], newSpans[i]);
      }

      expect(list.count()).toBe(3 - opts.oldSpans.length + opts.newSpans.length);
    }

    // part of first, part of 2nd
    verify({
      span: new Span(8, 5),
      oldSpans: [new Span(0, 10), new Span(10, 10)],
      newSpans: [new Span(0, 8), new Span(8, 7)]
    });
    // part of first, all of 2nd
    verify({
      span: new Span(8, 12),
      oldSpans: [new Span(0, 10), new Span(10, 10)],
      newSpans: [new Span(0, 8)]
    });
    // part of first, all of 2nd, part of 3rd
    verify({
      span: new Span(8, 14),
      oldSpans: [new Span(0, 10), new Span(10, 10), new Span(20, 10)],
      newSpans: [new Span(0, 8), new Span(8, 8)]
    });
    // all of 2nd
    verify({
      span: new Span(10, 10),
      oldSpans: [new Span(10, 10)],
      newSpans: []
    });
    // all of 2nd, part of 3rd
    verify({
      span: new Span(10, 12),
      oldSpans: [new Span(10, 10), new Span(20, 10)],
      newSpans: [new Span(10, 8)]
    });
    // part of 2nd, part of 3rd
    verify({
      span: new Span(12, 12),
      oldSpans: [new Span(10, 10), new Span(20, 10)],
      newSpans: [new Span(10, 2), new Span(12, 6)]
    });
    // part of 2nd, all of 3rd
    verify({
      span: new Span(12, 18),
      oldSpans: [new Span(10, 10), new Span(20, 10)],
      newSpans: [new Span(10, 2)]
    });
    // everything
    verify({
      span: new Span(0, 30),
      oldSpans: [new Span(0, 10), new Span(10, 10), new Span(20, 10)],
      newSpans: []
    });

  });

  it('Remove7', function() {
    var list = new AnnotationList(changeHandler);

    list.insertAnnotatedSpan(new Span(0, 10), new TestAnnotation('a'));
    list.insertAnnotatedSpan(new Span(10, 10), new TestAnnotation('b'));
    list.insertAnnotatedSpan(new Span(20, 10), new TestAnnotation('a'));
    list.insertAnnotatedSpan(new Span(30, 10), new TestAnnotation('c'));
    expect(list.count()).toBe(4);

    // remove 'b' segment.
    list.removeSpan(new Span(10, 10));
    expect(oldSpans.length).toBe(3);
    testSpan(oldSpans[0], 0, 10);
    testSpan(oldSpans[1], 10, 10);
    testSpan(oldSpans[2], 20, 10);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 0, 20);

    expect(list.count()).toBe(2);

  });

  it('Remove8', function() {
    var list = new AnnotationList(changeHandler);

    list.insertAnnotatedSpan(new Span(0, 3), new TestAnnotation('a'));
    list.insertAnnotatedSpan(new Span(3, 1), new TestAnnotation('b'));
    list.insertAnnotatedSpan(new Span(4, 3), new TestAnnotation('a'));
    expect(list.count()).toBe(3);

    // remove 'b' segment.
    list.removeSpan(new Span(3, 1));
    expect(oldSpans.length).toBe(3);
    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 0, 6);
  });

  it('BadRemove1', function() {
    var list = new AnnotationList(changeHandler);
    list.insertAnnotatedSpan(new Span(0, 10), new TestAnnotation('a'));
    list.insertAnnotatedSpan(new Span(10, 10), new TestAnnotation('b'));
    list.insertAnnotatedSpan(new Span(20, 10), new TestAnnotation('c'));

    expect(function() {
      list.removeSpan(new Span(25, 10));
    }).toThrow();
    expect(function() {
      list.removeSpan(new Span(30, 1));
    }).toThrow();
    expect(function() {
      list.removeSpan(new Span(35, 1));
    }).toThrow();
  });

  it('Update1', function() {
    var list = new AnnotationList(changeHandler);
    list.insertAnnotatedSpan(new Span(0, 10), new TestAnnotation('a'));
    list.insertAnnotatedSpan(new Span(10, 10), new TestAnnotation('b'));
    list.insertAnnotatedSpan(new Span(20, 10), new TestAnnotation('c'));

    // Update all spans.
    list.updateSpan(new Span(0, 30), function(annotation) {
      return new TestAnnotation(annotation.a + 'x');
    });

    expect(oldSpans.length).toBe(3);
    testSpan(oldSpans[0], 0, 10);
    testSpan(oldSpans[1], 10, 10);
    testSpan(oldSpans[2], 20, 10);
    expect(newSpans.length).toBe(3);
    testSpan(newSpans[0], 0, 10);
    expect(newSpans[0].annotation.equals(new TestAnnotation('ax'))).toBe(true);
    testSpan(newSpans[1], 10, 10);
    expect(newSpans[1].annotation.equals(new TestAnnotation('bx'))).toBe(true);
    testSpan(newSpans[2], 20, 10);
    expect(newSpans[2].annotation.equals(new TestAnnotation('cx'))).toBe(true);

  });

  it('Update2', function() {
    var list = new AnnotationList(changeHandler);
    list.insertAnnotatedSpan(new Span(0, 10), new TestAnnotation('a'));
    list.insertAnnotatedSpan(new Span(10, 10), new TestAnnotation('b'));
    list.insertAnnotatedSpan(new Span(20, 10), new TestAnnotation('c'));

    // Update only part of first/last span.
    list.updateSpan(new Span(5, 20), function(annotation) {
      return new TestAnnotation(annotation.a + 'x');
    });

    expect(oldSpans.length).toBe(3);
    testSpan(oldSpans[0], 0, 10);
    testSpan(oldSpans[1], 10, 10);
    testSpan(oldSpans[2], 20, 10);

    expect(newSpans.length).toBe(5);
    testSpan(newSpans[0], 0, 5);
    expect(newSpans[0].annotation.equals(new TestAnnotation('a'))).toBe(true);
    testSpan(newSpans[1], 5, 5);
    expect(newSpans[1].annotation.equals(new TestAnnotation('ax'))).toBe(true);
    testSpan(newSpans[2], 10, 10);
    expect(newSpans[2].annotation.equals(new TestAnnotation('bx'))).toBe(true);
    testSpan(newSpans[3], 20, 5);
    expect(newSpans[3].annotation.equals(new TestAnnotation('cx'))).toBe(true);
    testSpan(newSpans[4], 25, 5);
    expect(newSpans[4].annotation.equals(new TestAnnotation('c'))).toBe(true);

  });

  it('Update3', function() {
    var list = new AnnotationList(changeHandler);
    list.insertAnnotatedSpan(new Span(0, 10), new TestAnnotation('a'));
    list.insertAnnotatedSpan(new Span(10, 10), new TestAnnotation('b'));
    list.insertAnnotatedSpan(new Span(20, 10), new TestAnnotation('c'));

    list.updateSpan(new Span(5, 15), function(annotation) {
      return new TestAnnotation('a');
    });

    expect(oldSpans.length).toBe(2);
    testSpan(oldSpans[0], 0, 10);
    testSpan(oldSpans[1], 10, 10);

    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 0, 20);
    expect(newSpans[0].annotation.equals(new TestAnnotation('a'))).toBe(true);

  });

  it('Update4', function() {
    var list = new AnnotationList(changeHandler);
    list.insertAnnotatedSpan(new Span(0, 10), new TestAnnotation('a'));
    list.insertAnnotatedSpan(new Span(10, 10), new TestAnnotation('b'));
    list.insertAnnotatedSpan(new Span(20, 10), new TestAnnotation('c'));

    list.updateSpan(new Span(10, 10), function(annotation) {
      return new TestAnnotation('c');
    });

    expect(oldSpans.length).toBe(2);
    testSpan(oldSpans[0], 10, 10);
    testSpan(oldSpans[1], 20, 10);

    expect(newSpans.length).toBe(1);
    testSpan(newSpans[0], 10, 20);
    expect(newSpans[0].annotation.equals(new TestAnnotation('c'))).toBe(true);
  });

  function AttributesAnnotation(attrs) {
    this.attrs = attrs;
  }

  AttributesAnnotation.prototype.equals = function(other) {
    if (!(other instanceof AttributesAnnotation)) {
      return false;
    }
    var attr;
    for(attr in this.attrs) {
      if (other.attrs[attr] !== this.attrs[attr]) {
        return false;
      }
    }

    for(attr in other.attrs) {
      if (other.attrs[attr] !== this.attrs[attr]) {
        return false;
      }
    }

    return true;
  };

  it('RandomOperations', helpers.randomTest(n, function() {
    var str = h.randomString(50);
    var attributes = h.randomAttributesArray(50);
    var o = h.randomOperation(str, /*useAttributes=*/true);
    var attributesFromApply = [ ];
    o.apply(str, attributes, attributesFromApply);

    // Apply operation to an annotation list.
    var attributesFromEvents = [ ];
    var list = new AnnotationList(function(oldNodes, newNodes) {
      var deletedChars = 0;
      for(var i = 0; i < oldNodes.length; i++) {
        expect(oldNodes[i].pos + oldNodes[i].length <= attributesFromEvents.length + deletedChars).toBe(true);
        attributesFromEvents.splice(oldNodes[i].pos - deletedChars, oldNodes[i].length);
        deletedChars += oldNodes[i].length;
      }
      for(i = 0; i < newNodes.length; i++) {
        // HACK: Is there a better way to insert an array into another array?
        var args = [newNodes[i].pos, 0];
        for(var j = 0; j < newNodes[i].length; j++) {
          args.push(newNodes[i].annotation.attrs);
        }
        attributesFromEvents.splice.apply(attributesFromEvents, args);
      }
    });

    for(var i = 0; i < attributes.length; i++) {
      list.insertAnnotatedSpan(new Span(i, 1), new AttributesAnnotation(attributes[i]));
    }

    var makeUpdateCallback = function(newAttributes) {
      return function(annotation) {
        var newAttrs = { }, attr;
        for(attr in annotation.attrs) {
          newAttrs[attr] = annotation.attrs[attr];
        }
        for(attr in newAttributes) {
          if (newAttributes[attr] === false) {
            delete newAttrs[attr];
          } else {
            newAttrs[attr] = newAttributes[attr];
          }
        }

        return new AttributesAnnotation(newAttrs);
      };
    };

    var pos = 0;
    for(i = 0; i < o.ops.length; i++) {
      var op = o.ops[i];
      if (op.isInsert()) {
        list.insertAnnotatedSpan(new Span(pos, op.text.length), new AttributesAnnotation(op.attributes));
        pos += op.text.length;
      } else if (op.isRetain()) {
        list.updateSpan(new Span(pos, op.chars), makeUpdateCallback(op.attributes));
        pos += op.chars;
      } else if (op.isDelete()) {
        list.removeSpan(new Span(pos, op.chars));
      }
    }

    var attributesFromAnnotationList = [ ];
    list.forEach(function(length, annotation) {
      for(var i = 0; i < length; i++) {
        attributesFromAnnotationList.push(annotation.attrs);
      }
    });

    expect(attributesFromApply).toEqual(attributesFromAnnotationList);
  }));
});
