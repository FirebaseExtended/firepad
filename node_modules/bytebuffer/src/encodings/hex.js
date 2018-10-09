//? if (HEX) {
// encodings/hex

/**
 * Encodes this ByteBuffer's contents to a hex encoded string.
 * @param {number=} begin Offset to begin at. Defaults to {@link ByteBuffer#offset}.
 * @param {number=} end Offset to end at. Defaults to {@link ByteBuffer#limit}.
 * @returns {string} Hex encoded string
 * @expose
 */
ByteBufferPrototype.toHex = function(begin, end) {
    begin = typeof begin === 'undefined' ? this.offset : begin;
    end = typeof end === 'undefined' ? this.limit : end;
    if (!this.noAssert) {
        //? ASSERT_RANGE();
    }
    //? if (NODE)
    return this.buffer.toString("hex", begin, end);
    //? else {
    var out = new Array(end - begin),
        b;
    while (begin < end) {
        //? if (DATAVIEW)
        b = this.view.getUint8(begin++);
        //? else
        b = this.view[begin++];
        if (b < 0x10)
            out.push("0", b.toString(16));
        else out.push(b.toString(16));
    }
    return out.join('');
    //? }
};

/**
 * Decodes a hex encoded string to a ByteBuffer.
 * @param {string} str String to decode
 * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
 *  {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
 *  {@link ByteBuffer.DEFAULT_NOASSERT}.
 * @returns {!ByteBuffer} ByteBuffer
 * @expose
 */
ByteBuffer.fromHex = function(str, littleEndian, noAssert) {
    if (!noAssert) {
        if (typeof str !== 'string')
            throw TypeError("Illegal str: Not a string");
        if (str.length % 2 !== 0)
            throw TypeError("Illegal str: Length not a multiple of 2");
    }
    //? if (NODE) {
    var bb = new ByteBuffer(0, littleEndian, true);
    bb.buffer = new Buffer(str, "hex");
    bb.limit = bb.buffer.length;
    //? } else {
    var k = str.length,
        bb = new ByteBuffer((k / 2) | 0, littleEndian),
        b;
    for (var i=0, j=0; i<k; i+=2) {
        b = parseInt(str.substring(i, i+2), 16);
        if (!noAssert)
            if (!isFinite(b) || b < 0 || b > 255)
                throw TypeError("Illegal str: Contains non-hex characters");
        //? if (DATAVIEW)
        bb.view.setUint8(j++, b);
        //? else
        bb.view[j++] = b;
    }
    bb.limit = j;
    //? }
    return bb;
};

//? }