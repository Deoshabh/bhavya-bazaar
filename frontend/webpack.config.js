// webpack.config.js
const path = require("path");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const shouldAnalyze = process.env.ANALYZE === 'true';

module.exports = {
  entry: "./src/index.js",  
  resolve: {
    fallback: {
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
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"]
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: isProduction ? "[name].[contenthash].js" : "bundle.js",
    chunkFilename: isProduction ? "[name].[contenthash].chunk.js" : "[name].chunk.js",
    clean: true,
    publicPath: '/'
  },
  optimization: {
    minimize: isProduction,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: isProduction,
            drop_debugger: isProduction,
          },
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        mui: {
          test: /[\\/]node_modules[\\/]@mui[\\/]/,
          name: 'mui',
          chunks: 'all',
          priority: 20,
        },
        redux: {
          test: /[\\/]node_modules[\\/](redux|react-redux|@reduxjs)[\\/]/,
          name: 'redux',
          chunks: 'all',
          priority: 20,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: 'single',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: isProduction ? [] : ["react-refresh/babel"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[hash][ext]',
        },
      },
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
        exclude: /node_modules\/timeago\.js/,
      },
    ],
  },  
  devtool: isProduction ? 'source-map' : 'eval-source-map',
  plugins: [
    ...(isProduction ? [
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 8192,
        minRatio: 0.8,
      }),
    ] : []),
    ...(shouldAnalyze ? [new BundleAnalyzerPlugin()] : []),
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000,
  },
};