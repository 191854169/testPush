// 多页面入口配置
module.exports = {
    index: {
        // 演示页面
        entry: 'src/entries/demo.js',
        template: 'public/demo.html',
        filename: 'index.html',
    },
    fund: {
        // 基金页
        entry: 'src/entries/Fund.js',
        template: 'public/index.html',
        filename: 'fund.html',
        title: '',
    },
    cashBox: {
        // 现金宝
        entry: 'src/entries/cashBox.js',
        template: 'public/index.html',
        filename: 'cashBox.html',
        title: '',
    },
    riskAssessment: {
        // 风险测评
        entry: 'src/entries/riskAssessment.js',
        template: 'public/index.html',
        filename: 'riskAssessment.html',
        title: '风险测评',
    },
    cmhk: {
        // cmhk项目
        entry: 'src/entries/cmhk.js',
        template: 'public/index.html',
        filename: 'cmhk.html',
        title: '',
    },
    fixedDepositTreasure: {
        // 定存宝项目
        entry: 'src/entries/fixedDepositTreasure.js',
        template: 'public/index.html',
        filename: 'fixedDepositTreasure.html',
        title: '',
    },
    xcbAccount: {
        // 星财宝专户项目
        entry: 'src/entries/xcbAccount.js',
        template: 'public/index.html',
        filename: 'starTreasureAccount.html',
        title: '',
    },
    commonOutside: {
        // 睿银通用站外H5
        entry: 'src/entries/commonOutside.js',
        template: 'public/index.html',
        filename: 'commonOutside.html',
        title: '',
    },
    investmentMigration: {
        // 投资移民专户
        entry: 'src/entries/investmentMigration.js',
        template: 'public/index.html',
        filename: 'investmentMigration.html',
        title: '',
    },
}
