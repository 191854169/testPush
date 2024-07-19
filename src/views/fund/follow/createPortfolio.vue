// 创建投资组合页
<template>
    <div class="create-portfolio">
        <div v-if="isInAPP">
            <navigation-bar @updateNaviHeight="v => (naviHeight = v)" @back="goBack"></navigation-bar>
        </div>
        <section class="process">
            <createStep :stepList="stepList" :active="active"></createStep>
        </section>
        <!-- 第一步 选择市场 -->
        <div v-if="active === 0">
            <section v-show="!isFund" class="selCard">
                <createPortfolioSelCard :is-fund-sel="isFund" @input="didClickPortfoilo"></createPortfolioSelCard>
            </section>
            <!-- 基金市场选择 -->
            <section v-show="isFund" class="selCard">
                <createPortfolioSelCard :is-fund-sel="isFund" @input="didClickFund"></createPortfolioSelCard>
            </section>
        </div>
        <!-- 第二步 添加股票/基金 -->
        <div v-if="active === 1">
            <van-sticky class="pct" :offset-top="naviHeight">
                <div ref="fixedAreaRef">
                    <assetDistributionPct :pctList="pctList"></assetDistributionPct>
                </div>
            </van-sticky>
            <!-- 空白块 -->
            <div v-show="holdList.length" class="blank">
                <div class="greyBlank" :style="{ backgroundColor: '#fff' }"></div>
                <van-sticky :offset-top="naviHeight + fixedAreaHeight" :style="{ height: '0.5px' }">
                    <div class="grey-line"></div>
                </van-sticky>
                <div class="greyBlank"></div>
            </div>
            <!-- 列表 -->
            <div v-show="holdList.length" class="group_container" v-for="(item, index) in holdList" :key="index">
                <div class="group_title">
                    {{ item.marketType | marketFilter(isFund) }}
                    <div class="group_ratio">{{ ratioMap[item.marketType] }}{{ '%' }}</div>
                </div>
                <div class="item_container" v-for="stock in item.holding" :key="stock.productCode">
                    <portfolioStockInfoItem
                        :ref="stock.productCode"
                        :obj="stock"
                        :max="maxRatio"
                        @delete="deleteItme(stock)"
                        @changing="changingItmeRatio"
                    ></portfolioStockInfoItem>
                </div>
                <div class="space" v-if="index != holdList.length - 1"></div>
            </div>
            <div v-if="showChangingPopup" class="sheetPlaceholder"></div>
            <!-- 空视图 -->
            <section v-show="holdList.length == 0" class="empty_container">
                <Empty :show-img="true" :tip-text="getNoDataText()" :imgName="'noProduct'" height="134px"></Empty>
                <div class="addBtn" @click="clickAddBtn">
                    <div class="addBtn-container">
                        <multi-img class="addBtn-addIcon" name="icon_optional_add" directory="fund"></multi-img>
                        <div class="addBtn-title">{{ isFund ? $t('createPortfolio.addFund') : $t('createPortfolio.addStock') }}</div>
                    </div>
                </div>
            </section>
            <div v-if="holdList.length > 0" class="addButtonFixed" @click="clickAddBtn">
                <multi-img class="icon" name="icon_add_orange" directory="common"></multi-img>
            </div>
            <div v-if="holdList.length > 0" class="list_bottom_placeholder"></div>
            <div class="bottom" ref="toolAreaRef">
                <div class="btn previous" @click="goBack">{{ $t('createPortfolio.previous') }}</div>
                <div class="btn next" :class="{ disableNext: holdList.length == 0 }" @click="clickNextBtn">{{ $t('createPortfolio.next') }}</div>
            </div>
        </div>

        <!-- 第三步, 完成创建 -->
        <div v-if="active === 2">
            <!-- 名称输入 -->
            <section class="nameCard">
                <p class="nameCard-title">{{ $t('createPortfolio.inputTitle') }}</p>
                <!-- <Field class="nameCard-textInput" v-model="portfolioName" :placeholder="$t('createPortfolio.inputPlaceholder')" maxlength="10" @input="isShowNameError = false"></Field> -->
                <textLimitedBox
                    class="nameCard-textInput"
                    v-model="portfolioName"
                    clearable
                    :isOneLine="true"
                    :showCount="false"
                    :boxHeight="40"
                    :maxTextLength="10"
                    :placeholder="$t('createPortfolio.inputPlaceholder')"
                    :overBehaviour="'cutOff'"
                    @input="isShowNameError = false"
                ></textLimitedBox>
                <p v-show="isShowNameError" class="nameCard-error">{{ $t('createPortfolio.inputErrorTip') }}</p>
                <p v-show="!isShowNameError" class="nameCard-description">{{ $t('createPortfolio.inputDescription') }}</p>
            </section>
            <div class="completeBox">
                <div class="agreementBox">
                    <p class="agreement">
                        <span>
                            <multi-img
                                class="radio"
                                :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'"
                                directory="fund"
                                width="16"
                                height="16"
                                @click="checked = !checked"
                            ></multi-img>
                        </span>
                        <span>{{ $t('createPortfolio.agreementTip') }}</span>
                        <span v-show="isProfessional" v-html="agreements[0]" @click="clickOrderCreateAgreement" :style="{ color: '#043799' }"></span>
                        <span v-show="isProfessional">{{ $t('createPortfolio.and') }}</span>
                        <span v-html="agreements[1]" @click="clickCustomerAgreement" :style="{ color: '#043799' }"></span>
                    </p>
                </div>

                <div class="complete" :class="{ disableComplete: portfolioName.length === 0 || !checked }" @click="clickCompleteBtn">
                    {{ $t('createPortfolio.complete') }}
                </div>
            </div>
        </div>

        <!-- 占位 -->
        <div :style="{ height: `${toolAreaHeight}px`, backgroundColor: '#fff' }"></div>

        <addStock
            v-model="showAddStock"
            :type="isFund ? 'fund' : 'stock'"
            :currency="fundCurreny"
            :selectedList="selectedList"
            @confirm="confirmAddStock"
        ></addStock>
        <changingRatioPopup ref="popupRef" v-model="showChangingPopup" :max="maxRatio" :defaultValue="defaultValue" @confirm="confirmChanging" />
    </div>
</template>

<script>
import createStep from './components/createStep.vue'
import assetDistributionPct from './components/assetDistributionPct.vue'
import Empty from '@/components/Empty.vue'
import createPortfolioSelCard from './components/createPortfolioSelCard.vue'
import addStock from './components/addStock/addStock.vue'
import portfolioStockInfoItem from './components/portfolioStockInfoItem.vue'
import changingRatioPopup from './components/changingRatioPopup.vue'
import portfolioAddProductMixin from './mixins/portfolioAddProductMixin'
import textLimitedBox from './components/textLimitedBox'

import { Sticky } from 'vant'

import { i18n } from '@/i18n/fund/index.js'
import { isTenantApp, floatToRatio } from '@/utils'
import NP from 'number-precision'
import { isEmpty } from '../../../utils'
import { FUND_TYPE_MAP } from '../config/common'
import { getStepsList } from './mixins/createPortfolio.js'
import pathnames from '@/config/H5Pathname.js'
import { getLangType } from '@/utils/tools.js'

import { PortfolioCreate } from '@/apis/followInvest/index.js'
import NavigationBar from '@/components/NavigationBar.vue'
import platformDifferenceMixin from '@/mixins/platformDifferenceMixin'

export default {
    name: 'create-portfolio',
    mixins: [portfolioAddProductMixin, platformDifferenceMixin],
    data() {
        return {
            naviHeight: 0,
            active: 0,
            showAddStock: false,
            stepList: getStepsList(),
            maxRatio: 0,
            cashValue: 0,
            defaultValue: 0,
            hasAnyChange: false,
            itemChanging: {},
            showChangingPopup: false,
            ratioMap: {},
            fundCurreny: '',
            fixedAreaHeight: 0,
            toolAreaHeight: 0,
            oldScrollTop: 0,
            portfolioType: 0,
            portfolioName: '',
            agreements: [i18n.t('createPortfolio.orderCreateAgreement'), i18n.t('createPortfolio.customerAgreement')],
            checked: false,
            isShowNameError: false,
            isProfessional: this.$route.query.isProfessional === 'true',
            resHolding: [],
        }
    },

    components: {
        textLimitedBox,
        createStep,
        assetDistributionPct,
        Empty,
        createPortfolioSelCard,
        NavigationBar,
        addStock,
        [Sticky.name]: Sticky,
        portfolioStockInfoItem,
        changingRatioPopup,
    },

    filters: {
        marketFilter(i, isFund) {
            if (isFund) {
                return ['', i18n.t('stockType'), i18n.t('bondType'), i18n.t('mixedType'), i18n.t('currencyType'), i18n.t('stockRightType')][i] || '--'
            }
            return ['', i18n.t('HKDMarket'), i18n.t('USDMarket'), ''][i] || '--'
        },
    },

    mounted() {
        this.fixedAreaChangeHeight()
    },

    methods: {
        didClickPortfoilo(value) {
            if (value == 0) {
                this.active = 1
                this.isFund = false
                this.fundCurreny = ''
            } else if (value == 1) {
                this.active = 0
                this.isFund = true
            }
            if (this.active == 1) {
                this.cashValue = 100
                this.holdList = []
            }
        },

        didClickFund(value) {
            if (value == 100) {
                this.fundCurreny = 'HKD'
            } else {
                this.fundCurreny = 'USD'
            }
            this.active = 1
            if (this.active == 1) {
                this.cashValue = 100
                this.holdList = []
            }
        },

        goBack() {
            if (this.active == 0) {
                //基金返回
                if (this.isFund) {
                    this.isFund = false
                    this.holdList = []
                    return
                }
                this.backPreviousPage()
            } else {
                this.active = this.active - 1
            }
        },

        getNoDataText() {
            return this.isFund ? i18n.t('createPortfolio.noFund') : i18n.t('createPortfolio.noStock')
        },

        clickAddBtn() {
            this.showAddStock = true
        },

        async createCustomerPortfolio(holdings) {
            const param = {
                name: this.portfolioName,
                brief: '',
                type: this.portfolioType,
                holdings: holdings,
            }
            try {
                this.$loading.show = true
                const data = await PortfolioCreate(param)
                this.$loading.show = false
                console.log('data.result', data.result)
                if (!isEmpty(data.result) && data.result.id) {
                    this.$toast.success({
                        message: this.$t('createPortfolio.success'),
                        forbidClick: true,
                        duration: 1000,
                        onClose: () => {
                            this.$router.replace({
                                path: `/follow-details`,
                                query: {
                                    portfolioId: data.result.id,
                                    compatibility: 1,
                                },
                            })
                        },
                    })
                }
            } catch (error) {
                console.error(error.error)
                this.$loading.show = false
                if (error?.error?.code == 281403) {
                    this.isShowNameError = true
                } else if (error.error.data) {
                    const data = error.error.data
                    data.tips && this.$toast(data.tips)
                }
            }
        },

        clickNextBtn() {
            if (!this.holdList.length) {
                this.$toast(this.$t('createPortfolio.limitedTip'))
                return
            }
            const holdings = []
            let hasError = false
            this.holdList.forEach(item => {
                item.holding.forEach(citem => {
                    const zero = parseFloat(citem.ratio) === 0
                    citem.ratio_error = zero
                    hasError = hasError || zero
                    holdings.push({
                        productCode: citem.productCode,
                        productType: citem.productType,
                        ratio: citem.ratio,
                    })
                })
            })
            if (hasError) {
                this.refresh()
            } else {
                this.active = 2
                this.resHolding = holdings
            }
        },

        clickCompleteBtn() {
            if (this.portfolioName.length == 0 || !this.checked) {
                return
            }
            this.createCustomerPortfolio(this.resHolding)
        },
        confirmAddStock(list) {
            this.handleAddProduct(list)
            this.updateGroupRatio()
            this.fixedAreaChangeHeight()
        },
        deleteItme(deleteItem) {
            this.holdList.forEach(item => {
                const index = item.holding.findIndex(e => {
                    return e.productCode == deleteItem.productCode
                })
                if (index >= 0) {
                    item.holding.splice(index, 1)
                    this.hasAnyChange = true
                }
            })
            // 过滤没有股票的分组
            this.holdList = this.holdList.filter(item => {
                return !isEmpty(item.holding)
            })
            this.updateGroupRatio()
            this.fixedAreaChangeHeight()
        },
        changingItmeRatio(info) {
            const value = NP.plus(this.cashValue, info.ratio)
            if (value < 1) {
                this.$toast(this.$t('rebalancing.noCash'))
                return
            }

            if (this.itemChanging.productCode == info.productCode) {
                this.endChanging()
                return
            }

            this.itemChanging = info
            // 计算
            this.maxRatio = Math.floor(Number(NP.plus(info.ratio, this.cashValue)))
            this.defaultValue = Math.floor(Number(info.ratio))
            this.holdList.forEach(item => {
                item.holding.forEach(citem => {
                    citem.changingRatio = info.productCode === citem.productCode
                })
            })
            this.showChangingPopup = true
            this.refresh()

            /// 当前滚动的高度
            this.oldScrollTop = window.pageYOffset
            const [itemRef] = this.$refs[`${info.productCode}`]
            const itemTop = itemRef.$el.getBoundingClientRect().bottom
            const deviceHeight = document.body.clientHeight
            window.setTimeout(() => {
                const popupHeight = this.$refs.popupRef.$el.clientHeight + 24
                if (deviceHeight - itemTop < popupHeight) {
                    window.scrollTo(0, this.oldScrollTop + popupHeight - (deviceHeight - itemTop))
                }
            }, 100)
        },
        endChanging() {
            this.holdList.forEach(item => {
                item.holding.forEach(citem => {
                    citem.changingRatio = false
                })
            })
            this.showChangingPopup = false
            this.itemChanging = {}
            window.setTimeout(() => {
                window.scrollTo(0, this.oldScrollTop)
            }, 100)
        },
        confirmChanging(newRatio) {
            this.holdList.forEach(item => {
                item.holding.forEach(citem => {
                    if (this.itemChanging.productCode === citem.productCode) {
                        citem.ratio = newRatio
                        citem.ratio_error = false
                    }
                })
            })
            this.endChanging()
            this.updateGroupRatio()
            this.fixedAreaChangeHeight()
        },
        groupRatio(item) {
            let total = 0
            item.holding?.forEach(citem => {
                total = NP.plus(citem.ratio, total)
            })
            return total
        },
        updateGroupRatio() {
            let total = 0
            this.ratioMap = {}
            this.holdList?.forEach(item => {
                const ratio = this.groupRatio(item)
                this.ratioMap[item.marketType] = floatToRatio(ratio, { rate: false, sign: false })
                total = NP.plus(ratio, total)
            })
            this.cashValue = 100 - total

            this.portfolioType = 0
            //组合类型, 1-港股, 2-美股, 3-基金, 4-混合(港+美)
            if (this.isFund) {
                this.portfolioType = 3
            } else {
                console.log('ratioMap ==> ', this.ratioMap)
                const hkRatio = this.ratioMap[1]
                const usRatio = this.ratioMap[2]
                if (hkRatio && usRatio) {
                    this.portfolioType = 4
                } else if (hkRatio) {
                    this.portfolioType = 1
                } else if (usRatio) {
                    this.portfolioType = 2
                }
            }
            console.log('portfolioType ==> ', this.portfolioType)
        },
        fixedAreaChangeHeight() {
            this.$nextTick(() => {
                this.fixedAreaHeight = this.$refs.fixedAreaRef?.scrollHeight || 0
                this.toolAreaHeight = this.$refs.toolAreaRef?.scrollHeight || 0
            })
        },
        clickOrderCreateAgreement() {
            if (!this.isFund) {
                const H5_KEY = 'PORTFOLIO-ORDER-DISCLAIMER'
                const { VUE_APP_BUILDER_PAGE } = pathnames
                const url = `${VUE_APP_BUILDER_PAGE}?key=${H5_KEY}` // 投资组合免责声明
                if (this.$jsBridge) return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
                location.href = url
            } else {
                const list = this.selectedList.map(item => {
                    return { name: item.name, fundID: item.ISIN, radio: item.ratio }
                })
                localStorage.setItem('investmentList', JSON.stringify(list))
                const url = `${location.origin}${location.pathname}#/follow-rule-list`
                if (this.$jsBridge) return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
                this.$router.push({ name: 'followRuleList' })
            }
        },
        clickCustomerAgreement() {
            const fileName = `客户声明_${getLangType()}.pdf`
            const url = `${location.origin}/wealth/static/${fileName}`
            const title = this.$t('protocol.clientStatement')
            if (isTenantApp() && this.$jsBridge) {
                this.$jsBridge.openPDF({ url: encodeURIComponent(url), title })
            } else {
                window.open(url)
            }
        },
    },

    created() {},

    computed: {
        pctList() {
            let list = []
            if (this.isFund) {
                list = [
                    {
                        key: 'stockFund',
                        pct: this.ratioMap[FUND_TYPE_MAP.keysMap.stock] || 0,
                        label: this.$t('stockType'),
                        groupID: FUND_TYPE_MAP.keysMap.stock,
                    },
                    {
                        key: 'bondFund',
                        pct: this.ratioMap[FUND_TYPE_MAP.keysMap.bond] || 0,
                        label: this.$t('bondType'),
                        groupID: FUND_TYPE_MAP.keysMap.bond,
                    },
                    {
                        key: 'mixtureFund',
                        pct: this.ratioMap[FUND_TYPE_MAP.keysMap.mixed] || 0,
                        label: this.$t('mixedType'),
                        groupID: FUND_TYPE_MAP.keysMap.mixed,
                    },
                    {
                        key: 'moneyFund',
                        pct: this.ratioMap[FUND_TYPE_MAP.keysMap.currency] || 0,
                        label: this.$t('currencyType'),
                        groupID: FUND_TYPE_MAP.keysMap.currency,
                    },
                ]
            } else {
                list = [
                    {
                        key: 'hkStock',
                        pct: this.ratioMap[1] || 0,
                        label: this.$t('HKDMarket'),
                        groupID: 1,
                    },
                    {
                        key: 'usStock',
                        pct: this.ratioMap[2] || 0,
                        label: this.$t('USDMarket'),
                        groupID: 2,
                    },
                ]
            }

            const real = []
            this.holdList.forEach(group => {
                real.push(
                    list.find(e => {
                        return group.marketType == e.groupID
                    })
                )
            })

            real.unshift({
                key: 'cash',
                pct: this.cashValue,
                label: this.$t('cash'),
            })
            return real
        },
    },
    watch: {
        showChangingPopup: {
            handler(nv, ov) {
                if (nv != ov && ov) {
                    this.endChanging()
                }
            },
        },
    },
}
</script>

<style scoped lang="less">
.create-portfolio {
    position: relative;
    z-index: auto;
    height: 100%;
    background-color: #fff;
    #iosBottom();

    .process {
        padding: 16px 24px 20px;
    }

    .pct {
        // height: 54px;

        :deep(.distr-pct) {
            padding: 12px 16px;
        }
    }

    .blank {
        width: 100%;
        height: 16px;

        .greyBlank {
            width: 100%;
            height: 8px;
            background: #f9f9f9;
        }
    }

    .grey-line {
        width: 100%;
        height: 0.5px;
        background: #f9f9f9;
        // box-shadow: 0px -0.5px 0px 0px #efefef inset;
    }

    .selCard {
        padding: 16px;
    }

    .group_container {
        position: relative;
        padding: 12px 16px 0;
        background: #fff;

        .group_title {
            display: flex;
            justify-content: space-between;
            color: @h1-white;
            font-weight: bold;
            font-size: 16px;
            line-height: 38px;
        }

        .item_container {
            height: 56px;
        }

        .space {
            height: 8px;
            margin: 0 -16px;
            background: #f9f9f9;
        }
    }

    .empty_container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-top: 113px;

        .addBtn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 112px;
            height: 32px;
            margin-top: 20px;
            overflow: hidden;
            background-color: rgba(255, 105, 7, 0.07);
            border-radius: 16px;

            &-container {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                width: 72px;
                height: 100%;
            }

            &-addIcon {
                width: 12px;
                height: 12px;
            }

            &-title {
                color: #ff6907;
                font-weight: 400;
                font-size: 14px;
                font-style: normal;
                line-height: 20px;
                text-align: center;
            }
        }
    }

    .addButtonFixed {
        position: fixed;
        right: 24px;
        bottom: 106px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        background: #fff0e6;
        border-radius: 28px;
        box-shadow: 0 5px 5px 0 #efefef;

        .icon {
            width: 24px;
            height: 24px;
        }
    }

    .list_bottom_placeholder {
        height: 78px;
        background-color: #fff;
    }

    .sheetPlaceholder {
        height: 400px;
        background: #fff;
    }

    .bottom {
        position: fixed;
        bottom: 0;
        display: flex;
        width: 100%;
        padding-bottom: 34px;
        // height: 60px;
        background: #fff;

        .btn {
            height: 44px;
            margin-top: 8px;
            margin-bottom: 4px;
            color: #2f2f2f;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
            letter-spacing: 0;
            text-align: center;
            border-radius: 22px;
        }

        .disableNext {
            opacity: 0.3;
        }

        .next {
            flex-shrink: 3;
            width: 100%;
            margin-right: 28px;
            margin-left: 12px;
            padding: 11px 0;
            color: #fff;
            background: #ff6907;
        }

        .previous {
            flex-shrink: 0;
            width: 110px;
            margin-left: 28px;
            padding: 11px 0;
            text-align: center;
            #border_all_1px(#9c9c9c, 22px);
        }
    }

    .nameCard {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        width: 100%;
        height: 200px;
        padding: 44px 32px 0;

        &-title {
            margin-bottom: 16px;
            color: #2f2f2f;
            font-weight: 500;
            font-size: 18px;
            line-height: 26px;
        }

        .nameCard-textInput {
            margin-bottom: 12px;
            background-color: #f6f6f6;
            border-radius: 20px;

            ::v-deep .limited-text {
                background-color: #f6f6f6;
                border-radius: 20px;
            }

            ::v-deep .limited-text-oneline {
                padding: 0 20px;
            }

            ::v-deep .van-field {
                // padding: 10px 12px;
                color: @h1-white;
                font-weight: normal;
                font-size: 14px;
                line-height: 40px;

                input::-webkit-input-placeholder {
                    /* WebKit browsers 适配谷歌 */
                    color: #9c9c9c;
                }

                input:-moz-placeholder {
                    /* Mozilla Firefox 4 to 18 适配火狐 */
                    color: #9c9c9c;
                }

                input::-moz-placeholder {
                    /* Mozilla Firefox 19+ 适配火狐 */
                    color: #9c9c9c;
                }

                input:-ms-input-placeholder {
                    /* Internet Explorer 10+  适配ie */
                    color: #9c9c9c;
                }
            }

            ::v-deep .van-field__control {
                color: #2f2f2f;
                font-weight: 400;
                font-size: 14px;
                line-height: 40px;
            }
        }

        &-error {
            color: #f31414;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }

        &-description {
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }
    }

    .completeBox {
        position: fixed;
        bottom: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 100%;
        padding-bottom: 34px;
        background: #fff;

        .complete {
            // width: 100%;
            height: 44px;
            margin-right: 28px;
            margin-left: 28px;
            padding: 11px 0;
            color: #fff;
            font-weight: 500;
            font-size: 16px;
            line-height: 22px;
            text-align: center;
            background: #ff6907;
            border-radius: 22px;
        }

        .disableComplete {
            background: #ff63074d;
        }

        .agreementBox {
            display: flex;
            width: 100%;
            padding: 0 0 16px 16px;

            .agreement {
                .radio {
                    position: relative;
                    margin-top: 3px;
                    margin-right: 8px;
                }

                display: flex;
                align-items: center;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }
        }
    }
}

.navi_bar {
    position: fixed;
    left: 0;
    z-index: 1000;
    font-weight: bold;
    font-size: 16px;
}
</style>
