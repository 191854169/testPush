const webpack = require('webpack')
const path = require('path')
const { variable } = require('./src/assets/css/variable')
const fs = require('fs')
// 打包分析插件
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const terserWebpackPlugin = require('terser-webpack-plugin')
const vConsolePlugin = require('vconsole-webpack-plugin');  // 动态插入vconsole

const pages = require('./pages')
// 如果生产环境打包的情况下，删除demo页面的打包 - 防止线上访问demo页面
if (process.env.VUE_APP_ENV === 'prod') {
    delete pages.index
}
module.exports = {
  //only use when look at local after build html under /dist
  publicPath: '/wealth',
  pages,
  //   outputDir: 'wealth',
  css: {
    loaderOptions: {
      // sass: {
      //   // data: `@import "@/style/_variable.scss";@import "@/style/mixin.scss";`
      // },
      // css: {
      //   // options here will be passed to css-loader
      // },
      less: {
        globalVars: variable,
        javascriptEnabled: true
      },
      postcss: {
        // options here will be passed to postcss-loader
        plugins: [
          require('autoprefixer'),
          require('postcss-pxtorem')({
            rootValue: 100, // 与设计稿相关
            // unitPrecision: 5, // 转换精度
            propList: ['*', '!box-shadow'], // 转换的属性
            selectorBlackList: [] // 不转换的选择器
          })
        ]
      }
    }
  },
  productionSourceMap: false, // 生产环境是否生成 SourceMap
  transpileDependencies: ['@fs/jsbridge', 'asmcrypto.js'], // 需要内部编译包
  configureWebpack: () => {
    // console.log(config)
    const minimizer = []
    if (process.env.VUE_APP_ENV === 'prod') {
      minimizer.push(
        new terserWebpackPlugin({
          terserOptions: {
            compress: {
              drop_console: true
            }
          }
        })
      )
    }
    return {
      plugins: [
        new webpack.DefinePlugin({
          ISDEVELOPMENT: process.env.NODE_ENV !== 'production'
        }),
        // new BundleAnalyzerPlugin({
        //   analyzerPort: 8900
        // }),
        new vConsolePlugin({ enable: process.env.VUE_APP_ENV !== 'prod' }),
        new LodashModuleReplacementPlugin()
      ],
      resolve: { symlinks: false },
      optimization: {
        minimizer
      }
    }
  },
  chainWebpack: (config) => {    
    // svg rule loader
    const svgRule = config.module.rule('svg')
    // 找到svg-loader
    svgRule.uses.clear()
    // 清除已有的loader, 如果不这样做会添加在此loader之后
    svgRule.exclude.add(/node_modules/)
    // 正则匹配排除node_modules目录
    // 添加svg新的loader处理
    svgRule
      .test(/\.svg$/)
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
      })
    const oneOfsMap = config.module.rule("less").oneOfs.store;
    oneOfsMap.forEach(item => {
      item
        .use("style-resources-loader")
        .loader("style-resources-loader")
        .options({
          patterns: [
            path.resolve(__dirname, './src/assets/css/variable.less'),
            path.resolve(__dirname, './src/assets/css/mixins.less'),
          ]
        })
        .end()
    })

  },

  devServer: {
    publicPath: '/wealth',
    open: true,
    hot: true,
    compress: true,
    https: false,
    // historyApiFallback: {
    //   disableDotRule: true,
    //   rewrites: [
    //     { from: /^\/pages\/(purchasing|margin)/, to: '/pages/purchasing.html' }
    //   ],
    // },
    // 行情的服务
    proxy: {
      '/': {
          target: 'http://uc-sit.xingyunplan.com',
          // router的值会覆盖target
          router: function (req) {
          const isTradeInterface = (path) => {
              const JY_REG = /^(AssetsSummary|AssetsDetail|Holdings|OrderCreate|OrderCancel|OrderList|OrderDetail|ProfitLossList|HistoryHoldingList|CleanHoldings|HoldingsDetail|OrderStatistics|ProfitLossDetail|LatestProfitLossDetail)$/
              return JY_REG.test(path)
          }
          let backGroupName = ''
          if (isTradeInterface(req.path)) backGroupName = 'trade'
          let backServerName = req.path?.split('\/')[1]
          backGroupName && (backServerName += `,${backGroupName}`)

          let data = ''
          let proxy = {}
          try {
              data = fs.readFileSync(process.cwd() + '/proxy.json', 'utf-8')
              proxy = JSON.parse(data)
          } catch (e) {
              console.error('proxy.json file is error')
              process.exit(999)
          }

          const { VUE_APP_ENV: mode } = process.env

          const defaultData = {
              common: `https://wealth-${mode}.fosunhanig.com`
          }
          Object.assign(proxy, defaultData)
          return (proxy[backServerName] || '').replace(/\$\{mode\}/, mode)
          }
      }
    }
  }
}
