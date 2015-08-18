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

  function styleTest(style, textFormatting) {
    var html = '<div style="' + style + '">Test</div>';
    parseTest(html, [
      Line([Text('Test', textFormatting)], lf)
    ]);
  }

  it('Supported styles', function() {
    styleTest('', tf);
    styleTest('font-weight: bold', tf.bold(true));
    styleTest('text-decoration: underline', tf.underline(true));
    styleTest('font-style: italic', tf.italic(true));
    styleTest('font-style: oblique', tf.italic(true));
    styleTest('color: green', tf.color('green'));
    styleTest('background-color: green', tf.backgroundColor('green'));
    styleTest('font-family: Times New Roman', tf.font('Times New Roman'));

    styleTest('font-size: xx-small', tf.fontSize('xx-small'));
    styleTest('font-size: x-small', tf.fontSize('x-small'));
    styleTest('font-size: small', tf.fontSize('small'));
    styleTest('font-size: medium', tf.fontSize('medium'));
    styleTest('font-size: large', tf.fontSize('large'));
    styleTest('font-size: x-large', tf.fontSize('x-large'));
    styleTest('font-size: xx-large', tf.fontSize('xx-large'));
    styleTest('font-size: 18px', tf.fontSize('18px'));

    // Multiple styles with weird spacing.
    styleTest('font-weight:bold   ;  text-decoration : underline ', tf.bold(true).underline(true));
  });

  it('Inline tags (b, strong, u, i, em)', function() {
    inlineTest('b', tf.bold(true));
    inlineTest('strong', tf.bold(true));
    inlineTest('u', tf.underline(true));
    inlineTest('i', tf.italic(true));
    inlineTest('em', tf.italic(true));
  });

  function inlineTest(tag, textFormatting) {
    var html = '<' + tag + '>Test</' + tag + '>';
    parseTest(html, [
      Line([Text('Test', textFormatting)], lf)
    ]);
  }

  it('Supported font tags', function() {
    fontTest('color="blue"', tf.color('blue'));
    fontTest('face="impact"', tf.font('impact'));
    fontTest('size="8"', tf.fontSize(8));
    fontTest('size="8" color="blue" face="impact"', tf.fontSize(8).color('blue').font('impact'));
  });

  function fontTest(attrs, textFormatting) {
    var html = '<font ' + attrs + '>Test</font>';
    parseTest(html, [
      Line([Text('Test', textFormatting)], lf)
    ]);
  }

  it('Nested divs', function() {
    parseTest('<div style="color: green"><div style="font-weight: bold">Foo</div>bar</div><div><div style="background-color: blue">Baz</div></div>', [
      Line([Text('Foo', tf.color('green').bold(true))], lf),
      Line([Text('bar', tf.color('green'))], lf),
      Line([Text('Baz', tf.backgroundColor('blue'))], lf)
    ]);
  });

  it('Spans with styles', function() {
    parseTest('<span style="font-weight: bold">Foo<span style="color: green">bar</span>baz</span><span style="background-color: blue">Lorem ipsum</span>', [
      Line([Text('Foo', tf.bold(true)), Text('bar', tf.bold(true).color('green')), Text('baz', tf.bold(true)), Text('Lorem ipsum', tf.backgroundColor('blue'))], lf)
    ]);
  });

  function entityText(entityType, info) {
    var formatting = new firepad.Formatting(
      (new firepad.Entity(entityType, info)).toAttributes()
    );
    return Text(firepad.sentinelConstants.ENTITY_SENTINEL_CHARACTER, formatting);
  }

  it('Images', function() {
    var t = Text('Foo', tf);
    parseTest('Foo<img src="http://www.google.com/favicon.ico">Foo', [
      Line([t, entityText('img', { src: 'http://www.google.com/favicon.ico' }), t], lf)
    ]);
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
    parseTest('<ol><li>Foo<ol><li>Foo</li><li>Foo</li></ol></li><li>Foo</li></ol>', [
      Line([t], lf.indent(1).listItem(LIST_TYPE.ORDERED)),
      Line([t], lf.indent(2).listItem(LIST_TYPE.ORDERED)),
      Line([t], lf.indent(2).listItem(LIST_TYPE.ORDERED)),
      Line([t], lf.indent(1).listItem(LIST_TYPE.ORDERED))
    ]);
  });

  // same as last, but with no text on each line.
  it('Complex list (2)', function() {
    var t = Text('Foo', tf);
    parseTest('<ol><li><ol><li></li><li></li></ol></li><li></li></ol>', [
      Line([], lf.indent(1).listItem(LIST_TYPE.ORDERED)),
      Line([], lf.indent(2).listItem(LIST_TYPE.ORDERED)),
      Line([], lf.indent(2).listItem(LIST_TYPE.ORDERED)),
      Line([], lf.indent(1).listItem(LIST_TYPE.ORDERED))
    ]);
  });

  it('Text after list', function() {
    parseTest('<ul><li>Hello</li></ul>Foo', [
      Line([Text("Hello")], lf.indent(1).listItem(LIST_TYPE.UNORDERED)),
      Line([Text("Foo")], lf)
    ]);
  });

  it('Todo list support', function() {
    var t = Text('Foo', tf);
    parseTest('<ul class="firepad-todo"><li>Foo</li><li class="firepad-checked">Foo</li></ul>', [
      Line([t], lf.indent(1).listItem(LIST_TYPE.TODO)),
      Line([t], lf.indent(1).listItem(LIST_TYPE.TODOCHECKED))
    ]);
  });

  it('<center> support (1)', function() {
    parseTest('<center>foo</center>', [
      Line([Text("foo")], lf.align('center'))
    ]);
  });

  it('<center> support (2)', function() {
    parseTest('<center>foo<br/>bar</center>', [
      Line([Text("foo")], lf.align('center')),
      Line([Text("bar")], lf.align('center'))
    ]);
  });

  it('<div> text-align support (1).', function() {
    testAlign('left');
    testAlign('center');
    testAlign('right');
  });

  function testAlign(align) {
    parseTest('<div style="text-align: ' + align + '">foo<br/>bar</div>', [
      Line([Text("foo")], lf.align(align)),
      Line([Text("bar")], lf.align(align))
    ]);
  }

  function parseTest(html, expLines) {
    var actLines = parse(html, new firepad.EntityManager());
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
    expect(actLines.length).toEqual(expLines.length);
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
