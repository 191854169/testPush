<template>
    <div class="bond-detail">
        <basic-info @quote-loaded="onQuoteLoaded"></basic-info>
        <history-module ref="historyModuleRef"></history-module>
        <brief></brief>
        <trade-rule></trade-rule>
        <template v-if="!isNotInHlOrWt">
            <div class="footer-box">
                <div ref="footerTemp"></div>
            </div>
        </template>
        <RiskStatement></RiskStatement>
    </div>
</template>
<script>
import basicInfo from './basicInfo.vue'
import brief from './brief.vue'
import tradeRule from './tradeRule.vue'
import historyModule from './historyModule.vue'
import verifyMixin from '@/mixins/business/verifyMixins.js'
import Vue from 'vue'
import { isUndefined } from '@/utils/tools.js'
import pathnames from '@/config/H5Pathname.js'
import { TRADE_STATUS_MAP } from '../../config/common'
import RiskStatement from '@/views/fund/components/RiskStatement.vue'

export default {
    name: 'bondDetail',
    mixins: [verifyMixin],
    components: {
        basicInfo,
        brief,
        tradeRule,
        historyModule,
        RiskStatement,
    },
    data() {
        return {
            isExpired: false,
            buyable: true, // 产品是否可买
            sellable: true, // 产品是否可卖
            isActive: true, // 产品是否上架
        }
    },
    watch: {
        '$root.isLogin': {
            handler(v) {
                if (!this.isNotInHlOrWt) {
                    if (!isUndefined(v)) {
                        // 初始化按钮
                        this.initButtons()
                    }
                }
            },
        },
    },
    async mounted() {
        if (!this.isNotInHlOrWt) {
            // 债券是否能支持认购
            await this.getTradeStatus()
            this.isDisbaled = !(this.buyable || this.sellable)
            // 初始化按钮 - 由于没有做成观察者模式，所以需要在mounted中手动调用一次
            if (typeof this.$root.isLogin === 'boolean') {
                this.initButtons()
            }
        }
    },
    methods: {
        // goRiskStatement() {
        //     const fileUrl = `static/风险披露&免责声明_${getLangType()}.pdf`
        //     const url = `${location.origin}/wealth/${fileUrl}`
        //     console.log('pdfUrl:', url)
        //     if (this.$jsBridge) {
        //         this.$jsBridge.openPDF({ url: encodeURIComponent(url), title: this.$t('protocol.publicRisk') })
        //     } else {
        //         window.open(fileUrl)
        //     }
        // },
        /**
         * 获取产品对应的过期、买入、卖出、上架状态
         */
        async getTradeStatus() {
            try {
                const result = (await this.getBasicInfo({ symbol: this.$route.query.symbol })) || {}
                // 债券是否过期
                this.isExpired = result.expired
                this.buyable = [TRADE_STATUS_MAP.CAN_BUY_SELL, TRADE_STATUS_MAP.ONLY_CAN_BUY].includes(result.tradingStatus)
                this.sellable = [TRADE_STATUS_MAP.CAN_BUY_SELL, TRADE_STATUS_MAP.ONLY_CAN_SELL].includes(result.tradingStatus)
                this.isActive = result.isActive // 1 上架
            } catch (e) {
                console.log('getBasicInfo===>e:', e)
            }
        },
        /**
         * 挂载dom到对应div上面 - footerTemp
         */
        generateFooterButton() {
            try {
                const footerComp = new Vue({
                    render: h => {
                        return h(
                            'footer',
                            {
                                style: { justifyContent: this.isInHlApp ? '' : 'center' },
                            },
                            [this.getFooterChild(h)]
                        )
                    },
                })
                // 延迟加载一次
                this.$nextTick(() => {
                    this.$refs.footerTemp && footerComp.$mount(this.$refs.footerTemp)
                })
            } catch (e) {
                console.error(e)
            }
        },
        // 开户|开通权限|认购|赎回 按钮
        getFooterChild(h) {
            const operationChild = this.generateOperationChild(h)
            const children = [operationChild]
            const tipChild = this.getUnsubscribeTipChild(h)
            if (tipChild) {
                children.unshift(tipChild)
            }
            return h('div', { staticClass: 'footer-content' }, children)
        },
        /**
         * 生成操作按钮的dom
         * @returns {Object} 开户|开通权限|认购|赎回 按钮
         */
        generateOperationChild(h) {
            const footerButtonChild = []

            if (this.openAccount) {
                footerButtonChild.push(this.generateOpenAccountChild(h))
            } else if (!this.isOpenedDerivative) {
                footerButtonChild.push(this.generateopenDerivativeChild(h))
            } else {
                if (this.buy) {
                    footerButtonChild.push(this.generateBuyBtnChild(h))
                }
                if (this.sell) {
                    footerButtonChild.push(this.generateSellBtnChild(h))
                }
            }

            const classList = {
                'open-account': this.openAccount,
                buy: this.buy,
                sell: this.sell,
            }
            if (this.buy && (this.isExpired || !this.buyable)) {
                classList['disabled-buy'] = true
            }
            if (this.sell && (this.isExpired || !this.sellable)) {
                classList['disabled-sell'] = true
            }
            const operationChild = h(
                'button',
                {
                    staticClass: 'footer-button big-btn',
                    class: {
                        'open-account': this.openAccount,
                        buy: this.buy,
                        sell: this.sell,
                        'disabled-buy': this.isExpired || !this.buyable,
                        'disabled-sell': this.buy && (this.isExpired || !this.sellable),
                    },
                    on: { click: this.onOpenAccount },
                },
                footerButtonChild
            )
            return operationChild
        },
        /**
         * 生成“立即开户”按钮
         * @returns {Object} vue instace
         */
        generateOpenAccountChild(h) {
            return h(
                'span',
                {
                    staticClass: 'mask',
                    attrs: {
                        'data-key': 'openAccount',
                    },
                },
                this.$t('openAccountNow')
            )
        },
        /**
         * 生成“开通衍生品”按钮
         * @returns {Object} vue instace
         */
        generateopenDerivativeChild(h) {
            return h(
                'span',
                {
                    staticClass: 'mask',
                    attrs: {
                        'data-key': 'derivative',
                    },
                },
                this.$t('openDerivative')
            )
        },
        /**
         * 生成“买入”|“暂停销售”按钮
         * @returns {Object} vue instace
         */
        generateBuyBtnChild(h) {
            // 无持仓 && 不可买入 && 上架 && 未过期 的情况下展示“暂停销售”
            const label = this.$t(!this.sell && !this.buyable && !this.isExpired && this.isActive ? 'stopSellingBtn' : 'subscribe')
            return h(
                'span',
                {
                    staticClass: 'mask',
                    attrs: {
                        'data-key': 'buy',
                    },
                },
                label
            )
        },
        /**
         * 生成“卖出”按钮
         * @returns {Object} vue instace
         */
        generateSellBtnChild(h) {
            return h(
                'span',
                {
                    staticClass: 'mask',
                    attrs: {
                        'data-key': 'sell',
                    },
                },
                this.$t('redeem')
            )
        },
        /**
         * 生成tip文案
         * @returns {Object} vue instace
         */
        getUnsubscribeTipChild(h) {
            let tip$tKey = ''
            if (this.isExpired) {
                tip$tKey = 'bondExpiredTip'
            } else if (!this.isActive) {
                tip$tKey = 'bondDisabledTip'
            } else if (!this.buyable) {
                tip$tKey = 'stopSelling'
                if (this.sell) {
                    tip$tKey = 'onlySellForProduct'
                }
            }

            const tip = this.$t(tip$tKey)
            if (!this.$root.isLogin || this.openAccount || !tip) return ''
            return h(
                'p',
                {
                    style: {
                        left: 0,
                        right: 0,
                        textAlign: 'center',
                        position: 'absolute',
                        transform: 'translateY(calc(-100% - 0.03rem))',
                        background: '#FFE5E7',
                        lineHeight: '0.32rem',
                        fontSize: '0.12rem',
                        color: '#9D252A',
                    },
                },
                tip
            )
        },
        /**
         * 按钮响应事件
         */
        async onOpenAccount(e) {
            try {
                this.$loading.show = true
                const key = e.target.dataset.key
                if (!key) return
                // 过期不可进行买卖操作
                if (this.isExpired) return
                // 不可进行买操作
                if (!this.buyable && key === 'buy') return
                // 不可进行卖操作
                if (!this.sellable && key === 'sell') return

                // 账户校验
                if (!(await this.accountVerify(key === 'sell'))) return

                if (key === 'sell') {
                    return this.jumpToPage(key)
                }

                // 风险匹配及测评校验
                if (!(await this.riskMatchVerify(key))) return

                this.jumpToPage(key)
            } catch (e) {
                console.error(e)
            } finally {
                this.$loading.show = false
            }
        },

        // 页面跳转
        jumpToPage(key) {
            const { symbol } = this.$route.query
            const { VUE_APP_DERIVATIVE_PAGE } = pathnames
            switch (key) {
                case 'buy':
                    this.$router.push(`/bond-buy/${symbol}?direction=1`)
                    break
                case 'sell':
                    this.$router.push(`/bond-buy/${symbol}?direction=2`)
                    break
                case 'derivative':
                    this.initAccountWatch()
                    this.$jsBridge &&
                        this.$jsBridge.open({
                            url: encodeURIComponent(
                                `${VUE_APP_DERIVATIVE_PAGE}?needRisk=1&matchRes=${this.matchRes}${
                                    !this.isRiskMatch ? `&symbol=${this.symbol}&user=1` : ''
                                }`
                            ),
                            title: '',
                        })
                    break
                default:
                    break
            }
        },

        onCallMe() {
            if (this.$jsBridge) {
                this.$jsBridge.contactUs()
            } else {
                this.$router.push({
                    path: '/services',
                })
            }
        },

        onQuoteLoaded(data) {
            this.$refs.historyModuleRef.initHistoryTrend(data)
        },
    },
}
</script>
<style scoped lang="less">
@import url('~@/assets/css/mixins.less');

// .mz-footer {
//     display: flex;
//     flex-direction: row;
//     justify-content: center;

//     .statementSty {
//         padding: 8px 14px;
//         color: #666;
//         font-size: 12px;
//         line-height: 16px;
//         text-align: center;
//         background: #fff;
//         border-radius: 35px;
//     }

//     margin-bottom: 24px;
// }

.bond-detail {
    padding: 12px 0 0;
    background: #f9f9f9;
    user-select: none;
    #iosBottom();

    &::after {
        display: block;
        height: 49px;
        content: '';
    }

    .footer-box {
        #iosBottom();

        position: fixed;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1000;
        background: #fff;
    }

    /deep/ footer {
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        justify-content: space-between;
        height: 49px;
        padding: 0 12px;

        button {
            position: relative;
            display: flex;
            justify-content: center;
            background: transparent;
            border: none;
            outline: none;

            span {
                &.mask {
                    position: relative;

                    &::after {
                        position: absolute;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        left: 0;
                        z-index: 1;
                        content: '';
                    }
                }
            }
        }

        .footer-content {
            width: 100%;

            button {
                width: 100%;
                color: #fff;
                font-weight: 700;
                font-size: 16px;
                line-height: 36px;
                background: #ff6907;
                border-radius: 18px;
            }

            .big-btn {
                width: calc(100% - 38px);
                margin-right: 19px;
                margin-left: 19px;
                line-height: 44px;
                border-radius: 28px;
            }

            span:first-child:last-child {
                width: 100%;
            }
        }

        .open-account,
        .buy {
            background: #ff6907;
        }

        .buy:not(.sell).disabled-buy {
            background: rgba(#ff6907, 0.3);
        }

        .sell.buy {
            span {
                width: 50%;
                text-align: center;
            }

            background: linear-gradient(90deg, #ff8d07 0%, #ff6907 50%, #ffa724 50%, #ffba07 100%);
            // - 不可以买 可以卖
            &.disabled-buy {
                background: linear-gradient(90deg, #ffddb5 0%, #ffd2b5 50%, #ffa724 50%, #ffba07 100%);
            }
            // - 不可以卖 可以买
            &.disabled-sell {
                background: linear-gradient(90deg, #ff8d07 0%, #ff6907 50%, #ffe5bd 50%, #ffeab5 100%);
            }
            // - 不可以买、卖
            &.disabled-buy.disabled-sell {
                background: linear-gradient(90deg, #ffddb5 0%, #ffd2b5 50%, #ffe5bd 50%, #ffeab5 100%);
            }
        }
    }
}
</style>
