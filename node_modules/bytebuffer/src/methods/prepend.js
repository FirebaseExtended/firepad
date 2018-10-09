/**
 * Prepends some data to this ByteBuffer. This will overwrite any contents before the specified offset up to the
 *  prepended data's length. If there is not enough space available before the specified `offset`, the backing buffer
 *  will be resized and its contents moved accordingly.
 //? if (NODE) {
 * @param {!ByteBuffer|string||!Buffer} source Data to prepend. If `source` is a ByteBuffer, its offset will be modified
 *  according to the performed read operation.
 //? } else {
 * @param {!ByteBuffer|string|!ArrayBuffer} source Data to prepend. If `source` is a ByteBuffer, its offset will be
 *  modified according to the performed read operation.
 //? }
 * @param {(string|number)=} encoding Encoding if `data` is a string ("base64", "hex", "binary", defaults to "utf8")
 * @param {number=} offset Offset to prepend at. Will use and decrease {@link ByteBuffer#offset} by the number of bytes
 *  prepended if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 * @example A relative `00<01 02 03>.prepend(<04 05>)` results in `<04 05 01 02 03>, 04 05|`
 * @example An absolute `00<01 02 03>.prepend(<04 05>, 2)` results in `04<05 02 03>, 04 05|`
 */
ByteBufferPrototype.prepend = function(source, encoding, offset) {
    if (typeof encoding === 'number' || typeof encoding !== 'string') {
        offset = encoding;
        encoding = undefined;
    }
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_OFFSET();
    }
    if (!(source instanceof ByteBuffer))
        source = ByteBuffer.wrap(source, encoding);
    var len = source.limit - source.offset;
    if (len <= 0) return this; // Nothing to prepend
    var diff = len - offset;
    if (diff > 0) { // Not enough space before offset, so resize + move
        //? if (NODE) {
        var buffer = new Buffer(this.buffer.length + diff);
        this.buffer.copy(buffer, len, offset, this.buffer.length);
        this.buffer = buffer;
        //? } else if (DATAVIEW) {
        var buffer = new ArrayBuffer(this.buffer.byteLength + diff);
        var arrayView = new Uint8Array(buffer);
        arrayView.set(new Uint8Array(this.buffer).subarray(offset, this.buffer.byteLength), len);
        this.buffer = buffer;
        this.view = new DataView(buffer);
        //? } else {
        var buffer = new ArrayBuffer(this.buffer.byteLength + diff);
        var view = new Uint8Array(buffer);
        view.set(this.view.subarray(offset, this.buffer.byteLength), len);
        this.buffer = buffer;
        this.view = view;
        //? }
        this.offset += diff;
        if (this.markedOffset >= 0) this.markedOffset += diff;
        this.limit += diff;
        offset += diff;
    }/*? if (!NODE) { */ else {
        var arrayView = new Uint8Array(this.buffer);
    }
    //? }
    //? if (NODE)
    source.buffer.copy(this.buffer, offset - len, source.offset, source.limit);
    //? else if (DATAVIEW)
    arrayView.set(new Uint8Array(source.buffer).subarray(source.offset, source.limit), offset - len);
    //? else
    this.view.set(source.view.subarray(source.offset, source.limit), offset - len);

    source.offset = source.limit;
    if (relative)
        this.offset -= len;
    return this;
};

/**
 * Prepends this ByteBuffer to another ByteBuffer. This will overwrite any contents before the specified offset up to the
 *  prepended data's length. If there is not enough space available before the specified `offset`, the backing buffer
 *  will be resized and its contents moved accordingly.
 * @param {!ByteBuffer} target Target ByteBuffer
 * @param {number=} offset Offset to prepend at. Will use and decrease {@link ByteBuffer#offset} by the number of bytes
 *  prepended if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 * @see ByteBuffer#prepend
 */
ByteBufferPrototype.prependTo = function(target, offset) {
    target.prepend(this, offset);
    return this;
};
