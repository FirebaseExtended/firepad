describe('Cursor Tests', function() {
  var Cursor = firepad.Cursor;
  var TextOperation = firepad.TextOperation;

  it('FromJSON', function() {
    var cursor = Cursor.fromJSON({ position: 3, selectionEnd: 5 });
    expect(cursor instanceof Cursor).toBeTruthy();
    expect(cursor.position).toBe(3);
    expect(cursor.selectionEnd).toBe(5);
  });

  it('Transform', function() {
    var cursor = new Cursor(3, 7);
    expect(cursor
      .transform(new TextOperation().retain(3).insert('lorem')['delete'](2).retain(42))
      .equals(new Cursor(8, 10))).toBeTruthy();
    expect(cursor
      .transform(new TextOperation()['delete'](45))
      .equals(new Cursor(0, 0))).toBeTruthy();
  });

  it('Compose', function() {
    var a = new Cursor(3, 7);
    var b = new Cursor(4, 4);
    expect(a.compose(b)).toBe(b);
  });
});
