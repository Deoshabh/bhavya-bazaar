// webpack.config.js
const path = require("path");

module.exports = {
  entry: "./src/index.js",  resolve: {
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
    filename: "bundle.js",
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
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
        exclude: /node_modules\/timeago\.js/,
      },
    ],
  },  devtool: "source-map",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000,
  },
};