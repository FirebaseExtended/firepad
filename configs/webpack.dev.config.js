const path = require("path");
const webpack = require("webpack");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

const fbConfig = require("./firebase.json");

module.exports = (env, argv) => {
  const mode = argv.mode || "development";
  const port = argv.port || 9000;
  const host = argv.host || "0.0.0.0";

  return {
    mode,
    context: path.resolve(__dirname, "../"),
    target: "web",
    entry: "./examples/firepad-monaco-example.ts",
    output: {
      clean: true,
      filename: "firepad.js",
      path: path.resolve(__dirname, "../examples"),
    },
    devServer: {
      host,
      port,
      hotOnly: true,
      publicPath: `${host}:${port}/examples`,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "X-Requested-With, content-type, Authorization",
      },
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"],
    },
    stats: {
      children: !!process.env.VERBOSE,
      errorDetails: !!process.env.VERBOSE,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    modules: false,
                    useBuiltIns: "usage",
                    corejs: "3.11",
                  },
                ],
                "@babel/preset-typescript",
              ],
              plugins: [
                "@babel/plugin-proposal-class-properties",
                "@babel/proposal-object-rest-spread",
              ],
            },
          },
        },
        {
          test: /\.js$/,
          use: ["source-map-loader"],
          enforce: "pre",
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(html|ttf)$/,
          use: "file?name=[name].[ext]",
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.FIREBASE_CONFIG": JSON.stringify(fbConfig),
      }),
      new MonacoWebpackPlugin(),
      new webpack.HotModuleReplacementPlugin(),
    ],
  };
};
