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
            '/*',
            ' * Firepad http://www.firepad.io/',
            ' *',
            ' * Copyright 2013 Firebase',
            ' * with code from ot.js (Copyright 2012-2013 Tim Baumann)',
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
          "lib/attribute-constants.js",
          "lib/entity-manager.js",
          "lib/entity.js",
          "lib/rich-text-codemirror.js",
          "lib/rich-text-codemirror-adapter.js",
          "lib/formatting.js",
          "lib/text.js",
          "lib/line-formatting.js",
          "lib/line.js",
          "lib/parse-html.js",
          "lib/firepad.js"
        ],
        "dest": "dist/firepad.js"
      }
    },
    uglify: {
      "firepad-min-js": {
        src: "dist/firepad.js",
        dest: "dist/firepad-min.js"
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
          }
        ]
      }
    },
    compress: {
      zip: {
        options: {
          archive: 'dist/firepad.zip',
        },
        files: [
          {
            cwd: 'dist/',
            expand: true,
            src: ['firepad.js', 'firepad.css', 'firepad-min.js', 'firepad.eot' ],
            dest: './'
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('default', ['coffeelint', 'coffee', 'concat', 'uglify', 'copy', 'compress']);
};
