var firepad = firepad || { };
firepad.WrappedOperation = (function (global) {
  'use strict';

  // A WrappedOperation contains an operation and corresponing metadata.
  function WrappedOperation (operation, meta) {
    this.wrapped = operation;
    this.meta    = meta;
  }

  WrappedOperation.prototype.apply = function () {
    return this.wrapped.apply.apply(this.wrapped, arguments);
  };

  WrappedOperation.prototype.invert = function () {
    var meta = this.meta;
    return new WrappedOperation(
      this.wrapped.invert.apply(this.wrapped, arguments),
      meta && typeof meta === 'object' && typeof meta.invert === 'function' ?
        meta.invert.apply(meta, arguments) : meta
    );
  };

  // Copy all properties from source to target.
  function copy (source, target) {
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
  }

  function composeMeta (a, b) {
    if (a && typeof a === 'object') {
      if (typeof a.compose === 'function') { return a.compose(b); }
      var meta = {};
      copy(a, meta);
      copy(b, meta);
      return meta;
    }
    return b;
  }

  WrappedOperation.prototype.compose = function (other) {
    return new WrappedOperation(
      this.wrapped.compose(other.wrapped),
      composeMeta(this.meta, other.meta)
    );
  };

  function transformMeta (meta, operation) {
    if (meta && typeof meta === 'object') {
      if (typeof meta.transform === 'function') {
        return meta.transform(operation);
      }
    }
    return meta;
  }

  WrappedOperation.transform = function (a, b) {
    // amend to support quill
    // var pair = a.wrapped.transform(b.wrapped);
    // return [
    //   new WrappedOperation(pair[0], transformMeta(a.meta, b.wrapped)),
    //   new WrappedOperation(pair[1], transformMeta(b.meta, a.wrapped))
    // ];
    var a1 = b.wrapped.transform(a.wrapped, true);
    var b1 = a.wrapped.transform(b.wrapped, false);
    return [
      new WrappedOperation(a1, transformMeta(a.meta, b.wrapped)),
      new WrappedOperation(b1, transformMeta(b.meta, a.wrapped))
    ];
  };

  // convenience method to write transform(a, b) as a.transform(b)
  WrappedOperation.prototype.transform = function(other) {
    return WrappedOperation.transform(this, other);
  };

  return WrappedOperation;

}());
