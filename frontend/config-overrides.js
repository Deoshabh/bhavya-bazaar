const webpack = require('webpack');

module.exports = function override(config) {  // Remove ModuleScopePlugin to allow imports outside of src/
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
      "buffer": require.resolve("buffer"),
      "url": require.resolve("url"),
      "util": require.resolve("util"),
      "assert": require.resolve("assert"),
      "zlib": require.resolve("browserify-zlib"),
      "process": require.resolve("process/browser"),
      "globalThis": false,
      "path": false,
      "fs": false,
      "os": false
    },
    alias: {
      'process/browser': require.resolve('process/browser'),
      'process': require.resolve('process/browser'),
      'globalThis': false
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    mainFields: ['browser', 'main', 'module']
  };

  // Fix source map warnings by properly configuring source-map-loader
  config.module.rules = config.module.rules.map(rule => {
    // Find the source-map-loader rule
    if (rule.enforce === 'pre' && rule.use && rule.use.find(use => 
        typeof use === 'object' && use.loader && use.loader.includes('source-map-loader'))) {
      return {
        ...rule,
        exclude: [
          /node_modules\/timeago\.js/,
          /node_modules\/@mui/,
          /node_modules\/react-redux/
        ]
      };
    }
    // Alternative check for different webpack configurations
    if (rule.use && Array.isArray(rule.use)) {
      const hasSourceMapLoader = rule.use.some(use => 
        (typeof use === 'string' && use.includes('source-map-loader')) ||
        (typeof use === 'object' && use.loader && use.loader.includes('source-map-loader'))
      );
      if (hasSourceMapLoader) {
        return {
          ...rule,
          exclude: [
            /node_modules\/timeago\.js/,
            /node_modules\/@mui/,
            /node_modules\/react-redux/
          ]
        };
      }
    }    return rule;
  });

  // Add plugins for browser polyfills and environment
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
      global: 'globalThis'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      global: 'globalThis'
    }),
    // Comprehensive replacement for process/browser resolution
    new webpack.NormalModuleReplacementPlugin(
      /^process$/,
      require.resolve('process/browser')
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^process\/browser$/,
      require.resolve('process/browser')
    )
  ];

  // Suppress specific webpack warnings
  config.ignoreWarnings = [
    /Failed to parse source map.*timeago\.js/,
    /Module Warning.*timeago\.js/,
    /source-map-loader/
  ];

  // Alternative approach: configure webpack stats to hide warnings
  if (config.stats) {
    config.stats.warningsFilter = [
      /timeago\.js/,
      /source-map-loader/
    ];
  } else {
    config.stats = {
      warningsFilter: [
        /timeago\.js/,
        /source-map-loader/
      ]
    };
  }

  return config;
};
