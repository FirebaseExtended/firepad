// a simple benchmark utility comparing performance between the different builds.

// Uint8Array observations (compared to node Buffers)
// - seems to be pretty much equal for byte ops

// DataView observations (compared to Uint8Array):
// - allocation is about 2 times slower
// - writing is about 5 times (int32) to 10 times (varint) slower
// - reading is about 3 times slower

// UTF8 encoding observations (compared to node's string/buffer API)
// - the longer the string, the poorer is read/write performance
// - either utfx doesn't cut it yet, or node's bindings simply outperform everything js here

var ByteBuffer = require("../index.js"),
    prettyHrTime = require("pretty-hrtime");

var impls = [
    { name: "ByteBufferNB", impl: ByteBuffer.ByteBufferNB },
    { name: "ByteBufferAB", impl: ByteBuffer.ByteBufferAB },
    { name: "ByteBufferAB_DataView", impl: ByteBuffer.ByteBufferAB_DataView }
];

var bench = {};

bench["allocate"] = function(ByteBuffer, n) {
    n = n || 10000;
    for (var i=0; i<n; ++i)
        new ByteBuffer();
    return n;
};

bench["writeInt32"] = function(ByteBuffer, n) {
    n = n || 1000000;
    var bb = new ByteBuffer(4);
    for (var i=0; i<n; ++i)
        bb.writeInt32(0x7fffffff, 0);
    return n;
};

bench["readInt32"] = function(ByteBuffer, n) {
    n = n || 1000000;
    var bb = new ByteBuffer(4).writeInt32(0x7fffffff).flip();
    for (var i=0; i<n; ++i)
        bb.readInt32(0);
    return n;
};

bench["writeVarint32"] = function(ByteBuffer, n) {
    n = n || 1000000;
    var bb = new ByteBuffer(6);
    for (var i=0; i<n; ++i)
        bb.writeVarint32(0x7fffffff, 0);
    return n;
};

bench["readVarint32"] = function(ByteBuffer, n) {
    n = n || 1000000;
    var bb = new ByteBuffer(6).writeInt32(0x7fffffff).flip();
    for (var i=0; i<n; ++i)
        bb.readVarint32(0);
    return n;
};

bench["writeString"] = function(ByteBuffer, n) {
    n = n || 100000;
    var bb = new ByteBuffer(26);
    for (var i=0; i<n; ++i)
        bb.writeString("abcdefghijklmnopqrstuvwxyz", 0);
    return n;
};

bench["readString"] = function(ByteBuffer, n) {
    n = n || 100000;
    var bb = new ByteBuffer(26).writeString("abcdefghijklmnopqrstuvwxyz").flip();
    for (var i=0; i<n; ++i)
        bb.readString(26, ByteBuffer.METRICS_BYTES, 0);
    return n;
};

bench["calculateString"] = function(ByteBuffer, n) {
    n = n || 100000;
    for (var i=0; i<n; ++i)
        ByteBuffer.calculateString("abcdefghijklmnopqrstuvwxyz");
    return n;
};

Object.keys(bench).forEach(function(key) {
    var func = bench[key];
    console.log(key);
    impls.forEach(function(impl) {
        var n, diff;
        var start = process.hrtime();
        n = func(impl.impl);
        diff = process.hrtime(start);
        console.log("- "+impl.name+": "+prettyHrTime(diff));
    });
    console.log();
});
