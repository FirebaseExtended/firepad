/**
 * Gets the backing buffer type.
 * @returns {Function} `Buffer` under node.js, `ArrayBuffer` in the browser (classes)
 * @expose
 */
ByteBuffer.type = function() {
    //? if (NODE)
    return Buffer;
    //? else
    return ArrayBuffer;
};
