const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
// const TerserPlugin = require('terser-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')

const appConfig = require('./config/appConfig.json');
const prod = process.env.NODE_ENV !== 'development';

module.exports = {
  target: 'web',
  entry: './client.js',
  mode: process.env.NODE_ENV || 'production',
  output: {
    globalObject: 'this',
    path: path.resolve(__dirname, 'public'),
    filename: appConfig.name + '.client.bundle.js',
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
    new webpack.DefinePlugin({
      'process.env': {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new MiniCssExtractPlugin({
      filename: appConfig.name + ".[name].style.css",
      chunkFilename: appConfig.name + ".[name].css"
    }),
    !prod && new BrowserSyncPlugin(
      {
        proxy: 'http://localhost:62099',
        port: 3005,
        files: ['public/**'],
        reloadDelay: 1500,
        online: true
      }
    )
  ],
  optimization: {},
};
