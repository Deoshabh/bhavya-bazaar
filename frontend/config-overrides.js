const webpack = require('webpack');

module.exports = function override(config, env) {
  // Add fallbacks for node core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "https": require.resolve('https-browserify'),
    "http": require.resolve('stream-http'),
    "stream": require.resolve('stream-browserify'),
    "util": require.resolve('util/'),
    "zlib": require.resolve('browserify-zlib'),
    "url": require.resolve('url/'),
    "assert": require.resolve('assert/'),
    "buffer": require.resolve('buffer/'),
    "crypto": false,
    "path": false,
    "fs": false,
    "os": false
  };

  // Exclude timeago.js from source-map-loader
  config.module.rules = config.module.rules.map(rule => {
    if (rule.use && rule.use.some(use => use.loader === 'source-map-loader')) {
      return {
        ...rule,
        exclude: /node_modules\/timeago\.js/
      };
    }
    return rule;
  });

  // Add ProvidePlugin for Buffer
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    })
  ];

  return config;
};
