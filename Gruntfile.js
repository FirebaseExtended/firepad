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
          "lib/codemirror-adapter.js",
          "lib/rich-text-codemirror.js",
          "lib/rich-text-codemirror-adapter.js",
          "lib/firepad.js"
        ],
        "dest": "build/firepad.js"
      },
      "firepad-userlistjs": {
        options: {
          banner: "var FirepadUserList = (function() {\n",
          footer: "\nreturn firepad.UserList; })();"
        },
        "src": [
          "lib/utils.js",
          "lib/user-list.js"
        ],
        "dest": "build/extras/firepad-userlist.js"
      }
    },
    uglify: {
      "firepad-min-js": {
        src: "build/firepad.js",
        dest: "build/firepad-min.js"
      },
      "firepad-userlist-min-js": {
        src: "build/extras/firepad-userlist.js",
        dest: "build/extras/firepad-userlist-min.js"
      }
    },
    copy: {
      all: {
        files: [
          {
            src: 'lib/firepad.css',
            dest: 'build/firepad.css'
          },
          {
            src: 'lib/firepad-userlist.css',
            dest: 'build/extras/firepad-userlist.css'
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['concat', 'uglify', 'copy']);
};

