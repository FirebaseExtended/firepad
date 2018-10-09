fs = require 'fs'
glob = require 'glob'
path = require 'path'
browserify = require 'browserify'
CoffeeScript = require 'coffee-script'
{ exec } = require 'child_process'

copySync = (src, dest) ->
    fs.writeFileSync dest, fs.readFileSync(src)

coffeeSync = (input, output) ->
    coffee = fs.readFileSync(input).toString()
    fs.writeFileSync output, CoffeeScript.compile(coffee)

task 'compile', 'Compile Coffeelint', ->
    console.log 'Compiling Coffeelint...'
    fs.mkdirSync 'lib' unless fs.existsSync 'lib'
    invoke 'compile:browserify'
    invoke 'compile:commandline'

task 'compile:commandline', 'Compiles commandline.js', ->
    coffeeSync 'src/commandline.coffee', 'lib/commandline.js'
    coffeeSync 'src/configfinder.coffee', 'lib/configfinder.js'
    coffeeSync 'src/cache.coffee', 'lib/cache.js'
    coffeeSync 'src/ruleLoader.coffee', 'lib/ruleLoader.js'
    fs.mkdirSync 'lib/reporters' unless fs.existsSync 'lib/reporters'
    for src in glob.sync('reporters/*.coffee', { cwd: 'src' })
        # Slice the "coffee" extension of the end and replace with js
        dest = src[...-6] + 'js'
        coffeeSync "src/#{src}", "lib/#{dest}"

task 'compile:browserify', 'Uses browserify to compile coffeelint', ->
    opts =
        standalone: 'coffeelint'
    b = browserify(opts)
    b.add [ './src/coffeelint.coffee' ]
    b.transform require('coffeeify')
    b.bundle().pipe fs.createWriteStream('lib/coffeelint.js')

task 'prepublish', 'Prepublish', ->
    { npm_config_argv } = process.env
    if npm_config_argv? and JSON.parse(npm_config_argv).original[0] is 'install'
        return

    copySync 'package.json', '.package.json'
    packageJson = require './package.json'

    delete packageJson.dependencies.browserify
    delete packageJson.dependencies.coffeeify
    delete packageJson.scripts.install

    fs.writeFileSync 'package.json', JSON.stringify(packageJson, undefined, 2)

    invoke 'compile'

task 'postpublish', 'Postpublish', ->
    # Revert the package.json back to it's original state
    exec 'git checkout ./package.json', (err) ->
      if err
        console.error('Error reverting package.json: ' + err)

task 'publish', 'publish', ->
    copySync '.package.json', 'package.json'

task 'install', 'Install', ->
    unless require("fs").existsSync("lib/commandline.js")
        invoke 'compile'
