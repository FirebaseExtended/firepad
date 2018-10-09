//? if (UTF8STRING && UTF8) {
// types/strings/utf8string

/**
 * Metrics representing number of UTF8 characters. Evaluates to `c`.
 * @type {string}
 * @const
 * @expose
 */
ByteBuffer.METRICS_CHARS = 'c';

/**
 * Metrics representing number of bytes. Evaluates to `b`.
 * @type {string}
 * @const
 * @expose
 */
ByteBuffer.METRICS_BYTES = 'b';

/**
 * Writes an UTF8 encoded string.
 * @param {string} str String to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} if omitted.
 * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
 * @expose
 */
ByteBufferPrototype.writeUTF8String = function(str, offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_OFFSET();
    }
    var k;
    //? if (NODE) {
    k = Buffer.byteLength(str, "utf8");
    //? ENSURE_CAPACITY('k');
    offset += this.buffer.write(str, offset, k, "utf8");
    if (relative) {
        this.offset = offset;
        return this;
    }
    return k;
    //? } else {
    var start = offset;
    k = utfx.calculateUTF16asUTF8(stringSource(str))[1];
    //? ENSURE_CAPACITY('k');
    utfx.encodeUTF16toUTF8(stringSource(str), function(b) {
        //? if (DATAVIEW)
        this.view.setUint8(offset++, b);
        //? else
        this.view[offset++] = b;
    }.bind(this));
    if (relative) {
        this.offset = offset;
        return this;
    }
    return offset - start;
    //? }
};
//? if (ALIASES) {

/**
 * Writes an UTF8 encoded string. This is an alias of {@link ByteBuffer#writeUTF8String}.
 * @function
 * @param {string} str String to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} if omitted.
 * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
 * @expose
 */
ByteBufferPrototype.writeString = ByteBufferPrototype.writeUTF8String;
//? }

/**
 * Calculates the number of UTF8 characters of a string. JavaScript itself uses UTF-16, so that a string's
 *  `length` property does not reflect its actual UTF8 size if it contains code points larger than 0xFFFF.
 * @param {string} str String to calculate
 * @returns {number} Number of UTF8 characters
 * @expose
 */
ByteBuffer.calculateUTF8Chars = function(str) {
    return utfx.calculateUTF16asUTF8(stringSource(str))[0];
};

/**
 * Calculates the number of UTF8 bytes of a string.
 * @param {string} str String to calculate
 * @returns {number} Number of UTF8 bytes
 * @expose
 */
ByteBuffer.calculateUTF8Bytes = function(str) {
    //? if (NODE) {
    if (typeof str !== 'string')
        throw TypeError("Illegal argument: "+(typeof str));
    return Buffer.byteLength(str, "utf8");
    //? } else
    return utfx.calculateUTF16asUTF8(stringSource(str))[1];
};
//? if (ALIASES) {

/**
 * Calculates the number of UTF8 bytes of a string. This is an alias of {@link ByteBuffer.calculateUTF8Bytes}.
 * @function
 * @param {string} str String to calculate
 * @returns {number} Number of UTF8 bytes
 * @expose
 */
ByteBuffer.calculateString = ByteBuffer.calculateUTF8Bytes;
//? }

/**
 * Reads an UTF8 encoded string.
 * @param {number} length Number of characters or bytes to read.
 * @param {string=} metrics Metrics specifying what `length` is meant to count. Defaults to
 *  {@link ByteBuffer.METRICS_CHARS}.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  read if omitted.
 * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
 *  read and the actual number of bytes read.
 * @expose
 */
ByteBufferPrototype.readUTF8String = function(length, metrics, offset) {
    if (typeof metrics === 'number') {
        offset = metrics;
        metrics = undefined;
    }
    //? RELATIVE();
    if (typeof metrics === 'undefined') metrics = ByteBuffer.METRICS_CHARS;
    if (!this.noAssert) {
        //? ASSERT_INTEGER('length');
        //? ASSERT_OFFSET();
    }
    var i = 0,
        start = offset,
        //? if (NODE)
        temp,
        sd;
    if (metrics === ByteBuffer.METRICS_CHARS) { // The same for node and the browser
        sd = stringDestination();
        utfx.decodeUTF8(function() {
            //? if (NODE)
            return i < length && offset < this.limit ? this.buffer[offset++] : null;
            //? else if (DATAVIEW)
            return i < length && offset < this.limit ? this.view.getUint8(offset++) : null;
            //? else
            return i < length && offset < this.limit ? this.view[offset++] : null;
        }.bind(this), function(cp) {
            ++i; utfx.UTF8toUTF16(cp, sd);
        });
        if (i !== length)
            throw RangeError("Illegal range: Truncated data, "+i+" == "+length);
        if (relative) {
            this.offset = offset;
            return sd();
        } else {
            return {
                "string": sd(),
                "length": offset - start
            };
        }
    } else if (metrics === ByteBuffer.METRICS_BYTES) {
        if (!this.noAssert) {
            //? ASSERT_OFFSET('length');
        }
        //? if (NODE) {
        temp = this.buffer.toString("utf8", offset, offset+length);
        if (relative) {
            this.offset += length;
            return temp;
        } else {
            return {
                'string': temp,
                'length': length
            };
        }
        //? } else {
        var k = offset + length;
        utfx.decodeUTF8toUTF16(function() {
            //? if (DATAVIEW)
            return offset < k ? this.view.getUint8(offset++) : null;
            //? else
            return offset < k ? this.view[offset++] : null;
        }.bind(this), sd = stringDestination(), this.noAssert);
        if (offset !== k)
            throw RangeError("Illegal range: Truncated data, "+offset+" == "+k);
        if (relative) {
            this.offset = offset;
            return sd();
        } else {
            return {
                'string': sd(),
                'length': offset - start
            };
        }
        //? }
    } else
        throw TypeError("Unsupported metrics: "+metrics);
};
//? if (ALIASES) {

/**
 * Reads an UTF8 encoded string. This is an alias of {@link ByteBuffer#readUTF8String}.
 * @function
 * @param {number} length Number of characters or bytes to read
 * @param {number=} metrics Metrics specifying what `n` is meant to count. Defaults to
 *  {@link ByteBuffer.METRICS_CHARS}.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  read if omitted.
 * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
 *  read and the actual number of bytes read.
 * @expose
 */
ByteBufferPrototype.readString = ByteBufferPrototype.readUTF8String;
//? }

//? }