/**
 * Creates a cloned instance of this ByteBuffer, preset with this ByteBuffer's values for {@link ByteBuffer#offset},
 *  {@link ByteBuffer#markedOffset} and {@link ByteBuffer#limit}.
 * @param {boolean=} copy Whether to copy the backing buffer or to return another view on the same, defaults to `false`
 * @returns {!ByteBuffer} Cloned instance
 * @expose
 */
ByteBufferPrototype.clone = function(copy) {
    var bb = new ByteBuffer(0, this.littleEndian, this.noAssert);
    if (copy) {
        //? if (NODE) {
        var buffer = new Buffer(this.buffer.length);
        this.buffer.copy(buffer);
        bb.buffer = buffer;
        //? } else {
        bb.buffer = new ArrayBuffer(this.buffer.byteLength);
        //? if (DATAVIEW) {
        new Uint8Array(bb.buffer).set(this.buffer);
        bb.view = new DataView(bb.buffer);
        //? } else {
        bb.view = new Uint8Array(bb.buffer);
        //? }
        //? }
    } else {
        bb.buffer = this.buffer;
        //? if (!NODE)
        bb.view = this.view;
    }
    bb.offset = this.offset;
    bb.markedOffset = this.markedOffset;
    bb.limit = this.limit;
    return bb;
};

