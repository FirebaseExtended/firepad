//? if (INT16) {
// types/ints/int16

/**
 * Writes a 16bit signed integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
 * @throws {TypeError} If `offset` or `value` is not a valid number
 * @throws {RangeError} If `offset` is out of bounds
 * @expose
 */
ByteBufferPrototype.writeInt16 = function(value, offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_INTEGER('value');
        //? ASSERT_OFFSET();
    }
    //? ENSURE_CAPACITY(2);
    //? if (NODE || !DATAVIEW) { var dst = NODE ? 'this.buffer' : 'this.view';
    if (this.littleEndian) {
        /*?= dst */[offset+1] = (value & 0xFF00) >>> 8;
        /*?= dst */[offset  ] =  value & 0x00FF;
    } else {
        /*?= dst */[offset]   = (value & 0xFF00) >>> 8;
        /*?= dst */[offset+1] =  value & 0x00FF;
    }
    //? } else
    this.view.setInt16(offset, value, this.littleEndian);
    //? RELATIVE(2);
    return this;
};
//? if (ALIASES) {

/**
 * Writes a 16bit signed integer. This is an alias of {@link ByteBuffer#writeInt16}.
 * @function
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
 * @throws {TypeError} If `offset` or `value` is not a valid number
 * @throws {RangeError} If `offset` is out of bounds
 * @expose
 */
ByteBufferPrototype.writeShort = ByteBufferPrototype.writeInt16;
//? }

/**
 * Reads a 16bit signed integer.
 * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
 * @returns {number} Value read
 * @throws {TypeError} If `offset` is not a valid number
 * @throws {RangeError} If `offset` is out of bounds
 * @expose
 */
ByteBufferPrototype.readInt16 = function(offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_OFFSET(2);
    }
    //? if (NODE || !DATAVIEW) { var dst = NODE ? 'this.buffer' : 'this.view';
    var value = 0;
    if (this.littleEndian) {
        value  = /*?= dst */[offset  ];
        value |= /*?= dst */[offset+1] << 8;
    } else {
        value  = /*?= dst */[offset  ] << 8;
        value |= /*?= dst */[offset+1];
    }
    if ((value & 0x8000) === 0x8000) value = -(0xFFFF - value + 1); // Cast to signed
    //? } else
    var value = this.view.getInt16(offset, this.littleEndian);
    //? RELATIVE(2);
    return value;
};
//? if (ALIASES) {

/**
 * Reads a 16bit signed integer. This is an alias of {@link ByteBuffer#readInt16}.
 * @function
 * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
 * @returns {number} Value read
 * @throws {TypeError} If `offset` is not a valid number
 * @throws {RangeError} If `offset` is out of bounds
 * @expose
 */
ByteBufferPrototype.readShort = ByteBufferPrototype.readInt16;
//? }

/**
 * Writes a 16bit unsigned integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
 * @throws {TypeError} If `offset` or `value` is not a valid number
 * @throws {RangeError} If `offset` is out of bounds
 * @expose
 */
ByteBufferPrototype.writeUint16 = function(value, offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_INTEGER('value', true);
        //? ASSERT_OFFSET();
    }
    //? ENSURE_CAPACITY(2);
    //? if (NODE || !DATAVIEW) { var dst = NODE ? 'this.buffer' : 'this.view';
    if (this.littleEndian) {
        /*?= dst */[offset+1] = (value & 0xFF00) >>> 8;
        /*?= dst */[offset  ] =  value & 0x00FF;
    } else {
        /*?= dst */[offset]   = (value & 0xFF00) >>> 8;
        /*?= dst */[offset+1] =  value & 0x00FF;
    }
    //? } else
    this.view.setUint16(offset, value, this.littleEndian);
    //? RELATIVE(2);
    return this;
};

/**
 * Writes a 16bit unsigned integer. This is an alias of {@link ByteBuffer#writeUint16}.
 * @function
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
 * @throws {TypeError} If `offset` or `value` is not a valid number
 * @throws {RangeError} If `offset` is out of bounds
 * @expose
 */
ByteBufferPrototype.writeUInt16 = ByteBufferPrototype.writeUint16;

/**
 * Reads a 16bit unsigned integer.
 * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
 * @returns {number} Value read
 * @throws {TypeError} If `offset` is not a valid number
 * @throws {RangeError} If `offset` is out of bounds
 * @expose
 */
ByteBufferPrototype.readUint16 = function(offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_OFFSET(2);
    }
    //? if (NODE || !DATAVIEW) { var dst = NODE ? 'this.buffer' : 'this.view';
    var value = 0;
    if (this.littleEndian) {
        value  = /*?= dst */[offset  ];
        value |= /*?= dst */[offset+1] << 8;
    } else {
        value  = /*?= dst */[offset  ] << 8;
        value |= /*?= dst */[offset+1];
    }
    //? } else
    var value = this.view.getUint16(offset, this.littleEndian);
    //? RELATIVE(2);
    return value;
};

/**
 * Reads a 16bit unsigned integer. This is an alias of {@link ByteBuffer#readUint16}.
 * @function
 * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
 * @returns {number} Value read
 * @throws {TypeError} If `offset` is not a valid number
 * @throws {RangeError} If `offset` is out of bounds
 * @expose
 */
ByteBufferPrototype.readUInt16 = ByteBufferPrototype.readUint16;

//? }