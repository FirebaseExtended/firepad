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
            'var Firepad = (function() {\n'
          ].join('\n'),
          footer: "\nreturn firepad.Firepad; })();"
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
          "lib/codemirror-adapter.js",
          "lib/ace-adapter.js",
          "lib/attribute-constants.js",
          "lib/entity-manager.js",
          "lib/entity.js",
          /*"lib/rich-text-codemirror.js",
          "lib/rich-text-codemirror-adapter.js",*/
          "lib/formatting.js",
          "lib/text.js",
          "lib/line-formatting.js",
          "lib/line.js",
          "lib/parse-html.js",
          "lib/firepad.js"
        ],
        "dest": "build/firepad.js"
      }
    },
    uglify: {
      "firepad-min-js": {
        src: "build/firepad.js",
        dest: "build/firepad-min.js"
      }
    },
    copy: {
      toBuild: {
        files: [
          {
            src: 'font/firepad.eot',
            dest: 'build/firepad.eot'
          },
          {
            src: 'lib/firepad.css',
            dest: 'build/firepad.css'
          }
        ]
      },
      toExamples: {
        files: [
          {
            src: 'build/firepad.js',
            dest: 'examples/firepad.js'
          },
          {
            src: 'build/firepad.css',
            dest: 'examples/firepad.css'
          },
          {
            src: 'build/firepad.eot',
            dest: 'examples/firepad.eot'
          },
        ]
      }
    },
    compress: {
      zip: {
        options: {
          archive: 'build/firepad.zip',
        },
        files: [
          {
            cwd: 'build/',
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

