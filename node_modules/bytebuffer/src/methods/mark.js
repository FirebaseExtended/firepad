/**
 * Marks an offset on this ByteBuffer to be used later.
 * @param {number=} offset Offset to mark. Defaults to {@link ByteBuffer#offset}.
 * @returns {!ByteBuffer} this
 * @throws {TypeError} If `offset` is not a valid number
 * @throws {RangeError} If `offset` is out of bounds
 * @see ByteBuffer#reset
 * @expose
 */
ByteBufferPrototype.mark = function(offset) {
    offset = typeof offset === 'undefined' ? this.offset : offset;
    if (!this.noAssert) {
        //? ASSERT_OFFSET();
    }
    this.markedOffset = offset;
    return this;
};
