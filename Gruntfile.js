module.exports = function (grunt) {
  grunt.initConfig({
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
          /*"lib/codemirror-adapter.js",*/
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
      },
      toExamples: {
        files: [
          {
            src: 'dist/firepad.js',
            dest: 'examples/firepad.js'
          },
          {
            src: 'dist/firepad.css',
            dest: 'examples/firepad.css'
          },
          {
            src: 'dist/firepad.eot',
            dest: 'examples/firepad.eot'
          },
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

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('default', ['concat', 'uglify', 'copy', 'compress']);
};