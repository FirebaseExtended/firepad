/*
 * grunt-karma
 * https://github.com/karma-runner/grunt-karma
 *
 * Copyright (c) 2013 Dave Geddes
 * Licensed under the MIT license.
 */

var runner = require('karma').runner
var Server = require('karma').Server
var path = require('path')
var _ = require('lodash')

function finished (code) {
  return this(code === 0)
}

// Parse out all cli arguments in the form of `--arg=something` or
// `-c=otherthing` and return the array.
function parseArgs (args) {
  return _.filter(args, function (arg) {
    return arg.match(/^--?/)
  })
}

module.exports = function (grunt) {
  grunt.registerMultiTask('karma', 'run karma.', function () {
    var done = this.async()
    var options = this.options({
      background: false,
      client: {}
    })

    // Allow for passing cli arguments to `client.args` using  `--grep=x`
    var args = parseArgs(process.argv.slice(2))
    if (options.client && _.isArray(options.client.args)) {
      args = options.client.args.concat(args)
    }

    // If arguments are provided we pass them to karma
    if (args.length > 0) {
      if (!options.client) {
        options.client = {}
      }
      options.client.args = args
    }

    // Only create client info if data is provided
    if (options.client) {
      // Merge karma default options
      _.defaults(options.client, {
        args: []
      })
    }

    var opts = _.cloneDeep(options)
    // Merge options onto data, with data taking precedence.
    var data = _.merge(opts, this.data)

    // But override the browsers array.
    if (data.browsers && this.data.browsers) {
      data.browsers = this.data.browsers
    }

    // Merge client.args
    if (this.data.client && _.isArray(this.data.client.args)) {
      data.client.args = this.data.client.args.concat(options.client.args)
    }

    if (data.configFile) {
      data.configFile = path.resolve(data.configFile)
    }

    // Combines both sets of files. The order should be:
    // - first, values from options.files,
    // - then, values from this.files.
    if (options.files || this.files.length) {
      // For our 'files' option, we support arbitrarily nested arrays,
      // as a convenient way to specify files without the user needing to
      // concat or flatten anything within their Gruntfile.
      data.files = _.flattenDeep(options.files || [])
      // The 'files' task data expanded by Grunt internally produces
      // a structure that is exactly 2 levels deep.
      this.files.forEach((file) => {
        file.src.forEach((src) => {
          let obj = {
            pattern: src
          };
          ['watched', 'served', 'included'].forEach((opt) => {
            if (opt in file) {
              obj[opt] = file[opt]
            }
          })
          data.files.push(obj)
        })
      })
    }

    // Allow the use of templates in preprocessors
    if (_.isPlainObject(data.preprocessors)) {
      var preprocessors = {}
      Object.keys(data.preprocessors).forEach(function (key) {
        var value = data.preprocessors[key]
        if (options.basePath) {
          key = path.join(options.basePath, key)
        }
        key = path.resolve(key)
        key = grunt.template.process(key)
        preprocessors[key] = value
      })
      data.preprocessors = preprocessors
    }

    // support `karma run`, useful for grunt watch
    if (this.flags.run) {
      runner.run(data, finished.bind(done))
      return
    }

    // allow karma to be run in the background so it doesn't block grunt
    if (data.background) {
      var backgroundProcess = require('child_process').fork(
        path.join(__dirname, '..', 'lib', 'background.js')
      )

      backgroundProcess.on('close', function (code) {
        var error = code
        if (error) {
          grunt.log.error('background karma process exited with error (code: ' + code + ')')
        }
      })

      process.on('exit', function () {
        backgroundProcess.kill()
      })

      backgroundProcess.send({ config: data })
      done()
    } else {
      var server = new Server(data, finished.bind(done))
      server.start()
    }
  })
}
