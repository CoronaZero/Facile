/*!
 * Facile 主题前端资源打包配置
 *
 * 入口：
 *   bundle —— src/js/app.js（含 12 个模块 import，jQuery 作为全局变量不打包）
 *   style  —— src/style/index.scss（由「拷贝前端文件用于打包.js」生成，
 *             内联 bootstrap + style + icon 三套样式）
 *
 * 产物：
 *   dist/bundle-[contenthash].js
 *   dist/style-[contenthash].css
 *
 * 「拷贝和修改文件用于最终的打包.js」会按正则 style-*.css / bundle-*.js 读取产物。
 */

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  // devtool 在 production 模式下默认为 false，不输出 source map
  entry: {
    bundle: './src/js/app.js',
    style: './src/style/index.scss'
  },
  output: {
    filename: '[name]-[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                // style.scss 的 @import 嵌套在选择器块内（如 .stackoverflow-light），
                // 无法迁移为 @use，静默 Dart Sass 对 @import 的弃用警告（3.0 才移除）
                silenceDeprecations: ['import']
              }
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(woff2?|ttf|eot|svg)$/,
        type: 'asset/resource',
        generator: { filename: 'fonts/[name][ext]' }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: '[name]-[contenthash].css' })
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()]
  },
  // jQuery 通过 footer.php 全局加载，打包时不内联
  externals: { jquery: 'jQuery' },
  // 主题前端资源体积较大，放宽性能提示阈值避免构建警告
  performance: {
    maxAssetSize: 2000000,
    maxEntrypointSize: 2000000
  }
};
