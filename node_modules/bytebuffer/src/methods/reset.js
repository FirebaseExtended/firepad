/**
 * Resets this ByteBuffer's {@link ByteBuffer#offset}. If an offset has been marked through {@link ByteBuffer#mark}
 *  before, `offset` will be set to {@link ByteBuffer#markedOffset}, which will then be discarded. If no offset has been
 *  marked, sets `offset = 0`.
 * @returns {!ByteBuffer} this
 * @see ByteBuffer#mark
 * @expose
 */
ByteBufferPrototype.reset = function() {
    if (this.markedOffset >= 0) {
        this.offset = this.markedOffset;
        this.markedOffset = -1;
    } else {
        this.offset = 0;
    }
    return this;
};
