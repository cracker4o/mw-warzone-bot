const path = require('path');

module.exports = {
    entry: './bot.js',
    target: 'node',
    node: {
        fs: 'empty'
    },
    resolve: {
        extensions: ['.js', '.json'],
        mainFields: ["main"]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bot.js'
   },
   module: {
        rules: [
            {
                test: /\.js$/, //using regex to tell babel exactly what files to transcompile
                exclude: /node_modules/, // files to be ignored
                use: {
                    loader: 'babel-loader' // specify the loader
                } 
            }
        ]
    }   
 } 