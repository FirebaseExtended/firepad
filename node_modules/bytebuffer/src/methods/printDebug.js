//? if (DEBUG) {
/**
 * Prints debug information about this ByteBuffer's contents.
 * @param {function(string)=} out Output function to call, defaults to console.log
 * @expose
 */
ByteBufferPrototype.printDebug = function(out) {
    if (typeof out !== 'function') out = console.log.bind(console);
    out(
        this.toString()+"\n"+
        "-------------------------------------------------------------------\n"+
        this.toDebug(/* columns */ true)
    );
};

//? }
