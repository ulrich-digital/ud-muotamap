const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    ...defaultConfig,
    entry: {
        ...defaultConfig.entry,
'single-map/edit': path.resolve(__dirname, 'src/single-map/edit.js'),
    'single-map/view': path.resolve(__dirname, 'src/single-map/view.js'),
    'collection-map/edit': path.resolve(__dirname, 'src/collection-map/edit.js'),
    'collection-map/view': path.resolve(__dirname, 'src/collection-map/view.js'),
    },
    externals: {
        leaflet: 'L',
    },
    plugins: [
        ...defaultConfig.plugins,
        new CopyWebpackPlugin({
            patterns: [
                { from: '*.css', to: '[name][ext]', context: 'src' },
            ],
        }),
    ],
};
