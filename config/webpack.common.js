const path = require('path');
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        include: path.join(__dirname, '../'),
        use: {
          loader: 'babel-loader'
        }
      },
    ]}
};
