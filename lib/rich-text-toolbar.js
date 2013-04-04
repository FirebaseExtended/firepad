var firepad = firepad || { };

firepad.RichTextToolbar = (function(global) {
  var utils = firepad.utils;

  function RichTextToolbar() {
    this.element_ = this.makeElement_();
  }

  utils.makeEventEmitter(RichTextToolbar, ['bold', 'italic', 'underline', 'font-size']);

  RichTextToolbar.prototype.element = function() { return this.element_; };

  RichTextToolbar.prototype.makeElement_ = function() {
    var self = this;
    var bold = utils.elt('a', 'B', { 'class': 'firepad-btn firepad-btn-bold' });
    utils.on(bold, 'click', utils.stopEventAnd(function() { self.trigger('bold'); }));
    var italic = utils.elt('a', 'I', { 'class': 'firepad-btn firepad-btn-italic' });
    utils.on(italic, 'click', utils.stopEventAnd(function() { self.trigger('italic'); }));
    var underline = utils.elt('a', 'U', { 'class': 'firepad-btn firepad-btn-underline' });
    utils.on(underline, 'click', utils.stopEventAnd(function() { self.trigger('underline'); }));
    var fontSize = this.makeFontSizeDropdown_();

    return utils.elt('div', [
      utils.elt('div', [fontSize], { 'class': 'firepad-btn-group'}),
      utils.elt('div', [bold, italic, underline], { 'class': 'firepad-btn-group'})
    ], { class: 'firepad-toolbar' });
  };

  RichTextToolbar.prototype.makeFontSizeDropdown_ = function() {
    var self = this;
    var button = utils.elt('a', 'Size ▾', { 'class': 'firepad-btn firepad-dropdown' });
    var list = utils.elt('ul', [ ], { 'class': 'firepad-dropdown-menu' });
    button.appendChild(list);

    var shown = false;
    function toggleFontSizeList() {
      if (shown) {
        list.style.display = '';
        utils.off(document, 'click', toggleFontSizeList);
      } else {
        list.style.display = 'block';
        utils.on(document, 'click', toggleFontSizeList);
      }
      shown = !shown;
    }

    function addSize(name, size) {
      var element = utils.elt('a', name);
      utils.on(element, 'click', utils.stopEventAnd(function() {
        toggleFontSizeList();
        self.trigger('font-size', size);
      }));
      list.appendChild(element);
    }

    addSize('Default', false);
    addSize('12', 12);
    addSize('14', 14);
    addSize('18', 18);
    addSize('24', 24);
    addSize('32', 32);
    addSize('42', 42);

    utils.on(button, 'click', utils.stopEventAnd(toggleFontSizeList));

    return button;
  };

  return RichTextToolbar;
})();
