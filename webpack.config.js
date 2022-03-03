const path = require('path');

module.exports = {
  mode: 'none',
  entry: {
    adminBundle: './assets/javascripts/admin/tableFilter.js',
    tabs: './assets/javascripts/tabs/entryPoint.js',
    morelessBundle: [
      './assets/javascripts/moreless/longlist.js',
      './assets/javascripts/moreless/moreless.js'
    ]
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {targets: 'defaults'}]
            ]
          }
        }
      }
    ]
  },
  externals: {
    jquery: 'jQuery'
  },
  output: {
    path: path.resolve('./public/javascripts')
  }
};
