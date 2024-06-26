<!--
 * @Description: 产品信息变更
-->

<template>
    <div class="main-wrapper">
        <div class="pad-12 main-content" :class="{ active: flag && !isChecked, 'pad-b16': !flag || isChecked }">
            <div class="bg-white pad-t20 pad-rl12 border-radius-8px pad-b12">
                <div class="border-bottom-1px pad-b16">
                    <div class="flex-middle">
                        <span class="f16 lh-22 mar-r6 h2-white">{{ name }}</span>
                    </div>
                    <div class="mar-t12 f22 lh-28 c-main align-c">{{ form.amount | amountFilter }}{{ form.currency | currencyFilter }}</div>
                </div>
                <div v-if="flag" class="flex-s tips" @click="handlePrompt">
                    <template v-if="!isChecked">
                        <span class="text">{{ $t('bills.confirmDeadline') }}：{{ confirmEndTime | dateTimeFilter }}</span>
                        <multi-img name="icon_prompt" directory="common" width="16" height="16"></multi-img>
                    </template>
                    <span class="text" v-if="isChecked">已接受，请耐心等待处理结果</span>
                </div>
                <div v-if="!flag" class="tips c-gray f12">{{ $t('bills.buyTime') }}：{{ form.buyTimestamp | dateTimeFilter }}</div>
            </div>

            <!-- 英文名称 -->
            <div class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12" v-if="before.nameEn || after.nameEn">
                <div class="c-gray f12">{{ $t('bills.englishName') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">{{ before.nameEn }}</div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">{{ after.nameEn }}</div>
                </div>
            </div>

            <!-- 简体名称 -->
            <div class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12" v-if="before.nameCn || after.nameCn">
                <div class="c-gray f12">{{ $t('bills.simplifiedName') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">{{ before.nameCn }}</div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">{{ after.nameCn }}</div>
                </div>
            </div>

            <!-- 繁体名称 -->
            <div class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12" v-if="before.nameCnt || after.nameCnt">
                <div class="c-gray f12">{{ $t('bills.traditionalName') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">{{ before.nameCnt }}</div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">{{ after.nameCnt }}</div>
                </div>
            </div>

            <!-- 英文标签 -->
            <div class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12" v-if="before.labelEn || after.labelEn">
                <div class="c-gray f12">{{ $t('bills.englishLabel') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">{{ before.labelEn }}</div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">{{ after.labelEn }}</div>
                </div>
            </div>

            <!-- 简体标签 -->
            <div class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12" v-if="before.labelCn || after.labelCn">
                <div class="c-gray f12">{{ $t('bills.simplifiedLabel') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">{{ before.labelCn }}</div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">{{ after.labelCn }}</div>
                </div>
            </div>

            <!-- 繁体标签 -->
            <div class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12" v-if="before.labelCnt || after.labelCnt">
                <div class="c-gray f12">{{ $t('bills.traditionalLabel') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">{{ before.labelCnt }}</div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">{{ after.labelCnt }}</div>
                </div>
            </div>

            <!-- 到期日 -->
            <div class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12" v-if="before.maturityDate || after.maturityDate">
                <div class="c-gray f12">{{ $t('bills.expiryDate') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">{{ before.maturityDate }}</div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">{{ after.maturityDate }}</div>
                </div>
            </div>

            <!-- 预计发行日 -->
            <div class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12" v-if="before.publishDate || after.publishDate">
                <div class="c-gray f12">{{ $t('bills.estimatedReleaseTime') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">{{ before.publishDate }}</div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">{{ after.publishDate }}</div>
                </div>
            </div>

            <!-- 风险评级 -->
            <div class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12" v-if="before.riskOverall || after.riskOverall">
                <div class="c-gray f12">{{ $t('riskLevel') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">{{ before.riskOverall | riskRatingFilter }}</div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">{{ after.riskOverall | riskRatingFilter }}</div>
                </div>
            </div>

            <!-- 复杂产品 -->
            <div class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12" v-if="before.isComplexProduct || after.isComplexProduct">
                <div class="c-gray f12">{{ $t('complexProduct') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">{{ before.isComplexProduct | complexFilter }}</div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">{{ after.isComplexProduct | complexFilter }}</div>
                </div>
            </div>

            <!-- 交收日（简体） -->
            <div
                class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12"
                v-if="before.settlementTimeDay || before.settlementTimeCn || after.settlementTimeDay || after.settlementTimeCn"
            >
                <div class="c-gray f12">{{ $t('bills.settlementDateCN') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">
                        {{ before.settlementTimeDay ? 'T + ' + before.settlementTimeDay : before.settlementTimeCn }}
                    </div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">
                        {{ after.settlementTimeDay ? 'T + ' + after.settlementTimeDay : after.settlementTimeCn }}
                    </div>
                </div>
            </div>

            <!-- 交收日（繁体） -->
            <div
                class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12"
                v-if="before.settlementTimeDay || before.settlementTimeCnt || after.settlementTimeDay || after.settlementTimeCnt"
            >
                <div class="c-gray f12">{{ $t('bills.settlementDateTC') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">
                        {{ before.settlementTimeDay ? 'T + ' + before.settlementTimeDay : before.settlementTimeCnt }}
                    </div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">
                        {{ after.settlementTimeDay ? 'T + ' + after.settlementTimeDay : after.settlementTimeCnt }}
                    </div>
                </div>
            </div>

            <!-- 交收日（英文） -->
            <div
                class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12"
                v-if="before.settlementTimeDay || before.settlementTimeEn || after.settlementTimeDay || after.settlementTimeEn"
            >
                <div class="c-gray f12">{{ $t('bills.settlementDateEN') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">
                        {{ before.settlementTimeDay ? 'T + ' + before.settlementTimeDay : before.settlementTimeEn }}
                    </div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">
                        {{ after.settlementTimeDay ? 'T + ' + after.settlementTimeDay : after.settlementTimeEn }}
                    </div>
                </div>
            </div>

            <!-- 到期兑付（简体） -->
            <div
                class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12"
                v-if="before.maturityPayDay || before.maturityPayCn || after.maturityPayDay || after.maturityPayCn"
            >
                <div class="c-gray f12">{{ $t('bills.paymentDueCN') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">{{ before.maturityPayDay ? 'T + ' + before.maturityPayCn : before.maturityPayCn }}</div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">{{ after.maturityPayDay ? 'T + ' + after.maturityPayCn : after.maturityPayCn }}</div>
                </div>
            </div>

            <!-- 到期兑付（繁体） -->
            <div
                class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12"
                v-if="before.maturityPayDay || before.maturityPayCnt || after.maturityPayDay || after.maturityPayCnt"
            >
                <div class="c-gray f12">{{ $t('bills.paymentDueTC') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">{{ before.maturityPayDay ? 'T + ' + before.maturityPayCnt : before.maturityPayCnt }}</div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">{{ after.maturityPayDay ? 'T + ' + after.maturityPayCnt : after.maturityPayCnt }}</div>
                </div>
            </div>

            <!-- 到期兑付（英文） -->
            <div
                class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12"
                v-if="before.maturityPayDay || before.maturityPayEn || after.maturityPayDay || after.maturityPayEn"
            >
                <div class="c-gray f12">{{ $t('bills.paymentDueEN') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">{{ before.maturityPayDay ? 'T + ' + before.maturityPayCn : before.maturityPayEn }}</div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">{{ after.maturityPayDay ? 'T + ' + after.maturityPayCn : after.maturityPayEn }}</div>
                </div>
            </div>

            <!-- 固定票据  参考利率 -->
            <div class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12" v-if="before.yield || after.yield">
                <div class="c-gray f12">{{ $t('bills.referenceRate') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">{{ before.yield }}%</div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">{{ after.yield }}%</div>
                </div>
            </div>

            <!-- 浮动票据 参考利率 -->
            <div
                class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12"
                v-if="before.yieldMin || after.yieldMin || before.yieldMax || after.yieldMax"
            >
                <div class="c-gray f12">{{ $t('bills.referenceRate') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20" v-if="before.yieldMin && before.yieldMax">
                        {{ before.yieldMin }}% ~ {{ before.yieldMax }}%
                    </div>
                    <div class="w-144 f14 c-main lh-20" v-else>{{ before.yieldMin || before.yieldMax }}%</div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20" v-if="after.yieldMin && after.yieldMax">{{ after.yieldMin }}% ~ {{ after.yieldMax }}%</div>
                    <div class="w-144 f14 c-main lh-20" v-else>{{ after.yieldMin || after.yieldMax }}%</div>
                </div>
            </div>

            <!-- 浮动票据 参考利率（简体） -->
            <div class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12" v-if="before.otherYieldCn || after.otherYieldCn">
                <div class="c-gray f12">{{ $t('bills.referenceRate') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">{{ before.otherYieldCn }}</div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">{{ after.otherYieldCn }}</div>
                </div>
            </div>

            <!-- 浮动票据 参考利率（繁体） -->
            <div class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12" v-if="before.otherYieldTc || after.otherYieldTc">
                <div class="c-gray f12">{{ $t('bills.referenceRate') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">{{ before.otherYieldTc }}</div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">{{ after.otherYieldTc }}</div>
                </div>
            </div>

            <!-- 浮动票据 参考利率（英文） -->
            <div class="bg-white pad-t20 pad-12 border-radius-8px pad-b8 mar-t12" v-if="before.otherYieldEn || after.otherYieldEn">
                <div class="c-gray f12">{{ $t('bills.referenceRate') }}</div>
                <div class="flex-s pad-t12">
                    <div class="w-144 f14 c-main lh-20">{{ before.otherYieldEn }}</div>
                    <multi-img name="icon_transfer" directory="common" width="35" height="14"></multi-img>
                    <div class="w-144 f14 c-main lh-20">{{ after.otherYieldEn }}</div>
                </div>
            </div>

            <div v-if="!flag || isChecked" class="mar-t22">
                <button class="button theme-button w-311" @click="closePage">{{ $t('iKnow') }}</button>
                <div class="f14 lh-18 c-theme pad-t20 pad-b12 align-c" @click="handleConcat" v-if="!flag">{{ $t('concatUs') }}</div>
            </div>
        </div>
        <BottomButton v-if="flag && !isChecked">
            <div class="flex-s pad-rl28 pad-t8 h-56">
                <button class="button w-110" @click="handleOperate(0)">{{ $t('bills.refuse') }}</button>
                <button class="button theme-button" @click="handleOperate(1)">{{ $t('bills.accept') }}</button>
            </div>
        </BottomButton>
    </div>
</template>

<script>
import BottomButton from './components/BottomButton.vue'
import { getConfirmInfo } from '@/apis/fund/note'
import { noteTradeInfo, noteOrderModify } from '@/apis/wealth/index'
import dayjs from 'dayjs'
import { thousandsFilter } from '@/config/filters'
import { CURRENCY_MAP, RISK_RATING_MAP, BILL_COMPLEX_MAP, BILL_CHECKED } from '@/views/fund/config/common'
import JSBridge from '@fs/jsbridge/dist/lib/jsBridge.js'
import { customerService } from '@/utils'
import { Toast } from 'vant'

export default {
    name: 'CustomizeConfirm',
    components: {
        BottomButton,
    },
    filters: {
        currencyFilter(v) {
            return CURRENCY_MAP.keyValueMap[v] || ''
        },
        riskRatingFilter(v) {
            return RISK_RATING_MAP.keyValueMap[v] || ''
        },
        complexFilter(v) {
            return BILL_COMPLEX_MAP.keyValueMap[v] || ''
        },
        dateTimeFilter(v) {
            return v ? dayjs(v).format('YYYY/MM/DD HH:mm:ss') : ''
        },
        amountFilter(v) {
            return v ? thousandsFilter(v) : '--'
        },
    },
    data() {
        return {
            flag: false,
            confirmId: Number(decodeURIComponent(this.$route.query.confirmId)),
            symbol: decodeURIComponent(this.$route.query.symbol),
            orderId: Number(this.$route.query.orderId),
            form: {},
            before: {},
            after: {},
            confirmEndTime: '',
            name: '',
            BILL_CHECKED,
        }
    },
    computed: {
        isChecked() {
            return this.form.checked === BILL_CHECKED
        },
    },
    mounted() {
        this.init()
    },
    methods: {
        init() {
            this.getConfirmInfoData()
            this.getData()
        },
        // 提示
        handlePrompt() {
            this.$dialog.confirm({
                title: this.$t('tipTitle'),
                message: this.$t('bills.confirmDeadlineTips'),
                showCancelButton: false,
                confirmButtonText: this.$t('iKnow'),
            })
        },

        // 获取更改的数据
        async getConfirmInfoData() {
            try {
                const params = {
                    symbol: this.symbol,
                    confirmId: this.confirmId,
                }
                const { result } = await getConfirmInfo(params)
                this.before = result?.before || {}
                this.after = result?.after || {}
                this.confirmEndTime = result?.confirmEndTime
                this.name = result?.name
            } catch (e) {
                console.log('getConfirmInfo===>e:', e)
            }
        },

        // 接受或拒绝
        async handleOperate(type) {
            try {
                const params = {
                    orderIds: this.form.orderIds,
                    customerAcceptNoteModify: type,
                }
                console.log('params=>', params)
                const { result, error } = await noteOrderModify(params)
                if (!error && result) {
                    this.closePage()
                } else {
                    Toast(error?.data?.tips || error?.message)
                }
            } catch (e) {
                Toast(this.$t('serviceError'))
                console.log('noteOrderModify===>e:', e)
            }
        },

        // 获取订单数据
        async getData() {
            try {
                const params = {
                    symbol: this.symbol,
                    subAccountId: this.$store.getters['user/getSubAccountId'],
                }
                const { result } = await noteTradeInfo(params)
                this.form = result || {}
                this.flag = result?.type == 2
            } catch (e) {
                console.log('noteTradeInfo===>e:', e)
                this.form = {}
            }
        },

        handleConcat() {
            customerService()
        },

        // 关闭页面
        closePage() {
            JSBridge ? JSBridge.close() : this.$router.go(-1)
        },
    },
}
</script>

<style lang="less" scoped>
.w-144 {
    width: 144px;
}

.main-wrapper {
    width: 100%;
    height: 100vh;
    overflow: hidden;

    .main-content {
        height: 100%;
        overflow-y: auto;

        &.active {
            height: calc(100% - 72px);
        }
    }

    .tag {
        width: 33px;
        color: #29c277;
        line-height: 16px;
        background: rgba(41, 194, 119, 0.15);
        border-radius: 3px;
    }

    .tips {
        height: 16px;
        margin-top: 12px;

        .text {
            color: #ff751b;
            font-size: 12px;
            line-height: 16px;
        }
    }

    .button {
        display: block;
        font-weight: 700;
        font-size: 16px;
        line-height: 44px;
        background: none;
        border: none;
        border-radius: 31px;
        outline: none;

        &.w-110 {
            width: 110px;
            color: #2f2f2f;
            border: 0.5px solid #9c9c9c;
        }

        &.theme-button {
            width: 197px;
            color: #fff;
            background: #ff6907;
            border: none;
        }

        &.w-311 {
            width: 311px;
            margin: 0 auto;
        }
    }
}
</style>
