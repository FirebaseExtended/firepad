//? if (VSTRING && VARINTS && VARINT32) {
// types/strings/vstring

/**
 * Writes a length as varint32 prefixed UTF8 encoded string.
 * @param {string} str String to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {!ByteBuffer|number} `this` if `offset` is omitted, else the actual number of bytes written
 * @expose
 * @see ByteBuffer#writeVarint32
 */
ByteBufferPrototype.writeVString = function(str, offset) {
    //? RELATIVE()
    if (!this.noAssert) {
        if (typeof str !== 'string')
            throw TypeError("Illegal str: Not a string");
        //? ASSERT_OFFSET();
    }
    var start = offset,
        k, l;
    //? if (NODE) {
    k = Buffer.byteLength(str, "utf8");
    l = ByteBuffer.calculateVarint32(k);
    //? ENSURE_CAPACITY('l+k');
    offset += this.writeVarint32(k, offset);
    offset += this.buffer.write(str, offset, k, "utf8");
    //? } else {
    k = utfx.calculateUTF16asUTF8(stringSource(str), this.noAssert)[1];
    l = ByteBuffer.calculateVarint32(k);
    //? ENSURE_CAPACITY('l+k');
    offset += this.writeVarint32(k, offset);
    utfx.encodeUTF16toUTF8(stringSource(str), function(b) {
        //? if (DATAVIEW)
        this.view.setUint8(offset++, b);
        //? else
        this.view[offset++] = b;
    }.bind(this));
    if (offset !== start+k+l)
        throw RangeError("Illegal range: Truncated data, "+offset+" == "+(offset+k+l));
    //? }
    if (relative) {
        this.offset = offset;
        return this;
    }
    return offset - start;
};

/**
 * Reads a length as varint32 prefixed UTF8 encoded string.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  read if omitted.
 * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
 *  read and the actual number of bytes read.
 * @expose
 * @see ByteBuffer#readVarint32
 */
ByteBufferPrototype.readVString = function(offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_OFFSET(1);
    }
    var start = offset;
    var len = this.readVarint32(offset);
    var str = this.readUTF8String(len['value'], ByteBuffer.METRICS_BYTES, offset += len['length']);
    offset += str['length'];
    if (relative) {
        this.offset = offset;
        return str['string'];
    } else {
        return {
            'string': str['string'],
            'length': offset - start
        };
    }
};

//? }
