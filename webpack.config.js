const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const mode = process.env.NODE_ENV || "development";

/**
 * @type {webpack.Configuration}
 */
module.exports = {
  mode,
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  devServer:
    mode === "development"
      ? {
          static: "./dist",
        }
      : undefined,
  devtool: mode === "development" ? "inline-source-map" : undefined,
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new NodePolyfillPlugin(),
  ],
};
