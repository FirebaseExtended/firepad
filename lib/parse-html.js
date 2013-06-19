var firepad = firepad || { };

/**
 * Helper to parse html into Firepad-compatible lines / text.
 * @type {*}
 */
firepad.ParseHtml = (function () {
  var LIST_TYPE = firepad.LineFormatting.LIST_TYPE;

  /**
   * Represents the current parse state as an immutable structure.  To create a new ParseState, use
   * the withXXX methods.
   *
   * @param opt_listType
   * @param opt_lineFormatting
   * @param opt_textFormatting
   * @constructor
   */
  function ParseState(opt_listType, opt_lineFormatting, opt_textFormatting) {
    this.listType = opt_listType || LIST_TYPE.UNORDERED;
    this.lineFormatting = opt_lineFormatting || firepad.LineFormatting();
    this.textFormatting = opt_textFormatting || firepad.Formatting();
  }

  ParseState.prototype.withTextFormatting = function(textFormatting) {
    return new ParseState(this.listType, this.lineFormatting, textFormatting);
  };

  ParseState.prototype.withLineFormatting = function(lineFormatting) {
    return new ParseState(this.listType, lineFormatting, this.textFormatting);
  };

  ParseState.prototype.withListType = function(listType) {
    return new ParseState(listType, this.lineFormatting, this.textFormatting);
  };

  ParseState.prototype.withIncreasedIndent = function() {
    var lineFormatting = this.lineFormatting.indent(this.lineFormatting.getIndent() + 1);
    return new ParseState(this.listType, lineFormatting, this.textFormatting);
  };

  /**
   * Mutable structure representing the current parse output.
   * @constructor
   */
  function ParseOutput() {
    this.lines = [ ];
    this.currentLine = [];
    this.currentLineListItemType = null;
  }

  ParseOutput.prototype.newlineIfNonEmpty = function(state) {
    if (this.currentLine.length > 0) {
      this.newline(state);
    }
  };

  ParseOutput.prototype.newlineIfNonEmptyOrListItem = function(state) {
    if (this.currentLine.length > 0 || this.currentLineListItemType !== null) {
      this.newline(state);
    }
  };

  ParseOutput.prototype.newline = function(state) {
    var lineFormatting = state.lineFormatting;
    if (this.currentLineListItemType !== null) {
      lineFormatting = lineFormatting.listItem(this.currentLineListItemType);
      this.currentLineListItemType = null;
    }
    this.lines.push(firepad.Line(this.currentLine, lineFormatting));
    this.currentLine = [];
  };

  ParseOutput.prototype.makeListItem = function(type) {
    this.currentLineListItemType = type;
  };

  ParseOutput.prototype.isListItem = function() {
    return this.currentLineListItemType !== null;
  };

  function parseHtml(html) {
    // Create DIV with HTML (as a convenient way to parse it).
    var div = document.createElement('div');
    div.innerHTML = html;

    var output = new ParseOutput();
    var state = new ParseState();
    parseNode(div, state, output);

    return output.lines;
  }

  function parseNode(node, state, output) {
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        var text = node.nodeValue.replace(/\s+/g, ' '); // Not sure this is 100% right, but mostly works.
        output.currentLine.push(firepad.Text(text, state.textFormatting));
        break;
      case Node.ELEMENT_NODE:
        var style = node.getAttribute('style') || '';
        state = state.withTextFormatting(parseStyle(state.textFormatting, style));
        switch (node.nodeName.toLowerCase()) {
          case 'div':
          case 'h1':
          case 'h2':
          case 'h3':
          case 'p':
            output.newlineIfNonEmpty(state);
            parseChildren(node, state, output);
            output.newlineIfNonEmpty(state);
            break;
          case 'b':
          case 'strong':
            parseChildren(node, state.withTextFormatting(state.textFormatting.bold(true)), output);
            break;
          case 'u':
            parseChildren(node, state.withTextFormatting(state.textFormatting.underline(true)), output);
            break;
          case 'i':
          case 'em':
            parseChildren(node, state.withTextFormatting(state.textFormatting.italic(true)), output);
            break;
          case 'font':
            var face = node.getAttribute('face');
            var color = node.getAttribute('color');
            var size = parseInt(node.getAttribute('size'));
            if (face) { state = state.withTextFormatting(state.textFormatting.font(face)); }
            if (color) { state = state.withTextFormatting(state.textFormatting.color(color)); }
            if (size) { state = state.withTextFormatting(state.textFormatting.fontSize(size)); }
            parseChildren(node, state, output);
            break;
          case 'br':
            output.newline(state);
            break;
          case 'ul':
            output.newlineIfNonEmptyOrListItem(state);
            parseChildren(node, state.withListType(LIST_TYPE.UNORDERED).withIncreasedIndent(), output);
            output.newlineIfNonEmpty(state);
            break;
          case 'ol':
            output.newlineIfNonEmptyOrListItem(state);
            parseChildren(node, state.withListType(LIST_TYPE.ORDERED).withIncreasedIndent(), output);
            output.newlineIfNonEmpty(state);
            break;
          case 'li':
            parseListItem(node, state, output);
            break;
          default:
            parseChildren(node, state, output);
            break;
        }
        break;
      default:
        // Ignore other nodes (comments, etc.)
        break;
    }
  }

  function parseChildren(node, state, output) {
    if (node.hasChildNodes()) {
      for(var i = 0; i < node.childNodes.length; i++) {
        parseNode(node.childNodes[i], state, output);
      }
    }
  }

  function parseListItem(node, state, output) {
    // Note: <li> is weird:
    // * Only the first line in the <li> tag should be a list item (i.e. with a bullet or number next to it).
    // * <li></li> should create an empty list item line; <li><ol><li></li></ol></li> should create two.

    output.newlineIfNonEmptyOrListItem(state);

    output.makeListItem(state.listType);
    var oldLine = output.currentLine;

    parseChildren(node, state, output);

    if (oldLine === output.currentLine || output.currentLine.length > 0) {
      output.newline(state);
    }
  }

  function parseStyle(formatting, styleString) {
    var styles = styleString.split(';');
    for(var i = 0; i < styles.length; i++) {
      var stylePieces = styles[i].split(':');
      if (stylePieces.length !== 2)
        continue;
      var prop = stylePieces[0].trim().toLowerCase();
      var val = stylePieces[1].trim();
      switch (prop) {
        case 'text-decoration':
          var underline = val.indexOf('underline') >= 0;
          formatting = formatting.underline(underline);
          break;
        case 'font-weight':
          var bold = (val === 'bold') || parseInt(val) >= 600;
          formatting = formatting.bold(bold);
          break;
        case 'font-style':
          var italic = (val === 'italic' || val === 'oblique');
          formatting = formatting.italic(italic);
          break;
        case 'color':
          formatting = formatting.color(val.toLowerCase());
          break;
        case 'font-size':
          switch (val) {
            case 'xx-small':
              formatting = formatting.fontSize(9);
              break;
            case 'x-small':
              formatting = formatting.fontSize(10);
              break;
            case 'small':
              formatting = formatting.fontSize(12);
              break;
            case 'medium':
              formatting = formatting.fontSize(14);
              break;
            case 'large':
              formatting = formatting.fontSize(18);
              break;
            case 'x-large':
              formatting = formatting.fontSize(24);
              break;
            case 'xx-large':
              formatting = formatting.fontSize(32);
              break;
            default:
              formatting = formatting.fontSize(parseInt(val));
          }
          break;
        case 'font-family':
          var font = val.split(',')[0].trim(); // get first font.
          font = font.replace(/['"]/g, ''); // remove quotes.
          formatting = formatting.font(font);
          break;
      }
    }
    return formatting;
  }

  return parseHtml;
})();