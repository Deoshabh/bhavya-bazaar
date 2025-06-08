const webpack = require('webpack');

module.exports = function override(config, env) {
  // Jest configuration for MSW v2.x compatibility
  if (env === 'test') {
    // Add Jest configuration to handle MSW ES modules
    config.transformIgnorePatterns = [
      'node_modules/(?!(msw|@bundled-es-modules|@mswjs)/)'
    ];
    
    // Add Jest module name mapping
    config.moduleNameMapper = {
      ...config.moduleNameMapper,
      '^@/(.*)$': '<rootDir>/src/$1'
    };
    
    return config;
  }
  
  // Remove ModuleScopePlugin to allow imports outside of src/
  config.resolve.plugins = config.resolve.plugins.filter(plugin => 
    plugin.constructor.name !== 'ModuleScopePlugin'
  );

  // Performance optimizations for production builds
  if (process.env.NODE_ENV === 'production') {
    // Enable code splitting and chunk optimization
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 10,
        maxAsyncRequests: 10,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            enforce: true
          },
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'mui',
            chunks: 'all',
            priority: 15,
            enforce: true
          },
          redux: {
            test: /[\\/]node_modules[\\/](react-redux|@reduxjs)[\\/]/,
            name: 'redux',
            chunks: 'all',
            priority: 12,
            enforce: true
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            enforce: true
          }
        }
      },
      usedExports: true,
      sideEffects: false
    };
  }

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

  // Performance optimizations
  if (process.env.NODE_ENV === 'production') {
    // Enable code splitting and chunk optimization
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            enforce: true
          },
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'mui',
            chunks: 'all',
            priority: 15,
            enforce: true
          },
          redux: {
            test: /[\\/]node_modules[\\/](react-redux|@reduxjs)[\\/]/,
            name: 'redux',
            chunks: 'all',
            priority: 12,
            enforce: true
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            enforce: true
          }
        }
      },
      // Enable gzip compression
      minimize: true,
      usedExports: true,
      sideEffects: false
    };
  }

  return config;
};
