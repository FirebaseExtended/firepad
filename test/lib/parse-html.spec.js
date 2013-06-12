describe('Parse HTML Tests', function() {
  var Line = firepad.Line;
  var Text = firepad.Text;
  var lf = firepad.LineFormatting();
  var tf = firepad.Formatting();
  var parse = firepad.ParseHtml;
  var LIST_TYPE = firepad.LineFormatting.LIST_TYPE;

  it('Empty HTML', function() {
    parseTest('', []);
  });

  it('<br/>', function() {
    parseTest('<br/>', [
      Line([], lf)
    ]);
  });

  it('div with style', function() {
    parseTest('<div style="font-weight: bold">Test</div>', [
      Line([Text('Test', tf.bold(true))], lf)
    ]);
  });

  it("Handle newlines and extra spaces in html.", function() {
    parseTest('Foo\nBar\nBaz    Blah', [
      Line([Text('Foo Bar Baz Blah')], lf)
    ]);
  });


  it('Supported styles', function() {
    styleTest('', tf);
    styleTest('font-weight: bold', tf.bold(true));
    styleTest('text-decoration: underline', tf.underline(true));
    styleTest('font-style: italic', tf.italic(true));
    styleTest('font-style: oblique', tf.italic(true));
    styleTest('color: green', tf.color('green'));
    styleTest('font-family: Times New Roman', tf.font('Times New Roman'));

    styleTest('font-size: xx-small', tf.fontSize(9));
    styleTest('font-size: x-small', tf.fontSize(10));
    styleTest('font-size: small', tf.fontSize(12));
    styleTest('font-size: medium', tf.fontSize(14));
    styleTest('font-size: large', tf.fontSize(18));
    styleTest('font-size: x-large', tf.fontSize(24));
    styleTest('font-size: xx-large', tf.fontSize(32));
    styleTest('font-size: 18px', tf.fontSize(18));

    // Multiple styles with weird spacing.
    styleTest('font-weight:bold   ;  text-decoration : underline ', tf.bold(true).underline(true));
  });

  function styleTest(style, textFormatting) {
    var html = '<div style="' + style + '">Test</div>';
    parseTest(html, [
      Line([Text('Test', textFormatting)], lf)
    ]);
  }

  it('Nested divs', function() {
    parseTest('<div style="color: green"><div style="font-weight: bold">Foo</div>bar</div><div><div>Baz</div></div>', [
      Line([Text('Foo', tf.color('green').bold(true))], lf),
      Line([Text('bar', tf.color('green'))], lf),
      Line([Text('Baz', tf)], lf)
    ]);
  });

  it('Spans with styles', function() {
    parseTest('<span style="font-weight: bold">Foo<span style="color: green">bar</span>baz</span>', [
      Line([Text('Foo', tf.bold(true)), Text('bar', tf.bold(true).color('green')), Text('baz', tf.bold(true))], lf)
    ]);
  });

  it('Inline tags (b, strong, u, i, em)', function() {
    inlineTest('b', tf.bold(true));
    inlineTest('strong', tf.bold(true));
    inlineTest('u', tf.underline(true));
    inlineTest('i', tf.italic(true));
    inlineTest('em', tf.italic(true));
  });

  it('Unordered list', function() {
    var t = Text('Foo', tf);
    parseTest('<ul><li>Foo</li><li>Foo</li></ul>', [
      Line([t], lf.indent(1).listItem(LIST_TYPE.UNORDERED)),
      Line([t], lf.indent(1).listItem(LIST_TYPE.UNORDERED))
    ]);
  });

  it('Ordered list', function() {
    var t = Text('Foo', tf);
    parseTest('<ol><li>Foo</li><li>Foo</li></ul>', [
      Line([t], lf.indent(1).listItem(LIST_TYPE.ORDERED)),
      Line([t], lf.indent(1).listItem(LIST_TYPE.ORDERED))
    ]);
  });

  it('Divs listed in list items', function() {
    var t = Text('Foo', tf);
    parseTest('<ol><li><div>Foo</div><div>Foo</div></li><li>Foo</li></ul>', [
      Line([t], lf.indent(1).listItem(LIST_TYPE.ORDERED)),
      Line([t], lf.indent(1)), // should be indented, but no list item.
      Line([t], lf.indent(1).listItem(LIST_TYPE.ORDERED))
    ]);
  });

  it('Complex list (1)', function() {
    var t = Text('Foo', tf);
    parseTest('<ol><li>Foo<ol><li>Foo</li><li>Foo</li></ol></li><li>Foo</li></ul>', [
      Line([t], lf.indent(1).listItem(LIST_TYPE.ORDERED)),
      Line([t], lf.indent(2).listItem(LIST_TYPE.ORDERED)),
      Line([t], lf.indent(2).listItem(LIST_TYPE.ORDERED)),
      Line([t], lf.indent(1).listItem(LIST_TYPE.ORDERED))
    ]);
  });

  // same as last, but with no text on each line.
  it('Complex list (2)', function() {
    var t = Text('Foo', tf);
    parseTest('<ol><li><ol><li></li><li></li></ol></li><li></li></ul>', [
      Line([], lf.indent(1).listItem(LIST_TYPE.ORDERED)),
      Line([], lf.indent(2).listItem(LIST_TYPE.ORDERED)),
      Line([], lf.indent(2).listItem(LIST_TYPE.ORDERED)),
      Line([], lf.indent(1).listItem(LIST_TYPE.ORDERED))
    ]);
  });

  function inlineTest(tag, textFormatting) {
    var html = '<' + tag + '>Test</' + tag + '>';
    parseTest(html, [
      Line([Text('Test', textFormatting)], lf)
    ]);
  }

  function parseTest(html, expLines) {
    var actLines = parse(html);
    for(var i = 0; i < expLines.length; i++) {
      var expLine = dumpLine(expLines[i]);
      if (i >= actLines.length) {
        throw new Error("Line " + i + ":\n  Expected: " + expLine + "\n  Actual  : <none>");
      }
      var actLine = dumpLine(actLines[i]);
      if (actLine !== expLine) {
        throw new Error("Line " + i + ":\n  Expected: " + expLine + "\n  Actual  : " + actLine);
      }
    }
    if (i < actLines.length) {
      throw new Error("Unexpected extra line " + i + ":" + dumpLine(actLines[i]));
    }
  }

  function dumpLine(line) {
    expect(line instanceof Line).toBe(true);
    var text = 'Line([';
    for(var i = 0; i < line.textPieces.length; i++) {
      if (i !== 0) {
        text += ', ';
      }
      var t = line.textPieces[i];
      text += 'Text("' + t.text + '", ' + dumpObj(t.formatting.attributes) + ')';
    }
    text += '], ' + dumpObj(line.formatting.attributes) + ')';
    return text;
  }

  // Basically JSON.stringify, except sorts object keys alphabetically so that the output is deterministic.
  function dumpObj(obj) {
    if (obj === null) {
      return 'null';
    } else if (typeof obj === 'object') {
      var keys = Object.keys(obj);
      keys.sort();
      var text = '{ ';
      for(var i = 0; i < keys.length; i++) {
        if (i !== 0) {
          text += ', ';
        }
        text += keys[i] + ': ' + dumpObj(obj[keys[i]]);
      }
      text += ' }';
      return text;
    } else {
      return JSON.stringify(obj);
    }
  }
});