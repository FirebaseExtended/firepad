var firepad = firepad || { };

/**
 * Object to represent Formatted text.
 *
 * @type {Function}
 */
firepad.Text = (function() {
  function Text(text, formatting) {
    // Allow calling without new.
    if (!(this instanceof Text)) { return new Text(text, formatting); }

    this.text = text;
    this.formatting = formatting || firepad.Formatting();
  }

  return Text;
})();
