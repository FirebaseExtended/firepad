module.exports = function (grunt) {
  grunt.initConfig({
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
          "lib/text-op.js",
          "lib/text-operation.js",
          "lib/cursor.js",
          "lib/firebase-adapter.js",
          "lib/wrapped-operation.js",
          "lib/undo-manager.js",
          "lib/client.js",
          "lib/editor-client.js",
          "lib/rich-text-codemirror.js",
          "lib/rich-text-codemirror-adapter.js",
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
    watch: {
      files: ['lib/*.js'],
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

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');

  // Tasks
  grunt.registerTask('test', ['karma:unit']);
  grunt.registerTask('build', ['concat', 'uglify'])
  grunt.registerTask('default', ['build', 'test']);
};
