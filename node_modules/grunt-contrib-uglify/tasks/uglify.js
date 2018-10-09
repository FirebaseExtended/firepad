/*
 * grunt-contrib-uglify
 * https://gruntjs.com/
 *
 * Copyright (c) 2016 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var chalk = require('chalk');
var maxmin = require('maxmin');
var uriPath = require('uri-path');
var err;

// Return the relative path from file1 => file2
function relativePath(file1, file2) {
  var file1Dirname = path.dirname(file1);
  var file2Dirname = path.dirname(file2);

  if (file1Dirname !== file2Dirname) {
    return path.relative(file1Dirname, file2Dirname);
  }
  return '';
}

// Converts \r\n to \n
function normalizeLf(string) {
  return string.replace(/\r\n/g, '\n');
}

module.exports = function(grunt) {
  // Internal lib.
  var uglify = require('./lib/uglify').init(grunt);

  var getAvailableFiles = function (filesArray) {
    return filesArray.filter(function (filepath) {
      if (!grunt.file.exists(filepath)) {
        grunt.log.warn('Source file ' + chalk.cyan(filepath) + ' not found');
        return false;
      }
      return true;
    });
  };

  grunt.registerMultiTask('uglify', 'Minify files with UglifyJS.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      banner: '',
      footer: '',
      compress: {},
      mangle: {},
      beautify: false,
      report: 'min',
      ie8: false
    });

    var footer = normalizeLf(options.footer);
    var mapNameGenerator, mapInNameGenerator;
    var created = {
      maps: 0,
      files: 0
    };
    var size = {
      before: 0,
      after: 0
    };
    var generateSourceMapURL = options.sourceMap && !options.sourceMap.url;
    var generateSourceMapFilename = options.sourceMap && !options.sourceMap.filename;

    // function to get the name of the sourceMap
    if (typeof options.sourceMapName === 'function') {
      mapNameGenerator = options.sourceMapName;
    }

    // Iterate over all src-dest file pairs.
    this.files.forEach(function (f) {
      var availableFiles = getAvailableFiles(f.src);

      if (availableFiles.length === 0) {
        grunt.log.warn('Destination ' + chalk.cyan(f.dest) + ' not written because src files were empty.');
        return;
      }

      // function to get the name of the sourceMapIn file
      if (typeof options.sourceMapIn === 'function') {
        if (availableFiles.length !== 1) {
          grunt.fail.warn('Cannot generate `sourceMapIn` for multiple source files.');
        }
        mapInNameGenerator = options.sourceMapIn;
      }

      // dynamically create destination sourcemap name
      if (mapNameGenerator) {
        try {
          options.generatedSourceMapName = mapNameGenerator(f.dest);
        } catch (e) {
          err = new Error('SourceMap failed.');
          err.origError = e;
          grunt.fail.warn(err);
        }
      // If no name is passed append .map to the filename
      } else if (!options.sourceMapName) {
        options.generatedSourceMapName = f.dest + '.map';
      } else {
        options.generatedSourceMapName = options.sourceMapName;
      }

      // Dynamically create incoming sourcemap names
      if (mapInNameGenerator) {
        try {
          options.sourceMapIn = mapInNameGenerator(availableFiles[0]);
        } catch (e) {
          err = new Error('SourceMapInName failed.');
          err.origError = e;
          grunt.fail.warn(err);
        }
      }

      if (options.sourceMap) {
        if (typeof options.sourceMap !== 'object') {
          options.sourceMap = {};
        }
        if (options.sourceMapIn) {
          options.sourceMap.content = grunt.file.read(options.sourceMapIn);
        }
        // Calculate the path from the dest file to the sourcemap for sourceMap.url
        if (generateSourceMapURL) {
          if (generateSourceMapFilename) {
            options.sourceMap.filename = path.basename(f.dest);
          }
          var destToSourceMapPath = relativePath(f.dest, options.generatedSourceMapName);
          var sourceMapBasename = path.basename(options.generatedSourceMapName);
          options.sourceMap.url = uriPath(path.join(destToSourceMapPath, sourceMapBasename));
        }
      }

      // Minify files, warn and fail on error.
      var result;
      try {
        result = uglify.minify(availableFiles, f.dest, options);
      } catch (e) {
        console.log(e);
        err = new Error('Uglification failed.');
        if (e.message) {
          err.message += '\n' + e.message + '. \n';
          if (e.line) {
            err.message += 'Line ' + e.line + ' in ' + availableFiles + '\n';
          }
        }
        err.origError = e;
        grunt.log.warn('Uglifying source ' + chalk.cyan(availableFiles) + ' failed.');
        grunt.fail.warn(err);
      }

      // Concat minified source + footer
      var output = result.min + footer;

      var unCompiledJSString = availableFiles.map(function (file) {
        return grunt.file.read(file);
      }).join('');

      // Write the destination file.
      grunt.file.write(f.dest, output);

      size.before += unCompiledJSString.length;

      // Write source map
      if (options.sourceMap) {
        grunt.file.write(options.generatedSourceMapName, result.sourceMap);
        grunt.verbose.writeln('File ' + chalk.cyan(options.generatedSourceMapName) + ' created (source map).');
        created.maps++;
      }

      var outputSize = maxmin(result.max, output, options.report === 'gzip');
      grunt.verbose.writeln('File ' + chalk.cyan(f.dest) + ' created: ' + chalk.dim(outputSize));

      created.files++;
      size.after += output.length;
    });

    if (created.maps > 0) {
      grunt.log.ok(created.maps + ' source' + grunt.util.pluralize(created.maps, 'map/maps') + ' created.');
    }

    if (created.files > 0) {
      grunt.log.ok(created.files + ' ' + grunt.util.pluralize(this.files.length, 'file/files') + ' created ' + chalk.dim(maxmin(size.before, size.after)));
    } else {
      grunt.log.warn('No files created.');
    }
  });
};
