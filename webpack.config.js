const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const path = require('path');
const { IgnorePlugin } = require('webpack');

const mode = process.env.NODE_ENV || 'development';

const plugins = [
  new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' }), //
  new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'src/index.html'), inject: 'body' }),
  new CopyWebpackPlugin({
    patterns: [{ from: 'static', to: '.' }],
  }),
  new IgnorePlugin(/^\.\/app-check$/, /firebase$/),
  new IgnorePlugin(/^\.\/analytics$/, /firebase$/),
  new IgnorePlugin(/^\.\/functions$/, /firebase$/),
  new IgnorePlugin(/^\.\/remote-config$/, /firebase$/),
  new IgnorePlugin(/^\.\/performance$/, /firebase$/),
  new WorkboxPlugin.InjectManifest({
    swSrc: './src/service-worker.ts',
    maximumFileSizeToCacheInBytes: mode === 'development' ? 52428800 : 5242880,
    exclude: [
      /^fonts\/NotoSans(Thai)?-(?:Black|BlackItalic|BoldItalic|ExtraBold|ExtraBoldItalic|ExtraLight|ExtraLightItalic|Italic|Light|LightItalic|MediumItalic|SemiBoldItalic|Thin|ThinItalic)\.ttf/,
      /^fonts\/NotoMono[^.]+\.ttf/,
      /^fonts\/LICENSE_OFL\.txt/,
      /^ip[^.]+\.png/,
      /^robots\.txt/,
    ],
  }),
];

module.exports = {
  mode,
  devtool: mode === 'development' ? 'inline-source-map' : false,
  entry: path.resolve(__dirname, 'src/index.tsx'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: [/node_modules/, /.*.(test|spec).ts$/],
      },
      {
        test: /\.(png|svg)$/,
        use: 'file-loader',
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins,
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'public'),
    clean: true,
    publicPath: '/',
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
};
