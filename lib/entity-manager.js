var firepad = firepad || { };

firepad.EntityManager = (function () {
  var utils = firepad.utils;

  function EntityManager() {
    this.entities_ = {};

    var attrs = ['src', 'alt', 'width', 'height', 'style', 'class'];
    this.register('img', {
      render: function(info) {
        utils.assert(info.src, "image entity should have 'src'!");
        var attrs = ['src', 'alt', 'width', 'height', 'style', 'class'];
        var html = '<img ';
        for(var i = 0; i < attrs.length; i++) {
          var attr = attrs[i];
          if (attr in info) {
            html += ' ' + attr + '="' + info[attr] + '"';
          }
        }
        html += ">";
        return html;
      },
      fromElement: function(element) {
        var info = {};
        for(var i = 0; i < attrs.length; i++) {
          var attr = attrs[i];
          if (element.hasAttribute(attr)) {
            info[attr] = element.getAttribute(attr);
          }
        }
        return info;
      }
    });
  }

  EntityManager.prototype.register = function(type, options) {
    firepad.utils.assert(options.render, "Entity options should include a 'render' function!");
    firepad.utils.assert(options.fromElement, "Entity options should include a 'fromElement' function!");
    this.entities_[type] = options;
  };

  EntityManager.prototype.renderToElement = function(entity, entityHandle) {
    return this.tryRenderToElement_(entity, 'render', entityHandle);
  };

  EntityManager.prototype.exportToElement = function(entity) {
    // Turns out 'export' is a reserved keyword, so 'getHtml' is preferable.
    var elt = this.tryRenderToElement_(entity, 'export') ||
              this.tryRenderToElement_(entity, 'getHtml') ||
              this.tryRenderToElement_(entity, 'render');
    elt.setAttribute('data-firepad-entity', entity.type);
    return elt;
  };

  /* Updates a DOM element to reflect the given entity.
     If the entity doesn't support the update method, it is fully
     re-rendered.
  */
  EntityManager.prototype.updateElement = function(entity, element) {
    var type = entity.type;
    var info = entity.info;
    if (this.entities_[type] && typeof(this.entities_[type].update) != 'undefined') {
      this.entities_[type].update(info, element);
    }
  };

  EntityManager.prototype.fromElement = function(element) {
    var type = element.getAttribute('data-firepad-entity');

    // HACK.  This should be configurable through entity registration.
    if (!type)
      type = element.nodeName.toLowerCase();

    if (type && this.entities_[type]) {
      var info = this.entities_[type].fromElement(element);
      return new firepad.Entity(type, info);
    }
  };

  EntityManager.prototype.tryRenderToElement_ = function(entity, renderFn, entityHandle) {
    var type = entity.type, info = entity.info;
    if (this.entities_[type] && this.entities_[type][renderFn]) {
      var windowDocument = firepad.document || (window && window.document);
      var res = this.entities_[type][renderFn](info, entityHandle, windowDocument);
      if (res) {
        if (typeof res === 'string') {
          var div = (firepad.document || document).createElement('div');
          div.innerHTML = res;
          return div.childNodes[0];
        } else if (typeof res === 'object') {
          firepad.utils.assert(typeof res.nodeType !== 'undefined', 'Error rendering ' + type + ' entity.  render() function' +
              ' must return an html string or a DOM element.');
          return res;
        }
      }
    }
  };

  EntityManager.prototype.entitySupportsUpdate = function(entityType) {
    return this.entities_[entityType] && this.entities_[entityType]['update'];
  };

  return EntityManager;
})();
