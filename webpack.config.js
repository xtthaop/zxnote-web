const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

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
    })
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
