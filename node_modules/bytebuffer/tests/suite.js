/*
 Copyright 2013 Daniel Wirtz <dcode@dcode.io>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

var ByteBuffer = require("../dist/bytebuffer-node.js");
var ByteBufferNode = ByteBuffer;
var ByteBufferBrowser = require("../dist/bytebuffer.min.js");
var ByteBufferBrowser_DataView = require("../dist/bytebuffer-dataview.min.js");
var pkg = require("../package.json");

/**
 * Constructs a new Sandbox for module loaders and shim testing.
 * @param {Object.<string,*>} properties Additional properties to set
 * @constructor
 */
var Sandbox = function(properties) {
    this.Int8Array = function() {};
    this.Uint8Array = function() {};
    this.Int16Array = function() {};
    this.Uint16Array = function() {};
    this.Int32Array = function() {};
    this.Uint32Array = function() {};
    this.Float32Array = function() {};
    this.Float64Array = function() {};
    this.DataView = function() {};
    for (var i in properties) {
        this[i] = properties[i];
    }
    this.console = {
        log: function(s) {
            console.log(s);
        }
    };
};

function makeSuite(ByteBuffer) {
    var type = ByteBuffer.type(), // Buffer or ArrayBuffer
        accessor = ByteBuffer.accessor(),
        Long = ByteBuffer.Long;
    var suite = {};
    
    suite.init = function(test) {
        test.ok(require("../index.js"));
        if (ByteBuffer == ByteBufferNode)
            test.log("\n\n                           --- ByteBufferNB ---\n".bold.white),
            test.log("[optional] node-memcpy is "+(ByteBuffer.memcpy ? "present" : "not present"));
        else if (ByteBuffer == ByteBufferBrowser)
            test.log("\n\n                           --- ByteBufferAB ---\n".bold.white);
        else if (ByteBuffer == ByteBufferBrowser_DataView)
            test.log("\n\n                      --- ByteBufferAB_DataView ---\n".bold.white);
        test.ok(type === Buffer || type === ArrayBuffer);
        test.ok(typeof ByteBuffer == "function");
        test.strictEqual(pkg.version, ByteBuffer.VERSION);
        test.done();
    };
    
    suite.base = {};
    
    suite.base.allocate = function(test) {
        var bb = new ByteBuffer();
        test.ok(bb.buffer instanceof type);
        test.equal(bb.offset, 0);
        test.equal(bb.limit, ByteBuffer.DEFAULT_CAPACITY);
        test.equal(bb.littleEndian, ByteBuffer.DEFAULT_ENDIAN);
        test.equal(bb.noAssert, ByteBuffer.DEFAULT_NOASSERT);
        if (type === Buffer)
            test.equal(bb.buffer.length, bb.capacity());
        else
            test.equal(bb.buffer.byteLength, bb.capacity());
        test.equal(bb.capacity(), ByteBuffer.DEFAULT_CAPACITY);
        bb = ByteBuffer.allocate(undefined, !ByteBuffer.DEFAULT_ENDIAN, !ByteBuffer.DEFAULT_NOASSERT);
        test.equal(bb.capacity(), ByteBuffer.DEFAULT_CAPACITY);
        test.equal(bb.littleEndian, !ByteBuffer.DEFAULT_ENDIAN);
        test.equal(bb.noAssert, !ByteBuffer.DEFAULT_NOASSERT);

        // __isByteBuffer__
        test.strictEqual(bb.__isByteBuffer__, true);
        bb.__isByteBuffer__ = false;
        test.strictEqual(bb.__isByteBuffer__, true);
        test.equal(ByteBuffer.isByteBuffer(bb), true);

        // Fixed set of properties
        for (var i in bb)
            if (bb.hasOwnProperty(i) && ["offset", "markedOffset", "limit", "littleEndian", "noAssert", "buffer", "view"].indexOf(i) < 0)
                test.fail("Illegal enumerable property: "+i);

        test.done();
    };

    suite.base.clone = function(test) {
        var bb = new ByteBuffer(1, true, false);
        var bb2 = bb.clone();
        test.strictEqual(bb.buffer, bb2.buffer);
        test.equal(bb.offset, bb2.offset);
        test.equal(bb.limit, bb2.limit);
        test.equal(bb.markedOffset, bb2.markedOffset);
        test.equal(bb.littleEndian, bb2.littleEndian);
        test.equal(bb.noAssert, bb2.noAssert);
        test.notStrictEqual(bb, bb2);
        test.done();
    };
    
    suite.base.assert = function(test) {
        var bb = new ByteBuffer();
        test.strictEqual(bb.noAssert, false);
        test.strictEqual(bb.assert(false), bb);
        test.strictEqual(bb.noAssert, true);
        test.strictEqual(bb.assert(true), bb);
        test.strictEqual(bb.noAssert, false);
        test.done();
    };
    
    suite.wrap = {};
    
    if (type === Buffer) {
        suite.wrap.Buffer = function(test) {
            var buf = new Buffer(1);
            buf[0] = 0x01;
            var bb = ByteBuffer.wrap(buf);
            test.strictEqual(bb.capacity(), 1);
            test.strictEqual(bb.buffer, buf);
            test.strictEqual(bb.toDebug(), "<01>");
            test.done();
        };
    }
    
    suite.wrap.ArrayBuffer = function(test) {
        var buf = new ArrayBuffer(1);
        var bb = ByteBuffer.wrap(buf);
        test.strictEqual(bb.capacity(), 1);
        if (type === ArrayBuffer)
            test.strictEqual(bb.buffer, buf);
        else
            test.ok(bb.buffer instanceof Buffer);
        test.equal(bb.offset, 0);
        test.equal(bb.limit, 1);
        test.done();
    };
    
    suite.wrap.Uint8Array = function(test) {
        // Full view
        var buf = new Uint8Array(1);
        buf[0] = 0x01;
        var bb = ByteBuffer.wrap(buf);
        test.strictEqual(bb.capacity(), 1);
        if (type === ArrayBuffer)
            test.strictEqual(bb.buffer, buf.buffer);
        else
            test.ok(bb.buffer instanceof Buffer);
        test.strictEqual(bb.toDebug(), "<01>");

        // Partial view (not on node, node copies)
        if (type === ArrayBuffer) {
            buf = new Uint8Array(3);
            buf[0] = 0x01; buf[1] = 0x02; buf[2] = 0x03;
            buf = new Uint8Array(buf.buffer, 1, 1);
            bb = ByteBuffer.wrap(buf);
            test.strictEqual(bb.capacity(), 3);
            test.strictEqual(bb.toDebug(), "01<02>03");
        }
        
        test.done();
    };
    
    suite.wrap.Array = function(test) {
        var arr = [1,255,-1];
        var bb = ByteBuffer.wrap(arr);
        test.strictEqual(bb.capacity(), 3);
        test.strictEqual(bb.toDebug(), "<01 FF FF>");
        test.done();
    };

    suite.wrap.ByteBuffer = function(test) {
        var bb2 = ByteBuffer.wrap("\x12\x34\x56\x78", "binary");
        bb2.offset = 1;
        var bb = ByteBuffer.wrap(bb2);
        test.strictEqual(bb2.offset, bb.offset);
        test.strictEqual(bb2.limit, bb.limit);
        test.strictEqual(bb2.capacity(), bb.capacity());
        test.strictEqual(bb2.toString("debug"), bb.toString("debug"));
        test.done();
    };
    
    suite.wrap.string = function(test) {
        var bb = ByteBuffer.wrap("\u0061\u0062");
        test.equal(bb.toDebug(), "<61 62>");
        test.done();
    };
       
    suite.encodings = {};
    
    suite.encodings.UTF8 = function(test) {
        ["aäöüß€b", ""].forEach(function(str) {
            var bb = ByteBuffer.wrap(str, "utf8"); // Calls ByteBuffer#fromUTF8
            test.strictEqual(bb.toUTF8(), str);
            if (str.length > 2) {
                bb.offset = 1;
                bb.limit = bb.capacity()-1;
                test.strictEqual(bb.toUTF8(), str.substring(1, str.length-1));
            }
        });
        test.done();
    };

    suite.encodings.debug = function(test) {
        ["60<61 62]63", "<60 61 62 63]", "|", "|61", "<61>", "!12"].forEach(function(str) {
            var bb = ByteBuffer.wrap(str, "debug"); // Calls ByteBuffer#fromDebug
            test.equal(bb.toDebug(), str);
        });
        test.done();
    };
    
    suite.encodings.binary = function(test) {
        ["\x61\x62\x63\x64", "", "  "].forEach(function(str) {
            var bb = ByteBuffer.wrap(str, "binary"); // Calls ByteBuffer#fromBinary
            test.strictEqual(bb.toBinary(), str);
            if (str.length > 2) {
                bb.offset = 1;
                bb.limit = bb.capacity()-1;
                test.strictEqual(bb.toBinary(), str.substring(1, str.length-1));
            }
        });
        test.done();
    };
    
    suite.encodings.hex = function(test) {
        ["61626364", "61", ""].forEach(function(str) {
            var bb = ByteBuffer.wrap(str, "hex"); // Calls ByteBuffer#fromHex
            test.strictEqual(bb.toHex(), str);
            if (str.length > 2) {
                bb.offset = 1;
                bb.limit = bb.capacity()-1;
                test.strictEqual(bb.toHex(), str.substring(2, str.length-2));
            }
        });
        test.done();
    };
    
    suite.encodings.base64 = function(test) {
        ["", "YWI=", "YWJjZGVmZw==", "YWJjZGVmZ2g=", "YWJjZGVmZ2hp"].forEach(function(str) {
            var bb = ByteBuffer.wrap(str, "base64"); // Calls ByteBuffer#fromBase64
            test.strictEqual(bb.toBase64(), str);
            if (str.length > 8) {
                bb.offset = 3;
                bb.limit = bb.offset + 3;
                test.strictEqual(bb.toBase64(), str.substr(4, 4));
            }
        });
        test.done();
    };
    
    suite.methods = {};
    
    suite.methods.concat = function(test) {
        var bbs = [
            new ArrayBuffer(1),
            ByteBuffer.fromDebug('00<01 02>'),
            ByteBuffer.fromDebug('00 01 02<03>00'),
            ByteBuffer.fromDebug('00|'),
            ByteBuffer.fromDebug('<04>'),
            type === Buffer ? new Buffer(0) : new ArrayBuffer(0),
            new Uint8Array(0),
            '05'
        ];
        var bb = ByteBuffer.concat(bbs, 'hex', !ByteBuffer.DEFAULT_ENDIAN, !ByteBuffer.DEFAULT_NOASSERT);
        test.strictEqual(bb.littleEndian, !ByteBuffer.DEFAULT_ENDIAN);
        test.strictEqual(bb.noAssert, !ByteBuffer.DEFAULT_NOASSERT);
        test.equal(bb.toDebug(), '<00 01 02 03 04 05>');
        bb = ByteBuffer.concat([]);
        test.strictEqual(bb.buffer, new ByteBuffer(0).buffer); // EMPTY_BUFFER
        test.done();
    };
    
    suite.methods.resize = function(test) {
        var bb = new ByteBuffer(1);
        bb.offset = 1;
        bb.resize(2);
        bb.fill(0, 0, 2);
        test.equal(bb.capacity(), 2);
        test.equal(bb.toDebug(), "00|00");
        test.done();
    };

    suite.methods.ensureCapacity = function(test) {
        var bb = new ByteBuffer(5);
        test.equal(bb.capacity(), 5);
        bb.ensureCapacity(6); // Doubles
        test.equal(bb.capacity(), 10);
        bb.ensureCapacity(21); // Uses 21
        test.equal(bb.capacity(), 21);
        test.done();
    };
    
    suite.methods.slice = function(test) {
        var bb = new ByteBuffer.wrap("\x12\x34\x56"),
            bb2 = bb.slice(1,2);
        test.strictEqual(bb.buffer, bb2.buffer);
        test.equal(bb.offset, 0);
        test.equal(bb.limit, 3);
        test.equal(bb2.offset, 1);
        test.equal(bb2.limit, 2);
        test.done();
    };
    
    suite.methods.flip = function(test) {
        var bb = ByteBuffer.wrap('\x12\x34\x56\x78');
        bb.offset = 4;
        test.equal(bb.offset, 4);
        test.equal(bb.limit, 4);
        bb.flip();
        test.equal(bb.offset, 0);
        test.equal(bb.limit, 4);
        test.done();
    };
    
    suite.methods.mark = function(test) {
        var bb = ByteBuffer.wrap('\x12\x34\x56\x78');
        test.equal(bb.offset, 0);
        test.equal(bb.limit, 4);
        test.equal(bb.markedOffset, -1);
        bb.mark();
        test.equal(bb.markedOffset, 0);
        test.done();
    };
    
    suite.methods.reset = function(test) {
        var bb = ByteBuffer.wrap('\x12\x34\x56\x78');
        bb.reset();
        test.equal(bb.offset, 0);
        test.equal(bb.limit, 4);
        bb.offset = 1;
        bb.mark();
        test.equal(bb.markedOffset, 1);
        bb.reset();
        test.equal(bb.offset, 1);
        test.equal(bb.markedOffset, -1);
        test.done();
    };
    
    suite.methods.copy = function(test) {
        var bb = ByteBuffer.wrap("\x01", !ByteBuffer.DEFAULT_ENDIAN),
            bb2 = bb.copy();
        test.equal(bb.offset, 0);
        test.notStrictEqual(bb, bb2);
        test.notStrictEqual(bb.buffer, bb2.buffer);
        test.equal(bb2.offset, bb.offset);
        test.equal(bb2.limit, bb.limit);
        test.equal(bb2.markedOffset, bb.markedOffset);
        test.equal(bb2.littleEndian, bb.littleEndian);
        test.equal(bb2.noAssert, bb.noAssert);
        test.done();
    };
    
    suite.methods.copyTo = function(test) {
        var bb = ByteBuffer.wrap("\x01"),
            bb2 = new ByteBuffer(2).fill(0).flip();
        test.equal(bb.toDebug(), "<01>");
        // Modifies source and target offsets
        bb.copyTo(bb2 /* all offsets omitted */);
        test.equal(bb.toDebug(), "01|"); // Read 1 byte
        test.equal(bb2.toDebug(), "01<00>"); // Written 1 byte
        bb.reset();
        test.equal(bb.toDebug(), "<01>");
        // Again, but with bb2.offset=1
        bb.copyTo(bb2 /* all offsets omitted */);
        test.equal(bb.toDebug(), "01|"); // Read 1 byte
        test.equal(bb2.toDebug(), "01 01|"); // Written 1 byte at 2
        bb.reset();
        bb2.clear().fill(0).flip();
        // Modifies source offsets only
        bb.copyTo(bb2, 0 /* source offsets omitted */);
        test.equal(bb.toDebug(), "01|"); // Read 1 byte
        test.equal(bb2.toDebug(), "<01 00>"); // Written 1 byte (no change)
        // Modifies no offsets at all
        bb.reset();
        bb2.fill(0).flip();
        bb.copyTo(bb2, 1, 0, bb.capacity() /* no offsets omitted */);
        test.equal(bb.toDebug(), "<01>"); // Read 1 byte (no change)
        test.equal(bb2.toDebug(), "<00 01>"); // Written 1 byte (no change)
        test.done();
    };
    
    suite.methods.compact = function(test) {
        var bb = ByteBuffer.wrap("\x01\x02");
        bb.limit = 1;
        bb.markedOffset = 2;
        var prevBuffer = bb.buffer,
            prevView = bb.view;
        bb.compact();
        test.notStrictEqual(bb.buffer, prevBuffer);
        if (type === ArrayBuffer) {
            test.notStrictEqual(bb.buffer, prevView);
        }
        test.equal(bb.capacity(), 1);
        test.equal(bb.offset, 0);
        test.equal(bb.limit, 1);
        test.equal(bb.markedOffset, 2); // Actually out of bounds
        
        // Empty region
        bb.offset = 1;
        prevBuffer = bb.buffer;
        bb.compact();
        test.notStrictEqual(bb.buffer, prevBuffer);
        test.strictEqual(bb.buffer, new ByteBuffer(0).buffer); // EMPTY_BUFFER
        if (type === ArrayBuffer) {
            test.strictEqual(bb.view, null);
        }
        test.equal(bb.capacity(), 0);
        test.equal(bb.offset, 0);
        test.equal(bb.limit, 0);        
        test.done();
    };
    
    suite.methods.reverse = function(test) {
        var bb = ByteBuffer.wrap("\x12\x34\x56\x78");
        bb.reverse(1, 3);
        test.equal(bb.toString("debug"), "<12 56 34 78>");
        bb.reverse();
        test.equal(bb.toString("debug"), "<78 34 56 12>");
        bb.offset = 1;
        bb.limit = 3;
        bb.reverse();
        test.equal(bb.toString("debug"), "78<56 34>12");
        bb.reverse(0, 4).clear();
        test.equal(bb.toString("debug"), "<12 34 56 78>");
        test.done();
    };
    
    suite.methods.append = function(test) {
        var bb = ByteBuffer.wrap("\x12\x34");
        var bb2 = ByteBuffer.wrap("\x56\x78");
        bb.offset = 2;
        bb.append(bb2); // Modifies offsets of both
        test.equal(bb.toString("debug"), "12 34>56 78<");
        test.equal(bb2.toString("debug"), "56 78|");
        bb2.reset();
        bb.append(bb2, 1); // Modifies offsets of bb2 only
        test.equal(bb.toString("debug"), "12 56>78 78<");
        test.equal(bb2.toString("debug"), "56 78|");
        test.done();
    };
    
    suite.methods.prepend = function(test) {
        var bb = ByteBuffer.wrap("\x12\x34"),
            bb2 = ByteBuffer.wrap("\x56\x78");
        test.strictEqual(bb.prepend(bb2), bb); // Relative prepend at 0, 2 bytes (2 overflow)
        test.equal(bb.toDebug(), "<56 78 12 34>");
        test.equal(bb2.toDebug(), "56 78|");
        bb.offset = 4;
        bb2.offset = 1;
        bb.prepend(bb2, 3); // Absolute prepend at 3, 1 byte
        test.equal(bb.toDebug(), "56 78 78 34|");
        test.equal(bb2.toDebug(), "56 78|");
        bb2.offset = 0;
        bb.prepend(bb2); // Relative prepend at 4, 2 bytes
        test.equal(bb.toDebug(), "56 78<56 78>");
        test.equal(bb2.toDebug(), "56 78|");
        bb.offset = 3;
        bb2.offset = 0;
        test.throws(function() {
            bb.prepend(bb2, 6); // Absolute out of bounds
        }, RangeError);
        bb.prepend("abcde", "utf8"); // Relative prepend at 3, 5 bytes (1 overflow)
        test.equal(bb.toDebug(), "<61 62 63 64 65 78>");
        test.done();
    };
    
    suite.methods.prependTo = function(test) {
        var bb = ByteBuffer.wrap("\x12\x34"),
            bb2 = ByteBuffer.wrap("\x56\x78");
        test.strictEqual(bb2.prependTo(bb), bb2);
        test.equal(bb.toDebug(), "<56 78 12 34>");
        test.equal(bb2.toDebug(), "56 78|");
        test.done();
    };
    
    suite.methods.remaining = function(test) {
        var bb = ByteBuffer.wrap("\x12\x34");
        test.strictEqual(bb.remaining(), 2);
        bb.offset = 2;
        test.strictEqual(bb.remaining(), 0);
        bb.offset = 3;
        test.strictEqual(bb.remaining(), -1);
        test.done();
    };
    
    suite.methods.skip = function(test) {
        var bb = ByteBuffer.wrap("\x12\x34\x56");
        test.strictEqual(bb.offset, 0);
        bb.skip(3);
        test.strictEqual(bb.offset, 3);
        test.strictEqual(bb.noAssert, false);
        test.throws(function() {
            bb.skip(1);
        });
        test.strictEqual(bb.offset, 3);
        bb.noAssert = true;
        test.doesNotThrow(function() {
            bb.skip(1);
        });
        test.strictEqual(bb.offset, 4);
        test.done();
    };
    
    suite.methods.order = function(test) {
        test.strictEqual(ByteBuffer.LITTLE_ENDIAN, true);
        test.strictEqual(ByteBuffer.BIG_ENDIAN, false);
        var bb = new ByteBuffer(2);
        test.strictEqual(bb.littleEndian, false);
        bb.writeInt32(0x12345678);
        bb.flip();
        test.strictEqual(bb.toHex(), "12345678");
        bb.clear();
        test.strictEqual(bb.LE(), bb);
        test.strictEqual(bb.littleEndian, true);
        bb.writeInt32(0x12345678);
        bb.flip();
        test.strictEqual(bb.toHex(), "78563412");
        test.strictEqual(bb.BE(), bb);
        test.strictEqual(bb.littleEndian, false);
        test.strictEqual(bb.order(ByteBuffer.LITTLE_ENDIAN), bb);
        test.strictEqual(bb.littleEndian, true);
        test.strictEqual(bb.order(ByteBuffer.BIG_ENDIAN), bb);
        test.strictEqual(bb.littleEndian, false);
        test.done();
    };
    
    var types = [
        // name          | alias   | size | input                                   | output                                  | BE representation
        ["Int8"          , "Byte"  , 1    , 0xFE                                    , -2                                      , "fe"                  ],
        ["Uint8"         , null    , 1    , -2                                      , 0xFE                                    , "fe"                  ],
        ["Int16"         , "Short" , 2    , 0xFFFE                                  , -2                                      , "fffe"                ],
        ["Uint16"        , null    , 2    , -2                                      , 0xFFFE                                  , "fffe"                ],
        ["Int32"         , "Int"   , 4    , 0xFFFFFFFE                              , -2                                      , "fffffffe"            ],
        ["Uint32"        , null    , 4    , -2                                      , 0xFFFFFFFE                              , "fffffffe"            ],
        ["Float32"       , "Float" , 4    , 0.5                                     , 0.5                                     , "3f000000"            ],
        ["Float64"       , "Double", 8    , 0.1                                     , 0.1                                     , "3fb999999999999a"    ],
        ["Int64"         , "Long"  , 8    , new Long(0xFFFFFFFE, 0xFFFFFFFF, true)  , new Long(0xFFFFFFFE, 0xFFFFFFFF, false) , "fffffffffffffffe"    ],
        ["Uint64"        , null    , 8    , new Long(0xFFFFFFFE, 0xFFFFFFFF, false) , new Long(0xFFFFFFFE, 0xFFFFFFFF, true)  , "fffffffffffffffe"    ],
        
        // name          | alias   | size | input                                   | output                                  | representation
        ["Varint32"      , null    , 5    , 0xFFFFFFFE                              , -2                                      , "feffffff0f"          ],
        ["Varint32ZigZag", null    , 1    , -1                                      , -1                                      , "01"                  ],
        ["Varint64"      , null    , 10   , new Long(0xFFFFFFFE, 0xFFFFFFFF, true)  , new Long(0xFFFFFFFE, 0xFFFFFFFF, false) , "feffffffffffffffff01"],
        ["Varint64ZigZag", null    , 1    , Long.fromNumber(-1)                     , Long.fromNumber(-1)                     , "01"                  ]
    ];
    
    suite.types = {};
    
    types.forEach(function(type) {
        var name = type[0],
            varint = name.indexOf("Varint") >= 0,
            alias = type[1],
            size = type[2],
            input = type[3],
            output = type[4],
            be = type[5],
            le = "";
        for (var i=be.length; i>0; i-=2) {
            le += be.substr(i-2, 2);
        }
        suite.types[name.toLowerCase()] = function(test) {
            var bb = new ByteBuffer(size);
            // Relative BE (always LE for varints)
            test.strictEqual(bb["write"+name](input), bb);
            bb.flip();
            var val = bb["read"+name]();
            if (output instanceof Long) {
                test.deepEqual(val, output);
            } else {
                test.strictEqual(val, output);
            }
            bb.flip();
            test.strictEqual(bb.toHex(), be);
            if (!varint) {
                // Relative LE
                bb.LE();
                bb["write"+name](input);
                bb.flip();
                val = bb["read"+name]();
                if (output instanceof Long) {
                    test.deepEqual(val, output);
                } else {
                    test.strictEqual(val, output);
                }
                bb.flip();
                test.strictEqual(bb.toHex(), le);
            }
            test.throws(function() { // OOB
                bb.offset = bb.capacity() - size + 1;
                bb["read"+name](input);
            });
            test.doesNotThrow(function() { // OOB, automatic resizing * 2
                bb["write"+name](input);
            });
            test.strictEqual(bb.capacity(), size * 2);
            // Absolute
            bb.clear();
            if (!varint)
                test.strictEqual(bb["write"+name](input, 1), bb);
            else
                test.strictEqual(bb["write"+name](input, 1), size);
            val = bb["read"+name](1);
            if (output instanceof Long) {
                if (!varint)
                    test.deepEqual(val, output);
                else
                    test.deepEqual(val, {value: output, length: size});
            } else {
                if (!varint)
                    test.strictEqual(val, output);
                else
                    test.deepEqual(val, {value: output, length: size});
            }
            // Alias
            if (alias) {
                test.strictEqual(bb["write"+name], bb["write"+alias]);
                test.strictEqual(bb["read"+name], bb["read"+alias]);
            }
            test.done();
        };
    });
    
    suite.types.bitset = function(test) {
      var bb = new ByteBuffer(2),
          arr;

      function run(data) {
        bb.reset();
        bb.writeBitSet(data);
        bb.reset();
        test.deepEqual(bb.readBitSet(),data);
      };

      run([]);
      run([true]);
      run([false]);
      run([false,true]);
      run([false,false,false,false,false,false,false,false]);
      run([true,false,true,false,true,false,true,false]);
      run([true,true,true,true,true,true,true,true]);
      run([true,false,true,false,true,false,true,false]);
      run([true,false,true,false,true,false,true,false,true]);
      
      bb.reset();
      bb.writeBitSet([,null,"",0,42,"hello world",new Date(0),{},[]]);
      bb.reset();
      test.deepEqual(bb.readBitSet(),[false,false,false,false,true,true,true,true,true]);

      test.done();
    };

    suite.types.calculateVarint = function(test) {
        test.equal(ByteBuffer.MAX_VARINT32_BYTES, 5);
        test.equal(ByteBuffer.MAX_VARINT64_BYTES, 10);
        var values = [
            [0, 1],
            [-1, 5, 10],
            [1<<7, 2],
            [1<<14, 3],
            [1<<21, 4],
            [1<<28, 5],
            [0x7FFFFFFF | 0, 5],
            [0xFFFFFFFF, 5],
            [0xFFFFFFFF | 0, 5, 10]
        ];
        for (var i=0; i<values.length; i++) {
            test.equal(ByteBuffer.calculateVarint32(values[i][0]), values[i][1]);
            test.equal(ByteBuffer.calculateVarint64(values[i][0]), values[i].length > 2 ? values[i][2] : values[i][1]);
        }
        var Long = ByteBuffer.Long;
        values = [
            [Long.fromNumber(1).shiftLeft(35), 6],
            [Long.fromNumber(1).shiftLeft(42), 7],
            [Long.fromNumber(1).shiftLeft(49), 8],
            [Long.fromNumber(1).shiftLeft(56), 9],
            [Long.fromNumber(1).shiftLeft(63), 10],
            [Long.fromNumber(1, true).shiftLeft(63), 10]
        ];
        for (i=0; i<values.length; i++) {
            test.equal(ByteBuffer.calculateVarint64(values[i][0]), values[i][1]);
        }
        test.done();
    };
    
    suite.types.zigZagVarint = function(test) {
        var Long = ByteBuffer.Long;
        var values = [
            [ 0, 0],
            [-1, 1],
            [ 1, 2],
            [-2, 3],
            [ 2, 4],
            [-3, 5],
            [ 3, 6],
            [ 2147483647, 4294967294],
            [-2147483648, 4294967295]
        ];
        for (var i=0; i<values.length; i++) {
            test.equal(ByteBuffer.zigZagEncode32(values[i][0]), values[i][1]);
            test.equal(ByteBuffer.zigZagDecode32(values[i][1]), values[i][0]);
            test.equal(ByteBuffer.zigZagEncode64(values[i][0]).toNumber(), values[i][1]);
            test.equal(ByteBuffer.zigZagDecode64(values[i][1]).toNumber(), values[i][0]);
        }
        values = [
            [Long.MAX_VALUE, Long.MAX_UNSIGNED_VALUE.subtract(Long.ONE)],
            [Long.MIN_VALUE, Long.MAX_UNSIGNED_VALUE]
        ];
        // NOTE: Even 64bit doubles from toNumber() fail for these values so we are using toString() here
        for (i=0; i<values.length; i++) {
            test.equal(ByteBuffer.zigZagEncode64(values[i][0]).toString(), values[i][1].toString());
            test.equal(ByteBuffer.zigZagDecode64(values[i][1]).toString(), values[i][0].toString());
        }
        
        // 32 bit ZZ
        values = [
            0,
            1,
            300,
            -300,
            2147483647,
            -2147483648
        ];
        bb = new ByteBuffer(10);
        for (i=0; i<values.length; i++) {
            var encLen = bb.writeVarint32ZigZag(values[i], 0);
            bb.limit = encLen;
            var dec = bb.readVarint32ZigZag(0);
            test.equal(dec['value'], values[i]);
            test.equal(encLen, dec['length']);
            bb.clear();
        }
        
        // 64 bit ZZ
        values = [
            Long.ONE, 1,
            Long.fromNumber(-3),
            Long.fromNumber(300),
            Long.fromNumber(-300),
            Long.fromNumber(0x7FFFFFFF),
            Long.fromNumber(0x8FFFFFFF),
            Long.fromNumber(0xFFFFFFFF),
            Long.fromBits(0xFFFFFFFF, 0x7FFFFFFF),
            Long.fromBits(0xFFFFFFFF, 0xFFFFFFFF)
        ];
        var bb = new ByteBuffer(10);
        for (i=0; i<values.length; i++) {
            encLen = bb.writeVarint64ZigZag(values[i], 0);
            dec = bb.readVarint64ZigZag(0);
            test.equal(values[i].toString(), dec['value'].toString());
            test.equal(encLen, dec['length']);
        }
        test.done();
    };
    
    suite.types.utf8string = function(test) {        
        var bb = new ByteBuffer(2);
        // Aliases
        test.strictEqual(bb.writeUTF8String, bb.writeString);
        test.strictEqual(bb.readUTF8String, bb.readString);
        var str = "ä☺𠜎️☁️", str2;
        // Writing 
        test.strictEqual(bb.writeUTF8String(str), bb);
        bb.flip();
        // bb.printDebug();
        // Reading
        str2 = bb.readUTF8String(ByteBuffer.calculateUTF8Chars(str), ByteBuffer.METRICS_CHARS);
        // bb.printDebug();
        test.strictEqual(str2.length, str.length);
        test.strictEqual(str2, str);
        bb.reset();
        str2 = bb.readUTF8String(bb.limit, ByteBuffer.METRICS_BYTES);
        test.strictEqual(str2, str);
        test.done();
    };

    suite.types.istring = function(test) {
        var bb = new ByteBuffer(2);
        test.strictEqual(bb.writeIString("ab"), bb); // resizes to 4+2=6
        test.strictEqual(bb.capacity(), 6);
        test.strictEqual(bb.offset, 6);
        test.strictEqual(bb.limit, 2);
        bb.flip();
        test.equal(bb.toString("debug"), "<00 00 00 02 61 62>");
        test.deepEqual(bb.readIString(0), {"string": "ab", "length": 6});
        test.strictEqual(bb.readIString(), "ab");
        bb.reset();
        test.equal(bb.toString("debug"), "<00 00 00 02 61 62>");
        test.strictEqual(bb.readIString(), "ab");
        test.equal(bb.toString("debug"), "00 00 00 02 61 62|");
        test.done();
    };
    
    suite.types.vstring = function(test) {
        var bb = new ByteBuffer(2);
        bb.writeVString("ab"); // resizes to 2*2=4
        test.strictEqual(bb.capacity(), 4);
        test.strictEqual(bb.offset, 3);
        test.strictEqual(bb.limit, 2);
        bb.flip();
        test.equal(bb.toString("debug").substr(0, 10), "<02 61 62>");
        test.deepEqual(bb.readVString(0), {"string": "ab", "length": 3});
        test.equal(bb.toString("debug").substr(0, 10), "<02 61 62>");
        test.equal(bb.readVString(), "ab");
        test.equal(bb.toString("debug").substr(0, 9), "02 61 62|");
        test.done();
    };
    
    suite.types.cstring = function(test) {
        var bb = new ByteBuffer(2);
        bb.writeCString("a");
        test.equal(bb.capacity(), 2);
        test.equal(bb.offset, 2);
        test.equal(bb.limit, 2);
        bb.offset = 1;
        bb.writeCString("b"); // resizes to 4
        test.equal(bb.capacity(), 4);
        test.equal(bb.offset, 3);
        test.equal(bb.limit, 2);
        bb.flip();
        test.equal(bb.toString("debug").substr(0, 10), "<61 62 00>");
        test.deepEqual(bb.readCString(0), {"string": "ab", "length": 3});
        test.equal(bb.toString("debug").substr(0, 10), "<61 62 00>");
        test.equal(bb.readCString(), "ab");
        test.equal(bb.toString("debug").substr(0, 9), "61 62 00|");
        test.done();
    };
    
    suite.convert = {};
    
    suite.convert.toHex = function(test) {
        var bb = new ByteBuffer(4);
        bb.writeUint16(0x1234);
        bb.writeUint8(0x56);
        bb.flip();
        test.equal(bb.toHex(), "123456");
        test.strictEqual(bb.offset, 0);
        test.equal(bb.toHex(1), "3456");
        test.equal(bb.toHex(1,2), "34");
        test.equal(bb.toHex(1,1), "");
        test.throws(function() {
            bb.toHex(1,0);
        });
        test.done();
    };
    
    suite.convert.toBase64 = function(test) {
        var bb = new ByteBuffer(8);
        bb.writeUTF8String("abcdefg"); // 7 chars
        bb.flip();
        test.equal(bb.toBase64(), "YWJjZGVmZw==");
        test.strictEqual(bb.offset, 0);
        test.equal(bb.toBase64(3), "ZGVmZw==");
        test.equal(bb.toBase64(3,6), "ZGVm");
        test.equal(bb.toBase64(3,3), "");
        test.throws(function() {
            bb.toBase64(1,0);
        });
        test.done();
    };
    
    suite.convert.toBinary = function(test) {
        var bb = new ByteBuffer(5);
        bb.writeUint32(0x001234FF);
        bb.flip();
        test.strictEqual(bb.toBinary(), "\x00\x12\x34\xFF");
        test.strictEqual(bb.offset, 0);
        test.done();
    };
    
    suite.convert.toString = function(test) {
        var bb = new ByteBuffer(3);
        bb.writeUint16(0x6162).flip();
        test.equal(bb.toString("hex"), "6162");
        test.equal(bb.toString("base64"), "YWI=");
        test.equal(bb.toString("utf8"), "ab");
        test.equal(bb.toString("debug").substr(0,7), "<61 62>");
        test.equal(bb.toString(), (type === ArrayBuffer ? (accessor === DataView ? "ByteBufferAB_DataView" : "ByteBufferAB") : "ByteBufferNB")+"(offset=0,markedOffset=-1,limit=2,capacity=3)");
        test.strictEqual(bb.offset, 0);
        test.done();
    };
    
    suite.convert.toBuffer = function(test) {
        var bb = new ByteBuffer(2);
        bb.writeUint16(0x1234).flip();
        var buf = bb.toBuffer();
        test.strictEqual(buf, bb.buffer);
        if (type === ArrayBuffer) {
            test.ok(buf instanceof ArrayBuffer);
            test.strictEqual(buf.byteLength, 2);
        } else {
            test.ok(buf instanceof Buffer);
            test.strictEqual(buf.length, 2);
        }
        bb.limit = 1;
        buf = bb.toBuffer();
        test.notStrictEqual(buf, bb.buffer);
        if (type === ArrayBuffer) {
            test.ok(buf instanceof ArrayBuffer);
            test.strictEqual(buf.byteLength, 1);
        } else {
            test.ok(buf instanceof Buffer);
            test.strictEqual(buf.length, 1);
        }
        test.done();
    };
    
    suite.convert.toArrayBuffer = function(test) {
        var bb = new ByteBuffer(3);
        if (type === ArrayBuffer) {
            test.strictEqual(bb.toArrayBuffer, bb.toBuffer);
        } else {
            test.ok(bb.buffer instanceof Buffer);
            bb.writeUint16(0x1234);
            bb.flip();
            bb.offset = 1;
            var ab = bb.toArrayBuffer();
            test.ok(ab instanceof ArrayBuffer);
            test.strictEqual(ab.byteLength, 1);
        }
        test.done();
    };

    suite.misc = {};
    
    suite.misc.pbjsi19 = function(test) {
        // test that this issue is fixed: https://github.com/dcodeIO/ProtoBuf.js/issues/19
        var bb = new ByteBuffer(9); // Trigger resize to 18 in writeVarint64
        bb.writeVarint32(16);
        bb.writeVarint32(2);
        bb.writeVarint32(24);
        bb.writeVarint32(0);
        bb.writeVarint32(32);
        bb.writeVarint64(ByteBuffer.Long.fromString("1368057600000"));
        bb.writeVarint32(40);
        bb.writeVarint64(ByteBuffer.Long.fromString("1235455123"));
        bb.flip();
        test.equal(bb.toString("debug").substr(0,52), "<10 02 18 00 20 80 B0 D9 B4 E8 27 28 93 99 8E CD 04>");
        test.done();
    };
    
    suite.misc.NaN = function(test) {
        var bb = new ByteBuffer(4);
        test.ok(isNaN(bb.writeFloat(NaN).flip().readFloat(0)));
        test.strictEqual(bb.writeFloat(+Infinity).flip().readFloat(0), +Infinity);
        test.strictEqual(bb.writeFloat(-Infinity).flip().readFloat(0), -Infinity);
        bb.resize(8);
        test.ok(isNaN(bb.writeDouble(NaN).flip().readDouble(0)));
        test.strictEqual(bb.writeDouble(+Infinity).flip().readDouble(0), +Infinity);
        test.strictEqual(bb.writeDouble(-Infinity).flip().readDouble(0), -Infinity);

        // Varints, however, always need a cast, which results in the following:
        test.strictEqual(NaN >>> 0, 0);
        test.strictEqual(NaN | 0, 0);
        test.strictEqual(Infinity >>> 0, 0);
        test.strictEqual(Infinity | 0, 0);
        test.strictEqual(-Infinity >>> 0, 0);
        test.strictEqual(-Infinity | 0, 0);

        test.done();
    };

    suite.debug = {};

    suite.debug.printDebug = function(test) {
        var bb = new ByteBuffer(3);
        function callMe() { callMe.called = true; }
        bb.printDebug(callMe);
        test.ok(callMe.called);
        test.done();
    };
    
    if (type === ArrayBuffer) {
        suite.debug.printDebugVisual = function(test) {
            var bb = ByteBuffer.wrap("Hello world! from byteBuffer.js. This is just a last visual test of ByteBuffer#printDebug.");
            console.log("");
            bb.printDebug(console.log);
            test.done();
        };
    }
    
    return suite;
}

module.exports = {
    "info": function(test) {
        test.log("Version "+ByteBuffer.VERSION+", "+new Date().toISOString()+"\n");
        test.done();
    },
    "node": makeSuite(ByteBufferNode),
    "browser": makeSuite(ByteBufferBrowser),
    "dataview": makeSuite(ByteBufferBrowser_DataView)
};
