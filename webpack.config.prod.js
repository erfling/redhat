var webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');

var path = require('path');  
var glob = require('glob');  
var HtmlwebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');

var ROOT_PATH = path.resolve(__dirname);

module.exports = {
    entry: {
      main:   './client/index.tsx',
      vendor: ['react', 'lodash', 'semantic-ui-react', 'react-router-dom', 'react-router', 'sanitize-html'],
    },
    devtool: false,
    output: {
      path: ROOT_PATH +  '/dist/assets',
      publicPath: '/assets/',
      filename: '[name].bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.scss$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader', 'sass-loader']
          })
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [{loader: 'css-loader', options: { minimize: true }}]
          })
        },
        {
          test: /\.svg$/,
          use: ExtractTextPlugin.extract({
            use: 'svg-inline-loader'
          })
        },
        {
          test: /\.(png|jpg|jpeg|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                limit: 5000
              }
            }
          ]
        },
        {
          test: /.(woff|woff2|eot|ttf|otf)$/,
          use: ['file-loader']
        }
       
      ],
      loaders: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loaders: ['react-hot'],
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                limit: 8192
              }
            }
          ]
        },
        {
          test: /.(woff|woff2|eot|ttf|otf)$/,
          use: ['file-loader']
        }
      ]
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ]
    },
    plugins: [
      new HtmlwebpackPlugin({
        title: 'Shared Value Experience',
        filename: "../index.html",
        template: "template.html"
      }),
      new ExtractTextPlugin('style.css'),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"prod"'
      }),
      new webpack.optimize.AggressiveMergingPlugin(),//Merge chunks
      new UglifyJSPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor'
      }),
      new CompressionPlugin({
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        test: /\.js$|/,
        minRatio: 0.8,
        deleteOriginalAssets: false,
        filename: (filename) => {
          console.log("FILE IS", filename)
          return filename;
        }
      })
      
    ]
  };
  //<meta name="google-site-verification" content="LJ1jS5T5gq2RSmbjAqtxgKB01F86s7iNm5BZ0Xi91Ak" />
