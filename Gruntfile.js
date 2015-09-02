module.exports = function (grunt) {
  grunt.initConfig({
    coffeelint: {
      app: ['lib/*.coffee'],
      options: {
        max_line_length: {
          level: 'ignore'
        },
        line_endings: {
          value: "unix",
          level: "error"
        },
        no_trailing_semicolons: {
          level: "ignore"
        }
      }
    },
    coffee: {
      compile: {
        files: [{
          expand: true,         // Enable dynamic expansion.
          cwd: 'lib/',          // Src matches are relative to this path.
          src: ['**/*.coffee'], // Actual pattern(s) to match.
          dest: 'lib/',         // Destination path prefix.
          ext: '.js'            // Dest filepaths will have this extension.
        }],
        options: {
          bare: true            // Skip surrounding IIFE in compiled output.
        }
      }
    },
    concat: {
      "firepadjs": {
        options: {
          banner: [
            '/*!',
            ' * Firepad is an open-source, collaborative code and text editor. It was designed',
            ' * to be embedded inside larger applications. Since it uses Firebase as a backend,',
            ' * it requires no server-side code and can be added to any web app simply by',
            ' * including a couple JavaScript files.',
            ' *',
            ' * Firepad 0.0.0',
            ' * http://www.firepad.io/',
            ' * License: MIT',
            ' * Copyright: 2014 Firebase',
            ' * With code from ot.js (Copyright 2012-2013 Tim Baumann)',
            ' */\n',
            '(function (name, definition, context) {',
            '  //try CommonJS, then AMD (require.js), then use global.',
            '  if (typeof module != \'undefined\' && module.exports) module.exports = definition();',
            '  else if (typeof context[\'define\'] == \'function\' && context[\'define\'][\'amd\']) define(definition);',
            '  else context[name] = definition();',
            '})(\'Firepad\', function () {'
          ].join('\n'),
          footer: "\nreturn firepad.Firepad; }, this);"
        },
        "src": [
          "lib/utils.js",
          "lib/span.js",
          "lib/text-op.js",
          "lib/text-operation.js",
          "lib/annotation-list.js",
          "lib/cursor.js",
          "lib/firebase-adapter.js",
          "lib/rich-text-toolbar.js",
          "lib/wrapped-operation.js",
          "lib/undo-manager.js",
          "lib/client.js",
          "lib/editor-client.js",
          "lib/ace-adapter.js",
          "lib/constants.js",
          "lib/entity-manager.js",
          "lib/entity.js",
          "lib/rich-text-codemirror.js",
          "lib/rich-text-codemirror-adapter.js",
          "lib/formatting.js",
          "lib/text.js",
          "lib/line-formatting.js",
          "lib/line.js",
          "lib/parse-html.js",
          "lib/serialize-html.js",
          "lib/text-pieces-to-inserts.js",
          "lib/headless.js",
          "lib/firepad.js"
        ],
        "dest": "dist/firepad.js"
      }
    },
    uglify: {
      options: {
        preserveComments: "some"
      },
      "firepad-min-js": {
        src: "dist/firepad.js",
        dest: "dist/firepad.min.js"
      }
    },
    copy: {
      toBuild: {
        files: [
          {
            src: 'font/firepad.eot',
            dest: 'dist/firepad.eot'
          },
          {
            src: 'lib/firepad.css',
            dest: 'dist/firepad.css'
          },
        ]
      }
    },
    watch: {
      files: ['lib/*.js', 'lib/*.coffee', 'lib/*.css'],
      tasks: ['build']
    },

    // Unit tests
    karma: {
      options: {
        configFile: 'test/karma.conf.js',
      },
      unit: {
        autowatch: false,
        singleRun: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');

  // Tasks
  grunt.registerTask('test', ['karma:unit']);
  grunt.registerTask('build', ['coffeelint', 'coffee', 'concat', 'uglify', 'copy'])
  grunt.registerTask('default', ['build', 'test']);
};
