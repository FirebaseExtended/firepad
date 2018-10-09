// helpers
//? if (NODE) {

/**
 * @type {!Buffer}
 * @inner
 */
var EMPTY_BUFFER = new Buffer(0);
//? } else {

/**
 * @type {!ArrayBuffer}
 * @inner
 */
var EMPTY_BUFFER = new ArrayBuffer(0);
//? }
//? if (!INLINE) {

/**
 * Asserts that a value is an integer and returns the type-safe value.
 * @param {number} value Value to assert
 * @param {boolean=} unsigned Whether explicitly unsigned
 * @returns {number} Type-safe value
 * @throws {TypeError} If `value` is not an integer
 * @inner
 */
function assertInteger(value, unsigned) {
    if (typeof value !== 'number' || value % 1 !== 0)
        throw TypeError("Illegal value: "+offset+" (not an integer)");
    return unsigned ? value >>> 0 : value | 0;
}

/**
 * Asserts that a value is an integer or Long.
 * @param {number|!Long} value Value to assert
 * @param {boolean=} unsigned Whether explicitly unsigned
 * @returns {number|!Long} Type-safe value
 * @throws {TypeError} If `value` is not an integer or Long
 * @inner
 */
function assertLong(value, unsigned) {
    if (typeof value === 'number') {
        return Long.fromNumber(value, unsigned);
    } else if (typeof value === 'string') {
        return Long.fromString(value, unsigned);
    } else if (value && value instanceof Long) {
        if (typeof unsigned !== 'undefined') {
            if (unsigned && !value.unsigned) return value.toUnsigned();
            if (!unsigned && value.unsigned) return value.toSigned();
        }
        return value;
    } else
        throw TypeError("Illegal value: "+value+" (not an integer or Long)");
}

/**
 * Asserts that `min <= offset <= cap-size` and returns the type-safe offset.
 * @param {number} offset Offset to assert
 * @param {number} min Minimum offset
 * @param {number} cap Cap offset
 * @param {number} size Required size in bytes
 * @returns {number} Type-safe offset
 * @throws {TypeError} If `offset` is not an integer
 * @throws {RangeError} If `offset < min || offset > cap-size`
 * @inner
 */
function assertOffset(offset, min, cap, size) {
    if (typeof offset !== 'number' || offset % 1 !== 0)
        throw TypeError("Illegal offset: "+offset+" (not an integer)");
    offset = offset | 0;
    if (offset < min || offset > cap-size)
        throw RangeError("Illegal offset: "+min+" <= "+value+" <= "+cap+"-"+size);
    return offset;
}

/**
 * assertRange return value.
 * @type {Array.<number>}
 */
var rangeVal = new Array(2);

/**
 * Asserts that `min <= begin <= end <= cap`. Updates `rangeVal` with the type-safe range.
 * @param {number} begin Begin offset
 * @param {number} end End offset
 * @param {number} min Minimum offset
 * @param {number} cap Cap offset
 * @throws {TypeError} If `begin` or `end` is not an integer
 * @throws {RangeError} If `begin < min || begin > end || end > cap`
 * @inner
 */
function assertRange(begin, end, min, cap) {
    if (typeof begin !== 'number' || begin % 1 !== 0)
        throw TypeError("Illegal begin: "+begin+" (not a number)");
    begin = begin | 0;
    if (typeof end !== 'number' || end % 1 !== 0)
        throw TypeError("Illegal end: "+range[1]+" (not a number)");
    end = end | 0;
    if (begin < min || begin > end || end > cap)
        throw RangeError("Illegal range: "+min+" <= "+begin+" <= "+end+" <= "+cap);
    rangeVal[0] = begin; rangeVal[1] = end;
}
//? }
//? if (BASE64 || UTF8) {

/**
 * String.fromCharCode reference for compile-time renaming.
 * @type {function(...number):string}
 * @inner
 */
var stringFromCharCode = String.fromCharCode;

/**
 * Creates a source function for a string.
 * @param {string} s String to read from
 * @returns {function():number|null} Source function returning the next char code respectively `null` if there are
 *  no more characters left.
 * @throws {TypeError} If the argument is invalid
 * @inner
 */
function stringSource(s) {
    var i=0; return function() {
        return i < s.length ? s.charCodeAt(i++) : null;
    };
}

/**
 * Creates a destination function for a string.
 * @returns {function(number=):undefined|string} Destination function successively called with the next char code.
 *  Returns the final string when called without arguments.
 * @inner
 */
function stringDestination() {
    var cs = [], ps = []; return function() {
        if (arguments.length === 0)
            return ps.join('')+stringFromCharCode.apply(String, cs);
        if (cs.length + arguments.length > 1024)
            ps.push(stringFromCharCode.apply(String, cs)),
                cs.length = 0;
        Array.prototype.push.apply(cs, arguments);
    };
}
//? }
