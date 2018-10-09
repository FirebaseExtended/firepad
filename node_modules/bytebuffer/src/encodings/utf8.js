//? if (UTF8) {
// utfx-embeddable

//? include("../../node_modules/utfx/dist/utfx-embeddable.js");

// encodings/utf8

/**
 * Encodes this ByteBuffer's contents between {@link ByteBuffer#offset} and {@link ByteBuffer#limit} to an UTF8 encoded
 *  string.
 * @returns {string} Hex encoded string
 * @throws {RangeError} If `offset > limit`
 * @expose
 */
ByteBufferPrototype.toUTF8 = function(begin, end) {
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    if (!this.noAssert) {
        //? ASSERT_RANGE();
    }
    //? if (NODE)
    return this.buffer.toString("utf8", begin, end);
    //? else {
    var sd; try {
        utfx.decodeUTF8toUTF16(function() {
            //? if (DATAVIEW)
            return begin < end ? this.view.getUint8(begin++) : null;
            //? else
            return begin < end ? this.view[begin++] : null;
        }.bind(this), sd = stringDestination());
    } catch (e) {
        if (begin !== end)
            throw RangeError("Illegal range: Truncated data, "+begin+" != "+end);
    }
    return sd();
    //? }
};

/**
 * Decodes an UTF8 encoded string to a ByteBuffer.
 * @param {string} str String to decode
 * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
 *  {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
 *  {@link ByteBuffer.DEFAULT_NOASSERT}.
 * @returns {!ByteBuffer} ByteBuffer
 * @expose
 */
ByteBuffer.fromUTF8 = function(str, littleEndian, noAssert) {
    if (!noAssert)
        if (typeof str !== 'string')
            throw TypeError("Illegal str: Not a string");
    //? if (NODE) {
    var bb = new ByteBuffer(0, littleEndian, noAssert);
    bb.buffer = new Buffer(str, "utf8");
    bb.limit = bb.buffer.length;
    //? } else {
    var bb = new ByteBuffer(utfx.calculateUTF16asUTF8(stringSource(str), true)[1], littleEndian, noAssert),
        i = 0;
    utfx.encodeUTF16toUTF8(stringSource(str), function(b) {
        //? if (DATAVIEW)
        bb.view.setUint8(i++, b);
        //? else
        bb.view[i++] = b;
    });
    bb.limit = i;
    //? }
    return bb;
};

//? }