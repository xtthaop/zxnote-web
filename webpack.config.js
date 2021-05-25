const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: 'production',
  entry: {
    app: './src/index.js',
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.join(__dirname, 'dist'),
    clean: true,
    publicPath: '/notebook',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  devtool: 'inline-source-map',
  devServer: {
    port: 10990,
    publicPath: '/notebook',
    historyApiFallback: {
      index: '/notebook/index.html',
    },
    proxy: {
      '/restful': {
        target: 'https://zxctb.top',
        changeOrigin: true,
      },
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './public/index.html',
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'server',
      analyzerHost: '127.0.0.1',
      analyzerPort: 8888,
      reportFilename: 'report.html',
    }),
  ],
  module: {
    rules: [
      { test: /\.(jpg|png|gif|bmp|jpeg)$/, use: 'url-loader?limit=7631&name=[hash:8]-[name].[ext]' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        include: [path.resolve(__dirname, 'src/icons')],
        options: {
          symbolId: 'icon-[name]'
        }
      }
    ]
  }
}
