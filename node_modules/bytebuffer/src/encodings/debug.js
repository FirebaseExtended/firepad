//? if (DEBUG) {
// encodings/debug

/**
 * Encodes this ByteBuffer to a hex encoded string with marked offsets. Offset symbols are:
 * * `<` : offset,
 * * `'` : markedOffset,
 * * `>` : limit,
 * * `|` : offset and limit,
 * * `[` : offset and markedOffset,
 * * `]` : markedOffset and limit,
 * * `!` : offset, markedOffset and limit
 * @param {boolean=} columns If `true` returns two columns hex + ascii, defaults to `false`
 * @returns {string|!Array.<string>} Debug string or array of lines if `asArray = true`
 * @expose
 * @example `>00'01 02<03` contains four bytes with `limit=0, markedOffset=1, offset=3`
 * @example `00[01 02 03>` contains four bytes with `offset=markedOffset=1, limit=4`
 * @example `00|01 02 03` contains four bytes with `offset=limit=1, markedOffset=-1`
 * @example `|` contains zero bytes with `offset=limit=0, markedOffset=-1`
 */
ByteBufferPrototype.toDebug = function(columns) {
    var i = -1,
        //? if (NODE)
        k = this.buffer.length,
        //? else
        k = this.buffer.byteLength,
        b,
        hex = "",
        asc = "",
        out = "";
    while (i<k) {
        if (i !== -1) {
            //? if (NODE)
            b = this.buffer[i];
            //? else if (DATAVIEW)
            b = this.view.getUint8(i);
            //? else
            b = this.view[i];
            if (b < 0x10) hex += "0"+b.toString(16).toUpperCase();
            else hex += b.toString(16).toUpperCase();
            if (columns)
                asc += b > 32 && b < 127 ? String.fromCharCode(b) : '.';
        }
        ++i;
        if (columns) {
            if (i > 0 && i % 16 === 0 && i !== k) {
                while (hex.length < 3*16+3) hex += " ";
                out += hex+asc+"\n";
                hex = asc = "";
            }
        }
        if (i === this.offset && i === this.limit)
            hex += i === this.markedOffset ? "!" : "|";
        else if (i === this.offset)
            hex += i === this.markedOffset ? "[" : "<";
        else if (i === this.limit)
            hex += i === this.markedOffset ? "]" : ">";
        else
            hex += i === this.markedOffset ? "'" : (columns || (i !== 0 && i !== k) ? " " : "");
    }
    if (columns && hex !== " ") {
        while (hex.length < 3*16+3)
            hex += " ";
        out += hex + asc + "\n";
    }
    return columns ? out : hex;
};

/**
 * Decodes a hex encoded string with marked offsets to a ByteBuffer.
 * @param {string} str Debug string to decode (not be generated with `columns = true`)
 * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
 *  {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
 *  {@link ByteBuffer.DEFAULT_NOASSERT}.
 * @returns {!ByteBuffer} ByteBuffer
 * @expose
 * @see ByteBuffer#toDebug
 */
ByteBuffer.fromDebug = function(str, littleEndian, noAssert) {
    /*?
    // "<60 61 62 63>"; // 13 = 4
    // "60<61 62]63"    // 11 = 4
    // "<61 61 61>";    // 10 = 3    =>   C = ((L+1)/3) | 0
    // "61<61>61";      // 8 = 3
    // "<61 61>";       // 7 = 2
    */
    var k = str.length,
        bb = new ByteBuffer(((k+1)/3)|0, littleEndian, noAssert);
    var i = 0, j = 0, ch, b,
        rs = false, // Require symbol next
        ho = false, hm = false, hl = false, // Already has offset (ho), markedOffset (hm), limit (hl)?
        fail = false;
    while (i<k) {
        switch (ch = str.charAt(i++)) {
            case '!':
                if (!noAssert) {
                    if (ho || hm || hl) {
                        fail = true;
                        break;
                    }
                    ho = hm = hl = true;
                }
                bb.offset = bb.markedOffset = bb.limit = j;
                rs = false;
                break;
            case '|':
                if (!noAssert) {
                    if (ho || hl) {
                        fail = true;
                        break;
                    }
                    ho = hl = true;
                }
                bb.offset = bb.limit = j;
                rs = false;
                break;
            case '[':
                if (!noAssert) {
                    if (ho || hm) {
                        fail = true;
                        break;
                    }
                    ho = hm = true;
                }
                bb.offset = bb.markedOffset = j;
                rs = false;
                break;
            case '<':
                if (!noAssert) {
                    if (ho) {
                        fail = true;
                        break;
                    }
                    ho = true;
                }
                bb.offset = j;
                rs = false;
                break;
            case ']':
                if (!noAssert) {
                    if (hl || hm) {
                        fail = true;
                        break;
                    }
                    hl = hm = true;
                }
                bb.limit = bb.markedOffset = j;
                rs = false;
                break;
            case '>':
                if (!noAssert) {
                    if (hl) {
                        fail = true;
                        break;
                    }
                    hl = true;
                }
                bb.limit = j;
                rs = false;
                break;
            case "'":
                if (!noAssert) {
                    if (hm) {
                        fail = true;
                        break;
                    }
                    hm = true;
                }
                bb.markedOffset = j;
                rs = false;
                break;
            case ' ':
                rs = false;
                break;
            default:
                if (!noAssert) {
                    if (rs) {
                        fail = true;
                        break;
                    }
                }
                b = parseInt(ch+str.charAt(i++), 16);
                if (!noAssert) {
                    if (isNaN(b) || b < 0 || b > 255)
                        throw TypeError("Illegal str: Not a debug encoded string");
                }
                //? if (NODE)
                bb.buffer[j++] = b;
                //? else if (DATAVIEW)
                bb.view.setUint8(j++, b);
                //? else
                bb.view[j++] = b;
                rs = true;
        }
        if (fail)
            throw TypeError("Illegal str: Invalid symbol at "+i);
    }
    if (!noAssert) {
        if (!ho || !hl)
            throw TypeError("Illegal str: Missing offset or limit");
        //? if (NODE)
        if (j<bb.buffer.length)
        //? else
        if (j<bb.buffer.byteLength)
            throw TypeError("Illegal str: Not a debug encoded string (is it hex?) "+j+" < "+k);
    }
    return bb;
};

//? }