const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production'

    return {
        context: __dirname,
        mode: isProduction ? "production" : "development",
        entry: {
            owid: "./js/owid.entry.ts",
        },
        output: {
            path: path.join(__dirname, "dist"),
            filename: "js/[name].js"
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".css", ".scss"],
            modules: [
                path.join(__dirname, "js/libs"),
                path.join(__dirname, "css/libs"),
                path.join(__dirname, "node_modules"),
            ],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                    options: {
                        transpileOnly: true
                    }
                },
                {
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: ['css-loader?modules&importLoaders=1&localIdentName=[local]'],
                    }),
                },
                {
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: ['css-loader?modules&importLoaders=1&localIdentName=[local]', 'sass-loader'] })
                },
                {
                    test: /\.(jpe?g|gif|png|eot|woff|ttf|svg|woff2)$/,
                    loader: 'url-loader?limit=10000'
                }
            ],
        },

        // Enable sourcemaps for debugging webpack's output.
        devtool: (isProduction ? false : "cheap-module-eval-source-map"),

        plugins: (isProduction ? [
            // This plugin extracts css files required in the entry points
            // into a separate CSS bundle for download
            new ExtractTextPlugin('[name].css'),

            // CSS optimization
            /*new OptimizeCssAssetsPlugin({
                assetNameRegExp: /\.bundle.*\.css$/,
                cssProcessorOptions: { discardComments: { removeAll: true } }
            }),*/

            // JS optimization
            new ParallelUglifyPlugin({
                cachePath: path.join(__dirname, 'tmp'),
                uglifyJS: {
                    compress: {
                    warnings: false,
                    conditionals: true,
                    unused: false,
                    comparisons: true,
                    sequences: true,
                    dead_code: true,
                    evaluate: true,
                    if_return: true,
                    join_vars: true
                    },
                }
            }),
        ] : [
            new ExtractTextPlugin('[name].css')
        ]),

        devServer: {
            host: 'localhost',
            port: 8095,
            contentBase: 'public',
            disableHostCheck: true,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
            }
        }
    }
}