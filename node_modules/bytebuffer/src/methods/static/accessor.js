/**
 * Gets the accessor type.
 * @returns {Function} `Buffer` under node.js, `Uint8Array` respectively `DataView` in the browser (classes)
 * @expose
 */
ByteBuffer.accessor = function() {
    //? if (NODE)
    return Buffer;
    //? else if (DATAVIEW)
    return DataView;
    //? else
    return Uint8Array;
};
