// encodings/impl/binary

/**
 * Encodes a binary JavaScript string to bytes.
 * @param {string} src Source string
 * @param {number} srcOffset Source offset
 * @param {!ByteBuffer} dst Destination ByteBuffer
 * @param {number} dstOffset Destination offset
 * @param {number} count Number of char codes to encode
 * @returns {number} Number of bytes encoded
 * @inner
 */
function binary_encode(src, srcOffset, dst, dstOffset, count) {
    var n = 0;
    while (count--) {
        var cc = src.charCodeAt(srcOffset++);
        if (cc > 255)
            throw Error("illegal binary char code: "+cc);
        //? SET('cc', 'dstOffset++', 'dst');
        ++n;
    }
    return n;
}

/**
 * Decodes bytes to a binary JavaScript string.
 * @param {!ByteBuffer} src Source ByteBuffer
 * @param {number} srcOffset Source offset
 * @param {number} count Number of bytes to decode
 * @returns {string} Decoded string
 * @inner
 */
function binary_decode(src, srcOffset, count) {
    if (count === 0)
        return "";
    var parts = [], // readily assembled parts
        batch = []; // char codes for batch processing
    while (count--) {
        batch.push(/*? GET('srcOffset++', 'src') */);
        if (batch.length > 1023) {
            parts.push(String.fromCharCode.apply(String, batch));
            batch.length = 0;
        }
    }
    if (batch.length > 0) {
        if (parts.length === 0)
            return String.fromCharCode.apply(String, batch);
        parts.push(String.fromCharCode.apply(String, batch));
    }
    return parts.join('');
}

/**
 * Calculates the number of bytes required to store a binary JavaScript string.
 * @param {string} src Source string
 * @param {number} srcOffset Source offset
 * @param {number} count Number of char codes to calculate
 * @returns {number} Number of bytes required
 * @inner
 */
function binary_calculate(src, srcOffset, count) {
    return count;
}

ByteBuffer.registerEncoding("binary", binary_encode, binary_decode, binary_calculate);
