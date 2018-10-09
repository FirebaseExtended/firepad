/**
 * Reads the specified number of bytes.
 * @param {number} length Number of bytes to read
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `length` if omitted.
 * @returns {!ByteBuffer}
 * @expose
 */
ByteBufferPrototype.readBytes = function(length, offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_OFFSET('length');
    }
    var slice = this.slice(offset, offset + length);
    //? RELATIVE('length');
    return slice;
};

/**
 * Writes a payload of bytes. This is an alias of {@link ByteBuffer#append}.
 * @function
 //? if (NODE) {
 * @param {!ByteBuffer|!Buffer|!ArrayBuffer|!Uint8Array|string} source Data to write. If `source` is a ByteBuffer, its
 * offsets will be modified according to the performed read operation.
 //? } else {
 * @param {!ByteBuffer|!ArrayBuffer|!Uint8Array|string} source Data to write. If `source` is a ByteBuffer, its offsets
 *  will be modified according to the performed read operation.
 //? }
 * @param {(string|number)=} encoding Encoding if `data` is a string ("base64", "hex", "binary", defaults to "utf8")
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.writeBytes = ByteBufferPrototype.append;
