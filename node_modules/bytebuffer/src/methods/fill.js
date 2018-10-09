/**
 * Overwrites this ByteBuffer's contents with the specified value. Contents are the bytes between
 *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}.
 * @param {number|string} value Byte value to fill with. If given as a string, the first character is used.
 * @param {number=} begin Begin offset. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted. defaults to {@link ByteBuffer#offset}.
 * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
 * @returns {!ByteBuffer} this
 * @expose
 * @example `someByteBuffer.clear().fill(0)` fills the entire backing buffer with zeroes
 */
ByteBufferPrototype.fill = function(value, begin, end) {
    //? RELATIVE(undefined, 'begin');
    if (typeof value === 'string' && value.length > 0)
        value = value.charCodeAt(0);
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    if (!this.noAssert) {
        //? ASSERT_INTEGER('value');
        //? ASSERT_RANGE();
    }
    if (begin >= end)
        return this; // Nothing to fill
    //? if (NODE) {
    this.buffer.fill(value, begin, end);
    begin = end;
    //? } else if (DATAVIEW) {
    while (begin < end) this.view.setUint8(begin++, value);
    //? } else {
    while (begin < end) this.view[begin++] = value;
    //? }
    if (relative) this.offset = begin;
    return this;
};

