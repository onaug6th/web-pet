const path = require('path');
//  copy资源文件
const CopyWebpackPlugin = require('copy-webpack-plugin');
//  html入口
const HtmlWebpackPlugin = require('html-webpack-plugin');
//  html中插入资源文件
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');

// 使用 WEBPACK_SERVE 环境变量检测当前是否是在 webpack-server 启动的开发环境中
const dev = Boolean(process.env.WEBPACK_SERVE);

/**
 * 返回当前目录路径加目录名称的完整路径
 * 例如 vue.config.js 处于 C:\Users\administrator\Desktop\onaug6th
 * dir为 src/assets
 * 函数就会返回补全路径 C:\Users\administrator\Desktop\onaug6th + src/assets
 * @param {*} dir 
 */
const resolve = (dir) => {
    return path.join(__dirname, dir);
}

//  声明plugins空数组
let plugins = [];

/**
 * 初始化
 */
; (function init() {

    const logger = console.log;

    logger("output输出的path路径为", resolve('dist'));

})();

//  开发模式下，我们开启服务，并将资源文件整合到目标输出html中。
if (dev) {
    plugins = [
        new HtmlWebpackPlugin({
            /*
             * template 参数指定入口 html 文件路径，插件会把这个文件交给 webpack 去编译，
             * webpack 按照正常流程，找到 loaders 中 test 条件匹配的 loader 来编译，那么这里 html-loader 就是匹配的 loader
             * html-loader 编译后产生的字符串，会由 html-webpack-plugin 储存为 html 文件到输出目录，默认文件名为 index.html
             * 可以通过 filename 参数指定输出的文件名
             * html-webpack-plugin 也可以不指定 template 参数，它会使用默认的 html 模板。
             */
            template: './src/index.html',

            /*
             * 因为和 webpack 4 的兼容性问题，chunksSortMode 参数需要设置为 none
             * https://github.com/jantimon/html-webpack-plugin/issues/870
             */
            chunksSortMode: 'none'
        })
    ]
} else {
    plugins = [

    ]
}

module.exports = {
    /*
     * webpack 执行模式
     * development：开发环境，它会在配置文件中插入调试相关的选项，比如 moduleId 使用文件路径方便调试
     * production：生产环境，webpack 会将代码做压缩等优化
     */
    mode: dev ? 'development' : 'production',

    /*
     * 配置 source map
     * 开发模式下使用 cheap-module-eval-source-map, 生成的 source map 能和源码每行对应，方便打断点调试
     * 生产模式下使用 hidden-source-map, 生成独立的 source map 文件，并且不在 js 文件中插入 source map 路径，用于在 error report 工具中查看 （比如 Sentry)
     */
    devtool: dev ? 'cheap-module-eval-source-map' : 'hidden-source-map',

    // 配置页面入口 js 文件
    entry: './src/index.ts',

    // 配置打包输出相关
    output: {
        // 打包输出目录
        path: resolve('dist'),
        //  输出模式
        libraryTarget: 'umd',
        // 入口 js 的打包输出文件名
        filename: 'index.js'
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },

    module: {
        /*
         * 配置各种类型文件的加载器，称之为 loader
         * webpack 当遇到 import ... 时，会调用这里配置的 loader 对引用的文件进行编译
        */
        rules: [
            {
                //  匹配 ts 文件
                test: /\.ts$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true
                        }
                    }
                ]
            },
            {
                // 匹配 css 文件
                test: /\.css$/,

                /*
                 * 先使用 css-loader 处理，返回的结果交给 style-loader 处理。
                 * css-loader 将 css 内容存为 js 字符串，并且会把 background, @font-face 等引用的图片，
                 * 字体文件交给指定的 loader 打包，类似上面的 html-loader, 用什么 loader 同样在 loaders 对象中定义，等会下面就会看到。
                 */
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader']
            }
        ]
    },

    /*
     * 配置 webpack 插件
     * plugin 和 loader 的区别是，loader 是在 import 时根据不同的文件名，匹配不同的 loader 对这个文件做处理，
     * 而 plugin, 关注的不是文件的格式，而是在编译的各个阶段，会触发不同的事件，让你可以干预每个编译阶段。
    */
    plugins
}

/*
 * 配置开发时用的服务器，让你可以用 http://127.0.0.1:8080/ 这样的 url 打开页面来调试
 * 并且带有热更新的功能，打代码时保存一下文件，浏览器会自动刷新。比 nginx 方便很多
 * 如果是修改 css, 甚至不需要刷新页面，直接生效。这让像弹框这种需要点击交互后才会出来的东西调试起来方便很多。
 * 因为 webpack-cli 无法正确识别 serve 选项，使用 webpack-cli 执行打包时会报错。
 * 因此我们在这里判断一下，仅当使用 webpack-serve 时插入 serve 选项。
 * issue：https://github.com/webpack-contrib/webpack-serve/issues/19
*/
if (dev) {
    module.exports.serve = {
        // 配置监听端口，默认值 8080
        port: 8989,

        // add: 用来给服务器的 koa 实例注入 middleware 增加功能
        add: app => { }
    }
}
