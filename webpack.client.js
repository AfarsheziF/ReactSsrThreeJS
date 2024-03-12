const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const appConfig = require('./config/appConfig.json');
const prod = process.env.NODE_ENV !== 'development';

module.exports = {
  target: 'web',
  entry: './client.js',
  mode: process.env.NODE_ENV || 'production',
  devtool: !prod && 'eval-source-map',
  // stats: 'minimal',
  output: {
    globalObject: 'this',
    path: path.resolve(__dirname, 'public'),
    filename: appConfig.name + '.client.bundle.js',
    publicPath: '/',
  },
  resolve: {
    fallback: {
      // Loading node modules from client
      fs: false,
      path: false,
      https: false
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
    new webpack.DefinePlugin({
      'process.env': {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      },
      '__DEV__': !prod
    }),
    new MiniCssExtractPlugin({
      filename: appConfig.name + ".[name].style.css",
      chunkFilename: appConfig.name + ".[name].css"
    }),
    new ESLintPlugin({
      failOnError: !prod,
      emitWarning: prod,
    }),
    !prod && new BrowserSyncPlugin(
      {
        proxy: 'http://localhost:62098',
        port: 3005,
        files: ['public/**'],
        reloadDelay: 1600,
        online: true
      }
    ),
    // new BundleAnalyzerPlugin()
  ],
  optimization: prod ? {
    nodeEnv: prod ? 'production' : 'development',
    removeAvailableModules: true,
    minimizer: [
      new TerserPlugin()
    ],
  } : {},
};
