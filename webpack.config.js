const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    devtool: "source-map",
    entry: {
        main: path.resolve(__dirname, "js/index.js")
    },
    module: {
        rules: [
            {
                test: /\.(s*)css$/,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true
                        }
                    },
                    "sass-loader"
                ]
            },
        ]
    },
    resolve: {
        alias: {
            "@style": path.resolve(__dirname, "scss"),
        }
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    },
    devServer: {
        hot: true,
        static: {
            directory: path.join(__dirname, "dist"),
        },
        compress: true,
        port: 9000,
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './index.html'), // шаблон
            filename: 'index.html', // название выходного файла
        }),
    ],
}