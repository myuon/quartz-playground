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
  entry: "./src/index.tsx",
  module: {
    rules: [
      {
        test: /\.(tsx?|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/env"],
              [
                "@babel/typescript",
                {
                  jsxPragma: "h",
                },
              ],
              [
                "@babel/react",
                {
                  pragma: "h",
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
              importLoaders: 1,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [require("postcss-nested")],
              },
            },
          },
        ],
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
          hot: true,
        }
      : undefined,
  devtool: mode === "development" ? "inline-source-map" : undefined,
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new webpack.ProvidePlugin({
      h: ["preact", "h"],
    }),
    new NodePolyfillPlugin(),
  ],
};
