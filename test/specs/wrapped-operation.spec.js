describe('WrappedOperation', function() {
  var WrappedOperation = firepad.WrappedOperation;
  var TextOperation = firepad.TextOperation;
  var Cursor = firepad.Cursor;
  var h = helpers;
  var n = 20;

  it('Apply', helpers.randomTest(n, function() {
    var str = h.randomString(50);
    var operation = h.randomOperation(str);
    var wrapped = new WrappedOperation(operation, { lorem: 42 });
    expect(wrapped.meta.lorem).toBe(42);
    expect(wrapped.apply(str)).toBe(operation.apply(str));
  }));

  it('Invert', helpers.randomTest(n, function() {
    var str = h.randomString(50);
    var operation = h.randomOperation(str);
    var payload = { lorem: 'ipsum' };
    var wrapped = new WrappedOperation(operation, payload);
    var wrappedInverted = wrapped.invert(str);
    expect(wrappedInverted.meta).toBe(payload);
    expect(str).toBe(wrappedInverted.apply(operation.apply(str)));
  }));

  it('InvertMethod', function() {
    var str = h.randomString(50);
    var operation = h.randomOperation(str);
    var meta = { invert: function (doc) { return doc; } };
    var wrapped = new WrappedOperation(operation, meta);
    expect(wrapped.invert(str).meta).toBe(str);
  });

  it('Compose', helpers.randomTest(n, function() {
    var str = h.randomString(50);
    var a = new WrappedOperation(h.randomOperation(str), { a: 1, b: 2 });
    var strN = a.apply(str);
    var b = new WrappedOperation(h.randomOperation(strN), { a: 3, c: 4 });
    var ab = a.compose(b);
    expect(ab.meta.a).toBe(3);
    expect(ab.meta.b).toBe(2);
    expect(ab.meta.c).toBe(4);
    expect(ab.apply(str)).toBe(b.apply(strN));
  }));

  it('ComposeMethod', function() {
    var meta = {
      timesComposed: 0,
      compose: function (other) {
        return {
          timesComposed: this.timesComposed + other.timesComposed + 1,
          compose: meta.compose
        };
      }
    };
    var str = h.randomString(50);
    var a = new WrappedOperation(h.randomOperation(str), meta);
    var strN = a.apply(str);
    var b = new WrappedOperation(h.randomOperation(strN), meta);
    var ab = a.compose(b);
    expect(ab.meta.timesComposed).toBe(1);
  });

  it('Transform', helpers.randomTest(n, function() {
    var str = h.randomString(50);
    var metaA = {};
    var a = new WrappedOperation(h.randomOperation(str), metaA);
    var metaB = {};
    var b = new WrappedOperation(h.randomOperation(str), metaB);
    var pair = a.transform(b);
    var aPrime = pair[0];
    var bPrime = pair[1];
    expect(aPrime.meta).toBe(metaA);
    expect(bPrime.meta).toBe(metaB);
    expect(aPrime.apply(b.apply(str))).toBe(bPrime.apply(a.apply(str)));
  }));

  it('TransformMethod', function() {
    var str = 'Loorem ipsum';
    var a = new WrappedOperation(
      new TextOperation().retain(1)['delete'](1).retain(10),
      new Cursor(1, 1)
    );
    var b = new WrappedOperation(
      new TextOperation().retain(7)['delete'](1).insert("I").retain(4),
      new Cursor(8, 8)
    );
    var pair = a.transform(b);
    var aPrime = pair[0];
    var bPrime = pair[1];
    expect("Lorem Ipsum").toBe(bPrime.apply(a.apply(str)));
    expect(aPrime.meta.equals(new Cursor(1, 1))).toBeTruthy();
    expect(bPrime.meta.equals(new Cursor(7, 7))).toBeTruthy();
  });
});
