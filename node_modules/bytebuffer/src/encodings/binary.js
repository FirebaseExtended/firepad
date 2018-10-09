//? if (BINARY) {
// encodings/binary

/**
 * Encodes this ByteBuffer to a binary encoded string, that is using only characters 0x00-0xFF as bytes.
 * @param {number=} begin Offset to begin at. Defaults to {@link ByteBuffer#offset}.
 * @param {number=} end Offset to end at. Defaults to {@link ByteBuffer#limit}.
 * @returns {string} Binary encoded string
 * @throws {RangeError} If `offset > limit`
 * @expose
 */
ByteBufferPrototype.toBinary = function(begin, end) {
    if (typeof begin === 'undefined')
        begin = this.offset;
    if (typeof end === 'undefined')
        end = this.limit;
    begin |= 0; end |= 0;
    if (begin < 0 || end > this.capacity() || begin > end)
        throw RangeError("begin, end");
    //? if (NODE)
    return this.buffer.toString("binary", begin, end);
    //? else {
    if (begin === end)
        return "";
    var chars = [],
        parts = [];
    while (begin < end) {
        //? if (NODE)
        chars.push(this.buffer[begin++]);
        //? else if (DATAVIEW)
        chars.push(this.view.getUint8(begin++));
        //? else
        chars.push(this.view[begin++]);
        if (chars.length >= 1024)
            parts.push(String.fromCharCode.apply(String, chars)),
            chars = [];
    }
    return parts.join('') + String.fromCharCode.apply(String, chars);
    //? }
};

/**
 * Decodes a binary encoded string, that is using only characters 0x00-0xFF as bytes, to a ByteBuffer.
 * @param {string} str String to decode
 * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
 *  {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @returns {!ByteBuffer} ByteBuffer
 * @expose
 */
ByteBuffer.fromBinary = function(str, littleEndian) {
    //? if (NODE) {
    return ByteBuffer.wrap(new Buffer(str, "binary"), littleEndian);
    //? } else {
    if (typeof str !== 'string')
        throw TypeError("str");
    var i = 0,
        k = str.length,
        charCode,
        bb = new ByteBuffer(k, littleEndian);
    while (i<k) {
        charCode = str.charCodeAt(i);
        if (charCode > 0xff)
            throw RangeError("illegal char code: "+charCode);
        //? if (DATAVIEW)
        bb.view.setUint8(i++, charCode);
        //? else
        bb.view[i++] = charCode;
    }
    bb.limit = k;
    //? }
    return bb;
};

//? }