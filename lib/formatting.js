var firepad = firepad || { };

/**
 * Immutable object to represent text formatting.  Formatting can be modified by chaining method calls.
 *
 * @constructor
 * @type {Function}
 */
firepad.Formatting = (function() {
  var ATTR = firepad.AttributeConstants;

  function Formatting(attributes) {
    // Allow calling without new.
    if (!(this instanceof Formatting)) { return new Formatting(attributes); }

    this.attributes = attributes || { };
  }

  Formatting.prototype.cloneWithNewAttribute_ = function(attribute, value) {
    var attributes = { };

    // Copy existing.
    for(var attr in this.attributes) {
      attributes[attr] = this.attributes[attr];
    }

    // Add new one.
    if (value === false) {
      delete attributes[attribute];
    } else {
      attributes[attribute] = value;
    }

    return new Formatting(attributes);
  };

  Formatting.prototype.bold = function(val) {
    return this.cloneWithNewAttribute_(ATTR.BOLD, val);
  };

  Formatting.prototype.italic = function(val) {
    return this.cloneWithNewAttribute_(ATTR.ITALIC, val);
  };

  Formatting.prototype.underline = function(val) {
    return this.cloneWithNewAttribute_(ATTR.UNDERLINE, val);
  };

  Formatting.prototype.strike = function(val) {
    return this.cloneWithNewAttribute_(ATTR.STRIKE, val);
  };

  Formatting.prototype.font = function(font) {
    return this.cloneWithNewAttribute_(ATTR.FONT, font);
  };

  Formatting.prototype.fontSize = function(size) {
    return this.cloneWithNewAttribute_(ATTR.FONT_SIZE, size);
  };

  Formatting.prototype.color = function(color) {
    return this.cloneWithNewAttribute_(ATTR.COLOR, color);
  };

  Formatting.prototype.backgroundColor = function(color) {
    return this.cloneWithNewAttribute_(ATTR.BACKGROUND_COLOR, color);
  };

  return Formatting;
})();
