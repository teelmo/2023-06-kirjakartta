const { merge } = require('webpack-merge');
const path = require('path');
const name = require('./package.json').name;
const common = require('./webpack.common.js');
const ESLintPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge(common, {
  devtool: 'inline-source-map',
  devServer: {
    hot: true,
    static: path.resolve(__dirname, './public'),
    host: 'localhost',
    https: false
  },
  mode: 'development',
  output: {
    filename: 'js/' + name + '.min.js',
    path: path.resolve(__dirname, './public'),
    clean: true
  },
  plugins: [
    new ESLintPlugin({
      extensions: ['js', 'jsx'],
      fix: true
    }),
    new MiniCssExtractPlugin({
      filename: 'css/' + name + '.min.css'
    })
  ]
});