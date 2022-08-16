    // File: ./webpack.config.js
    const webpack = require('webpack')
    const path = require('path')
    
    module.exports = {
      mode: 'development',
      entry: path.resolve(__dirname + '/src/index.js'),
      output: {
        path: path.resolve(__dirname + '/dist/'),
        filename: 'main.js',
        library: {
          type: 'commonjs2',
          export: 'default'
        }
      }
    }