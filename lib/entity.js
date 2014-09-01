var firepad = firepad || { };

/**
 * Object to represent an Entity.
 */
firepad.Entity = (function() {
  var ATTR = firepad.AttributeConstants;
  var SENTINEL = ATTR.ENTITY_SENTINEL;
  var PREFIX = SENTINEL + '_';

  function Entity(type, info) {
    // Allow calling without new.
    if (!(this instanceof Entity)) { return new Entity(type, info); }

    this.type = type;
    this.info = info || { };
  }

  Entity.prototype.toAttributes = function() {
    var attrs = { };
    attrs[SENTINEL] = this.type;

    for(var attr in this.info) {
      attrs[PREFIX + attr] = this.info[attr];
    }

    return attrs;
  };

  Entity.fromAttributes = function(attributes) {
    var type = attributes[SENTINEL];
    var info = { };
    for(var attr in attributes) {
      if (attr.indexOf(PREFIX) === 0) {
        info[attr.substr(PREFIX.length)] = attributes[attr];
      }
    }

    return new Entity(type, info);
  };

  return Entity;
})();
