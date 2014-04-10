var firepad = firepad || { };
firepad.utils = { };

firepad.utils.makeEventEmitter = function(clazz, opt_allowedEVents) {
  clazz.prototype.allowedEvents_ = opt_allowedEVents;

  clazz.prototype.on = function(eventType, callback, context) {
    this.validateEventType_(eventType);
    this.eventListeners_ = this.eventListeners_ || { };
    this.eventListeners_[eventType] = this.eventListeners_[eventType] || [];
    this.eventListeners_[eventType].push({ callback: callback, context: context });
  };

  clazz.prototype.off = function(eventType, callback) {
    this.validateEventType_(eventType);
    this.eventListeners_ = this.eventListeners_ || { };
    var listeners = this.eventListeners_[eventType] || [];
    for(var i = 0; i < listeners.length; i++) {
      if (listeners[i].callback === callback) {
        listeners.splice(i, 1);
        return;
      }
    }
  };

  clazz.prototype.trigger =  function(eventType /*, args ... */) {
    this.eventListeners_ = this.eventListeners_ || { };
    var listeners = this.eventListeners_[eventType] || [];
    for(var i = 0; i < listeners.length; i++) {
      listeners[i].callback.apply(listeners[i].context, Array.prototype.slice.call(arguments, 1));
    }
  };

  clazz.prototype.validateEventType_ = function(eventType) {
    if (this.allowedEvents_) {
      var allowed = false;
      for(var i = 0; i < this.allowedEvents_.length; i++) {
        if (this.allowedEvents_[i] === eventType) {
          allowed = true;
          break;
        }
      }
      if (!allowed) {
        throw new Error('Unknown event "' + eventType + '"');
      }
    }
  };
};

firepad.utils.elt = function(tag, content, attrs) {
  var e = document.createElement(tag);
  if (typeof content === "string") {
    firepad.utils.setTextContent(e, content);
  } else if (content) {
    for (var i = 0; i < content.length; ++i) { e.appendChild(content[i]); }
  }
  for(var attr in (attrs || { })) {
    e.setAttribute(attr, attrs[attr]);
  }
  return e;
};

firepad.utils.setTextContent = function(e, str) {
  e.innerHTML = "";
  e.appendChild(document.createTextNode(str));
};


firepad.utils.on = function(emitter, type, f, capture) {
  if (emitter.addEventListener) {
    emitter.addEventListener(type, f, capture || false);
  } else if (emitter.attachEvent) {
    emitter.attachEvent("on" + type, f);
  }
};

firepad.utils.off = function(emitter, type, f, capture) {
  if (emitter.removeEventListener) {
    emitter.removeEventListener(type, f, capture || false);
  } else if (emitter.detachEvent) {
    emitter.detachEvent("on" + type, f);
  }
};

firepad.utils.preventDefault = function(e) {
  if (e.preventDefault) {
    e.preventDefault();
  } else {
    e.returnValue = false;
  }
};

firepad.utils.stopPropagation = function(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  } else {
    e.cancelBubble = true;
  }
};

firepad.utils.stopEvent = function(e) {
  firepad.utils.preventDefault(e);
  firepad.utils.stopPropagation(e);
};

firepad.utils.stopEventAnd = function(fn) {
  return function(e) {
    fn(e);
    firepad.utils.stopEvent(e);
    return false;
  };
};

firepad.utils.trim = function(str) {
  return str.replace(/^\s+/g, '').replace(/\s+$/g, '');
};

firepad.utils.stringEndsWith = function(str, suffix) {
  var list = (typeof suffix == 'string') ? [suffix] : suffix;
  for (var i = 0; i < list.length; i++) {
    var suffix = list[i];
    if (str.indexOf(suffix, str.length - suffix.length) !== -1)
      return true;
  }
  return false;
};

firepad.utils.assert = function assert (b, msg) {
  if (!b) {
    throw new Error(msg || "assertion error");
  }
};

firepad.utils.log = function() {
  if (typeof console !== 'undefined' && typeof console.log !== 'undefined') {
    var args = ['Firepad:'];
    for(var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    console.log.apply(console, args);
  }
};
