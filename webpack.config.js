var path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: "LazyObjectView",
    libraryTarget: 'umd',
  },
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'source-map-loader',
      exclude: /node_modules/,
      enforce: 'pre',
    }, {
      test: /\.tsx?$/,
      loaders: [
        'awesome-typescript-loader',
      ],
      exclude: /node_modules/,
    }, {
      test: /\.scss$/,
      loaders: ['style-loader', 'css-loader', 'sass-loader']
    }, {
      test: /\.css$/,
      loaders: ['style-loader', 'css-loader']
    }],
  }
};
