const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');
module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, '../example/src/'),
    port: 3001,
  },
  entry: path.join(__dirname, "../example/src/app.js"),
  output: {
    path: path.join(__dirname, "../example/src/"),
    filename: "bundle.js", // 使用webpack-dev-sevrer启动开发服务时，并不会实际在`src`目录下生成bundle.js，打包好的文件是在内存中的，但并不影响我们使用。
    clean: true,
  },
  resolve: {
    extensions: ['.js','.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },      
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ]},
});
