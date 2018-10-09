// encodings/impl/utf8

/**
 * Encodes a standard JavaScript string to UTF8 bytes.
 * @param {string} src Source string
 * @param {number} srcOffset Source offset
 * @param {!ByteBuffer} dst Destination ByteBuffer
 * @param {number} dstOffset Destination offset
 * @param {number} count Number of char codes to encode
 * @returns {number} Number of bytes encoded
 * @inner
 */
function utf8_encode(src, srcOffset, dst, dstOffset, count) {
    if (count === 0)
        return 0;
    var n = 0;
    //? // SET(varValue, varOffset, varTarget) with varTarget referencing a ByteBuffer
    do {
        var cc = src.charCodeAt(srcOffset++);
        --count;
        if (cc < 0x80) {
            n += 1;
            //? SET('cc', 'dstOffset++', 'dst');
        } else if (cc < 0x800) {
            n += 2;
            //? SET('0xC0 | (cc >> 6)', 'dstOffset++', 'dst');
            //? SET('0x80 | (cc & 0x3F)', 'dstOffset++', 'dst');
        } else if (cc < 0xD800 || cc >= 0xE000) {
            n += 3;
            //? SET('0xE0 | (cc >> 12)', 'dstOffset++', 'dst');
            //? SET('0x80 | ((cc >> 6) & 0x3F)', 'dstOffset++', 'dst');
            //? SET('0x80 | (cc & 0x3F)', 'dstOffset++', 'dst');
        } else { // surrogate
            if (count === 0)
                throw Error("truncated utf8 surrogate");
            cc = 0x10000 + (((cc & 0x3FF) << 10) | (src.charCodeAt(srcOffset++) & 0x3FF));
            --count;
            n += 4;
            //? SET('0xF0 | (cc >> 18)', 'dstOffset++', 'dst');
            //? SET('0x80 | ((cc >> 12) & 0x3F)', 'dstOffset++', 'dst');
            //? SET('0x80 | ((cc >> 6) & 0x3F)', 'dstOffset++', 'dst');
            //? SET('0x80 | (cc & 0x3F)', 'dstOffset++', 'dst');
        }
    } while (count > 0);
    return n;
}

/**
 * Decodes UTF8 bytes to a standard JavaScript string.
 * @param {!ByteBuffer} src Source ByteBuffer
 * @param {number} srcOffset Source offset
 * @param {number} count Number of bytes to decode
 * @returns {string} Decoded string
 * @inner
 */
function utf8_decode(src, srcOffset, count) {
    if (count === 0)
        return "";
    var parts = [], // readily assembled parts
        batch = []; // char codes for batch processing
    //? // GET(varOffset, varTarget) with varTarget referencing a ByteBuffer
    while (count--) {
        var c = /*? GET('srcOffset++', 'src') */,
            c2, c3;
        switch (c >> 4) {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                batch.push(c);
                break;
            case 12: case 13:
                if (count < 1)
                    throw Error("truncated utf8 sequence");
                c2 = /*? GET('srcOffset++', 'src') */;
                --count;
                batch.push(((c & 0x1F) << 6) | (c2 & 0x3F));
                break;
            case 14:
                if (count < 2)
                    throw Error("truncated utf8 sequence");
                c2 = /*? GET('srcOffset++', 'src') */;
                c3 = /*? GET('srcOffset++', 'src') */;
                count -= 2;
                batch.push(((c & 0x0F) << 12) | ((c2 & 0x3F) << 6) | ((c3 & 0x3F) << 0));
                break;
        }
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
 * Calculates the number of UTF8 bytes required to store a standard JavaScript string.
 * @param {string} src Source string
 * @param {number} srcOffset Source offset
 * @param {number} count Number of char codes to calculate
 * @returns {number} Number of bytes required
 * @inner
 */
function utf8_calculate(src, srcOffset, count) {
    if (count === 0)
        return 0;
    var n = 0;
    do {
        var cc = src.charCodeAt(srcOffset++);
        --count;
        if (cc < 0x80) {
            n += 1;
        } else if (cc < 0x800) {
            n += 2;
        } else if (cc < 0xD800 || cc >= 0xE000) {
            n += 3;
        } else {
            n += 4;
        }
    } while (count > 0);
    return n;
}

ByteBuffer.registerEncoding("utf8", utf8_encode, utf8_decode, utf8_calculate);
