/**
 * Tests if the specified type is a ByteBuffer.
 * @param {*} bb ByteBuffer to test
 * @returns {boolean} `true` if it is a ByteBuffer, otherwise `false`
 * @expose
 */
ByteBuffer.isByteBuffer = function(bb) {
    return (bb && bb["__isByteBuffer__"]) === true;
};
