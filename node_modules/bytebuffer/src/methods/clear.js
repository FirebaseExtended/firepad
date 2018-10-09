/**
 * Clears this ByteBuffer's offsets by setting {@link ByteBuffer#offset} to `0` and {@link ByteBuffer#limit} to the
 *  backing buffer's capacity. Discards {@link ByteBuffer#markedOffset}.
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.clear = function() {
    this.offset = 0;
    this.limit = /*?= CAPACITY */;
    this.markedOffset = -1;
    return this;
};

