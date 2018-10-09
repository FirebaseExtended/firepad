coffeelint-stylish [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![NPM version][npm-image]][npm-url]
==================
[![Screenshot](http://img.shields.io/badge/pretty-stylish-ff69b4.svg)][screenshot-image] [![Dependency Status][depstat-image]][depstat-url] [![devDependency Status][devdepstat-image]][devdepstat-url]

> Stylish reporter for CoffeeLint http://www.coffeelint.org. Heavily inspired by the beautiful [jshint-stylish](https://github.com/sindresorhus/jshint-stylish).

![screenshot](screenshot.png)

## Install

Install with [npm](https://npmjs.org/package/coffeelint-stylish): `npm install --save-dev coffeelint-stylish`.

## Usage with CoffeeLint cli

```bash
coffeelint index.coffee --reporter coffeelint-stylish
```

## Usage with CoffeeLint runtime

```coffeescript
coffeelint = require 'coffeelint'
reporter = require('coffeelint-stylish').reporter

filename = 'make.coffee'
source = 'do -> coffee()'

reporter filename, coffeelint source
```

## Runtime API `reporter(filename, results)`

### filename
Type: `String`, Default: `''`

Headline of the report.

### results
Type: `Array`, Default: `[]`

Results `Array` provided by `coffeelint.lint`, see http://www.coffeelint.org/#api.

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License) © [Jan Raasch](http://janraasch.com)

[screenshot-image]: https://github.com/janraasch/coffeelint-stylish/blob/master/screenshot.png

[npm-url]: https://npmjs.org/package/coffeelint-stylish
[npm-image]: http://img.shields.io/npm/v/coffeelint-stylish.svg

[travis-url]: http://travis-ci.org/janraasch/coffeelint-stylish
[travis-image]: https://travis-ci.org/janraasch/coffeelint-stylish.svg?branch=master

[coveralls-url]: https://coveralls.io/r/janraasch/coffeelint-stylish?branch=master
[coveralls-image]: https://img.shields.io/coveralls/janraasch/coffeelint-stylish.svg

[depstat-url]: https://david-dm.org/janraasch/coffeelint-stylish
[depstat-image]: https://david-dm.org/janraasch/coffeelint-stylish.svg

[devdepstat-url]: https://david-dm.org/janraasch/coffeelint-stylish#info=devDependencies
[devdepstat-image]: https://david-dm.org/janraasch/coffeelint-stylish/dev-status.svg
