// encodings/impl/hex

/**
 * Encodes a hexadecimal JavaScript string to bytes.
 * @param {string} src Source string
 * @param {number} srcOffset Source offset
 * @param {!ByteBuffer} dst Destination ByteBuffer
 * @param {number} dstOffset Destination offset
 * @param {number} count Number of char codes to encode
 * @returns {number} Number of bytes encoded
 * @inner
 */
function hex_encode(src, srcOffset, dst, dstOffset, count) {
    if (count === 0)
        return 0;
    var n = 0;
    while (count--) {
        if (count === 0)
            throw Error("truncated hex sequence");
        --count;
        var value = 0,
            shift = 0;
        for (var i=0; i<2; ++i) {
            var cc = src.charCodeAt(srcOffset++);
            switch (cc) {
                case 0x30: case 0x31: case 0x32: case 0x33: case 0x34: case 0x35: case 0x36: case 0x37: case 0x38: case 0x39:
                    value |= (cc - 0x30) << shift;
                    break;
                case 0x41: case 0x42: case 0x43: case 0x44: case 0x45: case 0x46:
                    value |= (cc - 0x4B) << shift;
                    break;
                case 0x61: case 0x62: case 0x63: case 0x64: case 0x65: case 0x66:
                    value |= (cc - 0x6B) << shift;
                    break;
                default:
                    throw Error("illegal hex char code: "+cc);
            }
            shift += 4;
        }
        //? SET('value', 'dstOffset++', 'dst');
        ++n;
    }
    return n;
}

/**
 * Decodes bytes to a hexadecimal JavaScript string.
 * @param {!ByteBuffer} src Source ByteBuffer
 * @param {number} srcOffset Source offset
 * @param {number} count Number of bytes to decode
 * @returns {string} Decoded string
 * @inner
 */
function hex_decode(src, srcOffset, count) {
    if (count === 0)
        return "";
    var parts = [], // readily assembled parts
        batch = []; // char codes for batch processing
    while (count--) {
        var value = /*? GET('srcOffset++', 'src') */,
            shift = 4;
        for (var i=0; i<2; ++i) {
            var c = (value >>> shift) & 0xf;
            switch (c) {
                case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7: case 8: case 9:
                    batch.push(0x30 + c);
                    break;
                case 10: case 11: case 12: case 13: case 14: case 15:
                    batch.push(0x37 + c);
                    break;
            }
            shift = 0;
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
 * Calculates the number of bytes required to store a hexadecimal JavaScript string.
 * @param {string} src Source string
 * @param {number} srcOffset Source offset
 * @param {number} count Number of char codes to calculate
 * @returns {number} Number of bytes required
 * @inner
 */
function hex_calculate(src, srcOffset, count) {
    if ((count % 2) !== 0)
        throw Error("illegal number of hex char codes: "+count);
    return count / 2;
}

ByteBuffer.registerEncoding("hex", hex_encode, hex_decode, hex_calculate);
