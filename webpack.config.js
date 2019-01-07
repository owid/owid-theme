const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const devServer = require('./dist/src/devServer').devServer

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
            filename: "js/[name].js",
            libraryTarget: 'umd'
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
        ] : [
            new ExtractTextPlugin('[name].css'),
        ]),

        devServer: {
            host: 'localhost',
            port: 8095,
            contentBase: 'public',
            disableHostCheck: true,
            before: function(app, server) {
                app.use('/', devServer)
            },
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
            }
        }
    }
}