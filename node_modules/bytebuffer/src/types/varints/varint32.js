//? if (VARINT32) {
// types/varints/varint32

/**
 * Maximum number of bytes required to store a 32bit base 128 variable-length integer.
 * @type {number}
 * @const
 * @expose
 */
ByteBuffer.MAX_VARINT32_BYTES = 5;

/**
 * Calculates the actual number of bytes required to store a 32bit base 128 variable-length integer.
 * @param {number} value Value to encode
 * @returns {number} Number of bytes required. Capped to {@link ByteBuffer.MAX_VARINT32_BYTES}
 * @expose
 */
ByteBuffer.calculateVarint32 = function(value) {
    // ref: src/google/protobuf/io/coded_stream.cc
    value = value >>> 0;
         if (value < 1 << 7 ) return 1;
    else if (value < 1 << 14) return 2;
    else if (value < 1 << 21) return 3;
    else if (value < 1 << 28) return 4;
    else                      return 5;
};

/**
 * Zigzag encodes a signed 32bit integer so that it can be effectively used with varint encoding.
 * @param {number} n Signed 32bit integer
 * @returns {number} Unsigned zigzag encoded 32bit integer
 * @expose
 */
ByteBuffer.zigZagEncode32 = function(n) {
    return (((n |= 0) << 1) ^ (n >> 31)) >>> 0; // ref: src/google/protobuf/wire_format_lite.h
};

/**
 * Decodes a zigzag encoded signed 32bit integer.
 * @param {number} n Unsigned zigzag encoded 32bit integer
 * @returns {number} Signed 32bit integer
 * @expose
 */
ByteBuffer.zigZagDecode32 = function(n) {
    return ((n >>> 1) ^ -(n & 1)) | 0; // // ref: src/google/protobuf/wire_format_lite.h
};

/**
 * Writes a 32bit base 128 variable-length integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {!ByteBuffer|number} this if `offset` is omitted, else the actual number of bytes written
 * @expose
 */
ByteBufferPrototype.writeVarint32 = function(value, offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_INTEGER('value');
        //? ASSERT_OFFSET();
    }
    var size = ByteBuffer.calculateVarint32(value),
        b;
    //? ENSURE_CAPACITY('size');
    value >>>= 0;
    while (value >= 0x80) {
        b = (value & 0x7f) | 0x80;
        //? if (NODE)
        this.buffer[offset++] = b;
        //? else if (DATAVIEW)
        this.view.setUint8(offset++, b);
        //? else
        this.view[offset++] = b;
        value >>>= 7;
    }
    //? if (NODE)
    this.buffer[offset++] = value;
    //? else if (DATAVIEW)
    this.view.setUint8(offset++, value);
    //? else
    this.view[offset++] = value;
    if (relative) {
        this.offset = offset;
        return this;
    }
    return size;
};

/**
 * Writes a zig-zag encoded (signed) 32bit base 128 variable-length integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {!ByteBuffer|number} this if `offset` is omitted, else the actual number of bytes written
 * @expose
 */
ByteBufferPrototype.writeVarint32ZigZag = function(value, offset) {
    return this.writeVarint32(ByteBuffer.zigZagEncode32(value), offset);
};

/**
 * Reads a 32bit base 128 variable-length integer.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {number|!{value: number, length: number}} The value read if offset is omitted, else the value read
 *  and the actual number of bytes read.
 * @throws {Error} If it's not a valid varint. Has a property `truncated = true` if there is not enough data available
 *  to fully decode the varint.
 * @expose
 */
ByteBufferPrototype.readVarint32 = function(offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_OFFSET(1);
    }
    var c = 0,
        value = 0 >>> 0,
        b;
    do {
        if (!this.noAssert && offset > this.limit) {
            var err = Error("Truncated");
            err['truncated'] = true;
            throw err;
        }
        //? if (NODE)
        b = this.buffer[offset++];
        //? else if (DATAVIEW)
        b = this.view.getUint8(offset++);
        //? else
        b = this.view[offset++];
        if (c < 5)
            value |= (b & 0x7f) << (7*c);
        ++c;
    } while ((b & 0x80) !== 0);
    value |= 0;
    if (relative) {
        this.offset = offset;
        return value;
    }
    return {
        "value": value,
        "length": c
    };
};

/**
 * Reads a zig-zag encoded (signed) 32bit base 128 variable-length integer.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {number|!{value: number, length: number}} The value read if offset is omitted, else the value read
 *  and the actual number of bytes read.
 * @throws {Error} If it's not a valid varint
 * @expose
 */
ByteBufferPrototype.readVarint32ZigZag = function(offset) {
    var val = this.readVarint32(offset);
    if (typeof val === 'object')
        val["value"] = ByteBuffer.zigZagDecode32(val["value"]);
    else
        val = ByteBuffer.zigZagDecode32(val);
    return val;
};

//? }