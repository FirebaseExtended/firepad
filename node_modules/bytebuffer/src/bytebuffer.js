//? include("macros.js");
/**
 * Constructs a new ByteBuffer.
 * @class The swiss army knife for binary data in JavaScript.
 * @exports ByteBuffer
 * @constructor
 * @param {number=} capacity Initial capacity. Defaults to {@link ByteBuffer.DEFAULT_CAPACITY}.
 * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
 *  {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
 *  {@link ByteBuffer.DEFAULT_NOASSERT}.
 * @expose
 */
var ByteBuffer = function(capacity, littleEndian, noAssert) {
    if (typeof capacity === 'undefined')
        capacity = ByteBuffer.DEFAULT_CAPACITY;
    if (typeof littleEndian === 'undefined')
        littleEndian = ByteBuffer.DEFAULT_ENDIAN;
    if (typeof noAssert === 'undefined')
        noAssert = ByteBuffer.DEFAULT_NOASSERT;
    if (!noAssert) {
        capacity = capacity | 0;
        if (capacity < 0)
            throw RangeError("Illegal capacity");
        littleEndian = !!littleEndian;
        noAssert = !!noAssert;
    }
    //? if (NODE) {
    
    /**
     * Backing node Buffer.
     * @type {!Buffer}
     * @expose
     */
    this.buffer = capacity === 0 ? EMPTY_BUFFER : new Buffer(capacity);
    //? } else {
    
    /**
     * Backing ArrayBuffer.
     * @type {!ArrayBuffer}
     * @expose
     */
    this.buffer = capacity === 0 ? EMPTY_BUFFER : new ArrayBuffer(capacity);

    //? if (DATAVIEW) {
    /**
     * DataView utilized to manipulate the backing buffer. Becomes `null` if the backing buffer has a capacity of `0`.
     * @type {?DataView}
     * @expose
     */
    this.view = capacity === 0 ? null : new DataView(this.buffer);
    //? } else {
    /**
     * Uint8Array utilized to manipulate the backing buffer. Becomes `null` if the backing buffer has a capacity of `0`.
     * @type {?Uint8Array}
     * @expose
     */
    this.view = capacity === 0 ? null : new Uint8Array(this.buffer);
    //? }
    //? }
    
    /**
     * Absolute read/write offset.
     * @type {number}
     * @expose
     * @see ByteBuffer#flip
     * @see ByteBuffer#clear
     */
    this.offset = 0;

    /**
     * Marked offset.
     * @type {number}
     * @expose
     * @see ByteBuffer#mark
     * @see ByteBuffer#reset
     */
    this.markedOffset = -1;

    /**
     * Absolute limit of the contained data. Set to the backing buffer's capacity upon allocation.
     * @type {number}
     * @expose
     * @see ByteBuffer#flip
     * @see ByteBuffer#clear
     */
    this.limit = capacity;

    /**
     * Whether to use little endian byte order, defaults to `false` for big endian.
     * @type {boolean}
     * @expose
     */
    this.littleEndian = littleEndian;

    /**
     * Whether to skip assertions of offsets and values, defaults to `false`.
     * @type {boolean}
     * @expose
     */
    this.noAssert = noAssert;
};

/**
 * ByteBuffer version.
 * @type {string}
 * @const
 * @expose
 */
ByteBuffer.VERSION = "/*?= VERSION */";

/**
 * Little endian constant that can be used instead of its boolean value. Evaluates to `true`.
 * @type {boolean}
 * @const
 * @expose
 */
ByteBuffer.LITTLE_ENDIAN = true;

/**
 * Big endian constant that can be used instead of its boolean value. Evaluates to `false`.
 * @type {boolean}
 * @const
 * @expose
 */
ByteBuffer.BIG_ENDIAN = false;

/**
 * Default initial capacity of `16`.
 * @type {number}
 * @expose
 */
ByteBuffer.DEFAULT_CAPACITY = 16;

/**
 * Default endianess of `false` for big endian.
 * @type {boolean}
 * @expose
 */
ByteBuffer.DEFAULT_ENDIAN = ByteBuffer.BIG_ENDIAN;

/**
 * Default no assertions flag of `false`.
 * @type {boolean}
 * @expose
 */
ByteBuffer.DEFAULT_NOASSERT = false;
//? if (NODE) {

/**
 * A `Long` class for representing a 64-bit two's-complement integer value.
 * @type {!Long}
 * @const
 * @see https://npmjs.org/package/long
 * @expose
 */
ByteBuffer.Long = Long;
//? } else {

/**
 * A `Long` class for representing a 64-bit two's-complement integer value. May be `null` if Long.js has not been loaded
 *  and int64 support is not available.
 * @type {?Long}
 * @const
 * @see https://github.com/dcodeIO/long.js
 * @expose
 */
ByteBuffer.Long = Long || null;
//? }

/**
 * @alias ByteBuffer.prototype
 * @inner
 */
var ByteBufferPrototype = ByteBuffer.prototype;

/**
 * An indicator used to reliably determine if an object is a ByteBuffer or not.
 * @type {boolean}
 * @const
 * @expose
 * @private
 */
ByteBufferPrototype.__isByteBuffer__;

Object.defineProperty(ByteBufferPrototype, "__isByteBuffer__", {
    value: true,
    enumerable: false,
    configurable: false
});

//? include("helpers.js");

//? include("methods/static/*.js");
//? if (BYTES) {

//? include("types/bytes/*.js");
//? }
//? if (INTS) {

//? include("types/ints/*.js");
//? }
//? if (FLOATS) {

//? include("types/floats/float*.js");
//? }
//? if (VARINTS) {

//? include("types/varints/*.js");
//? }
//? if (UTF8 && STRINGS) {

//? include("types/strings/*.js");
//? }

//? include("methods/*.js");
//? if (ENCODINGS) {

//? include("encodings/*.js");
//? }