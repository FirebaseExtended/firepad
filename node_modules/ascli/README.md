![ascli](https://raw.github.com/dcodeIO/ascli/master/ascli.png)
=====
**Why?** Some of us are not only programmers but also part-time artist. So am I. This is good. However, to limit myself
a bit to a straight look of my CLI apps, I've created ascli based on the thought of not making things too fancy but
still looking good. So, basically, this package is meant to be used by me but if you like my interpretation of
unobtrusiveness and ease-of-use ... You are welcome!

<p align="center">
    <img src="https://raw.github.com/dcodeIO/ascli/master/example.png" alt="example" />
</p>

Installation
------------
`npm install ascli`

Usage
-----
```js
var cli = require("ascli")("myAppName");
cli.banner(ascli.appName.green.bold, "v1.0.0 by Foo Bar <foobar@example.com>");
cli.log("Hello!");
cli.info("World!");
cli.warn("of");
cli.error("ascli.");
// If it worked:
cli.ok("It worked!", /* optional exit code */ 0);
// If it didn't:
cli.fail("Nope, sorry.", /* optional exit code */ 1);
```

#### Using another alphabet
By default ascli uses a modified version of the **straight** ASCII alphabet. If you don't like it, you are free to
replace it:

```js
cli.use("/path/to/my/alphabet.json");
// or
var myAlphabet = { ... };
cli.use(myAlphabet);
```

See the `alphabet/` directory for an example.

#### Using colors
ascli automatically looks up and translates ANSI terminal colors applied to the title string. For that it depends on
[colour.js](https://github.com/dcodeIO/colour.js) which is also exposed as a property of the ascli namespace:
`cli.colour` / `cli.colors`. Also means: You don't need another ANSI terminal colors dependency.

#### Indentation
`cli.log` etc. indents all console output by one space just because it looks better with the banner.

Parsing command line arguments
------------------------------
[opt.js](https://github.com/dcodeIO/opt.js) will be pre-run on the `cli` namespace and also exposed as `cli.optjs()`.
```js
cli.node   // Node executable
cli.script // Executed script
cli.opt    // Options as a hash
cli.argv   // Remaining non-option arguments
```

License
-------
Apache License, Version 2.0
