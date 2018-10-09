/**
 * Slices this ByteBuffer by creating a cloned instance with `offset = begin` and `limit = end`.
 * @param {number=} begin Begin offset, defaults to {@link ByteBuffer#offset}.
 * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
 * @returns {!ByteBuffer} Clone of this ByteBuffer with slicing applied, backed by the same {@link ByteBuffer#buffer}
 * @expose
 */
ByteBufferPrototype.slice = function(begin, end) {
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    if (!this.noAssert) {
        //? ASSERT_RANGE();
    }
    var bb = this.clone();
    bb.offset = begin;
    bb.limit = end;
    return bb;
};
