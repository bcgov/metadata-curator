module.exports = {
    productionSourceMap: false,

    devServer: {
        host: 'localhost',
        proxy: {
            '/api': {
                target: 'http://localhost:9090/',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '/api',
                },
            },
        },
    },

    configureWebpack: {
        optimization: {
            runtimeChunk: 'multiple',
            splitChunks: {
                chunks: 'all',
                maxInitialRequests: Infinity,
                minSize: 10000,
                maxSize: 25000,
                cacheGroups: {
                    vendor: {
                        //test: /\/node_modules\/!(cluster)\//,
                        test: /\/node_modules\//,
                        name(module) {
                            // get the name. E.g. node_modules/packageName/not/this/part.js
                            // or node_modules/packageName
                            const packageName = module.context.match(
                                /\/node_modules\/(.*?)(\/|$)/
                            )[1];

                            // npm package names are URL-safe, but some servers don't like @ symbols
                            return `npm.${packageName.replace('@', '')}`;
                        },
                    },
                },
            },
        },
    },
};
