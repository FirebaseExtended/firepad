/**
 * Creates a copy of this ByteBuffer's contents. Contents are the bytes between {@link ByteBuffer#offset} and
 *  {@link ByteBuffer#limit}.
 * @param {number=} begin Begin offset, defaults to {@link ByteBuffer#offset}.
 * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
 * @returns {!ByteBuffer} Copy
 * @expose
 */
ByteBufferPrototype.copy = function(begin, end) {
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    if (!this.noAssert) {
        //? ASSERT_RANGE();
    }
    if (begin === end)
        return new ByteBuffer(0, this.littleEndian, this.noAssert);
    var capacity = end - begin,
        bb = new ByteBuffer(capacity, this.littleEndian, this.noAssert);
    bb.offset = 0;
    bb.limit = capacity;
    if (bb.markedOffset >= 0) bb.markedOffset -= begin;
    this.copyTo(bb, 0, begin, end);
    return bb;
};

/**
 * Copies this ByteBuffer's contents to another ByteBuffer. Contents are the bytes between {@link ByteBuffer#offset} and
 *  {@link ByteBuffer#limit}.
 * @param {!ByteBuffer} target Target ByteBuffer
 * @param {number=} targetOffset Offset to copy to. Will use and increase the target's {@link ByteBuffer#offset}
 *  by the number of bytes copied if omitted.
 * @param {number=} sourceOffset Offset to start copying from. Will use and increase {@link ByteBuffer#offset} by the
 *  number of bytes copied if omitted.
 * @param {number=} sourceLimit Offset to end copying from, defaults to {@link ByteBuffer#limit}
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.copyTo = function(target, targetOffset, sourceOffset, sourceLimit) {
    var relative,
        targetRelative;
    if (!this.noAssert) {
        if (!ByteBuffer.isByteBuffer(target))
            throw TypeError("Illegal target: Not a ByteBuffer");
    }
    targetOffset = (targetRelative = typeof targetOffset === 'undefined') ? target.offset : targetOffset | 0;
    sourceOffset = (relative = typeof sourceOffset === 'undefined') ? this.offset : sourceOffset | 0;
    sourceLimit = typeof sourceLimit === 'undefined' ? this.limit : sourceLimit | 0;

    //? var TARGET_CAPACITY = NODE ? 'target.buffer.length' : 'target.buffer.byteLength';
    if (targetOffset < 0 || targetOffset > /*?= TARGET_CAPACITY */)
        throw RangeError("Illegal target range: 0 <= "+targetOffset+" <= "+/*?= TARGET_CAPACITY */);
    if (sourceOffset < 0 || sourceLimit > /*?= CAPACITY */)
        throw RangeError("Illegal source range: 0 <= "+sourceOffset+" <= "+/*?= CAPACITY */);

    var len = sourceLimit - sourceOffset;
    if (len === 0)
        return target; // Nothing to copy

    target.ensureCapacity(targetOffset + len);

    //? if (NODE)
    this.buffer.copy(target.buffer, targetOffset, sourceOffset, sourceLimit);
    //? else if (DATAVIEW)
    new Uint8Array(target.buffer).set(new Uint8Array(this.buffer).subarray(sourceOffset, sourceLimit), targetOffset);
    //? else
    target.view.set(this.view.subarray(sourceOffset, sourceLimit), targetOffset);

    if (relative) this.offset += len;
    if (targetRelative) target.offset += len;

    return this;
};

