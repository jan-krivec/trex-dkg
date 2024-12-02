const webpack = require('webpack');

module.exports = {
  resolve: {
    extensions: [ '.ts', '.js' ],
    fallback: {
      "fs": false,
      "path": require.resolve("path-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "net": false,
      "tls": false,
      "os": require.resolve("os-browserify/browser"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer")
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      global: 'window' // Polyfill for 'global'
    })
  ]
};
