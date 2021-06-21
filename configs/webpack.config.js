const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "production",
  context: path.resolve(__dirname, "../"),
  target: "web",
  entry: {
    firepad: ["./lib/firepad-classic.js"],
  },
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "firepad.min.js",
    library: {
      name: "Firepad",
      type: "global",
      export: "default",
    },
  },
  externals: {
    "monaco-editor": {
      root: "monaco",
      commonjs: "monaco-editor",
      commonjs2: "monaco-editor",
      amd: "monaco-editor",
    },
    "firebase/app": {
      root: "firebase.app",
      commonjs: "firebase/app",
      commonjs2: "firebase/app",
      amd: "firebase/app",
    },
    "firebase/database": {
      root: "firebase.database",
      commonjs: "firebase/database",
      commonjs2: "firebase/database",
      amd: "firebase/database",
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [path.resolve(__dirname, "../lib")],
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: "[file].map",
    }),
  ],
};
