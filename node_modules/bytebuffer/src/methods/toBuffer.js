/**
 * Returns a copy of the backing buffer that contains this ByteBuffer's contents. Contents are the bytes between
 *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}.
 * @param {boolean=} forceCopy If `true` returns a copy, otherwise returns a view referencing the same memory if
 *  possible. Defaults to `false`
//? if (NODE) {
 * @returns {!Buffer} Contents as a Buffer
//? } else {
 * @returns {!ArrayBuffer} Contents as an ArrayBuffer
//? }
 * @expose
 */
ByteBufferPrototype.toBuffer = function(forceCopy) {
    var offset = this.offset,
        limit = this.limit;
    if (!this.noAssert) {
        //? ASSERT_RANGE('offset', 'limit');
    }
    //? if (NODE) {
    if (forceCopy) {
        var buffer = new Buffer(limit - offset);
        this.buffer.copy(buffer, 0, offset, limit);
        return buffer;
    } else {
        if (offset === 0 && limit === this.buffer.length)
            return this.buffer;
        else
            return this.buffer.slice(offset, limit);
    }
    //? } else {
    // NOTE: It's not possible to have another ArrayBuffer reference the same memory as the backing buffer. This is
    // possible with Uint8Array#subarray only, but we have to return an ArrayBuffer by contract. So:
    if (!forceCopy && offset === 0 && limit === this.buffer.byteLength)
        return this.buffer;
    if (offset === limit)
        return EMPTY_BUFFER;
    var buffer = new ArrayBuffer(limit - offset);
    new Uint8Array(buffer).set(new Uint8Array(this.buffer).subarray(offset, limit), 0);
    return buffer;
    //? }
};

//? if (NODE) {
/**
 * Returns a copy of the backing buffer compacted to contain this ByteBuffer's contents. Contents are the bytes between
 *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}.
 * @returns {!ArrayBuffer} Contents as an ArrayBuffer
 */
ByteBufferPrototype.toArrayBuffer = function() {
    var offset = this.offset,
        limit = this.limit;
    if (!this.noAssert) {
        //? ASSERT_RANGE('offset', 'limit');
    }
    var ab = new ArrayBuffer(limit - offset);
    if (memcpy) { // Fast
        memcpy(ab, 0, this.buffer, offset, limit);
    } else { // Slow
        var dst = new Uint8Array(ab);
        for (var i=offset; i<limit; ++i)
            dst[i-offset] = this.buffer[i];
    }
    return ab;
};
//? } else {
/**
 * Returns a raw buffer compacted to contain this ByteBuffer's contents. Contents are the bytes between
 *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}. This is an alias of {@link ByteBuffer#toBuffer}.
 * @function
 * @param {boolean=} forceCopy If `true` returns a copy, otherwise returns a view referencing the same memory.
 *  Defaults to `false`
 * @returns {!ArrayBuffer} Contents as an ArrayBuffer
 * @expose
 */
ByteBufferPrototype.toArrayBuffer = ByteBufferPrototype.toBuffer;
//? }

