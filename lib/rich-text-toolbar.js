var firepad = firepad || { };

firepad.RichTextToolbar = (function(global) {
  var utils = firepad.utils;

  function RichTextToolbar() {
    this.element_ = this.makeElement_();
  }

  utils.makeEventEmitter(RichTextToolbar, ['bold', 'italic', 'underline', 'heading']);

  RichTextToolbar.prototype.element = function() { return this.element_; };

  RichTextToolbar.prototype.makeElement_ = function() {
    var self = this;
    var bold = utils.elt('a', 'B', { 'class': 'firepad-btn firepad-btn-bold' });
    utils.on(bold, 'click', utils.stopEventAnd(function() { self.trigger('bold'); }));
    var italic = utils.elt('a', 'I', { 'class': 'firepad-btn firepad-btn-italic' });
    utils.on(italic, 'click', utils.stopEventAnd(function() { self.trigger('italic'); }));
    var underline = utils.elt('a', 'U', { 'class': 'firepad-btn firepad-btn-underline' });
    utils.on(underline, 'click', utils.stopEventAnd(function() { self.trigger('underline'); }));
    var heading = this.makeHeadingDropdown_();

    return utils.elt('div', [
      bold, italic, underline, heading
    ], { class: 'firepad-toolbar' });
  };

  RichTextToolbar.prototype.makeHeadingDropdown_ = function() {
    var self = this;
    var heading = utils.elt('a', 'Heading ▾', { 'class': 'firepad-btn firepad-dropdown' });
    var headingList = utils.elt('ul', [ ], { 'class': 'firepad-dropdown-menu' });
    heading.appendChild(headingList);

    var shown = false;
    function toggleHeadingList() {
      if (shown) {
        headingList.style.display = '';
        utils.off(document, 'click', toggleHeadingList);
      } else {
        headingList.style.display = 'block';
        utils.on(document, 'click', toggleHeadingList);
      }
      shown = !shown;
    }

    function addHeading(name, level) {
      var element = utils.elt('a', name);
      utils.on(element, 'click', utils.stopEventAnd(function() {
        toggleHeadingList();
        self.trigger('heading', level);
      }));
      headingList.appendChild(element);
    }

    addHeading('Normal', false);
    addHeading('Heading 1', 1);
    addHeading('Heading 2', 2);
    addHeading('Heading 3', 3);

    utils.on(heading, 'click', utils.stopEventAnd(toggleHeadingList));

    return heading;
  };

  return RichTextToolbar;
})();
