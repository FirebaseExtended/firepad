/**
 * Makes this ByteBuffer ready for a new sequence of write or relative read operations. Sets `limit = offset` and
 *  `offset = 0`. Make sure always to flip a ByteBuffer when all relative read or write operations are complete.
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.flip = function() {
    this.limit = this.offset;
    this.offset = 0;
    return this;
};
