<template>
    <div class="submit-result">
        <section class="header">
            <multi-img name="submit-success" directory="common" />
            <p>{{ result?.orderStatus === orderStatusKeysMap.CREATING ? $t('tjcgclz') : $t('tjcg') }}</p>
            <p>{{ $t('tradeSuccessRemind') }}</p>
        </section>
        <section class="process" v-if="result">
            <trade-process :orderInfo="result"></trade-process>
        </section>
        <section class="center">
            <ul>
                <li v-for="(item, index) in resultList" :key="index">
                    <span class="label">{{ item.label }}</span>
                    <span class="value">{{ item.value }}</span>
                </li>
            </ul>
        </section>
        <section class="footer">
            <div class="button" @click="successHandler">{{ $t('wancheng') }}</div>
            <!-- <p v-if="!isAuto" @click="goOrderHistory">{{ $t('orderDetail') }}</p> -->
        </section>
        <section v-if="showEcashAutoRollIn" class="open-ecash open-ecash__auto">
            <div class="left">
                <p class="open-title">{{ $t('openEcashAuto') }}</p>
                <div class="left-slogan">
                    <p>{{ $t('ecashCreateInterest') }}</p>
                </div>
            </div>
            <button class="right" @click="goEcashSetting">{{ $t('goStart') }}</button>
        </section>
        <section v-else-if="showEcashKeepAmount" class="open-ecash open-ecash__amount">
            <div class="left">
                <p class="open-title">{{ $t('setKeepAmount') }}</p>
                <div class="left-slogan">
                    <p>{{ $t('ecashKeepAmountAuto') }}</p>
                </div>
            </div>
            <button class="right" @click="goEcashSetting">{{ $t('goSetting') }}</button>
        </section>
    </div>
</template>
<script>
import TradeProcess from '@/components/TradeProcess.vue'
import { orderDetail, ecashUserSetting } from '@/apis/wealth/index.js'
import { thousandsFilter, currencyFilter } from '@/config/filters.js'
import { ORDER_STATUS_MAP } from '@/views/fund/config/common'
import { keepDecimals } from '@/utils'
import dayjs from 'dayjs'
import { i18n } from '@/i18n/cashBox'
import { accountTypeMap } from '@/config/common'
import NP from 'number-precision'
import { isAndroid } from '@/utils/tools'
import { isInOutsideH5 } from '@/utils'

dayjs.extend(require('dayjs/plugin/duration'))

const accountTypeKeyMap = accountTypeMap.keyValueMap

const orderDirectionMap = {
    1: i18n.t('rollIn'),
    2: i18n.t('rollOut'),
}

const orderStatusKeysMap = ORDER_STATUS_MAP.keysMap

export default {
    name: 'submitResult',
    components: {
        TradeProcess,
    },
    data() {
        return {
            result: null,
            orderNumbers: this.$route.query.orderNumbers,
            orient: this.$route.query.orient,
            ecashUserSetting: {}, // 星财宝设置状态
            ecashOpenStatus: 1, // 星财宝开通状态 1：开通，0：未开通
            ecashKeepAmountStorageKey: 'SUBMIT-ECASH-KEEP-AMOUNT-DATE-STORAGE',
            ecashKeepAmountStorageDate: '', // 星财宝保留金额引导存储时间
            resultList: [
                {
                    key: 'productName',
                    label: this.$t('cpmc'),
                    value: '',
                },
                {
                    key: 'orderDirection',
                    label: this.$t('weituoleixing'),
                    value: '',
                    filter: v => {
                        return orderDirectionMap[v] || ''
                    },
                },
                {
                    key: 'applyAmount',
                    label: this.$t('rollInAmount'),
                    labelFilter: row => {
                        return row.orderDirection === 1 ? this.$t('rollInAmount') : this.$t('rollOutAmount')
                    },
                    value: '',
                    filter: (v, row) => {
                        return `${thousandsFilter(keepDecimals(v, 2))}${currencyFilter(row.currency)}`
                    },
                },
                {
                    key: 'account',
                    label: this.$t('tradeAccount'),
                    value: '',
                    filter: (v, row) => {
                        return `${accountTypeKeyMap[row.accountType]}(${v})`
                    },
                },
                {
                    key: 'submitTime',
                    label: this.$t('xdsj'),
                    value: '',
                    filter: v => dayjs(v).format('YYYY/MM/DD HH:mm:ss'),
                },
            ],
            orderStatusKeysMap,
        }
    },
    computed: {
        isAuto() {
            return this.$route.query.isAuto === '1'
        },
        orientText() {
            return {
                rollIn: this.$t('rollIn'),
                rollOut: this.$t('rollOut'),
            }[this.orient]
        },
        // 显示星财宝自动买入引导
        showEcashAutoRollIn() {
            if (this.ecashOpenStatus) {
                // 港美股两个市场都没有开通自动买入
                const HKStatus = this.ecashUserSetting?.hkd?.subscriptionStatus ?? 1 // 自动申购状态：1-开启 2-关闭
                const USStatus = this.ecashUserSetting?.usd?.subscriptionStatus ?? 1 // 自动申购状态：1-开启 2-关闭
                if (HKStatus === 2 && USStatus === 2) {
                    return true
                }
            }
            return false
        },
        // 显示星财宝账户保留金额引导
        showEcashKeepAmount() {
            if (this.ecashOpenStatus) {
                // 港美股两个市场的账户保留金额都 <= 0
                const HKKeepAmount = this.ecashUserSetting?.hkd?.keepAmount ?? '0' // 自动转入保留金额
                const USKeepAmouunt = this.ecashUserSetting?.usd?.keepAmount ?? '0'
                if (Number(HKKeepAmount) <= 0 && Number(USKeepAmouunt) <= 0) {
                    if (this.ecashKeepAmountStorageDate) {
                        // 判断时间是否在当天或者是否超过30天
                        const today = dayjs().format('YYYY-MM-DD')
                        if (this.ecashKeepAmountStorageDate === today) {
                            return true
                        }
                        // 是否超出30天
                        const isExceedThirty = dayjs().subtract(30, 'day').valueOf() >= dayjs(this.ecashKeepAmountStorageDate).valueOf()
                        if (isExceedThirty) {
                            return true
                        }
                    } else {
                        return true
                    }
                }
            }
            return false
        },
    },
    async created() {
        window.document.title = `${this.orientText}${this.$t('result')}`
        if (!this.isAuto) {
            // 非自动买入策略显示订单编号
            this.resultList.push({
                key: 'orderNumber',
                label: this.$t('orderNumber'),
                value: '',
            })
        }
        console.warn('orderNumbers', this.orderNumbers)
        const task = []
        task.push(this.orderDetail(), this.getEcashUserStatus())
        this.$loading.show = {
            show: true,
            options: {
                mask: true,
            },
        }
        await Promise.all(task)
        this.$loading.show = false
    },
    mounted() {
        this.$jsBridge &&
            this.$jsBridge.watchPageVisible(() => {
                this.getEcashUserStatus()
            })
        if (!isAndroid() && isInOutsideH5()) {
            // fix  ios下 買入卖出星财宝页面上移问题
            window.setTimeout(() => {
                window.scrollTo(0, 0)
            }, 100)
        }
    },
    methods: {
        async orderDetail() {
            const orderNumbers = JSON.parse(this.orderNumbers) || []
            try {
                const promiseList = []
                orderNumbers.forEach(orderNumber => {
                    promiseList.push(
                        orderDetail({
                            orderNumber,
                        })
                    )
                })
                let result = {}
                await Promise.all(promiseList).then(results => {
                    const applyAmount = results.reduce((pre, cur) => {
                        const amount = cur.result?.applyAmount || 0
                        pre = NP.plus(pre, Number(amount))
                        return pre
                    }, 0)
                    if (results[0]) {
                        this.result = result = { ...(results[0].result || {}), applyAmount }
                    }
                })
                this.resultList.forEach(item => {
                    const key = item.key
                    item.value = item.filter ? item.filter(result[key], result) : result[key]
                    item.labelFilter && (item.label = item.labelFilter(result))
                    if (key === 'productName' && this.isAuto) {
                        item.value = this.$t('smartTactics')
                    }
                })
            } catch (e) {
                console.log('orderDetail===>e:', e)
            }
        },

        successHandler() {
            if (this.$jsBridge) {
                this.$jsBridge.back()
            } else {
                this.$router.replace('/')
            }
        },

        goOrderHistory() {
            const url = `${window.location.origin}/wealth/fund.html#/order-detail?orderNumber=${this.orderNumber}`
            window.location.replace(url)
        },

        // 星财宝开通信息
        async getEcashUserStatus() {
            try {
                const result = await this.$store.dispatch('user/getEcashStatus', true)
                this.ecashOpenStatus = result?.openStatus || 0
                if (this.ecashOpenStatus) {
                    // 已开通 查询 星财宝设置状态
                    this.getEcashUserSetting()
                    this.getKeepAmountStorageDate()
                }
            } catch (e) {
                console.error('ecashUserStatus===>e:', e)
            }
        },

        // 获取星财宝设置信息
        async getEcashUserSetting() {
            try {
                const { result } = await ecashUserSetting()
                this.ecashUserSetting = result || {}
            } catch (e) {
                console.log('ecashUserSetting===>error:', e)
            }
        },

        // 获取星财宝保留金额引导存储时间
        async getKeepAmountStorageDate() {
            const date = await this.getCashCache(this.ecashKeepAmountStorageKey)
            console.warn('getKeepAmountStorageDate-date:', date)
            date && (this.ecashKeepAmountStorageDate = date)
            if (this.showEcashKeepAmount) {
                this.setKeepAmountStorageDate()
            }
        },
        // 设置星财宝保留金额引导存储时间
        async setKeepAmountStorageDate() {
            console.warn('setKeepAmountStorageDate')
            this.setCashCache(this.ecashKeepAmountStorageKey, dayjs().format('YYYY-MM-DD'))
        },

        /**
         * @name 设置缓存时间
         * @param {String} key
         * @param {String} times
         */
        setCashCache(key, times) {
            if (this.$jsBridge) {
                this.$jsBridge.writeLocalStorage(key, times)
            } else {
                return localStorage.setItem(key, times)
            }
        },
        // 获取缓存时间
        async getCashCache(key) {
            if (this.$jsBridge) {
                const cache = await this.$jsBridge.readLocalStorage(key)
                return cache?.value ?? ''
            }
            return localStorage.getItem(key)
        },

        goEcashSetting() {
            this.$goPage('/autoDeal')
        },
    },
}
</script>
<style scoped lang="less">
@import url('~@/assets/css/mixins.less');

.submit-result {
    min-height: 100vh;
    padding: 0 12px;
    background: #f9f9f9;
    #iosBottom(8px);

    .header {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 37px 0 32px;

        img {
            width: 60px;
            height: 60px;
        }

        p:first-of-type {
            padding: 21px 0 4px;
            color: #1f1f1f;
            font-weight: 700;
            font-size: 18px;
            line-height: 26px;
            text-align: center;
        }

        p:nth-of-type(2) {
            width: 284px;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            text-align: center;
        }
    }

    .process {
        margin-bottom: 12px;
        padding: 12px;
        background: #fff;
        border-radius: 8px;
    }

    .center {
        padding: 8px 12px;
        background: #fff;
        border-radius: 8px;

        ul {
            li {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;

                .label {
                    flex: 0 0 110px;
                    color: #666;
                    text-align: left;
                }

                .value {
                    flex: 1;
                    color: #1f1f1f;
                    text-align: right;
                }
            }
        }
    }

    .footer {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px 0 0;

        .button {
            width: 345px;
            height: 44px;
            color: #fff;
            font-weight: bold;
            font-size: 16px;
            line-height: 44px;
            text-align: center;
            background: @theme;
            border-radius: 49px;
        }

        p {
            padding-top: 16px;
            color: @theme;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            text-align: center;
        }
    }

    .open-ecash {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 32px;
        padding: 16px;
        background-color: #fff;
        background-image: url('~@/assets/images/fund/ecash-open-bg@3x.png');
        background-repeat: no-repeat;
        background-position: left bottom;
        background-size: 69px 66px;
        border-radius: 8px;
        box-shadow: inset 0.5px 0.5px 0 #fff;

        .left {
            display: flex;
            flex-direction: column;

            .open-title {
                color: #2f2f2f;
                font-weight: 500;
                font-size: 16px;
                line-height: 22px;
            }

            .left-slogan {
                display: flex;
                align-items: center;
                margin-top: 6px;
                color: #666;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;

                .divider {
                    height: 11px;
                    margin: 0 6px;
                    border-left: 0.5px solid #cfcfcf;
                }
            }
        }

        .right {
            padding: 4px 12px;
            color: #fff;
            font-weight: 500;
            font-size: 14px;
            line-height: 20px;
            text-align: center;
            background: @theme;
            border-width: 0;
            border-radius: 14px;
        }
    }

    .open-ecash__auto {
        background-image: url('~@/assets/images/fund/ecash-open-auto@3x.png');
        background-position: 0 3px;
        background-size: 86px 86px;
    }

    .open-ecash__amount {
        background-image: url('~@/assets/images/fund/ecash-keep-amount@3x.png');
        background-position: 0 5px;
        background-size: 90px 71px;
    }
}
</style>
