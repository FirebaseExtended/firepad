/**
 * Skips the next `length` bytes. This will just advance
 * @param {number} length Number of bytes to skip. May also be negative to move the offset back.
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.skip = function(length) {
    if (!this.noAssert) {
        //? ASSERT_INTEGER('length');
    }
    var offset = this.offset + length;
    if (!this.noAssert) {
        if (offset < 0 || offset > /*?= CAPACITY */)
            throw RangeError("Illegal length: 0 <= "+this.offset+" + "+length+" <= "+/*?= CAPACITY */);
    }
    this.offset = offset;
    return this;
};

