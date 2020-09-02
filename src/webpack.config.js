const path = require('path');

module.exports = {
    entry: require.resolve('./bot.js'),
    target: 'node',
    devtool: 'source-map',
    node: {
        fs: 'empty'
    },
    resolve: {
        extensions: ['.js', '.json', '.ts'],
        mainFields: ["main"]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]',
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