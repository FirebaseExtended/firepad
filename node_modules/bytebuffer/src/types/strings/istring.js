//? if (ISTRING) {
// types/strings/istring

/**
 * Writes a length as uint32 prefixed UTF8 encoded string.
 * @param {string} str String to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {!ByteBuffer|number} `this` if `offset` is omitted, else the actual number of bytes written
 * @expose
 * @see ByteBuffer#writeVarint32
 */
ByteBufferPrototype.writeIString = function(str, offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        if (typeof str !== 'string')
            throw TypeError("Illegal str: Not a string");
        //? ASSERT_OFFSET();
    }
    var start = offset,
        k;
    //? if (NODE) {
    k = Buffer.byteLength(str, "utf8");
    //? ENSURE_CAPACITY('4+k');
    //? WRITE_UINT32_ARRAY('k');
    offset += 4;
    offset += this.buffer.write(str, offset, k, "utf8");
    //? } else {
    k = utfx.calculateUTF16asUTF8(stringSource(str), this.noAssert)[1];
    //? ENSURE_CAPACITY('4+k');
    //? if (DATAVIEW)
    this.view.setUint32(offset, k, this.littleEndian);
    //? else
    //? WRITE_UINT32_ARRAY('k');
    offset += 4;
    utfx.encodeUTF16toUTF8(stringSource(str), function(b) {
        //? if (DATAVIEW)
        this.view.setUint8(offset++, b);
        //? else
        this.view[offset++] = b;
    }.bind(this));
    if (offset !== start + 4 + k)
        throw RangeError("Illegal range: Truncated data, "+offset+" == "+(offset+4+k));
    //? }
    if (relative) {
        this.offset = offset;
        return this;
    }
    return offset - start;
};

/**
 * Reads a length as uint32 prefixed UTF8 encoded string.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  read if omitted.
 * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
 *  read and the actual number of bytes read.
 * @expose
 * @see ByteBuffer#readVarint32
 */
ByteBufferPrototype.readIString = function(offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_OFFSET(4);
    }
    var start = offset;
    var len = this.readUint32(offset);
    var str = this.readUTF8String(len, ByteBuffer.METRICS_BYTES, offset += 4);
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