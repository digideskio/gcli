/*
 * Copyright 2012, Mozilla Foundation and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/* eslint no-var: 0 */

var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    'wp-index': [ './wp-index.js' ],
  },
  output: {
    path: path.join(__dirname, 'built'),
    filename: '[name].js',
    sourceMapFilename: '[file].map',
    publicPath: 'http://localhost:3000/',
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: 'raw' },
      { test: /\.html$/, loader: 'raw' },
      { test: /\.json$/, loader: 'json' },
    ],
  },
  plugins: [
    new webpack.IgnorePlugin(/child_process$/),
    new webpack.IgnorePlugin(/dom-urls$/),
    new webpack.IgnorePlugin(/fs$/),
    new webpack.IgnorePlugin(/jsdom$/),
    new webpack.IgnorePlugin(/path$/),
  ],
};
