/**
 * Enables or disables assertions of argument types and offsets. Assertions are enabled by default but you can opt to
 *  disable them if your code already makes sure that everything is valid.
 * @param {boolean} assert `true` to enable assertions, otherwise `false`
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.assert = function(assert) {
    this.noAssert = !assert;
    return this;
};

