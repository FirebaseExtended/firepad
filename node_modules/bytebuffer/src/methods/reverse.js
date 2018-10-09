/**
 * Reverses this ByteBuffer's contents.
 * @param {number=} begin Offset to start at, defaults to {@link ByteBuffer#offset}
 * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.reverse = function(begin, end) {
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    if (!this.noAssert) {
        //? ASSERT_RANGE();
    }
    if (begin === end)
        return this; // Nothing to reverse
    //? if (NODE)
    Array.prototype.reverse.call(this.buffer.slice(begin, end));
    //? else if (DATAVIEW) {
    Array.prototype.reverse.call(new Uint8Array(this.buffer).subarray(begin, end));
    this.view = new DataView(this.buffer); // FIXME: Why exactly is this necessary?
    //? } else {
    Array.prototype.reverse.call(this.view.subarray(begin, end));
    //? }
    return this;
};
