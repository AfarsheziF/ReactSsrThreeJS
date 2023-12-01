const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const nodeExternals = require('webpack-node-externals');

const appConfig = require('./config/appConfig.json');

module.exports = {
  target: 'node',
  entry: './server.js',
  mode: process.env.NODE_ENV || 'production',
  externals: [nodeExternals()], //only backend side
  output: {
    globalObject: 'this',
    path: path.resolve(__dirname, 'public'),
    filename: appConfig.name + '.server.bundle.js',
    publicPath: '/',
  },
  resolve: {
    fallback: {
      fs: false,
    },
    alias: {
      Images: path.resolve(__dirname, 'public/images'),
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.s?[ac]ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { url: false, sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } }
        ],
      },
      // {
      //   test: /\.svg$/i,
      //   type: 'asset/inline',
      // },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: [/url/] }, // exclude react component if *.svg?url
        use: ['@svgr/webpack'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin(JSON.stringify(process.env)),
    new MiniCssExtractPlugin({
      filename: appConfig.name + ".[name].style.css",
      chunkFilename: appConfig.name + ".[name].css"
    }),
    new webpack.SourceMapDevToolPlugin({
      // filename: 'server.[name].js.map'
    }),
  ],
};