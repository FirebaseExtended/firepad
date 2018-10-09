/**
 * Appends some data to this ByteBuffer. This will overwrite any contents behind the specified offset up to the appended
 *  data's length.
//? if (NODE) {
 * @param {!ByteBuffer|!Buffer|!ArrayBuffer|!Uint8Array|string} source Data to append. If `source` is a ByteBuffer, its
 * offsets will be modified according to the performed read operation.
//? } else {
 * @param {!ByteBuffer|!ArrayBuffer|!Uint8Array|string} source Data to append. If `source` is a ByteBuffer, its offsets
 *  will be modified according to the performed read operation.
//? }
 * @param {(string|number)=} encoding Encoding if `data` is a string ("base64", "hex", "binary", defaults to "utf8")
 * @param {number=} offset Offset to append at. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 * @example A relative `<01 02>03.append(<04 05>)` will result in `<01 02 04 05>, 04 05|`
 * @example An absolute `<01 02>03.append(04 05>, 1)` will result in `<01 04>05, 04 05|`
 */
ByteBufferPrototype.append = function(source, encoding, offset) {
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
    var length = source.limit - source.offset;
    if (length <= 0) return this; // Nothing to append
    //? ENSURE_CAPACITY('length');
    //? if (NODE)
    source.buffer.copy(this.buffer, offset, source.offset, source.limit);
    //? else if (DATAVIEW)
    new Uint8Array(this.buffer, offset).set(new Uint8Array(source.buffer).subarray(source.offset, source.limit));
    //? else
    this.view.set(source.view.subarray(source.offset, source.limit), offset);
    source.offset += length;
    //? RELATIVE('length');
    return this;
};

/**
 * Appends this ByteBuffer's contents to another ByteBuffer. This will overwrite any contents at and after the
    specified offset up to the length of this ByteBuffer's data.
 * @param {!ByteBuffer} target Target ByteBuffer
 * @param {number=} offset Offset to append to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  read if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 * @see ByteBuffer#append
 */
ByteBufferPrototype.appendTo = function(target, offset) {
    target.append(this, offset);
    return this;
};

