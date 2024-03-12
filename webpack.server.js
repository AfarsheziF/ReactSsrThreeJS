const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const nodeExternals = require('webpack-node-externals');
const ESLintPlugin = require('eslint-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const appConfig = require('./config/appConfig.json');
const prod = process.env.NODE_ENV !== 'development';

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
      Fonts: path.resolve(__dirname, 'public/fonts'),
      vendor_mods: path.resolve(__dirname, 'vendor_mods')
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
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: [/url/] }, // exclude react component if *.svg?url
        use: ['@svgr/webpack'],
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: ['raw-loader', 'glslify-loader']
      }
    ],
  },
  plugins: [
    new webpack.DefinePlugin(JSON.stringify(process.env)),
    new ESLintPlugin({
      failOnError: !prod,
      emitWarning: prod,
    }),
    new MiniCssExtractPlugin({
      filename: appConfig.name + ".[name].style.css",
      chunkFilename: appConfig.name + ".[name].css"
    }),
    new webpack.SourceMapDevToolPlugin({
      // filename: 'server.[name].js.map'
    }),
    // new BundleAnalyzerPlugin()
  ],
};