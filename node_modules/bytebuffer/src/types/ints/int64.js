//? if (INT64) {
// types/ints/int64

if (Long) {

    /**
     * Writes a 64bit signed integer.
     * @param {number|!Long} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeInt64 = function(value, offset) {
        //? RELATIVE();
        if (!this.noAssert) {
            //? ASSERT_LONG('value');
            //? ASSERT_OFFSET();
        }
        //? LONG('value');
        //? ENSURE_CAPACITY(8);
        //? if (NODE || !DATAVIEW) {
        var lo = value.low,
            hi = value.high;
        if (this.littleEndian) {
            //? WRITE_UINT32_ARRAY('lo', undefined, undefined, true);
            offset += 4;
            //? WRITE_UINT32_ARRAY('hi', undefined, undefined, true);
        } else {
            //? WRITE_UINT32_ARRAY('hi', undefined, undefined, false);
            offset += 4;
            //? WRITE_UINT32_ARRAY('lo', undefined, undefined, false);
        }
        //? } else {
        if (this.littleEndian) {
            this.view.setInt32(offset  , value.low , true);
            this.view.setInt32(offset+4, value.high, true);
        } else {
            this.view.setInt32(offset  , value.high, false);
            this.view.setInt32(offset+4, value.low , false);
        }
        //? }
        //? RELATIVE(8);
        return this;
    };
    //? if (ALIASES) {

    /**
     * Writes a 64bit signed integer. This is an alias of {@link ByteBuffer#writeInt64}.
     * @param {number|!Long} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeLong = ByteBufferPrototype.writeInt64;
    //? }
    
    /**
     * Reads a 64bit signed integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!Long}
     * @expose
     */
    ByteBufferPrototype.readInt64 = function(offset) {
        //? RELATIVE();
        if (!this.noAssert) {
            //? ASSERT_OFFSET(8);
        }
        //? if (NODE || !DATAVIEW) {
        var lo = 0,
            hi = 0;
        if (this.littleEndian) {
            //? READ_UINT32_ARRAY('lo', undefined, undefined, true);
            offset += 4;
            //? READ_UINT32_ARRAY('hi', undefined, undefined, true);
        } else {
            //? READ_UINT32_ARRAY('hi', undefined, undefined, false);
            offset += 4;
            //? READ_UINT32_ARRAY('lo', undefined, undefined, false);
        }
        var value = new Long(lo, hi, false);
        //? } else {
        var value = this.littleEndian
            ? new Long(this.view.getInt32(offset  , true ), this.view.getInt32(offset+4, true ), false)
            : new Long(this.view.getInt32(offset+4, false), this.view.getInt32(offset  , false), false);
        //? }
        //? RELATIVE(8);
        return value;
    };
    //? if (ALIASES) {

    /**
     * Reads a 64bit signed integer. This is an alias of {@link ByteBuffer#readInt64}.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!Long}
     * @expose
     */
    ByteBufferPrototype.readLong = ByteBufferPrototype.readInt64;
    //? }
    
    /**
     * Writes a 64bit unsigned integer.
     * @param {number|!Long} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeUint64 = function(value, offset) {
        //? RELATIVE();
        if (!this.noAssert) {
            //? ASSERT_LONG('value');
            //? ASSERT_OFFSET();
        }
        //? LONG('value');
        //? ENSURE_CAPACITY(8);
        //? if (NODE || !DATAVIEW) {
        var lo = value.low,
            hi = value.high;
        if (this.littleEndian) {
            //? WRITE_UINT32_ARRAY('lo', undefined, undefined, true);
            offset += 4;
            //? WRITE_UINT32_ARRAY('hi', undefined, undefined, true);
        } else {
            //? WRITE_UINT32_ARRAY('hi', undefined, undefined, false);
            offset += 4;
            //? WRITE_UINT32_ARRAY('lo', undefined, undefined, false);
        }
        //? } else {
        if (this.littleEndian) {
            this.view.setInt32(offset  , value.low , true);
            this.view.setInt32(offset+4, value.high, true);
        } else {
            this.view.setInt32(offset  , value.high, false);
            this.view.setInt32(offset+4, value.low , false);
        }
        //? }
        //? RELATIVE(8);
        return this;
    };

    /**
     * Writes a 64bit unsigned integer. This is an alias of {@link ByteBuffer#writeUint64}.
     * @function
     * @param {number|!Long} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeUInt64 = ByteBufferPrototype.writeUint64;
    
    /**
     * Reads a 64bit unsigned integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!Long}
     * @expose
     */
    ByteBufferPrototype.readUint64 = function(offset) {
        //? RELATIVE();
        if (!this.noAssert) {
            //? ASSERT_OFFSET(8);
        }
        //? if (NODE || !DATAVIEW) {
        var lo = 0,
            hi = 0;
        if (this.littleEndian) {
            //? READ_UINT32_ARRAY('lo', undefined, undefined, true);
            offset += 4;
            //? READ_UINT32_ARRAY('hi', undefined, undefined, true);
        } else {
            //? READ_UINT32_ARRAY('hi', undefined, undefined, false);
            offset += 4;
            //? READ_UINT32_ARRAY('lo', undefined, undefined, false);
        }
        var value = new Long(lo, hi, true);
        //? } else {
        var value = this.littleEndian
            ? new Long(this.view.getInt32(offset  , true ), this.view.getInt32(offset+4, true ), true)
            : new Long(this.view.getInt32(offset+4, false), this.view.getInt32(offset  , false), true);
        //? }
        //? RELATIVE(8);
        return value;
    };

    /**
     * Reads a 64bit unsigned integer. This is an alias of {@link ByteBuffer#readUint64}.
     * @function
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!Long}
     * @expose
     */
    ByteBufferPrototype.readUInt64 = ByteBufferPrototype.readUint64;
    
} // Long

//? }