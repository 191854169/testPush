// 认购
<template>
    <div class="subscribe" :class="{ 'subscribe-mmf': showEcashProtocol }">
        <div class="top" v-if="fundMode == 0" @click="goFundDetail">
            <div class="left">
                <div class="fundName">{{ fundInfo.name }}</div>
                <div class="fundNum">
                    <div class="currency" :class="[`currency-${shareCurrency}`]"></div>
                    <p>{{ fundInfo.ISIN }}</p>
                </div>
            </div>
            <div class="right">
                <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
            </div>
        </div>
        <!-- 份额提示，仅私募有 -->
        <template v-if="showQuanityTip">
            <p class="quanity-tip" :class="{ lack: isLackQuanity }">{{ $t(isEmptyQuanity ? 'trade.emptyQuantity' : 'trade.lackQuantity') }}</p>
            <p class="quanity-tip-placeholder">&nbsp;</p>
        </template>
        <div class="top" v-if="fundMode == 1" @click="goFundDetail">
            <div class="left">
                <div class="fundName private">
                    <span class="name">{{ fundInfo.name }}</span>
                    <span class="classify">{{ classify }}</span>
                </div>
            </div>
            <div class="right">
                <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
            </div>
        </div>
        <div class="buyBox">
            <div class="autoBuy">
                <div class="left">{{ $t('trade.rgje') }}</div>
                <div class="right" v-if="isPublicFund" @click="goTradeRule">
                    <span class="right-text">{{ $t('tradeRule') }}</span>
                    <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
                </div>
            </div>
            <div class="numTip" v-show="calcDigits(number)">
                <i></i>
                <span>{{ calcDigits(number) }}</span>
            </div>
            <div class="buyInput" :class="{ hasWrong: calcWrong(number) }">
                <div class="left">{{ shareCurrency }}</div>
                <div class="inputBox">
                    <div class="input">
                        <van-field
                            name="applyMarginLimit"
                            type="text"
                            inputmode="decimal"
                            @keyup="chkPrice"
                            @blur="chkLast"
                            @clear="onClear"
                            v-model="amountDisplay"
                            :placeholder="placeholder"
                            :class="{ 'focus-large': amountDisplay }"
                            clearable
                        />
                    </div>
                    <div class="buyAll" @click="buyAll" :class="{ hasAll: number == maxPurchasingPower && amountDisplay != '' }">
                        {{ $t('trade.qbrg') }}
                    </div>
                </div>
            </div>
            <div class="fast" v-if="fastArr.length > 0">
                <span v-for="(item, index) in fastArr" :key="index" @click="fastInput(item.amount)">{{ item.label }}</span>
            </div>
            <div class="wrongTip" v-show="calcWrong(number)">{{ calcWrong(number) }}</div>
            <!-- <ul v-if="isPrivateFund" class="subscribe-fee-list"> -->
            <div class="subscribe-fee-list">
                <div class="start-content">
                    <div class="item start-amount">
                        <span>{{ $t('startAmount') }}：</span>
                        <span class="amount-value">{{ minInitial | thousandsFilter }}</span>
                        <span>{{ shareCurrency | currencyFilter }}</span>
                    </div>
                    <div class="item fee-amount">
                        <span>{{ $t('trade.rgfl') }}：</span>
                        <span class="amount-value">{{ buyRate }}</span>
                    </div>
                </div>
                <div class="gross-amount">
                    <span>{{ $t('trade.estimateCost') }}：</span>
                    <span>
                        <i class="colorsty">{{ estimatedCost | thousandsFilter }}</i>
                        <span>{{ shareCurrency | currencyFilter }}</span>
                    </span>
                </div>
            </div>
        </div>
        <capital-detail
            v-if="currency"
            ref="capitalDetailRef"
            :product-buy-type="productBuyType"
            :currency="currency"
            :trade-amount="tradeAmount"
            v-model="capitalGap"
            :andNeedDialogMessage="$t(productBuyTypePP ? 'andNeedMsgPP' : 'andNeedMsgCash')"
            @getWithDrawalBalance="onGetWithDrawalBalance"
        ></capital-detail>
        <!-- <div class="card able-card" v-if="isPrivateFund"> -->

        <div class="ratio">
            <div class="title">{{ $t('trade.investAssetRatio') }}</div>
            <div class="t-tips">{{ $t('productDemand') }}{{ productDemandRate }}</div>
            <van-radio-group v-model="radio" direction="horizontal" @change="changeRadio">
                <van-radio v-for="i in investFocusDegreeList" :key="i" :name="i" :value="i">
                    <template v-slot:icon="{ checked }">
                        <multi-img
                            :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'"
                            directory="fund"
                            style="width: 18px"
                        ></multi-img>
                    </template>
                    <span v-if="i < 61">&lt;{{ i }}%</span>
                    <span v-else>&gt;60%</span>
                </van-radio>
            </van-radio-group>
            <p class="custips" v-if="showTips">
                {{ $t('jzdtips') }}
            </p>
        </div>

        <div class="ecash-slogan" v-if="showEcashProtocol">
            <div class="slogan-left">
                <div class="left-content">
                    <p class="open-title">{{ $t('openEcashAllege') }}</p>
                    <div class="left-desc">
                        <p>{{ $t('ecashProfitExceedSave') }}</p>
                        <div class="divider"></div>
                        <p>{{ $t('ecashTradeWeathAsync') }}</p>
                    </div>
                </div>
            </div>
            <button class="slogan-right" @click="goEcashOpen">{{ $t('goOpen') }}</button>
        </div>
        <!-- <div class="maxMoney" v-if="!isPrivateFund">
            {{ $t('trade.kyje') }}
            <span class="num">{{ maxPurchasingPower | thousandsFilter }}{{ currencyObj[shareCurrency] }}</span>

            <span class="ratioTitle">{{ $t('trade.rgfl') }}</span>
            <span class="num">{{ buyRate }}</span>
        </div> -->
        <div class="xgxy">
            <p>{{ $t('readContent') }}</p>
            <div>
                <i v-for="(item, idx) in fileList" :key="idx">{{ item ? '《' + item.fileType + '》' : '' }}</i>
                <i v-if="!isPrivateFund">《{{ $t('publicRisk') }}》</i>
                <i v-else>《{{ $t('riskWarning') }}》</i>
                <span>《{{ $t('protocol.clientStatement') }}》</span>
                <span class="protocol" @click="goProtocol">{{ $t('checkTheAgreement') }}</span>
            </div>
        </div>
        <footer>
            <div class="agree">
                <van-checkbox class="outter-checkbox" v-model="agreeFlag">
                    <template v-slot:icon="{ checked }">
                        <multi-img
                            class="check-icon"
                            :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'"
                            directory="fund"
                        ></multi-img>
                    </template>
                    <p class="label">
                        <span>{{ $t('trade.bryydbty') }}</span>
                        <span class="protocol" @click.stop="goProtocol">《{{ $t('trade.xgxywj') }}》</span>
                        <span>及</span>
                        <span class="protocol" @click.stop="goClientStatement">《{{ $t('protocol.clientStatement') }}》</span>
                    </p>
                </van-checkbox>
                <template v-if="showEcashProtocol">
                    <van-checkbox class="outter-checkbox" @click="ecashRedeemDialog = true" :disabled="ecashAutoRollOut" v-model="ecashAutoRollOut">
                        <template v-slot:icon="{ checked }">
                            <multi-img
                                class="check-icon"
                                :name="checked ? 'icon_agreement_select--disabled' : 'icon_agreement_normal'"
                                directory="common"
                            ></multi-img>
                        </template>
                        <p class="label">
                            <span>{{ $t('trade.bryydbtykt') }}</span>
                            <span class="protocol" @click.stop="goEcashProtocol('rollOut')">{{ $t('trade.ecashAutoOutProtocol') }}</span>
                        </p>
                    </van-checkbox>
                </template>
            </div>
            <div class="button" :class="{ canSign: canSign }" v-debounce="sure">{{ $t('trade.rengou') }}</div>
            <div class="safe-padding-bottom"></div>
        </footer>
        <van-dialog
            class="outter-dialog"
            v-model="buySure"
            :title="$t('trade.rgqr')"
            :show-cancel-button="true"
            cancel-button-color="#2F2F2F"
            confirm-button-color="#FF6307"
            :confirm-button-text="$t('trade.queding')"
            @confirm="confirmBuy"
        >
            <div class="diagBox">
                <div class="item">
                    <div class="left">{{ $t('tradeAccount') }}</div>
                    <div class="right">{{ accts.subAcctId }}</div>
                </div>
                <div class="item">
                    <div class="left">{{ $t('trade.cpmc') }}</div>
                    <div class="right">{{ fundInfo.name }}{{ classify }}</div>
                </div>
                <div class="item">
                    <div class="left">{{ $t('trade.rgje') }}</div>
                    <div class="right">{{ amountDisplay }}{{ shareCurrency }}</div>
                </div>
                <div class="item" v-if="isPrivateFund">
                    <div class="left">{{ $t('buyRate') }}</div>
                    <div class="right">{{ calcRate(buyRate) }}{{ shareCurrency }}</div>
                </div>
                <div class="item" v-if="isPrivateFund">
                    <div class="left">{{ $t('transactionAmount') }}</div>
                    <div class="right">{{ transactionAmount }}{{ shareCurrency }}</div>
                </div>
            </div>
        </van-dialog>
        <van-dialog
            class="outter-dialog"
            v-model="buyFail"
            :title="$t('trade.rgsb')"
            confirm-button-color="#FF6907"
            :confirm-button-text="$t('iGet')"
        >
            <div class="dialogContent">{{ failText }}</div>
        </van-dialog>
        <van-dialog
            class="outter-dialog"
            v-model="cepingDiag"
            :title="$t('prompt')"
            :show-cancel-button="true"
            cancel-button-color="#2F2F2F"
            confirm-button-color="#FF6307"
            :confirm-button-text="$t('goRisk')"
            @confirm="cepingSure"
        >
            <div class="cepingBox">
                {{ cepingText }}
            </div>
        </van-dialog>
        <van-dialog
            class="outter-dialog statement-dialog"
            v-model="showStatement"
            :lazy-render="false"
            :close-on-click-overlay="true"
            :confirm-button-color="confirmColor"
            :confirm-button-text="confirmText"
            @confirm="confirmStatement"
        >
            <template v-slot:title></template>
            <div class="dialogContent statement" id="scroll" v-html="statement"></div>
        </van-dialog>
        <van-dialog
            class="outter-dialog"
            v-model="ecashRedeemDialog"
            :title="$t('ecashTradeRollOutRemind')"
            confirm-button-color="#FF6907"
            :confirm-button-text="$t('iGet')"
        >
            <div class="ecash-dialog-content">
                <span v-html="$t('ecashOpenRemindMessage')"></span>
                <span class="text-link" @click="goWhatsEcash">&nbsp;{{ $t('whatsEcash') }}</span>
            </div>
        </van-dialog>
        <investmentProTradeDialog v-model="showInvestmentProPopup"></investmentProTradeDialog>
        <loading :propsShow="true" :msg="loadingMsg" :showLoading="showLoading" />
    </div>
</template>
<script>
import JSBridge from '@fs/jsbridge/dist/lib/jsBridge.js'
import { AssetsDetail } from '@/apis/fund/index.js'
import InvestmentProDialogMixin from '@/views/fund/mixins/InvestmentProDialogMixin.js'
import investmentProTradeDialog from '@/views/fund/components/investmentProTradeDialog.vue'
// import { getWithDrawalBalance } from '@/apis/portfolio/index.js'
import { getQuote, getTradingRule } from '@/apis/fund/fund.js'
import { thousandsFilter, currencyFilter } from '@/config/filters.js'
import { Toast } from 'vant'
import { mapState } from 'vuex'
import { ENCRYPT_TYPES } from '@/httpRequest/encrypt.js'
import { milliFormat, floatToRatio, keepDecimals } from '@/utils'
import { addCurParamsForUrl, humanNum } from '@/utils/utils.js'
import { showTip, AGE_LIMIT_CODE } from '@/mixins/AgeLimit'
import { accMul, accDiv } from '@/utils/accurate'
import { getAmount } from '@/apis/amount'
import { productBuy, FundSubscribe, ecashSubscribe, ecashSubscribeWithOpen } from '@/apis/wealth/index.js'
import { getArticleDetail } from '@/apis/cms.js'
import { getLangType } from '../../../utils'
import { isHLApp } from '@/utils/tools.js'
import { FUND_TYPE_MAP } from '../config/common'
import { getFile, getPriDocument } from '@/apis/fund/fund'
import dayjs from 'dayjs'
import NP from 'number-precision'
import verifyMixin from '@/mixins/business/verifyMixins.js'
import pathnames from '@/config/H5Pathname.js'
import { PRODUCT_BUY_TYPE } from '@/config/common'
import capitalDetail from '@/components/capitalDetail'
import TradeLogin from '@/config/globalProterties/tradeLogin'
import { getPageVisibleSupportProperty } from '@/utils/utils'
import wealthOrderInstructionMixin from '@/mixins/wealthOrderInstructionMixin.js'
import { isInOutsideH5 } from '@/utils'

const typeMap = FUND_TYPE_MAP.keyValueMap

const KMaxTradeValue = 99999999.99

export default {
    name: 'subscribe',
    mixins: [verifyMixin, wealthOrderInstructionMixin, InvestmentProDialogMixin],
    components: { capitalDetail, investmentProTradeDialog },
    filters: {
        currencyFilter,
        typeFilter(v, $t) {
            return (
                {
                    1: $t('stockType'),
                    2: $t('bondType'),
                    3: $t('mixedType'),
                    4: $t('currencyType'),
                }[v] || ''
            )
        },
    },
    data() {
        return {
            checked: true,
            number: '',
            show: false,
            selectIndex: 0,
            agreeFlag: true,
            ecashAutoRollOut: true, // 星财宝自动赎回协议
            ecashAutoRollIn: false, // 星财宝自动买入协议
            radio: '',
            buySure: false,
            buyFail: false,
            failText: '',
            fundInfo: {},
            power: {},
            riskRatingObj: {
                0: this.$t('lowRisk'),
                1: this.$t('lowRisk'),
                2: this.$t('middleLowRisk'),
                3: this.$t('middleRisk'),
                4: this.$t('middleHighRisk'),
                5: this.$t('highRisk'),
            },
            isDividendObj: {
                0: this.$t('trade.bupaixi'),
                1: this.$t('trade.paixi'),
            },
            fastArr: [
                { amount: '2000', label: '2000' },
                { amount: '3000', label: '3000' },
                { amount: '5000', label: '5000' },
            ],
            priAvailableWithdrawBalance: 0, // 私募 最大购买力/可用金额
            pubAvailableWithdrawBalance: 0, // 公募 单币种现金可用
            summaryWithdrawBalance: 0, // 公募 账户总现金 - 包含别的币种转换后的之和

            buyRate: '',
            unitAmount: '',
            investFocusDegree: '', //投资集中度
            deGree: false, //验证投资集中度
            fundMode: 1, //0：公募 1：私募
            minInitial: 0, //最小起投金额
            placeholder: '',
            amountDisplay: '',
            // 映射为行情数值 https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001170
            focusDegreeObj: {
                0: 999,
                1: 15,
                2: 30,
                3: 45,
                4: 60,
                5: 75,
                6: 90,
            },
            cepingDiag: false,
            cepingText: '',
            isAssessed: '',
            isExpired: '',
            investFocusDegreeList: [15, 30, 45, 60, 61],
            timer: '',
            confirmColor: '#C7C7C7',
            confirmText: '',
            showStatement: false,
            statement: '',
            countTime: 20,
            hasView: false, // 是否已经看完声明
            scrollBottom: false, //已经滚动到底部
            //FHANIGCSBF-SP-A 大中华A   FHANIGCSBF-SP-B 大中华B   FHANIGHSF-SP 大健康    FHANICNEF-SP 碳中和  FHANISCBF-SP-A 优先A  FHANISCBF-SP-B 优先B
            stateDocNameArr: ['FHANIGCSBF-SP-A', 'FHANIGCSBF-SP-B', 'FHANIGHSF-SP', 'FHANICNEF-SP', 'FHANISCBF-SP-A', 'FHANISCBF-SP-B'],
            shareCurrency: '',
            loadingMsg: this.$t('inCommit'),
            showLoading: false,
            privateFundAmount: {}, // 私募份额信息
            showTips: false,
            typeMap: typeMap,
            fileList: [],
            cashBoxMap: {}, // 星财宝开通信息,
            myLinkTradeLogin: null, // 中移动交易密码登录、站外通用卖出校验交易密码
            ecashRedeemDialog: false, // 星财宝自动赎回提示 dialog
            capitalGap: 0,
            propertyData: {}, // 页面监听属性
            isGoEcashOpen: false, // 是否前往星财宝开通页
        }
    },
    computed: {
        ...mapState('user', ['accts']),
        accountType() {
            return this.accts?.type
        },
        canSign() {
            return (
                !this.isEmptyQuanity &&
                this.number !== '' &&
                this.agreeFlag &&
                this.deGree &&
                this.calcWrong(this.number) == '' &&
                Number(this.number) >= Number(this.minInitial) &&
                this.number &&
                this.capitalGap <= 0
            )
        },
        classify() {
            return this.fundInfo?.otherShareType?.find(item => item.symbol === this.symbol)?.shareType || ''
        },
        isPublicFund() {
            return this.fundMode === 0
        },
        isPrivateFund() {
            return this.fundMode === 1
        },
        maxPurchasingPower() {
            return this.isPrivateFund ? this.priAvailableWithdrawBalance : this.pubAvailableWithdrawBalance
        },
        // 投资集中度上限
        productDemandRate() {
            return this.$t(`bills.payRate.${this.fundInfo.investFocusDegree || 0}`)
        },
        // 返回的为半分比数据
        quanityPercent() {
            const { remainingVol = '', totalVol = '' } = this.privateFundAmount
            if (remainingVol === '' || totalVol === '') return 100 // 为空表示认购份额无上限
            return accMul(accDiv(remainingVol, totalVol), 100)
        },
        showQuanityTip() {
            // 私募 && 份额数量在0 ~ 20 之间
            return this.isPrivateFund && this.quanityPercent <= 20
        },
        // 份额是否紧张
        isLackQuanity() {
            return this.quanityPercent <= 20 && this.quanityPercent > 0
        },
        // 份额为空
        isEmptyQuanity() {
            return this.quanityPercent <= 0
        },
        // 估算费用 - 认购费用
        estimatedCost() {
            const rate = accDiv(Number.parseFloat(this.buyRate, 10) || 0, 100)
            const num = this.number || 0
            const res = accMul(num, rate)
            return floatToRatio(res, { sign: false, rate: false })
        },
        //交易金额=买入金额+预估费用
        transactionAmount() {
            return keepDecimals(NP.plus(this.number, this.estimatedCost), 2)
        },

        // 可用资金不足时是否可以展示“引导入金”按钮
        isShowDepositGuide() {
            return this.capitalGap > 0 || this.maxPurchasingPower <= 0
        },

        // 校验综合可提现金是否充足
        // isEnoughWithdrawalBalance() {
        //     // 公募 单币种小于总资产说明当前币种不会去兑付其它币种的欠款
        //     if (this.isPrivateFund) return true

        //     // 综合账户可提现金 单币种可提现金 都 >= 金额，则不校验是否欠款
        //     const amount = Number(this.number)
        //     if (this.pubAvailableWithdrawBalance >= amount && this.summaryWithdrawBalance >= amount) return true
        //     return this.pubAvailableWithdrawBalance <= this.summaryWithdrawBalance
        // },
        isMMF() {
            return this.fundInfo.isMMF === 1
        },
        // 展示星财宝协议文件
        showEcashProtocol() {
            // MMF基金 并且 未开通星财宝
            return this.isMMF && !this.cashBoxMap.openStatus
        },
        tradeAmount() {
            return NP.plus(this.number, this.estimatedCost)
        },

        currency() {
            return this.fundInfo?.currency
        },
        productBuyTypePP() {
            return this.productBuyType === PRODUCT_BUY_TYPE.keysMap.purchasingPower
        },
        productBuyType() {
            if (this.fundInfo.isPP && !this.isMMF) {
                return PRODUCT_BUY_TYPE.keysMap.purchasingPower
            }
            return PRODUCT_BUY_TYPE.keysMap.cash
        },
    },
    watch: {
        showStatement(v) {
            document.title = this.$t(!v ? 'trade.subscribeFund' : 'prompt')
            if (!v) {
                clearInterval(this.timer)
                this.timer = null
                this.countTime = 20
            }
        },
        $route(route, oldRoute) {
            if (!route.query.tipsPage && oldRoute.query.tipsPage) {
                if (this.hasView) {
                    setTimeout(() => {
                        this.sure()
                    }, 0)
                }
            }
        },
    },
    async created() {
        console.warn('accts:', this.accts.type)
        this.symbol = this.$route.params.symbol
        this.getRiskassessmentFile()
        this.getPrivateFundAmount()
    },
    async mounted() {
        if (this.$jsBridge) {
            this.$jsBridge?.enabelPageRefreshFunction({ enable: false })
            this.$jsBridge.watchPageVisible(() => {
                this.showReGetEcashStatus()
            })
        } else {
            // 非app页面重新显示事件
            this.propertyData = getPageVisibleSupportProperty()
            // 买入，卖出，开通星财宝返回时，刷新页面
            document.addEventListener(this.propertyData.visibilityChange, this.handlePageShow, false)
        }

        this.$loading.show = {
            show: true,
            options: {
                mask: true,
            },
        }
        await this.getFundInfo()
        await this.getBasicInfo({ symbol: this.symbol })
        console.warn('isMMF:', this.isMMF)
        let instuctionKey = ''
        if (this.isMMF) {
            instuctionKey = 'CASHBOX'
            // MMF基金查询星财宝开通状态
            await this.getEcashUserStatus()
        } else {
            instuctionKey = this.fundMode === 0 ? 'PUBLIC' : 'PRIVATE'
        }
        await Promise.all([
            this.initInstuction(instuctionKey), // 初始化下单指令ID
            this.getRate(),
        ])
        console.warn('------- 初始化ins成功 --------', this.instructionId)
        if (this.isPrivateFund) {
            // 私募调老接口查询资产
            // await this.getPrivateAssetsDeatil()
        } else {
            // 公募调新接口查购买力
            // await this.getPublicAssetsDetail()
        }
        this.$loading.show = false

        this.scroll = document.getElementById('scroll')
        this.scroll.addEventListener('scroll', this.listen)
    },
    beforeDestroy() {
        this.scroll?.removeEventListener('scroll', this.listen)
        if (this.timer != '') {
            clearInterval(this.timer)
        }
        if (!this.$jsBridge) {
            // 非app 清除页面重现事件监听
            document.removeEventListener(this.propertyData.visibilityChange, this.handlePageShow, false)
        }
    },
    methods: {
        // app外监听页面显示
        handlePageShow() {
            if (document[this.propertyData.hidden]) return
            this.showReGetEcashStatus()
        },
        // 重新获取星财宝开通状态
        showReGetEcashStatus() {
            if (this.isMMF && this.isGoEcashOpen) {
                // MMF基金查询星财宝开通状态
                console.log('返回页面获取开通状态')
                this.isGoEcashOpen = false
                this.getEcashUserStatus()
            }
        },
        async getEcashUserStatus() {
            try {
                const result = await this.$store.dispatch('user/getEcashStatus', true)
                console.log('星财宝开通状态：', result)
                this.cashBoxMap = result
            } catch (e) {
                console.error('ecashUserStatus===>e:', e)
            }
        },
        async getPrivateFile() {
            try {
                const {
                    result: { list = [], riskFile = {} },
                } = await getPriDocument({ symbol: this.symbol })
                this.fileList = list
                this.riskFile = riskFile ? [riskFile] : []
            } catch (e) {
                console.log('getPriDocument===>e:', e)
            }
        },
        async getFundFile() {
            try {
                if (!this.symbol) return
                const res = await getFile({ symbol: this.symbol })
                if (res.result && res.result.list) {
                    const resList = res.result.list || []
                    const arrlist = resList
                    this.fileList.unshift(...arrlist)
                }
            } catch (e) {
                console.log('getFile=>e:', e)
            }
        },
        async getRiskassessmentFile() {
            try {
                // 统一用生产的
                let key = this.symbol?.toUpperCase()
                if (/\d$/.test(key)) {
                    key += '-PRIVATE'
                }
                const { result } = await getArticleDetail({ key, preview: 1 }, { encrypt: 0 })
                this.statement = result?.content || ''
            } catch (e) {
                console.error(e)
            }
        },
        async getPrivateFundAmount() {
            try {
                if (this.isPrivateFund) {
                    const { result } = await getAmount({ symbol: this.symbol })
                    this.privateFundAmount = result
                }
            } catch (e) {
                console.error(e)
            }
        },
        //私募基金展示客户声明
        openStatement() {
            this.$router.push(`/subscribe/${this.symbol}?tipsPage=1`)
            this.confirmText = `${this.countTime}s ${this.$t('trade.qhdzdb')}`
            this.countTime = 20
            if (this.timer != '') {
                clearInterval(this.timer)
            }
            this.timer = setInterval(() => {
                this.countTime--
                this.confirmText = `${this.countTime}s ${this.$t('trade.qhdzdb')}`
                if (this.countTime <= 0) {
                    this.countTime = 0
                    clearInterval(this.timer)
                    if (this.countTime == 0 && this.scrollBottom) {
                        this.confirmColor = '#FF6907'
                        this.confirmText = this.$t('trade.wyydbqr')
                        this.hasView = true
                    }
                }
            }, 1000)
            this.showStatement = true
        },
        listen() {
            const scrollTop = this.scroll.scrollTop
            const clientHeight = this.scroll.clientHeight
            const scrollHeight = this.scroll.scrollHeight
            if (scrollHeight > clientHeight && scrollTop + clientHeight + 5 > scrollHeight) {
                this.scrollBottom = true
                console.log('已到底部')
                if (this.countTime == 0 && this.scrollBottom) {
                    this.confirmColor = '#FF6907'
                    this.confirmText = this.$t('trade.wyydbqr')
                    this.hasView = true
                }
            }
        },
        //确认已经阅读
        confirmStatement() {
            this.$router.go(-1)
        },
        //判断是否风险测评
        async isCeping() {
            const data = await this.getAssessStatus()
            // let { isAssessed, isExpired } = data?.result
            this.isAssessed = data?.result.isAssessed
            this.isExpired = data?.result.isExpired
            let { VUE_APP_RISK_PAGE: link } = pathnames
            link = addCurParamsForUrl(link)
            // 是否已经评测，1，是，2，否
            if (this.isAssessed == 2) {
                this.confirmDialog(4, link, {}, { replace: false })
                return false
            }
            // 是否评测过期，1，是，2，否
            if (this.isExpired == 1) {
                this.confirmDialog(5, link, {}, { replace: false })
                return false
            }
            return true
        },
        //跳转到风险测评
        cepingSure() {
            const url = location.origin + '/wealth/riskAssessment.html#/'
            if (JSBridge) {
                JSBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                window.location.href = this.$addCurParamsForUrl(url)
            }
        },
        chkPrice(e) {
            e.target.value = e.target.value.replace(/[^\d.]/g, '')
            //必须保证第一位为数字而不是.
            e.target.value = e.target.value.replace(/^\./g, '')
            //保证只有出现一个.而没有多个.
            e.target.value = e.target.value.replace(/\.{2,}/g, '.')
            //保证.只出现一次，而不能出现两次以上
            e.target.value = e.target.value.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
            this.number = e.target.value.replace(/^(.*\..{2}).*$/, '$1') //只能输入2位小数
            this.amountDisplay = e.target.value = thousandsFilter(this.number)
        },
        chkLast() {
            if (this.amountDisplay == '') {
                return ''
            }
            this.number = keepDecimals(this.number, 2)
            this.amountDisplay = thousandsFilter(this.number)
            // 如果出现非法字符就截取掉
            // if(e.target.value.substr((e.target.value.length - 1), 1) == '.')
            // e.target.value = e.target.value.substr(0,(e.target.value.length - 1));
        },
        onClear() {
            this.number = ''
            this.amountDisplay = ''
        },
        calcReturn(num) {
            if (num > 0) {
                return '+' + num
            }
            return num
        },
        fastInput(item) {
            console.log(item)
            this.number = keepDecimals(item, 2)
            this.amountDisplay = thousandsFilter(this.number)
        },
        //验证投资集中度
        changeRadio(value) {
            console.log('changeRadio', this.radio)
            if (value <= this.investFocusDegree) {
                this.deGree = true
                this.showTips = false
            } else {
                this.deGree = false
                this.showTips = true
                // Toast({ message: this.$t('trade.ndjzdxzbpp'), className: 'invest-focus-degree' })
            }
        },
        //获取基金详情和根据币种获取用户资产
        async getFundInfo() {
            try {
                const res = await getQuote({
                    data: {
                        symbol: this.symbol,
                    },
                })
                if (res.data.result) {
                    const result = res.data.result
                    this.fundMode = result.fundMode //0：公募 1：私募
                    this.fundInfo = this.fundMode == 0 ? result.pubQuote : result.priQuote
                    this.investFocusDegree = this.focusDegreeObj[this.fundInfo.investFocusDegree || 0]
                    console.log('基金信息fundInfo:', this.fundInfo)
                    if (result.fundMode == 1) {
                        this.getPrivateFile()
                    } else {
                        this.getFundFile()
                    }
                }
            } catch (e) {
                console.log('===>e:', e)
            }
        },
        //获取基金交易规则
        async getRate() {
            try {
                const res = await getTradingRule({
                    data: {
                        symbol: this.symbol,
                    },
                })
                if (res.data.result) {
                    console.log('getTradingRule', res.data)
                    this.buyRate = res.data.result.tradingRule.buyRate || '0.00%'
                    this.minInitial = res.data.result.tradingRule.minInitial
                    this.unitAmount = res.data.result.tradingRule.minSubsequent || '0'
                    this.unitAmount = Math.max(0.01, Number(this.unitAmount))
                    console.log(`yinlong this.unitAmount`, this.unitAmount)
                    let minInitialTemp = milliFormat(this.minInitial) // 暂时的起投金额（私募和公募有区分）
                    // if (this.isPrivateFund) {
                    let humanMinInitial, originBaseStartAmount, upperBaseStartAmount, currency
                    if (this.minInitial < 10000) {
                        humanMinInitial = this.minInitial
                        upperBaseStartAmount = Math.ceil(this.minInitial)
                        currency = ''
                    } else {
                        humanMinInitial = humanNum(this.minInitial, 8, true, this.$i18n)
                        originBaseStartAmount = humanMinInitial.slice(0, -1)
                        upperBaseStartAmount = Math.ceil(originBaseStartAmount)
                        currency = humanMinInitial.slice(-1)
                    }

                    // console.log('humanMinInitial',humanMinInitial)
                    // console.log('upperBaseStartAmount',upperBaseStartAmount)
                    // console.log('currency',currency)
                    // const humanMinInitial = humanNum(this.minInitial, 8, true, this.$i18n)
                    // const originBaseStartAmount = humanMinInitial.slice(0, -1)
                    // const upperBaseStartAmount = Math.ceil(originBaseStartAmount)
                    // const currency = humanMinInitial.slice(-1)
                    const base =
                        {
                            [this.$t('yi')]: Math.pow(10, 8),
                            [this.$t('wan')]: Math.pow(10, 4),
                        }[currency] || 1
                    if (this.isPrivateFund) {
                        // 构建私募的快捷输入
                        this.fastArr = [
                            { amount: upperBaseStartAmount * base, label: `${upperBaseStartAmount}${currency}` } /*起投金额 */,
                            { amount: upperBaseStartAmount * 5 * base, label: `${upperBaseStartAmount * 5}${currency}` } /*起投金额 * 5 */,
                            { amount: upperBaseStartAmount * 10 * base, label: `${upperBaseStartAmount * 10}${currency}` } /*起投金额 * 10 */,
                        ]
                        minInitialTemp = upperBaseStartAmount + humanMinInitial.slice(-1)
                    } else {
                        //公募
                        let multiple1, multiple2, multiple3, multiple4
                        if (this.minInitial > 0 && this.minInitial <= 1) {
                            multiple1 = 100
                            multiple2 = 200
                            multiple3 = 500
                            multiple4 = 1000
                        }
                        if (this.minInitial > 1 && this.minInitial <= 10) {
                            multiple1 = 10
                            multiple2 = 20
                            multiple3 = 50
                            multiple4 = 100
                        }
                        if (this.minInitial > 10 && this.minInitial <= 100) {
                            multiple1 = 1
                            multiple2 = 5
                            multiple3 = 10
                            multiple4 = 20
                        }
                        if (this.minInitial > 100 && this.minInitial <= 1000) {
                            multiple1 = 1
                            multiple2 = 2
                            multiple3 = 5
                            multiple4 = 10
                        }
                        if (this.minInitial > 1000 && this.minInitial <= 10000) {
                            multiple1 = 1
                            multiple2 = 2
                            multiple3 = 3
                            multiple4 = 5
                        }
                        if (this.minInitial > 10000) {
                            multiple1 = 1
                            multiple2 = 2
                            multiple3 = 5
                            multiple4 = 10
                        }
                        if (this.minInitial == 0) {
                            this.fastArr = []
                        } else {
                            this.fastArr = [
                                {
                                    amount: upperBaseStartAmount * multiple1 * base,
                                    label: `${upperBaseStartAmount * multiple1}${currency}`,
                                } /*起投金额 */,
                                {
                                    amount: upperBaseStartAmount * multiple2 * base,
                                    label: `${upperBaseStartAmount * multiple2}${currency}`,
                                } /*起投金额 * 5 */,
                                {
                                    amount: upperBaseStartAmount * multiple3 * base,
                                    label: `${upperBaseStartAmount * multiple3}${currency}`,
                                } /*起投金额 * 10 */,
                                {
                                    amount: upperBaseStartAmount * multiple4 * base,
                                    label: `${upperBaseStartAmount * multiple4}${currency}`,
                                } /*起投金额 * 10 */,
                            ]
                        }

                        if (this.minInitial < 10000) {
                            minInitialTemp = upperBaseStartAmount
                        } else {
                            minInitialTemp = upperBaseStartAmount + humanMinInitial.slice(-1)
                        }
                    }
                    // }
                    this.shareCurrency = res.data.result.tradingRule.shareCurrency
                    this.placeholder = `${typeof minInitialTemp === 'number' ? keepDecimals(minInitialTemp, 2) : minInitialTemp}${currencyFilter(
                        this.shareCurrency
                    )}${this.$t('trade.qi')}`
                }
            } catch (error) {
                console.error('获取基金交易规则===>error:', error)
            }
        },
        // 获取资产 老接口
        async getPrivateAssetsDeatil() {
            try {
                if (!this.shareCurrency) {
                    console.warn('获取币种失败')
                    return
                }
                const res = await AssetsDetail({ data: { currency: this.shareCurrency } })
                this.priAvailableWithdrawBalance = res?.data?.result?.availableWithdrawBalance || ''
                console.log('getPrivateAssetsDeatil===>res:', res)
            } catch (e) {
                console.log('getPrivateAssetsDeatil===>e:', e)
            }
        },

        // 获取资产 新接口(判断是否有欠款)
        async onGetWithDrawalBalance(data) {
            try {
                this.power = data
                this.summaryWithdrawBalance = Number(data?.summaryWithdrawBalance || 0)
                this.pubAvailableWithdrawBalance = Number(data?.singleWithdrawBalance || 0)
                this.priAvailableWithdrawBalance = Number(data?.singleWithdrawBalance || 0)
                console.log('onGetWithDrawalBalance===>data:', data)
            } catch (e) {
                console.log('getWithDrawalBalance===>e:', e)
            }
        },

        //计算交易费
        calcRate(rate) {
            const rates = Number(rate.replace('%', ''))
            return keepDecimals(this.number * rates * 0.01, 2)
        },
        //点击全部认购
        buyAll() {
            let powerValue = Number(this.maxPurchasingPower)
            if (this.productBuyTypePP) {
                powerValue = Number(this.power.purchasingPower || 0)
            }

            // 对比可购买的最大值
            powerValue = Math.max(powerValue, 0)
            const rates = this.buyRate.replace('%', '')
            let value = NP.divide(powerValue, NP.plus(1, NP.times(rates, 0.01)))
            value = Math.min(KMaxTradeValue, value)

            // 向下取整
            value = Math.trunc(NP.divide(value, this.unitAmount))
            // 算出来最终结果
            value = NP.times(value, this.unitAmount)

            this.number = keepDecimals(value, 2)
            this.amountDisplay = thousandsFilter(this.number)
        },
        //跳转到协议文件
        goProtocol() {
            const investFocusDegree = this.investFocusDegreeList.indexOf(this.radio) + 1
            const url = location.origin + `/wealth/fund.html#/protocol?symbol=${this.symbol}&investFocusDegree=${investFocusDegree}`
            if (JSBridge) {
                JSBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: '/protocol',
                    query: {
                        symbol: this.symbol,
                        investFocusDegree,
                        type: this.$route.query.type,
                    },
                })
            }
        },
        goClientStatement() {
            const fileName = `客户声明_${getLangType()}.pdf`
            const url = `${location.origin}/wealth/static/${fileName}`
            console.log('pdfUrl:', url)
            const title = this.$t('protocol.clientStatement')
            if (isHLApp() && this.$jsBridge) {
                this.$jsBridge.openPDF({ url: encodeURIComponent(url), title })
            } else {
                window.open(url)
            }
        },
        async sure() {
            // 是否支持认购
            if (!this.canSign) {
                return
            }
            if (!this.usNationalityVerify(false)) {
                return
            }
            // 份额校验
            if (!this.checkQuanity()) return
            // 风测校验
            // if (!(await this.isCeping())) {
            //     return
            // }
            this.isOpenedDerivative = this.getDerivativeStatus()
            const showDialog = result => {
                const investFocusDegree = this.investFocusDegreeList.indexOf(this.radio) + 1
                this.riskMatchDialog(result, investFocusDegree)
            }
            if (!(await this.riskMatchVerify('buy', showDialog))) return

            // 合规风险提示文件阅读
            if (this.isPrivateFund && !this.hasView) {
                this.openStatement()
                return
            }
            const ecashContinueVerify = await this.ecashContinueTradeVerify()
            // 取消继续买入 return
            if (!ecashContinueVerify) return
            try {
                if (JSBridge) {
                    await JSBridge.tradeLogin()
                } else if (isInOutsideH5()) {
                    if (!this.myLinkTradeLogin) {
                        this.myLinkTradeLogin = new TradeLogin({
                            propsData: {
                                subAcctId: this.accts.subAcctId,
                                callBack: () => {
                                    this.buySure = true
                                },
                                showCloseIcon: isInOutsideH5(),
                            },
                        })
                    }
                    this.myLinkTradeLogin.show = true
                    return
                }
                this.buySure = true
            } catch (e) {
                console.log('tradeLogin===>error:', e)
            }
        },

        // 份额校验 - true - 充足 false - 不充足
        checkQuanity() {
            const remainingVol = this.privateFundAmount?.remainingVol
            const isValidRemainingVol = /\d+/g.test(remainingVol)
            if (isValidRemainingVol) {
                if (+this.number > +remainingVol) {
                    const message = `<span>${this.$t(
                        'trade.noQuantityForService'
                    )}<span onclick="location.href='${`${location.origin}/wealth/fund.html#/services`}'">${this.$t('concatUs')}</span></span>`
                    this.$dialog.confirm({
                        value: true,
                        message,
                        overlayStyle: { backgroundColor: 'rgba(0, 0, 0, 0.3)', zIndex: 10000 },
                        showCancelButton: false,
                        confirmButtonColor: '#ff6907',
                        className: 'amout-tip',
                    })
                    return false
                }
            }
            return true
        },
        //检测输入值返回错误信息
        calcWrong(num) {
            if (num == '' || this.amountDisplay == '') {
                return ''
            }
            if (Number(num) < Number(this.minInitial)) {
                return this.placeholder
            } else if (Number(num) > KMaxTradeValue) {
                return `${this.$t('trade.cgmrjexzdbzdmr')}${currencyFilter(this.shareCurrency)}`
            }
            return ''
        },
        //返回输入位数
        calcDigits(num) {
            if (this.amountDisplay == '') {
                return ''
            }
            num = num + ''
            const intStr = num.indexOf('.') > -1 ? num.split('.')[0] : num
            const numArr = {
                4: this.$t('qian'),
                5: this.$t('wan'),
                6: this.$t('shiwan'),
                7: this.$t('baiwan'),
                8: this.$t('qianwan'),
                9: this.$t('yi'),
                10: this.$t('shiyi'),
            }
            return numArr[intStr.length]
        },
        async confirmBuy() {
            this.$sensorsTrack('FundTradeOperation', {
                operation_type: '下单',
                deal_type: '认购',
                fund_type: this.fundInfo.type,
                fund_code: this.fundInfo.ISIN,
                fund_name: this.fundInfo.name,
                subscribe_amount: this.number,
                currency: this.fundInfo.currency,
            })
            if (this.isPrivateFund) {
                this.privateTrade()
            } else {
                // 校验综合可提现金是否充足 - 放在了capital-detail组件内部实现
                if (!(await this.$refs.capitalDetailRef?.check())) return
                this.publicTrade()
            }
        },
        /**
         * @name 继续买入校验
         * @description 非MMF基金 或者 非现金账户直接跳出
         * @returns { Boolean } true: 通过校验或不需要校验， false： 取消买入
         */
        async ecashContinueTradeVerify() {
            if (!this.isMMF || this.accts.type !== 1) return true
            // MMF基金认购显示未生效弹框 && 星财宝服务开通 && 未生效 && 在T日(4:00 ~ 11:00)
            const openTime = this.cashBoxMap.openTime ? dayjs(this.cashBoxMap.openTime).valueOf() : ''
            const timestampDate = this.cashBoxMap.timestamp ? dayjs(this.cashBoxMap.timestamp).format('YYYY-MM-DD') : ''
            const startTime = timestampDate ? dayjs(timestampDate).hour(4).valueOf() : 0
            const endTime = timestampDate ? dayjs(timestampDate).hour(11).valueOf() : 0
            if (!!this.cashBoxMap.openStatus && !this.cashBoxMap.effectiveStatus && openTime && openTime > startTime && openTime < endTime) {
                // 继续买入提示
                return await this.ecashTradeRemind()
            }
            return true
        },

        // 星财宝货币基金买入提示
        async ecashTradeRemind() {
            try {
                await this.$dialog({
                    title: this.$t('ecashTradeRemindTitle'),
                    message: this.$t('ecashTradeRemindMessage'),
                    confirmButtonText: this.$t('continueBuy'),
                    cancelButtonText: this.$t('cancel'),
                    showCancelButton: true,
                })
                return true
            } catch (e) {
                console.log('取消买入')
                return false
            }
        },

        // 公募认购
        async publicTrade() {
            try {
                this.showLoading = true
                const paramsDegree = this.investFocusDegreeList.indexOf(this.radio) + 1
                let res = {},
                    params = {}
                if (this.isMMF) {
                    params = {
                        orderMode: 1, // 下单模式： 1-指定产品 2-自动分配
                        amount: String(this.number),
                        currency: this.shareCurrency,
                        symbol: this.symbol,
                        investFocusDegree: paramsDegree > 4 ? 128 : paramsDegree,
                        instructionId: this.getInstructionId(),
                    }
                    if (this.showEcashProtocol) {
                        // 未开通星财宝
                        params = {
                            ...params,
                            buyKeepAmountUSD: '0', // USD自动转入金额
                            buyKeepAmountHKD: '0', // HKD自动转入金额
                            subscriptionStatus: 2, // 自动(转入)申购状态 1-开启 2-关闭
                            instructionId: this.getInstructionId(),
                        }
                        const { result } = await ecashSubscribeWithOpen(params)
                        res = result || {}
                    } else {
                        const { result } = await ecashSubscribe(params)
                        res = result || {}
                    }
                } else {
                    const { result = {} } = await FundSubscribe(
                        {
                            symbol: this.symbol,
                            currency: this.shareCurrency,
                            amount: String(this.number),
                            investFocusDegree: paramsDegree > 4 ? 128 : paramsDegree,
                            instructionId: this.getInstructionId(),
                        },
                        {
                            encrypt: ENCRYPT_TYPES.APP_TRADE_ENC,
                        }
                    )
                    res = result
                }
                console.warn('FundSubscribe==>result:', res)
                Toast.success({
                    message: this.$t('trade.tijiaochenggong'),
                    forbidClick: true,
                    onClose: () => {
                        this.$router.replace({
                            path: '/submit-result',
                            query: {
                                isMMF: this.isMMF ? 1 : 0,
                                orderId: res.orderId || '',
                                orderNumber: res.orderNumber,
                                symbol: this.symbol,
                                type: 'public',
                            },
                        })
                    },
                })
            } catch (e) {
                this.handleOrderError({
                    error: e,
                    orderFunction: this.publicTrade,
                    callback: err => {
                        console.log('publicTrade ===> e:', e)
                        const error = err?.error || {}
                        if (error?.code === AGE_LIMIT_CODE) {
                            showTip()
                            return
                        }
                        if (error?.data?.tips) {
                            this.failText = error.data.tips
                            this.buyFail = true
                            return
                        }
                        const msg = this.$t('serviceError')
                        msg &&
                            this.$dialog.alert({
                                closeOnClickOverlay: true,
                                title: this.$t('trade.rgsb'),
                                message: msg,
                                messageAlign: 'center',
                                confirmButtonText: this.$t('iGet'),
                            })
                    },
                    timeoutCallback: async orderList => {
                        Toast.success({
                            message: this.$t('trade.tijiaochenggong'),
                            forbidClick: true,
                            onClose: () => {
                                const { orderId, orderNumber } = orderList[0]
                                this.$router.replace({
                                    path: '/submit-result',
                                    query: {
                                        isMMF: this.isMMF ? 1 : 0,
                                        orderId: orderId,
                                        orderNumber: orderNumber,
                                        symbol: this.symbol,
                                        type: 'public',
                                    },
                                })
                            },
                        })
                    },
                    direction: 'subscribe',
                })
            } finally {
                this.showLoading = false
            }
        },

        // 私募认购
        async privateTrade() {
            try {
                this.showLoading = true
                const paramsDegree = this.investFocusDegreeList.indexOf(this.radio) + 1
                const { result } = await productBuy(
                    {
                        symbol: this.symbol,
                        amount: this.number + '',
                        currency: this.shareCurrency,
                        investFocusDegree: paramsDegree > 4 ? 128 : paramsDegree,
                        buyType: PRODUCT_BUY_TYPE.keysMap.cash,
                        instructionId: this.getInstructionId(),
                    },
                    {
                        encrypt: ENCRYPT_TYPES.APP_TRADE_ENC,
                    }
                )
                console.log(`productBuy ===> result:`, result)
                Toast.success({
                    message: this.$t('trade.tijiaochenggong'),
                    onClose: () => {
                        this.$router.replace({
                            path: '/submit-result',
                            query: {
                                orderId: result.orderId,
                                orderNumber: result.orderNumber,
                                symbol: this.symbol,
                                type: 'private',
                            },
                        })
                    },
                })
            } catch (e) {
                this.handleOrderError({
                    error: e,
                    orderFunction: this.privateTrade,
                    callback: err => {
                        console.log('privateTrade===>e:', e)
                        const error = err.error || {}
                        const msg = error.message || this.$t('serviceError')
                        msg &&
                            this.$dialog.alert({
                                closeOnClickOverlay: true,
                                title: this.$t('trade.rgsb'),
                                message: msg,
                                messageAlign: 'center',
                                confirmButtonText: this.$t('iGet'),
                            })
                    },
                    timeoutCallback: async orderList => {
                        Toast.success({
                            message: this.$t('trade.tijiaochenggong'),
                            onClose: () => {
                                const { orderId, orderNumber } = orderList[0]
                                this.$router.replace({
                                    path: '/submit-result',
                                    query: {
                                        orderId,
                                        orderNumber,
                                        symbol: this.symbol,
                                        type: 'private',
                                    },
                                })
                            },
                        })
                    },
                    direction: 'subscribe',
                })
            } finally {
                this.showLoading = false
            }
        },

        // 星财宝前往详情页
        goEcashProtocol(type = '') {
            const key =
                {
                    rollIn: '',
                    rollOut: 'CASH_ZDSH_BOX',
                }[type] || ''
            if (!key) return
            console.warn('key', type)
            const { VUE_APP_BUILDER_PAGE } = pathnames
            const url = `${VUE_APP_BUILDER_PAGE}?key=${key}`
            if (this.$jsBridge) return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            location.href = url
        },

        // 前往星财宝开通页
        goEcashOpen() {
            this.isGoEcashOpen = true
            let params = { close: true }
            if (isInOutsideH5()) {
                const symbol = this.$route.query.symbol
                const path = pathnames.VUE_APP_WEALTH_FUND_PAGE + `subscribe/${symbol}`
                const urlParams = encodeURIComponent(this.$addCurParamsForUrl(path))
                console.log('******************urlParams:', decodeURIComponent(urlParams))
                params = Object.assign(params, { url: urlParams })
            }
            this.$goPage('/sign', params, {
                pathname: '/wealth/cashBox.html',
            })
        },
        // 了解星财宝
        goWhatsEcash() {
            this.$goPage('/xcbExplain', {}, { pathname: '/wealth/cashBox.html' })
        },

        // 前往基金详情
        goFundDetail() {
            this.$goPage('/detail', { type: this.isPublicFund ? 'public' : 'private', symbol: this.symbol, fundType: this.fundInfo.type })
        },
        // 前往交易规则
        goTradeRule() {
            if (this.isPublicFund) {
                this.$goPage('/trade-rule', { type: 'public', symbol: this.symbol, fundType: this.fundInfo.type })
            }
        },
    },
}
</script>
<style lang="less">
.van-toast {
    max-width: 80%;
}

.amout-tip {
    z-index: 10001 !important;
    width: 280px !important;
    border-radius: 12px;

    .van-dialog__content {
        min-height: auto;
    }

    .van-dialog__message {
        padding: 28px 16px;

        span {
            display: block;
            color: #1f1f1f;
            font-size: 14px;
            line-height: 20px;
            text-align: center;

            span {
                display: inline;
                color: #ff6907;
            }
        }
    }

    .van-dialog__footer {
        .van-dialog__confirm {
            height: 44px;
        }

        box-shadow: inset 0 0.5px 0 #efefef;
    }
}

.invest-focus-degree {
    max-width: 100%;
    white-space: nowrap;
}
</style>
<style lang="less" scoped>
@import url('~@/assets/css/mixins.less');

.subscribe-mmf {
    padding-bottom: 148px !important;
}

.subscribe {
    padding: 12px 12px 116px; // 116 = 104(footer高度) + 12px 间距
    .custips {
        margin-top: 8px;
        color: #f31414;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
    }

    .xgxy {
        margin-top: 32px;
        margin-bottom: 32px;
        color: #9c9c9c;
        font-size: 12px;
        line-height: 16px;

        p {
            margin-bottom: 8px;
            font-weight: 500;
        }

        div {
            font-weight: 400;
            line-height: 18px;

            span.protocol {
                color: #043799;
            }
        }

        i {
            font-style: normal;
        }
    }

    .van-dialog {
        width: 280px;

        /deep/ .van-dialog__header {
            font-size: 16px;
        }
    }

    /deep/ .van-overlay {
        background: rgba(0, 0, 0, 0.3);
    }

    .quanity-tip,
    .quanity-tip-placeholder {
        position: fixed;
        top: 0;
        right: -12px;
        left: -12px;
        z-index: 888;
        width: calc(100% + 24px);
        color: #9d252a;
        font-size: 12px;
        line-height: 32px;
        text-align: center;
        background: #ffe5e7;

        &.lack {
            color: #af7213 !important;
            background: #fff6e8 !important;
        }
    }

    .quanity-tip-placeholder {
        position: relative;
        top: -12px;
        z-index: 887;
        background: transparent;
    }

    .top {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding: 12px;
        background: #fff;
        border-radius: 8px;

        .left {
            flex: 1 1 auto;
            margin-right: 8px;

            .fundName {
                font-weight: 500;
                font-size: 16px;
                line-height: 22px;

                &.private {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;

                    .name {
                        margin-right: 12px;
                    }
                }
            }

            .classify {
                padding: 0 4px;
                color: @fontLightColor;
                font-size: 12px;
                line-height: 16px;
                background: #f8f8f8;
                border-radius: 3px;
            }

            .fundNum {
                display: flex;
                align-items: center;
                margin-top: 7px;

                p {
                    margin-right: 4px;
                    color: #9c9c9c;
                    font-weight: 400;
                    font-size: 10px;
                    line-height: 12px;
                }

                .currency {
                    margin-right: 4px;
                }
            }
        }

        .right {
            display: flex;
            align-items: center;

            img {
                width: 16px;
                height: 16px;
            }
        }
    }

    .buyBox {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 0 12px;
        padding-bottom: 16px;
        background: #fff;
        border-radius: 8px;

        .autoBuy {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding-top: 16px;

            .left {
                font-weight: 700;
                font-size: 16px;
                line-height: 22px;
            }

            .right {
                display: flex;
                align-items: center;

                .right-text {
                    color: #666;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 16px;
                }

                img {
                    width: 12px;
                    height: 12px;
                    margin-left: 4px;
                }
            }
        }

        .numTip {
            position: absolute;
            top: 40px;
            left: 70px;
            z-index: 2;
            display: flex;
            flex-direction: row;
            align-items: center;

            i {
                display: inline-block;
                width: 1px;
                height: 12px;
                margin-right: 2px;
                background: #d6d6d6;
                transform: scaleX(0.5);
            }

            span {
                padding: 2px;
                color: #666;
                font-size: 8px;
                background: #f0f0f0;
                border-radius: 1px;
            }
        }

        .wrongTip {
            margin-top: 8px;
            color: #f31414;
            font-size: 12px;
            line-height: 16px;
        }

        .buyInput {
            position: relative;
            display: flex;
            flex-direction: row;
            align-items: center;
            width: 100%;
            height: 64px;
            overflow: hidden;

            &.hasWrong {
                &::after {
                    background: #f31414;
                }
            }

            .left {
                width: 44px;
                font-size: 20px;
                line-height: 28px;
            }

            .inputBox {
                display: flex;
                flex: 1;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
            }

            .input {
                flex: 1;

                ::v-deep .van-field {
                    padding: 10px 13px;
                    color: #000;
                    font-size: 16px;
                    line-height: 28px;

                    &.focus-large {
                        font-size: 32px;
                        line-height: 44px;
                    }

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
            }

            .buyAll {
                margin-left: 10px;
                color: #ff6907;
                font-size: 14px;

                &.hasAll {
                    opacity: 0.3;
                }
            }
        }

        .fast {
            position: relative;
            width: 100%;
            margin: 0 0 16px;

            span {
                display: inline-block;
                min-width: 48px;
                margin-right: 10px;
                padding: 4px 8px;
                color: #ff6907;
                font-size: 12px;
                line-height: 16px;
                text-align: center;
                background: rgba(255, 105, 7, 0.08);
                border-radius: 12px;
            }

            // 底部0.5 border
            &::after {
                position: absolute;
                right: 0;
                bottom: -16px;
                left: 0;
                height: 1px;
                background: #efefef;
                transform: scaleY(0.5);
                content: '';
            }
        }

        .border-bt {
            width: 100%;
            padding-bottom: 12px;
            border-bottom: 0.5px solid rgb(244, 242, 242);
        }

        .subscribe-fee-list {
            .start-content {
                display: flex;
                flex-direction: row;
                align-items: center;

                .start-amount {
                    margin-right: 28px;
                }
            }

            .amount-value {
                color: #2f2f2f;
            }

            .item {
                margin-top: 16px;
                color: #666;

                span {
                    font-size: 11px;
                    line-height: 14px;

                    &:first-child {
                        color: #666;
                    }
                }
            }

            .gross-amount {
                margin-top: 6px;

                span {
                    color: #666;
                    font-size: 12px;
                    line-height: 20px;
                }

                .colorsty {
                    color: #ff6907;
                    font-style: normal;
                }
            }
        }
    }

    .able-card {
        margin-top: 12px;
        padding: 16px 12px;
        color: #2f2f2f;
        background: #fff;
        border-radius: 8px;

        .card-main {
            display: flex;
            align-items: center;
            margin-top: 0;

            .capital {
                flex: 1 1 auto;
                color: #2f2f2f;

                .label {
                    margin-right: 8px;
                    color: #9c9c9c;
                }

                .need {
                    padding-top: 8px;
                }

                .gap {
                    color: #f31414;
                }
            }

            .save {
                flex: 0 0 auto;
                min-width: 80px;
                padding: 4px 12px;
                color: #fff;
                font-weight: bold;
                font-size: 14px;
                line-height: 20px;
                text-align: center;
                background: #ff6907;
                border-radius: 31px;
                user-select: none;
            }
        }
    }

    .cus-able-card {
        width: 100%;
        margin-top: 12px;
        padding: 12px 0 0;
        color: #2f2f2f;
        background: #fff;
        border-radius: 8px;

        .card-main {
            display: flex;
            align-items: center;
            width: 100%;
            margin-top: 0;
            // justify-content: space-between;
            .capital {
                flex: 1 1 auto;
                color: #2f2f2f;

                .label {
                    margin-right: 8px;
                    color: #9c9c9c;
                }

                .need {
                    padding-top: 8px;
                }

                .gap {
                    color: #f31414;
                }
            }

            .save {
                flex: 0 0 auto;
                min-width: 80px;
                padding: 4px 12px;
                color: #fff;
                font-weight: bold;
                font-size: 14px;
                line-height: 20px;
                text-align: center;
                background: #ff6907;
                border-radius: 31px;
                user-select: none;
            }
        }
    }

    .ratio {
        margin-top: 12px;
        padding: 20px 12px;
        background: #fff;
        border-radius: 8px;

        .title {
            margin-bottom: 6px;
            color: #666;
            font-size: 14px;
            line-height: 20px;
        }

        .t-tips {
            margin-bottom: 16px;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 20px;
        }

        /deep/ .van-radio-group {
            justify-content: space-between;

            .van-radio--horizontal {
                flex: 1;
                margin-right: 0;
            }

            .van-radio__icon {
                display: flex;
                align-items: center;
            }

            .van-radio__label {
                flex: 1;
                margin-left: 2px;
                color: #2f2f2f;
            }
        }
    }

    .ecash-slogan {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 12px;
        padding: 16px;
        background: #fff;
        background-image: url('~@/assets/images/fund/ecash-open-bg@3x.png');
        background-repeat: no-repeat;
        background-position: left bottom;
        background-size: 69px 66px;
        border-radius: 8px;
        box-shadow: inset 0.5px 0.5px 0 #fff;

        .slogan-left {
            display: flex;
            align-items: center;

            .left-content {
                display: flex;
                flex-direction: column;

                .open-title {
                    color: #2f2f2f;
                    font-weight: 500;
                    font-size: 16px;
                    line-height: 22px;
                }

                .left-desc {
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
        }

        .slogan-right {
            padding: 4px 12px;
            color: #fff;
            font-weight: 500;
            font-size: 14px;
            line-height: 20px;
            text-align: center;
            background: #ff6907;
            border-width: 0;
            border-radius: 14px;
        }
    }

    .maxMoney {
        margin-top: 12px;
        color: #9c9c9c;
        font-size: 12px;
        line-height: 16px;

        .num {
            margin-left: 8px;
            color: #666;
        }

        .ratioTitle {
            margin-left: 24px;
        }
    }

    footer {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        padding: 12px;
        background-color: #fff;

        .agree {
            margin: 0 16px;
            font-size: 12px;

            .outter-checkbox {
                position: relative;

                .check-icon {
                    width: 16px;
                    height: 16px;
                }

                /deep/ .van-checkbox__icon {
                    position: absolute;
                    top: 50%;
                    font-size: 16px;
                    transform: translateY(-50%);
                }

                /deep/ .van-checkbox__label {
                    margin-left: 24px;

                    p.label {
                        color: #9c9c9c;

                        .protocol {
                            color: #043799;
                        }
                    }
                }

                &:nth-of-type(2) {
                    margin-top: 12px;
                }
            }
        }

        .button {
            height: 44px;
            margin: 0 16px;
            margin-top: 16px;
            color: #fff;
            font-weight: 700;
            font-size: 16px;
            line-height: 44px;
            text-align: center;
            background: #ff6307;
            border-radius: 22px;
            opacity: 0.3;

            &.canSign {
                opacity: 1;
            }
        }

        .safe-padding-bottom {
            #iosBottom();
        }
    }

    .diagBox {
        display: flex;
        flex-direction: column;
        margin-bottom: 24px;

        .item {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
            padding: 6px 16px;

            .left {
                color: #9c9c9c;
                font-size: 14px;
                line-height: 20px;
            }

            .right {
                width: 160px;
                color: #1f1f1f;
                font-size: 14px;
                line-height: 22px;
                text-align: right;
            }
        }
    }

    .dialogContent {
        padding: 12px 16px 28px;
        overflow-y: scroll;
        text-align: center;

        &.statement {
            padding-top: 0;
        }
    }

    .ecash-dialog-content {
        padding: 0 16px 28px;
        color: #1f1f1f;
        font-weight: 400;
        font-size: 14px;
        line-height: 22px;
        text-align: left;

        .text-link {
            color: #ff6907;
            font-weight: 500;
        }
    }

    .cepingBox {
        padding: 17px 16px 28px;
    }
}

.outter-dialog {
    width: 280px;
    border-radius: 12px;

    &.statement-dialog {
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        border-radius: 0;
        transform: none;

        /deep/ .van-dialog__content {
            .statement {
                height: calc(100vh - 56px);
                overflow: auto;
            }
        }
    }
}

/deep/ .statement {
    p {
        font-size: 14px;
        line-height: 22px;
        text-align: left;
    }
}
</style>
