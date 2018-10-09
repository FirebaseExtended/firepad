/**
 * Resizes this ByteBuffer to be backed by a buffer of at least the given capacity. Will do nothing if already that
 *  large or larger.
 * @param {number} capacity Capacity required
 * @returns {!ByteBuffer} this
 * @throws {TypeError} If `capacity` is not a number
 * @throws {RangeError} If `capacity < 0`
 * @expose
 */
ByteBufferPrototype.resize = function(capacity) {
    if (!this.noAssert) {
        //? ASSERT_INTEGER('capacity');
        if (capacity < 0)
            throw RangeError("Illegal capacity: 0 <= "+capacity);
    }
    //? if (NODE) {
    if (this.buffer.length < capacity) {
        var buffer = new Buffer(capacity);
        this.buffer.copy(buffer);
        this.buffer = buffer;
    }
    //? } else {
    if (this.buffer.byteLength < capacity) {
        //? if (DATAVIEW) {
        var buffer = new ArrayBuffer(capacity);
        new Uint8Array(buffer).set(new Uint8Array(this.buffer));
        this.buffer = buffer;
        this.view = new DataView(buffer);
        //? } else {
        var buffer = new ArrayBuffer(capacity);
        var view = new Uint8Array(buffer);
        view.set(this.view);
        this.buffer = buffer;
        this.view = view;
        //? }
    }
    //? }
    return this;
};
