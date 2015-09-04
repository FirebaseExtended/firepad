module.exports = function(config) {
  config.set({
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
      "./vendor/ace-1.2.0.js",

      "../lib/utils.js",
      "../lib/span.js",
      "../lib/text-op.js",
      "../lib/text-operation.js",
      "../lib/annotation-list.js",
      "../lib/cursor.js",
      "../lib/firebase-adapter.js",
      "../lib/rich-text-toolbar.js",
      "../lib/wrapped-operation.js",
      "../lib/undo-manager.js",
      "../lib/client.js",
      "../lib/editor-client.js",
      "../lib/ace-adapter.js",
      "../lib/constants.js",
      "../lib/entity-manager.js",
      "../lib/entity.js",
      "../lib/rich-text-codemirror.js",
      "../lib/rich-text-codemirror-adapter.js",
      "../lib/formatting.js",
      "../lib/text.js",
      "../lib/line-formatting.js",
      "../lib/line.js",
      "../lib/parse-html.js",
      "../lib/serialize-html.js",
      "../lib/text-pieces-to-inserts.js",
      "../lib/headless.js",
      "../lib/firepad.js",

      "specs/helpers.js",
      "specs/*.spec.js"
    ]
  });
};
