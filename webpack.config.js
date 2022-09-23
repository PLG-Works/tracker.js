  // File: ./webpack.config.js
  const webpack = require('webpack');
  const path = require('path');
  const PACKAGE = require('./package.json');
  
  const commonjs2Config = {
    mode: 'production',
    entry: path.resolve(__dirname + '/src/index.js'),
    output: {
      path: path.resolve(__dirname + '/dist/'),
      filename: 'main.js',
      library: {
        type: 'commonjs2',
        export: 'default'
      }
    }
  };

  const hostedScriptConfig = {
    mode: 'production',
    entry: path.resolve(__dirname + '/src/hosted.js'),
    output: {
      path: path.resolve(__dirname + '/dist/'),
      filename: `tracker.${PACKAGE.version}.min.js`
    }
  };

  module.exports = [commonjs2Config, hostedScriptConfig];