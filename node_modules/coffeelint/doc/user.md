How do I configure CoffeeLint?
==============================

There are two main options. In the root of your project create a
`coffeelint.json`, or add a `coffeelintConfig` section to your `package.json`.
Either way, the configuration is exactly the same. If CoffeeLint doesn't find
any configuration for the current project, it will check for a
`$HOME/coffeelint.json` to use.

`package.json`
--------------
```json
{
  "name": "your-project",
  "version": "0.0.0",
  "coffeelintConfig": {
    "indentation" : {
        "level" : "error",
        "value" : 4
    },
    "line_endings" : {
        "value" : "unix",
        "level" : "error"
    }
  }
}
```

`coffeelint.json`
-----------------
```json
{
  "indentation" : {
    "level" : "error",
    "value" : 4
  },
  "line_endings" : {
    "value" : "unix",
    "level" : "error"
  }
}
```

What are the rules?
===================

See [coffeelint.org][options] for all of the built in rules. Every rule has a
`level` of `ignore`, `error`, or `warn`. Most rules have a single behavior and
`level` is the only thing to configure. `indentation` is one of the exceptions,
it has a `value` that defaults to 2.

How do I temporarily disable a rule?
====================================

```CoffeeScript
 # coffeelint: disable=max_line_length
 object:
   attr: "some/huge/line/string/with/embed/#{values}.that/surpasses/the/max/column/width"
 # coffeelint: enable=max_line_length
 ```

What about 3rd party rules?
===========================

CoffeeLint 0.6 to 1.3 required 3rd party rules to be installed globally (`[sudo]
npm install -g <coffeelint-rule>`).

Starting with CoffeeLint 1.4 rules can (and should) be installed per project.
Consult the `README.md` or npmjs.org page for exact configuration instructions.
It's generally the same as built in rules but with the addition of a `module`
attribute to specify the correct module name. It may not exactly match the rule
name.

All rules should have a `coffeelintrule` tag on [npmjs.org][rules].

How do I use JSX (ReactJS)
==========================

CoffeeLint 1.8 allows you to add transformers that will run over the code
before CoffeeLint processes it.

*WARNING*: CoffeeLint cannot control what these transformers do. They may
violate all kinds of rules you have setup. It's up to you to wrap your code in
`# coffeelint: disable=max_line_length` or whatever you need.

*WARNING*: These transformers might not maintain line numbers. If this happens
and it's a problem, it's up to you to contact the developers to see if they can
keep everything on the same lines.

In your coffeelint.json:

```json
{
    "coffeelint": {
        "transforms": [ "coffee-react-transform" ]
    }
}
```

What about different flavors of CoffeeScript, like IcedCoffeeScript?
====================================================================

While this functionality was added in 1.8, it's basically unsupported. If your
chosen flavor breaks things it's up to you to contact the maintainer and see if
they are willing to bring their implementation in line with the official
CoffeeScript.

Using IcedCoffeeScript [does break][IcedCoffeeScript] the `cyclomatic_complexity` rule 

```json
{
    "coffeelint": {
        "coffeescript": [ "iced-coffee-script" ]
    }
}
```
 
[options]: http://www.coffeelint.org/#options
[rules]: https://www.npmjs.org/search?q=coffeelintrule
[IcedCoffeeScript]: https://github.com/clutchski/coffeelint/issues/349#issuecomment-67737784
