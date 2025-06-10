// Webpack bundle optimization configuration for Bhavya Bazaar
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

// Bundle optimization configuration
const bundleOptimizationConfig = {
  // Code splitting configuration
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
          enforce: true
        },
        
        // Common components
        common: {
          minChunks: 2,
          name: 'common',
          chunks: 'all',
          priority: 5,
          enforce: true
        },
        
        // React and related libraries
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20
        },
        
        // UI libraries
        ui: {
          test: /[\\/]node_modules[\\/](framer-motion|@headlessui|@heroicons)[\\/]/,
          name: 'ui',
          chunks: 'all',
          priority: 15
        },
        
        // Redux related
        redux: {
          test: /[\\/]node_modules[\\/](redux|react-redux|@reduxjs)[\\/]/,
          name: 'redux',
          chunks: 'all',
          priority: 15
        },
        
        // Large libraries
        heavy: {
          test: /[\\/]node_modules[\\/](chart\.js|moment|lodash)[\\/]/,
          name: 'heavy',
          chunks: 'all',
          priority: 15
        }
      }
    },
    
    // Runtime chunk
    runtimeChunk: {
      name: 'runtime'
    },
    
    // Minimize configuration
    minimize: true,
    minimizer: [
      // Terser for JS
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: process.env.NODE_ENV === 'production',
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.debug']
          },
          mangle: {
            safari10: true
          },
          format: {
            comments: false
          }
        },
        extractComments: false
      }),
      
      // CSS optimization
      new CssMinimizerPlugin()
    ]
  },
  
  // Performance hints
  performance: {
    hints: 'warning',
    maxEntrypointSize: 500000, // 500kb
    maxAssetSize: 500000
  },
  
  // Plugins for optimization
  plugins: [
    // Compression plugin
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8
    }),
    
    // Bundle analyzer (only in analyze mode)
    ...(process.env.ANALYZE === 'true' ? [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: 'bundle-report.html'
      })
    ] : [])
  ],
  
  // Module resolution optimization
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@assets': path.resolve(__dirname, 'src/assets')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: ['node_modules', path.resolve(__dirname, 'src')]
  }
};

// Vite-specific optimization configuration
const viteOptimizationConfig = {
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          redux: ['redux', 'react-redux', '@reduxjs/toolkit'],
          ui: ['framer-motion', '@headlessui/react', '@heroicons/react'],
          utils: ['axios', 'react-toastify', 'moment'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      }
    },
    
    // Compression
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // Asset optimization
    assetsInlineLimit: 4096, // 4kb
    chunkSizeWarningLimit: 1000,
    
    // Source maps for production debugging
    sourcemap: process.env.NODE_ENV === 'development'
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'redux',
      'react-redux',
      '@reduxjs/toolkit',
      'axios',
      'framer-motion'
    ],
    exclude: [
      // Exclude large optional dependencies
      'chart.js',
      'moment'
    ]
  },
  
  // Server configuration for development
  server: {
    // Enable compression
    compress: true,
    
    // Preload optimization
    warmup: {
      clientFiles: [
        './src/App.jsx',
        './src/pages/HomePage.jsx',
        './src/components/Layout/Header.jsx'
      ]
    }
  }
};

// Package.json scripts for optimization
const optimizationScripts = {
  "build:analyze": "cross-env ANALYZE=true npm run build",
  "build:prod": "cross-env NODE_ENV=production npm run build",
  "optimize:images": "imagemin src/assets/images/* --out-dir=src/assets/images/optimized",
  "optimize:bundle": "npm run build && npm run build:analyze",
  "lighthouse": "lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html",
  "bundle-size": "npm run build && bundlesize"
};

// Bundlesize configuration for CI/CD
const bundlesizeConfig = [
  {
    "path": "./build/static/js/*.js",
    "maxSize": "500kb",
    "compression": "gzip"
  },
  {
    "path": "./build/static/css/*.css",
    "maxSize": "100kb",
    "compression": "gzip"
  }
];

// Image optimization configuration
const imageOptimizationConfig = {
  // Imagemin configuration
  plugins: [
    ['imagemin-mozjpeg', { quality: 80 }],
    ['imagemin-pngquant', { quality: [0.6, 0.8] }],
    ['imagemin-svgo', {
      plugins: [
        { name: 'removeViewBox', active: false },
        { name: 'addAttributesToSVGElement', params: { attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }] } }
      ]
    }]
  ],
  
  // Responsive image sizes
  responsive: {
    quality: 80,
    progressive: true,
    formats: ['webp', 'jpeg'],
    sizes: [
      { width: 300, rename: { suffix: '-sm' } },
      { width: 600, rename: { suffix: '-md' } },
      { width: 1200, rename: { suffix: '-lg' } },
      { width: 1920, rename: { suffix: '-xl' } }
    ]
  }
};

// Performance monitoring configuration
const performanceConfig = {
  // Web Vitals thresholds
  thresholds: {
    LCP: 2500, // Largest Contentful Paint
    FID: 100,  // First Input Delay
    CLS: 0.1,  // Cumulative Layout Shift
    FCP: 1800, // First Contentful Paint
    TTI: 3800  // Time to Interactive
  },
  
  // Performance budgets
  budgets: {
    javascript: 500, // KB
    css: 100,        // KB
    images: 2000,    // KB
    fonts: 200,      // KB
    total: 3000      // KB
  }
};

module.exports = {
  bundleOptimizationConfig,
  viteOptimizationConfig,
  optimizationScripts,
  bundlesizeConfig,
  imageOptimizationConfig,
  performanceConfig
};
