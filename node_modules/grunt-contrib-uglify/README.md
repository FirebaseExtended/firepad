# grunt-contrib-uglify v4.0.0 [![Build Status: Linux](https://travis-ci.org/gruntjs/grunt-contrib-uglify.svg?branch=master)](https://travis-ci.org/gruntjs/grunt-contrib-uglify) [![Build Status: Windows](https://ci.appveyor.com/api/projects/status/ybtf5vbvtenii561/branch/master?svg=true)](https://ci.appveyor.com/project/gruntjs/grunt-contrib-uglify/branch/master)

> Minify JavaScript files with UglifyJS



## Getting Started

If you haven't used [Grunt](https://gruntjs.com/) before, be sure to check out the [Getting Started](https://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](https://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-contrib-uglify --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-contrib-uglify');
```




## Uglify task
_Run this task with the `grunt uglify` command._

Task targets, files and options may be specified according to the grunt [Configuring tasks](https://gruntjs.com/configuring-tasks) guide.

### Options

This task primarily delegates to [UglifyJS](https://github.com/mishoo/UglifyJS2), so please consider their documentation as required reading for advanced configuration.


###### Deprecated options from `2.x`

Option                  | Replacement
----------------------- | -----------
ASCIIOnly               | output.ascii_only
enclose                 | &mdash;
exportAll               | &mdash;
expression              | parse.expression
indentLevel             | output.indent_level
mangleProperties        | mangle.properties
maxLineLen              | output.max\_line_len
preserveComments        | output.comments
quoteStyle              | output.quote_style
screwIE8                | !ie8
sourceMapIncludeSources | sourceMap.includeSources
sourceMapRoot           | sourceMap.root
sourceMapUrl            | sourceMap.url


#### mangle
Type: `Boolean` `Object`  
Default: `{}`

Turn on or off mangling with default options. If an `Object` is specified, it is passed directly to `ast.mangle_names()` *and* `ast.compute_char_frequency()` (mimicking command line behavior). [View all options here](https://github.com/mishoo/UglifyJS2#mangler-options).

#### compress
Type: `Boolean` `Object`  
Default: `{}`

Turn on or off source compression with default options. If an `Object` is specified, it is passed as options to `UglifyJS.Compressor()`. [View all options here](https://github.com/mishoo/UglifyJS2#compressor-options).

#### beautify
Type: `Boolean` `Object`  
Default: `false`

Turns on beautification of the generated source code. [View all options here](https://github.com/mishoo/UglifyJS2#beautifier-options)

###### parse.expression
Type: `Boolean`  
Default: `false`

Parse a single expression, rather than a program (for parsing JSON)

#### report
Type: `string`  
Choices: `'min'`, `'gzip'`  
Default: `'min'`

Report minification result or both minification and gzip results.
This is useful to see exactly how well uglify-js is performing but using `'gzip'` will make the task take 5-10x longer to complete. [Example output](https://github.com/sindresorhus/maxmin#readme).

#### sourceMap
Type: `Boolean`  
Default: `false`

If `true`, a source map file will be generated in the same directory as the `dest` file. By default it will have the same basename as the `dest` file, but with a `.map` extension.

#### sourceMapName
Type: `String` `Function`  
Default: `undefined`

To customize the name or location of the generated source map, pass a string to indicate where to write the source map to. If a function is provided, the uglify destination is passed as the argument and the return value will be used as the file name.

#### sourceMapIn
Type: `String` `Function`  
Default: `undefined`

The location of an input source map from an earlier compilation, e.g. from CoffeeScript. If a function is provided, the
uglify source is passed as the argument and the return value will be used as the sourceMap name. This only makes sense
when there's one source file.

#### sourceMap.includeSources
Type: `Boolean`  
Default: `false`

Pass this flag if you want to include the content of source files in the source map as sourcesContent property.

###### sourceMap.root
Type: `String`  
Default: `undefined`

With this option you can customize root URL that browser will use when looking for sources.

If the sources are not absolute URLs after prepending of the `sourceMap.root`, the sources are resolved relative to the source map.

#### sourceMap.url
Type: `String`  
Default: `undefined`

Override the calculated value for `sourceMappingURL` in the source map. This is useful if the source map location is not relative to the base path of the minified file, i.e. when using a CDN

#### wrap
Type: `String`  
Default: `undefined`

Wrap all of the code in a closure, an easy way to make sure nothing is leaking.
For variables that need to be public `exports` and `global` variables are made available.
The value of wrap is the global variable exports will be available as.

#### output.ascii_only
Type: `Boolean`  
Default: `false`

Enables to encode non-ASCII characters as \uXXXX.

#### output.comments
Type: `Boolean` `String` `Function`  
Default: `undefined`  
Options: `false` `'all'` `'some'`

Turn on preservation of comments.

- `false` will strip all comments
- `'all'` will preserve all comments in code blocks that have not been squashed or dropped
- `'some'` will preserve all comments that include a closure compiler style directive (`@preserve` `@license` `@cc_on`)
- `Function` specify your own comment preservation function. You will be passed the current node and the current comment and are expected to return either `true` or `false`
- `RegExp` `'/[RegExp]/'` will preserve comments matching given RegExp or stringified RegExp

#### banner
Type: `String`  
Default: `''`

This string will be prepended to the minified output. Template strings (e.g. `<%= config.value %>`) will be expanded automatically.

#### footer
Type: `String`  
Default: `''`

This string will be appended to the minified output. Template strings (e.g. `<%= config.value %>`) will be expanded automatically.

#### ie8
Type: `Boolean`  
Default: `false`

Set this to `true` if you still care about full compliance with Internet Explorer 6-8 quirks.

#### mangle.properties
Type: `Boolean` `Object`  
Default: `false`

Turn on or off property mangling with default options. If an `Object` is specified, it is passed directly to `ast.mangle_properties()` (mimicking command line behavior). [View all options here](https://github.com/mishoo/UglifyJS2#mangler-options).

#### reserveDOMProperties
Type: `Boolean`  
Default: `false`

Use this flag in conjunction with `mangle.properties` to prevent built-in browser object properties from being mangled.

#### exceptionsFiles
Type: `Array`  
Default: `[]`

Use this with `mangle.properties` to pass one or more JSON files containing a list of variables and object properties
that should not be mangled. See the [UglifyJS docs](https://www.npmjs.com/package/uglify-js) for more info on the file syntax.

#### nameCache
Type: `String`  
Default: `''`

A string that is a path to a JSON cache file that uglify will create and use to coordinate symbol mangling between
multiple runs of uglify. Note: this generated file uses the same JSON format as the `exceptionsFiles` files.

#### output.quote_style
Type: `Integer`  
Default: `0`

Preserve or enforce quotation mark style.

* `0` will use single or double quotes such as to minimize the number of bytes (prefers double quotes when both will do)
* `1` will always use single quotes
* `2` will always use double quotes
* `3` will preserve original quotation marks

### Usage examples

#### Basic compression

This configuration will compress and mangle the input files using the default options.

```js
// Project configuration.
grunt.initConfig({
  uglify: {
    my_target: {
      files: {
        'dest/output.min.js': ['src/input1.js', 'src/input2.js']
      }
    }
  }
});
```

#### No mangling

Specify `mangle: false` to prevent changes to your variable and function names.

```js
// Project configuration.
grunt.initConfig({
  uglify: {
    options: {
      mangle: false
    },
    my_target: {
      files: {
        'dest/output.min.js': ['src/input.js']
      }
    }
  }
});
```

#### Reserved identifiers

You can specify identifiers to leave untouched with an `reserved` array in the `mangle` options.

```js
// Project configuration.
grunt.initConfig({
  uglify: {
    options: {
      mangle: {
        reserved: ['jQuery', 'Backbone']
      }
    },
    my_target: {
      files: {
        'dest/output.min.js': ['src/input.js']
      }
    }
  }
});
```

#### Source maps

Generate a source map by setting the `sourceMap` option to `true`. The generated
source map will be in the same directory as the destination file. Its name will be
the basename of the destination file with a `.map` extension. Override these
defaults with the `sourceMapName` attribute.

```js
// Project configuration.
grunt.initConfig({
  uglify: {
    my_target: {
      options: {
        sourceMap: true,
        sourceMapName: 'path/to/sourcemap.map'
      },
      files: {
        'dest/output.min.js': ['src/input.js']
      }
    }
  }
});
```

#### Advanced source maps

Set the `sourceMap.includeSources` option to `true` to embed your sources directly into the map. To include
a source map from a previous compilation pass it as the value of the `sourceMapIn` option.

```js
// Project configuration.
grunt.initConfig({
  uglify: {
    my_target: {
      options: {
        sourceMap: {
          includeSources: true
        },
        sourceMapIn: 'example/coffeescript-sourcemap.js', // input sourcemap from a previous compilation
      },
      files: {
        'dest/output.min.js': ['src/input.js'],
      },
    },
  },
});
```

Refer to the [UglifyJS SourceMap Documentation](https://github.com/mishoo/UglifyJS2#source-map-options) for more information.

#### Turn off console warnings

Specify `drop_console: true` as part of the `compress` options to discard calls to `console.*` functions.
This will suppress warning messages in the console.

```js
// Project configuration.
grunt.initConfig({
  uglify: {
    options: {
      compress: {
        drop_console: true
      }
    },
    my_target: {
      files: {
        'dest/output.min.js': ['src/input.js']
      }
    }
  }
});
```

#### Beautify

Specify `beautify: true` to beautify your code for debugging/troubleshooting purposes.
Pass an object to manually configure any other output options.

See [UglifyJS documentation](https://github.com/mishoo/UglifyJS2#beautifier-options) for more information.

```js
// Project configuration.
grunt.initConfig({
  uglify: {
    my_target: {
      options: {
        beautify: true
      },
      files: {
        'dest/output.min.js': ['src/input.js']
      }
    },
    my_advanced_target: {
      options: {
        beautify: {
          width: 80
        }
      },
      files: {
        'dest/output.min.js': ['src/input.js']
      }
    }
  }
});
```

#### Banner comments

In this example, running `grunt uglify:my_target` will prepend a banner created by interpolating the `banner` template string with the config object. Here, those properties are the values imported from the `package.json` file (which are available via the `pkg` config property) plus today's date.

_Note: you don't have to use an external JSON file. It's also valid to create the `pkg` object inline in the config. That being said, if you already have a JSON file, you might as well reference it._

```js
// Project configuration.
grunt.initConfig({
  pkg: grunt.file.readJSON('package.json'),
  uglify: {
    options: {
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> */'
    },
    my_target: {
      files: {
        'dest/output.min.js': ['src/input.js']
      }
    }
  }
});
```

#### Conditional compilation

You can also enable UglifyJS conditional compilation. This is commonly used to remove debug code blocks for production builds. This is equivalent to the command line `--define` option.

See [UglifyJS global definitions documentation](https://github.com/mishoo/UglifyJS2#conditional-compilation) for more information.

```js
// Project configuration.
grunt.initConfig({
  uglify: {
    options: {
      compress: {
        global_defs: {
          'DEBUG': false
        },
        dead_code: true
      }
    },
    my_target: {
      files: {
        'dest/output.min.js': ['src/input.js']
      }
    }
  }
});
```

#### Compiling all files in a folder dynamically

This configuration will compress and mangle the files dynamically.

```js
// Project configuration.
grunt.initConfig({
  uglify: {
    my_target: {
      files: [{
        expand: true,
        cwd: 'src/js',
        src: '**/*.js',
        dest: 'dest/js'
      }]
    }
  }
});
```

#### Compiling all files separately on the each their path

This configuration will compress and mangle all js files separately in each folder.

Also exclude jQuery for mangling and ignore all `*.min.js` files.

```js
// Project configuration.
uglify: {
  dev: {
    options: {
      mangle: {
        reserved: ['jQuery']
      }
    },
    files: [{
      expand: true,
      src: ['dist/assets/js/*.js', '!dist/assets/js/*.min.js'],
      dest: 'dist/assets',
      cwd: '.',
      rename: function (dst, src) {
        // To keep the source js files and make new files as `*.min.js`:
        // return dst + '/' + src.replace('.js', '.min.js');
        // Or to override to src:
        return src;
      }
    }]
  }
},
```

#### Turn on object property name mangling

This configuration will turn on object property name mangling, but not mangle built-in browser object properties.
Additionally, variables and object properties listed in the `myExceptionsFile.json` will be mangled. For more info,
on the format of the exception file format please see the [UglifyJS docs](https://www.npmjs.com/package/uglify-js).

```js
// Project configuration.
grunt.initConfig({
  uglify: {
    options: {
      mangle: {
        properties: true
      },
      reserveDOMCache: true,
      exceptionsFiles: [ 'myExceptionsFile.json' ]
    },
    my_target: {
      files: {
        'dest/output.min.js': ['src/input.js']
      }
    }
  }
});
```

#### Turn on use of name mangling cache

Turn on use of name mangling cache to coordinate mangled symbols between outputted uglify files. uglify will the
generate a JSON cache file with the name provided in the options. Note: this generated file uses the same JSON format
as the `exceptionsFiles` files.

```js
// Project configuration.
grunt.initConfig({
  uglify: {
    options: {
      nameCache: '.tmp/grunt-uglify-cache.json',
    },
    my_target: {
      files: {
        'dest/output1.min.js': ['src/input1.js'],
        'dest/output2.min.js': ['src/input2.js']
      }
    }
  }
});
```


## Release History

 * 2018-08-26   v4.0.0   Update dependencies. Requires Node.js >= 6.
 * 2018-07-29   v3.4.0   Update uglify-js to v3.4.0.
 * 2017-12-24   v3.3.0   Update uglify-js to v3.3.0.
 * 2017-11-26   v3.2.1   Update uglify-js to v3.2.0.
 * 2017-09-11   v3.1.0   Update uglify-js to v3.1.0.
 * 2017-05-20   v3.0.1   Fix toplevel option.
 * 2017-05-12   v3.0.0   Update uglify-js to v3.0.4.
 * 2017-04-05   v2.3.0   Make CLI output less verbose.
 * 2017-03-31   v2.2.1   Fix banner option.
 * 2017-03-01   v2.2.0   Update uglify-js to v2.8.3.
 * 2017-02-08   v2.1.0   Show size changes in output. Switch to `object.assign`.
 * 2016-07-19   v2.0.0   Update uglify-js to v2.7.0. `screwIE8` is enabled by default.
 * 2016-07-19   v1.0.2   Update grunt to ^1.0.0. Fix `beautify` when passed as an object. Fix docs about `report` values.
 * 2016-03-16   v1.0.1   Downgrade maxmin for Node.js 0.10.
 * 2016-03-04   v1.0.0   Use uglify-js ~2.6.2 to fix sourcemap issue. Improve docs for `global-defs` and `--define` options. Add `sourceMapUrl` option. Add `bare_returns` option. Optionally set report verbosity level using report option.
 * 2016-01-29   v0.11.1   Update lodash to ^4.0.1. Update grunt-contrib-clean to ^0.7.0. Update grunt-contrib-jshint to ^0.12.0.
 * 2015-11-20   v0.11.0   Update uglify-js to ~2.6.0.
 * 2015-11-12   v0.10.1   Update uglify-js to ~2.5.
 * 2015-10-27   v0.10.0   Update uglify-js to ^2.5.
 * 2015-08-24   v0.9.2   Update uglify-js to ^2.4.24
 * 2015-04-07   v0.9.1   More fixes for `mangle` options.
 * 2015-04-07   v0.9.0   Add hook into uglify-js's mangling functionality.
 * 2015-03-30   v0.8.1   Lock uglify-js to 2.4.17 due to breaking changes.
 * 2015-02-19   v0.8.0   Add `screwIE8` option. Fix issue with explicit `compress` in Node.js 0.12.0.
 * 2014-12-23   v0.7.0   Add `sourceMapRoot` options. Update readme descriptions. Remove reference to clean-css.
 * 2014-09-17   v0.6.0   Output fixes. Add `ASCIIOnly` option. Other fixes.
 * 2014-07-25   v0.5.1   Update chalk to ^0.5.1. Output updates.
 * 2014-03-01   v0.4.0   Remove grunt-lib-contrib dependency and add more colors.
 * 2014-02-27   v0.3.3   Remove unnecessary calls to `grunt.template.process`.
 * 2014-01-22   v0.3.2   Fix handling of `sourceMapIncludeSources` option.
 * 2014-01-20   v0.3.1   Fix relative path issue in sourcemaps.
 * 2014-01-16   v0.3.0   Refactor sourcemap support.
 * 2013-11-09   v0.2.7   Prepend banner if `sourceMap` option not set, addresses #109.
 * 2013-11-08   v0.2.6   Merge #45, #53, #85 (#105 by way of duping #53). Add support for banners in uglified files with sourcemaps. Update docs.
 * 2013-10-28   v0.2.5   Add warning for banners when using sourcemaps.
 * 2013-09-02   v0.2.4   Update sourcemap format via #83.
 * 2013-06-10   v0.2.3   Add `footer` option.
 * 2013-05-31   v0.2.2   Revert #56 due to #58 until [chrome/239660](https://code.google.com/p/chromium/issues/detail?id=239660&q=sourcemappingurl&colspec=ID%20Pri%20M%20Iteration%20ReleaseBlock%20Cr%20Status%20Owner%20Summary%20OS%20Modified) [firefox/870361](https://bugzilla.mozilla.org/show_bug.cgi?id=870361) drop.
 * 2013-05-22   v0.2.1   Update uglify-js to ~2.3.5 #55 #40. Change `sourcemappingUrl` syntax #56. Disable sorting of names for consistent mangling #44. Update docs for `sourceMapRoot` #47 #25.
 * 2013-03-14   v0.2.0   No longer report gzip results by default. Support `report` option.
 * 2013-01-30   v0.1.2   Add better error reporting. Support for dynamic names of multiple sourcemaps.
 * 2013-02-15   v0.1.1   First official release for Grunt 0.4.0.
 * 2013-01-18   v0.1.1rc6   Update grunt/gruntplugin dependencies to rc6. Change in-development grunt/gruntplugin dependency versions from tilde version ranges to specific versions.
 * 2013-01-09   v0.1.1rc5   Update to work with grunt v0.4.0rc5. Switch back to `this.files` API.
 * 2012-11-28   v0.1.0   Work in progress, not officially released yet.

---

Task submitted by ["Cowboy" Ben Alman](http://benalman.com)

*This file was generated on Sun Aug 26 2018 09:22:15.*
