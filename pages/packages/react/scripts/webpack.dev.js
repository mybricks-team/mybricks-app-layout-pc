const path = require('path')
const { merge } = require('webpack-merge')
const common = require('./webpack.common')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackBar = require('webpackbar')
const fs = require('fs')
const pkg = require(path.join(__dirname, '../../../../package.json'))

const appInfo = pkg.appConfig.react
module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  resolve: {
    alias: {},
  },
  devServer: {
    static: {
      directory: path.join(__dirname, '../templates'),
    },
    port: 9001,
    host: 'localhost',
    hot: true,
    client: {
      logging: 'info',
      overlay: false
    },
    historyApiFallback: {
      rewrites: [
        {
          from: /^\/preview[^.]/, to: '/preview.html'
        },
      ],
    },
    proxy: [
      {
        context: ['/api/pcpage/publish', '/api/pcpage/upload', '/api/pcpage/rollback', '/api/pcpage/download-product', '/api/pcpage/custom-publish'],
        target: 'http://localhost:9002/mybricks-app-layout-pc',
        secure: false,
        changeOrigin: true,
      },
      {
        context: ['/public', '/css', '/js', '/paas', '/api', '/mfs', '/default_avatar.png'],
        target: 'https://lowcode.staging.kuaishou.com/',
        secure: false,
        changeOrigin: true,
      },
    ]
  },
  plugins: [
    new WebpackBar(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      chunks: ['index'],
      templateContent: ({ htmlWebpackPlugin }) => {
        let content = fs.readFileSync(path.resolve(__dirname, '../templates/index.html'), 'utf-8')
        content = content.replace('<!-- _APP_CONFIG_ -->', `<script>const _APP_CONFIG_ = {namespace: '${appInfo.name}'}</script>`)
        return content
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'preview.html',
      template: path.resolve(__dirname, '../templates/preview.html'),
      chunks: ['preview'],
    }),
    new HtmlWebpackPlugin({
      filename: 'setting.html',
      template: path.resolve(__dirname, '../templates/setting.html'),
      chunks: ['setting'],
    }),
    new HtmlWebpackPlugin({
      filename: 'groupSetting.html',
      template: path.resolve(__dirname, '../templates/groupSetting.html'),
      chunks: ['groupSetting'],
    })
  ]
})