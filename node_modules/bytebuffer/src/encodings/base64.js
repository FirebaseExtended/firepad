//? if (BASE64) {
//? if (!NODE) {
// lxiv-embeddable

//? include("../../node_modules/lxiv/dist/lxiv-embeddable.js");

//? }
// encodings/base64

/**
 * Encodes this ByteBuffer's contents to a base64 encoded string.
 * @param {number=} begin Offset to begin at, defaults to {@link ByteBuffer#offset}.
 * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}.
 * @returns {string} Base64 encoded string
 * @throws {RangeError} If `begin` or `end` is out of bounds
 * @expose
 */
ByteBufferPrototype.toBase64 = function(begin, end) {
    if (typeof begin === 'undefined')
        begin = this.offset;
    if (typeof end === 'undefined')
        end = this.limit;
    begin = begin | 0; end = end | 0;
    if (begin < 0 || end > this.capacity || begin > end)
        throw RangeError("begin, end");
    //? if (NODE)
    return this.buffer.toString("base64", begin, end);
    //? else {
    var sd; lxiv.encode(function() {
        //? if (DATAVIEW)
        return begin < end ? this.view.getUint8(begin++) : null;
        //? else
        return begin < end ? this.view[begin++] : null;
    }.bind(this), sd = stringDestination());
    return sd();
    //? }
};

/**
 * Decodes a base64 encoded string to a ByteBuffer.
 * @param {string} str String to decode
 * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
 *  {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @returns {!ByteBuffer} ByteBuffer
 * @expose
 */
ByteBuffer.fromBase64 = function(str, littleEndian) {
    //? if (NODE) {
    return ByteBuffer.wrap(new Buffer(str, "base64"), littleEndian);
    //? } else {
    if (typeof str !== 'string')
        throw TypeError("str");
    var bb = new ByteBuffer(str.length/4*3, littleEndian),
        i = 0;
    lxiv.decode(stringSource(str), function(b) {
        //? if (DATAVIEW)
        bb.view.setUint8(i++, b);
        //? else
        bb.view[i++] = b;
    });
    bb.limit = i;
    //? }
    return bb;
};

/**
 * Encodes a binary string to base64 like `window.btoa` does.
 * @param {string} str Binary string
 * @returns {string} Base64 encoded string
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.btoa
 * @expose
 */
ByteBuffer.btoa = function(str) {
    return ByteBuffer.fromBinary(str).toBase64();
};

/**
 * Decodes a base64 encoded string to binary like `window.atob` does.
 * @param {string} b64 Base64 encoded string
 * @returns {string} Binary string
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.atob
 * @expose
 */
ByteBuffer.atob = function(b64) {
    return ByteBuffer.fromBase64(b64).toBinary();
};

//? }