/**
 * Converts the ByteBuffer's contents to a string.
 * @param {string=} encoding Output encoding. Returns an informative string representation if omitted but also allows
 *  direct conversion to "utf8", "hex", "base64" and "binary" encoding. "debug" returns a hex representation with
 *  highlighted offsets.
 * @param {number=} begin Offset to begin at, defaults to {@link ByteBuffer#offset}
 * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
 * @returns {string} String representation
 * @throws {Error} If `encoding` is invalid
 * @expose
 */
ByteBufferPrototype.toString = function(encoding, begin, end) {
    if (typeof encoding === 'undefined')
        return "ByteBuffer/*?= NODE ? 'NB' : 'AB'+(DATAVIEW ? '_DataView' : '') */(offset="+this.offset+",markedOffset="+this.markedOffset+",limit="+this.limit+",capacity="+this.capacity()+")";
    if (typeof encoding === 'number')
        encoding = "utf8",
        begin = encoding,
        end = begin;
    switch (encoding) {
        //? if (ENCODINGS) {
        //? if (UTF8) {
        case "utf8":
            return this.toUTF8(begin, end);
        //? } if (BASE64) {
        case "base64":
            return this.toBase64(begin, end);
        //? } if (HEX) {
        case "hex":
            return this.toHex(begin, end);
        //? } if (BINARY) {
        case "binary":
            return this.toBinary(begin, end);
        //? } if (DEBUG) {
        case "debug":
            return this.toDebug();
        case "columns":
            return this.toColumns();
        //? }
        //? } // ENCODINGS
        default:
            throw Error("Unsupported encoding: "+encoding);
    }
};
