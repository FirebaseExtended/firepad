module.exports = function(config) {
  config.set({
    singleRun: false,
    frameworks: ["jasmine"],
    browsers: ["PhantomJS"],

    preprocessors: {
      "../lib/*.js": "coverage"
    },

    reporters: ["spec", "failed", "coverage"],
    coverageReporter: {
      reporters: [
        {
          type: "lcovonly",
          dir: "coverage",
          subdir: "."
        },
        {
          type: "text-summary"
        }
      ]
    },

    browserNoActivityTimeout: 30000,

    files: [
      "../bower_components/codemirror/lib/codemirror.js",
      "../bower_components/firebase/firebase.js",

      "../lib/utils.js",
      "../lib/text-op.js",
      "../lib/text-operation.js",
      "../lib/cursor.js",
      "../lib/firebase-adapter.js",
      "../lib/wrapped-operation.js",
      "../lib/undo-manager.js",
      "../lib/client.js",
      "../lib/editor-client.js",
      "../lib/rich-text-codemirror.js",
      "../lib/rich-text-codemirror-adapter.js",
      "../lib/firepad.js",

      "specs/helpers.js",
      "specs/*.spec.js"
    ]
  });
};
