![bytebuffer.js - The swiss army knife for binary data in JavaScript.](https://raw.github.com/dcodeIO/bytebuffer.js/master/bytebuffer.png)
======================================
A fast and complete ByteBuffer implementation using either ArrayBuffers in the browser or node Buffers under node.js,
generated from a single source tree through [MetaScript](https://github.com/dcodeIO/MetaScript).

[![Build Status](https://travis-ci.org/dcodeIO/bytebuffer.js.svg?branch=master)](https://travis-ci.org/dcodeIO/bytebuffer.js)
[![Donate](https://raw.githubusercontent.com/dcodeIO/bytebuffer.js/master/donate.png)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=dcode%40dcode.io&item_name=%3C3%20bytebuffer.js)

Features
--------
* Three API-compatible versions:
  * **bytebuffer** &nbsp; Backing buffer: ArrayBuffer, Accessor: Uint8Array
  * **bytebuffer-dataview** &nbsp; Backing buffer: ArrayBuffer, Accessor: DataView
  * **bytebuffer-node** &nbsp; Backing buffer / Accessor: node Buffer
* 8, 16, 32 and 64 bit (through [long.js](https://github.com/dcodeIO/long.js)) signed and unsigned integers
* 32 and 64 bit floats
* Varints as used in protobuf (32 and 64 bit, zig-zag)
* [Base64](https://github.com/dcodeIO/lxiv), [utf8](https://github.com/dcodeIO/utfx), binary, hex and debug encodings
* Handy string and debugging utilities
* Big and little endianness
* Relative and absolute zero-copy operations wherever possible
* Transparent resizing when using unknown-length data
* Chaining of all operations that do not return a specific value
* Slicing, appending, prepending, reversing, flip, mark, reset, etc.

Usage
-----
The library is compatible with CommonJS and AMD loaders and is exposed globally as `dcodeIO.ByteBuffer` if neither is
available.

```javascript
var ByteBuffer = require("bytebuffer");

var bb = new ByteBuffer()
            .writeIString("Hello world!")
            .flip();
console.log(bb.readIString()+" from bytebuffer.js");
```

In the browser, 64 bit integer support is optional and present only if [Long.js](https://github.com/dcodeIO/long.js) has
been loaded prior to bytebuffer.js.

API
---
* [View the API documentation](https://github.com/dcodeIO/bytebuffer.js/wiki/API)
* [Check the wiki](https://github.com/dcodeIO/bytebuffer.js/wiki)

Downloads
---------
* [Distributions](https://github.com/dcodeIO/bytebuffer.js/tree/master/dist)
* [ZIP-Archive](https://github.com/dcodeIO/bytebuffer.js/archive/master.zip)
* [Tarball](https://github.com/dcodeIO/bytebuffer.js/tarball/master)

Support for IE<10, FF<15, Chrome<9 etc.
---------------------------------------
* Use bytebuffer-dataview with a polyfill ([see](https://github.com/dcodeIO/bytebuffer.js/tree/master/dist))

Contributors
------------
[Dretch](https://github.com/Dretch) (IE8 compatibility)

License
-------
**License:** [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html) - Logo derived from [W3C HTML5 Logos](http://www.w3.org/html/logo/) (CC A 3.0)
