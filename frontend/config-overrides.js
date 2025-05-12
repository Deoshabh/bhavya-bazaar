const webpack = require('webpack');

module.exports = function override(config) {
  // Remove ModuleScopePlugin to allow imports outside of src/
  config.resolve.plugins = config.resolve.plugins.filter(plugin => 
    plugin.constructor.name !== 'ModuleScopePlugin'
  );

  // Configure resolve for Node.js polyfills and module resolution
  config.resolve = {
    ...config.resolve,
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "buffer": require.resolve("buffer/"),
      "url": require.resolve("url/"),
      "util": require.resolve("util/"),
      "assert": require.resolve("assert/"),
      "zlib": require.resolve("browserify-zlib"),
      "process": require.resolve("process/browser"),
      "path": false,
      "fs": false,
      "os": false
    },
    alias: {
      'https-browserify': require.resolve('https-browserify'),
      'stream-http': require.resolve('stream-http'),  
      'stream-browserify': require.resolve('stream-browserify'),
      'zlib': require.resolve('browserify-zlib'),
      'url': require.resolve('url'),
      'assert': require.resolve('assert'),
      'buffer': require.resolve('buffer')
    }
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

  // Add plugins for browser polyfills and environment
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ];

  return config;
};
