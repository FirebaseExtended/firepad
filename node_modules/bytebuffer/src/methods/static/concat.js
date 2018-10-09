/**
 * Concatenates multiple ByteBuffers into one.
//? if (NODE) {
 * @param {!Array.<!ByteBuffer|!Buffer|!ArrayBuffer|!Uint8Array|string>} buffers Buffers to concatenate
//? } else {
 * @param {!Array.<!ByteBuffer|!ArrayBuffer|!Uint8Array|string>} buffers Buffers to concatenate
//? }
 * @param {(string|boolean)=} encoding String encoding if `buffers` contains a string ("base64", "hex", "binary",
 *  defaults to "utf8")
 * @param {boolean=} littleEndian Whether to use little or big endian byte order for the resulting ByteBuffer. Defaults
 *  to {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @param {boolean=} noAssert Whether to skip assertions of offsets and values for the resulting ByteBuffer. Defaults to
 *  {@link ByteBuffer.DEFAULT_NOASSERT}.
 * @returns {!ByteBuffer} Concatenated ByteBuffer
 * @expose
 */
ByteBuffer.concat = function(buffers, encoding, littleEndian, noAssert) {
    if (typeof encoding === 'boolean' || typeof encoding !== 'string') {
        noAssert = littleEndian;
        littleEndian = encoding;
        encoding = undefined;
    }
    var capacity = 0;
    for (var i=0, k=buffers.length, length; i<k; ++i) {
        if (!ByteBuffer.isByteBuffer(buffers[i]))
            buffers[i] = ByteBuffer.wrap(buffers[i], encoding);
        length = buffers[i].limit - buffers[i].offset;
        if (length > 0) capacity += length;
    }
    if (capacity === 0)
        return new ByteBuffer(0, littleEndian, noAssert);
    var bb = new ByteBuffer(capacity, littleEndian, noAssert),
        bi;
    //? if (!NODE && DATAVIEW)
    var view = new Uint8Array(bb.buffer);
    i=0; while (i<k) {
        bi = buffers[i++];
        length = bi.limit - bi.offset;
        if (length <= 0) continue;
        //? if (NODE) {
        bi.buffer.copy(bb.buffer, bb.offset, bi.offset, bi.limit);
        bb.offset += length;
        //? } else {
        //? if (DATAVIEW)
        view.set(new Uint8Array(bi.buffer).subarray(bi.offset, bi.limit), bb.offset);
        //? else
        bb.view.set(bi.view.subarray(bi.offset, bi.limit), bb.offset);
        bb.offset += length;
        //? }
    }
    bb.limit = bb.offset;
    bb.offset = 0;
    return bb;
};

