/*
 * grunt-contrib-uglify
 * https://gruntjs.com/
 *
 * Copyright (c) 2017 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

// External libs.
var path = require('path');
var UglifyJS = require('uglify-js');
var uriPath = require('uri-path');
var domprops = require('uglify-js/tools/domprops');

// Converts \r\n to \n
function normalizeLf(string) {
  return string.replace(/\r\n/g, '\n');
}

function toCache(cache, key) {
  if (cache[key]) {
    cache[key].props = UglifyJS.Dictionary.fromObject(cache[key].props);
  } else {
    cache[key] = {
      cname: -1,
      props: new UglifyJS.Dictionary()
    };
  }
  return cache[key];
}

exports.init = function(grunt) {
  var exports = {};

  // Minify with UglifyJS.
  // From https://github.com/mishoo/UglifyJS2
  exports.minify = function(files, dest, options) {
    options = options || {};

    grunt.verbose.write('Minifying with UglifyJS...');

    var totalCode = '';
    var minifyOptions = {
      compress: options.compress,
      ie8: options.ie8,
      keep_fnames: options.keep_fnames,
      mangle: options.mangle,
      output: options.output || {},
      parse: options.parse || {},
      sourceMap: options.sourceMap,
      toplevel: options.toplevel,
      wrap: options.wrap
    };

    if (options.banner) {
      minifyOptions.output.preamble = normalizeLf(options.banner);
    }

    if (options.beautify) {
      minifyOptions.output.beautify = true;
      for (var key in options.beautify) {
        minifyOptions.output[key] = options.beautify[key];
      }
    }

    var cache;
    if (options.nameCache) {
      try {
        cache = JSON.parse(grunt.file.read(options.nameCache));
      } catch (ex) {
        cache = {};
      }
    }

    if (minifyOptions.mangle) {
      if (typeof minifyOptions.mangle !== 'object') {
        minifyOptions.mangle = {};
      }
      if (cache) {
        minifyOptions.mangle.cache = toCache(cache, 'vars');
      }
      if (!Array.isArray(minifyOptions.mangle.reserved)) {
        minifyOptions.mangle.reserved = [];
      }
      if (minifyOptions.mangle.properties) {
        if (typeof minifyOptions.mangle.properties !== 'object') {
          minifyOptions.mangle.properties = {};
        }
        if (cache) {
          minifyOptions.mangle.properties.cache = toCache(cache, 'props');
        }
        if (!Array.isArray(minifyOptions.mangle.properties.reserved)) {
          minifyOptions.mangle.properties.reserved = [];
        }
        if (options.reserveDOMProperties) {
          domprops.forEach(function(name) {
            UglifyJS.push_uniq(minifyOptions.mangle.properties.reserved, name);
          });
        }
      }
      if (options.exceptionsFiles) {
        options.exceptionsFiles.forEach(function(file) {
          try {
            var obj = JSON.parse(grunt.file.read(file));
            if (minifyOptions.mangle && obj.vars) {
              obj.vars.forEach(function(name) {
                UglifyJS.push_uniq(minifyOptions.mangle.reserved, name);
              });
            }
            if (minifyOptions.mangle.properties && obj.props) {
              obj.props.forEach(function(name) {
                UglifyJS.push_uniq(minifyOptions.mangle.properties.reserved, name);
              });
            }
          } catch (ex) {
            grunt.warn(ex);
          }
        });
      }
    }

    var result = UglifyJS.minify(files.reduce(function(o, file) {
      var code = grunt.file.read(file);
      totalCode += code;

      // The src file name must be relative to the source map for things to work
      var basename = path.basename(file);
      var fileDir = path.dirname(file);
      var sourceMapDir = path.dirname(options.generatedSourceMapName);
      var relativePath = path.relative(sourceMapDir, fileDir);
      var pathPrefix = relativePath ? relativePath + path.sep : '';

      // Convert paths to use forward slashes for sourcemap use in the browser
      o[uriPath(pathPrefix + basename)] = code;
      return o;
    }, {}), minifyOptions);
    if (result.error) {
      throw result.error;
    }

    if (options.nameCache) {
      grunt.file.write(options.nameCache, JSON.stringify(cache, function(key, value) {
        return value instanceof UglifyJS.Dictionary ? value.toObject() : value;
      }));
    }

    grunt.verbose.ok();

    return {
      max: totalCode,
      min: result.code,
      sourceMap: result.map
    };
  };

  return exports;
};
