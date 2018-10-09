/**
 * Gets the number of remaining readable bytes. Contents are the bytes between {@link ByteBuffer#offset} and
 *  {@link ByteBuffer#limit}, so this returns `limit - offset`.
 * @returns {number} Remaining readable bytes. May be negative if `offset > limit`.
 * @expose
 */
ByteBufferPrototype.remaining = function() {
    return this.limit - this.offset;
};
