<!-- 询价详情 -->
<template>
    <div class="fcn-details">
        <div :class="{ locked: showMask }">
            <van-collapse class="collapse" v-model="activeNames[0]" :border="false">
                <van-collapse-item name="0" class="item-title">
                    <div slot="title" class="title">{{ $t('fcn.quoteResults') }}</div>
                    <div>
                        <div class="quote-result-section">
                            <span>{{ $t('fcn.quotePricer') }}</span>
                            <span>{{ InquiryItemMap.interalLabelMap[info.inquiryItem || 0] }}</span>
                        </div>
                        <div class="pricer-info" v-for="(item, index) in info.pricerList" :key="index">
                            <div class="pricer-name flex-c">
                                {{ item.pricerName }}
                                <multi-img v-if="index === 0 && item.complete === 2" class="pricer-no1" name="icon_bill_pricer" directory="fund" />
                            </div>
                            <div v-if="item.complete === 0" class="pricer-ing">
                                <div>{{ $t('fcn.quoteing') }}</div>
                                <LoadingView class="loading" props-show show-loading></LoadingView>
                            </div>
                            <div v-if="item.complete === 1" class="c3">{{ $t('fcn.unableQuote') }}</div>
                            <div
                                v-if="item.complete === 2"
                                :class="{ bold: index === 0 && item.complete === 2 }"
                                v-riseFall="{ value: item.price, riseFall: false, sign: info.inquiryItem === 2 }"
                            ></div>
                        </div>
                    </div>
                </van-collapse-item>
            </van-collapse>
            <van-collapse class="collapse" v-model="activeNames[1]" :border="false">
                <van-collapse-item name="1" class="item-title">
                    <div slot="title" class="title">{{ $t('fcn.productOptions') }}</div>
                    <div>
                        <div class="obj-stock">
                            <span class="flex-shrink0 mar-r6">{{ $t('fcn.biaodi') }}</span>
                            <dynamic-font class="biaodi" :value="objList" :options="{ maxFontSize: 12, minFontSize: 8 }"></dynamic-font>
                        </div>
                        <div v-for="(item, index) in productOptionsList" :key="`productOptions_${index}`" class="options-items">
                            <span>{{ item.label }}</span>
                            <span>{{ item.value }}</span>
                        </div>
                    </div>
                </van-collapse-item>
            </van-collapse>
            <van-collapse class="collapse" v-model="activeNames[2]" :border="false">
                <van-collapse-item name="2" class="item-title">
                    <div slot="title" class="title">{{ $t('fcn.observeOptions') }}</div>
                    <div v-for="(item, index) in observeOptions" :key="`productOptions_${index}`" class="options-items">
                        <span>{{ item.label }}</span>
                        <span class="options-items">
                            <span>{{ item.value1 }}</span>
                            <div class="v-line" v-if="item.value2"></div>
                            <span v-if="item.value2">{{ item.value2 }}</span>
                        </span>
                    </div>
                </van-collapse-item>
            </van-collapse>
            <van-collapse v-if="isInApp" class="collapse" v-model="activeNames[3]" :border="false">
                <van-collapse-item name="3" class="item-title">
                    <div slot="title" class="title">{{ $t('fcn.inquiryInfo') }}</div>
                    <div v-for="(item, index) in inquiryInfo" :key="`productOptions_${index}`" class="options-items">
                        <span>{{ item.label }}</span>
                        <span>{{ item.value }}</span>
                    </div>
                </van-collapse-item>
            </van-collapse>

            <div v-if="!isInApp" class="outapp-quotation-time">{{ $t('fcn.quotationTime') }}{{ ': ' }}{{ info.quotationTime | dateFormat }}</div>

            <div :style="{ height: `${fixedFooterHeight}px` }"></div>
            <div class="footer" v-if="!hiddenFooter" :class="{ double: twoButtons, 'show-share': showShare }">
                <div class="btn reinquiry" :class="{ 'reinquiry-disable': disableReinquiryComputed }" v-debounce="onLeftClick">
                    <div>
                        {{ leftButtonTitle }}
                        <div class="disable" v-if="disableReinquiryComputed">{{ $t('fcn.nonsupport') }}</div>
                    </div>
                </div>
                <div v-if="twoButtons" class="btn literature" :class="{ 'literature-disable': pricerList.length === 0 }" v-debounce="onRightClick">
                    {{ $t('fcn.getProductLiterature') }}
                </div>
                <div class="share" v-if="showShare" @click="shareAction">
                    <div class="fsfont f-a-share_huaban1 f24"></div>
                    <div class="share-txt">{{ $t('share') }}</div>
                </div>
            </div>
        </div>

        <div v-if="showMask" class="mask" @click="viewDetailHnader(null, '')">
            <svg-icon iconClass="lock" className="lock"></svg-icon>
            <p>
                {{ $t('verifyText1') }}
                <br />
                {{ $t('verifyText2') }}
            </p>
            <button>
                <span class="skew_top1">{{ $t('willVerify') }}</span>
            </button>
        </div>

        <!-- 选择框 -->
        <van-popup v-model="selectVisible" round position="bottom">
            <div class="picker">
                <div class="header">
                    <multi-img class="cancel-btn" name="icon-cancel" directory="common" @click="selectVisible = false" />
                    <span>{{ $t('fcn.getProductLiterature') }}</span>
                    <span class="confirm-btn" :class="{ disabled: !selected.pricerName }" @click="popupConfirmHandle">{{ $t('confirm') }}</span>
                </div>
                <div class="popup-tips">
                    {{ $t('fcn.pleaseSelectPricer') }}
                </div>
                <div
                    class="picker-item"
                    :class="{ selected: isSelected(item) }"
                    v-for="(item, index) in pricerList"
                    :key="index"
                    @click="selected = item"
                >
                    <div>
                        <div class="flex-c">
                            <span>{{ item.pricerName }}</span>
                            <multi-img v-if="index === 0 && item.complete === 2" class="pricer-no1" name="icon_bill_pricer" directory="fund" />
                        </div>
                        <div v-if="index !== 0 && isSelected(item)" class="not-best">{{ $t('fcn.notBest') }}</div>
                    </div>
                    <multi-img v-if="isSelected(item)" class="img-selected" name="icon_tick_select" directory="common" />
                </div>
            </div>
        </van-popup>

        <van-dialog
            v-model="dialogVisible"
            :title="$t('prompt')"
            class="custom-dialog"
            :show-cancel-button="!isInApp"
            cancel-button-color="#2F2F2F"
            confirm-button-color="#FF6307"
            :confirm-button-text="$t(isInApp ? 'iKnow' : 'fcn.goApp')"
            @confirm="handleDialogConfirm"
        >
            <div class="dialog__content">
                <div v-if="isInApp">
                    <p>{{ $t('fcn.serviceText') }}</p>
                    <div class="mar-t12">
                        {{ $t('fcn.mainlandService') }}：
                        <a class="c-link" href="tel:400 812 0922">400 812 0922</a>
                    </div>
                    <div class="mar-t12">
                        {{ $t('hkService') }}：
                        <a class="c-link" href="tel:+852 2979 6988">+852 2979 6988</a>
                    </div>
                </div>
                <div v-else>
                    <p>{{ $t('fcn.serviceText2') }}</p>
                </div>
            </div>
        </van-dialog>
    </div>
</template>

<script>
import { Collapse, CollapseItem } from 'vant'
import { currencyFilter } from '@/config/filters'
import DynamicFont from '@/components/FosunDynamicFont.vue'
import { InquiryItemMap, knockOutTypeMap, knockInTypeMap } from './common'
import dayjs from 'dayjs'
import { calcRem, floatToRatio, isIos } from '@/utils'
import { isInApp } from '@/config/globalProterties/env'
import checkPIMixin from '@/mixins/business/checkPIMixin'
import { NoteInquiryOrderDetail, NoteInquiryOrderChoice, NoteInquiryWhiteList, NoteInquiryOrderCreate } from '@/apis/fund/noteApi'
import pathnames from '@/config/H5Pathname'
import LoadingView from '@/components/LoadingView.vue'
import PrivateMixin from '../../list/mixins/private'
import { isEmpty } from 'lodash'

const OrderStatusinvalid = 500

const dateFormat = v => {
    return v ? dayjs(v).format('YYYY/MM/DD HH:mm:ss') : '--'
}

export default {
    name: '',
    mixins: [PrivateMixin, checkPIMixin],
    components: {
        [Collapse.name]: Collapse,
        [CollapseItem.name]: CollapseItem,
        DynamicFont,
        LoadingView,
    },
    props: {},
    data() {
        return {
            isInApp,
            InquiryItemMap,
            info: {},
            activeNames: [['0'], ['1'], ['2'], ['3']],
            whiteList: false, // 白名单
            isLicensed: false, // 持牌销售
            disableReinquiry: false, // 不可以重新请求
            isRequestCreate: false,
            selected: {},
            selectVisible: false,
            dialogVisible: false,
            androidScheme: process.env.VUE_APP_SCHEME_ANDROID,
            iosScheme: process.env.VUE_APP_SCHEME_IOS,
            timer: null,
            createResult: {
                orderId: 0, // 订单ID
                orderNumber: '', //订单号
                objectProductType: 0, // 询价类型	1: FCN
                objectCodeList: [], //标的	无
                inquiryItem: 0, // 询价项	1: 执行价 2: 年化票息 3: 票面价格
                inquiryPeriod: 0, // 期限
                inquiryType: 0, // 询价类型	1: 普通询价 2: 下单询价
                submitTime: '', //提交时间
            },
        }
    },
    computed: {
        fixedFooterHeight() {
            return calcRem(document, 90)
        },
        twoButtons() {
            return (this.isProfessional || this.isLicensed) && this.whiteList && isInApp && this.info.orderStatus !== OrderStatusinvalid
        },
        disableReinquiryComputed() {
            return this.disableReinquiry && this.leftButtonTitle === this.$t('fcn.reinquiry')
        },
        pricerList() {
            return (
                this.info.pricerList?.filter(item => {
                    return item.complete === 2
                }) || []
            )
        },
        leftButtonTitle() {
            // PI 非白名单
            if (!isInApp) {
                return this.$t('fcn.getProductLiterature')
            } else if (this.info.orderStatus === OrderStatusinvalid) {
                return this.$t('fcn.reinquiry')
            } else if (this.isProfessional && !this.whiteList) {
                return this.$t('fcn.getProductLiterature')
            }
            return this.$t('fcn.reinquiry')
        },
        hiddenFooter() {
            if (isEmpty(this.info)) {
                return true
            }
            const case1 = this.info.orderStatus === OrderStatusinvalid && this.isProfessional && !this.whiteList
            const case2 = this.info.orderStatus === OrderStatusinvalid && !isInApp
            return case1 || case2
        },
        showShare() {
            return isInApp && this.isLicensed
        },
        showMask() {
            return !(this.isProfessional || this.whiteList) && !isInApp
        },
        objList() {
            return this.info.objectCodeList
                ?.map(obj => {
                    return `${obj.code}.${obj.mkt.toUpperCase()}`
                })
                .join('、')
        },
        productOptionsList() {
            const date = this.info.effectiveDateOffset
            const list = [
                {
                    label: this.$t('fcn.productType'),
                    value: 'FCN',
                },
                {
                    label: this.$t('fundList.currency'),
                    value: currencyFilter(this.info.currency),
                },
                {
                    label: this.$t('fcn.inquiryPeriod'),
                    value: this.info.inquiryPeriod,
                },
                {
                    label: this.$t('fcn.observationFrequency'),
                    value: this.info.observationFrequency,
                },
                {
                    label: this.$t('fcn.effectiveDateOffset'),
                    value: date ? this.$t('fcn.XEffectiveDay', { X: date }) : '--',
                },
            ]
            const notePrice = {
                label: this.$t('fcn.notePrice'),
                value: floatToRatio(this.info.notePrice, { base: 2, sign: false }),
            }
            const coupon = {
                label: this.$t('fcn.coupon'),
                value: floatToRatio(this.info.coupon, { base: 2, sign: true }),
            }
            if (isInApp) {
                if (this.info.inquiryItem === InquiryItemMap.KeyInteralMap.coupon) {
                    list.push(notePrice)
                } else if (this.info.inquiryItem === InquiryItemMap.KeyInteralMap.notePrice) {
                    list.push(coupon)
                } else {
                    list.push(notePrice)
                    list.push(coupon)
                }
            }

            return list
        },
        observeOptions() {
            const list = []
            const knockInPrice = floatToRatio(this.info.knockInPrice, { base: 2, sign: false })
            const isNone = this.info.knockInType === knockInTypeMap.KeyInteralMap.NONE
            if (this.info.inquiryItem !== InquiryItemMap.KeyInteralMap.strikePrice) {
                list.push({
                    label: this.$t('fcn.strikePrice'),
                    value1: floatToRatio(this.info.strikePrice, { base: 2, sign: false }),
                })
            }
            list.push({
                label: this.$t('fcn.knockOutType'),
                value1: knockOutTypeMap.interalLabelMap[this.info.knockOutType],
                value2: floatToRatio(this.info.knockOutPrice, { base: 2, sign: false }),
            })
            list.push({
                label: this.$t('fcn.knockInType'),
                value1: knockInTypeMap.interalLabelMap[this.info.knockInType],
                value2: isNone ? '--' : knockInPrice,
            })
            return list
        },
        inquiryInfo() {
            const list = []
            const loadingList =
                this.info.pricerList?.filter(item => {
                    return item.complete === 0
                }) || []
            if (this.info.quotationTime && (this.pricerList.length > 0 || loadingList.length === 0)) {
                list.push({
                    label: this.$t('fcn.quotationTime'),
                    value: dateFormat(this.info.quotationTime),
                })
            }
            list.push({
                label: this.$t('fcn.time'),
                value: dateFormat(this.info.inquiryTime),
            })
            list.push({
                label: this.$t('fcn.InquiryID'),
                value: this.info.orderNumber,
            })
            return list
        },
        popupOptions() {
            return ['1', '2']
        },
    },
    watch: {
        '$root.isLogin': {
            async handler(v) {
                if (typeof v === 'boolean' && v) {
                    await this.getNoteInquiryWhiteList()
                    this.getNoteInquiryOrderDetail()
                }
            },
            immediate: true,
        },
    },
    created() {},
    mounted() {},
    destroyed() {},
    filters: { currencyFilter, dateFormat },
    methods: {
        async getNoteInquiryOrderDetail() {
            const params = {
                orderId: Number(this.$route.query.number),
            }
            try {
                const { result = {} } = (await NoteInquiryOrderDetail(params)) ?? {}
                console.log(`yinlong NoteInquiryOrderDetail result`, result, params)
                this.disableReinquiry = result.canReInquiry === 0
                this.info = result
                let time = 1000 * 60 * 2
                const list = result.pricerList.filter(i => i.complete === 0)
                if (list.length > 0) {
                    time = 1000 * 3
                }
                // 两分钟刷新一次
                // 有查询中的数据,三秒更新一次
                setTimeout(() => {
                    this.getNoteInquiryOrderDetail()
                }, time)
            } catch (error) {
                console.error(`NoteInquiryOrderDetail`, error, params)
            }
        },
        async getNoteInquiryWhiteList() {
            try {
                const { result = {} } = (await NoteInquiryWhiteList()) ?? {}
                console.log(`NoteInquiryWhiteList result`, result)
                this.whiteList = result.inWhiteList // 白名单
                this.isLicensed = result.licensed // 持牌销售
            } catch (error) {
                console.error(`NoteInquiryWhiteList`, error)
            }
        },
        async requestNoteInquiryCreate() {
            this.isRequestCreate = true
            const params = { sourceOrderId: Number(this.$route.query.number) }
            try {
                const { result = {} } = (await NoteInquiryOrderCreate(params)) ?? {}
                this.isRequestCreate = false
                this.$loading.show = false
                console.log(`yinlong NoteInquiryOrderCreate result`, result)

                Object.keys(this.createResult).forEach(key => {
                    this.createResult[key] = result[key]
                })
                sessionStorage.setItem('createResult', JSON.stringify(this.createResult))
                this.$router.replace({
                    path: '/bill-add-enquiry-result',
                })
            } catch (error) {
                this.isRequestCreate = false
                this.$loading.show = false
                console.error(`NoteInquiryOrderCreate`, error)
            }
        },
        isSelected(item) {
            return Object.keys(item).reduce((res, key) => {
                return res && item[key] === this.selected[key]
            }, true)
        },
        onLeftClick() {
            if (this.leftButtonTitle === this.$t('fcn.reinquiry')) {
                if (!this.disableReinquiry) {
                    if (!this.isRequestCreate) {
                        this.requestNoteInquiryCreate()
                        this.$toast({
                            message: this.$t('fcn.resubmitted'),
                            duration: 1000,
                            onClose: () => {
                                if (this.isRequestCreate) {
                                    this.$loading.show = true
                                }
                            },
                        })
                    }
                } else {
                    this.$toast(this.$t('fcn.reinquirynotSupported'))
                }
            } else {
                this.onRightClick()
            }
        },
        onRightClick() {
            const requestingList =
                this.info.pricerList?.filter(item => {
                    return item.complete === 0
                }) || []
            if (this.pricerList.length > 0) {
                this.selectVisible = true
            } else if (requestingList.length > 0) {
                this.$toast(this.$t('fcn.requestingToast'))
            } else {
                this.$toast(this.$t('fcn.unableQuote'))
            }
        },
        shareAction() {
            const pageUrl = location.href
            this.$jsBridge.share({ title: this.$t('fcn.shareTitle'), desc: this.objList, pageUrl })
        },
        async popupConfirmHandle() {
            this.selectVisible = false
            const params = {
                orderId: Number(this.$route.query.number),
                pricerName: this.selected.pricerName,
                pricerType: this.selected.pricerType,
            }
            try {
                this.$loading.show = true
                const { result = {} } = (await NoteInquiryOrderChoice(params)) ?? {}
                console.log(`yinlong NoteInquiryOrderChoice result`, result, params)
                this.$loading.show = false
                this.dialogVisible = true
            } catch (error) {
                this.$loading.show = false
                console.error(`NoteInquiryOrderChoice`, error, params)
            }
        },
        handleDialogConfirm() {
            if (!isInApp) {
                // 跳转app之后禁止再跳转中间页
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'hidden') {
                        console.log(document.visibilityState, 'document.visibilityState')
                        // 如果页面隐藏了，则表示唤起成功，这时候需要清除下载定时器
                        this.timer && clearTimeout(this.timer)
                    }
                })
                let scheme = ''
                if (isIos()) scheme = this.iosScheme
                else scheme = this.androidScheme
                const listpage = window.location.origin + window.location.pathname + '#/invest-product/alter-investments'
                console.log(`yinlong listpage`, listpage)
                window.location.href = `${scheme}/web?url=${encodeURIComponent(listpage)}`
                // 3s之后跳转到APP下载页
                this.timer = setTimeout(() => {
                    const { VUE_APP_FOSUN_DOWNLOAD_PAGE: url } = pathnames
                    this.$goPage(url)
                }, 3000)
            }
        },
    },
}
</script>

<style scoped lang="less">
.fcn-details {
    .locked {
        opacity: 0.8;
        filter: blur(4px);
    }

    .collapse {
        margin: 12px;

        .item-title {
            .title {
                color: @h1-white;
                font-weight: bold;
                font-size: 16px;
                line-height: 24px;
            }
        }
    }

    .quote-result-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 16px;
        color: @h3-white;
        font-size: 12px;
        line-height: 16px;
    }

    .pricer-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 36px;
        color: @h1-white;
        font-size: 14px;
        line-height: 20px;

        .pricer-name {
            .pricer-no1 {
                width: 41px;
                height: 16px;
                margin-left: 4px;
            }
        }

        .pricer-ing {
            display: flex;
            align-items: center;
            justify-content: flex-end;

            .loading {
                margin-left: 4px;
            }
        }

        .c3 {
            color: @h3-white;
        }
    }

    .options-items {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 24px;
        color: @h1-white;
        font-size: 14px;
        line-height: 20px;

        + .options-items {
            margin-top: 12px;
        }

        .v-line {
            width: 1px;
            height: 10px;
            margin: 0 12px;
            background: #b6b6b6;
        }
    }

    .obj-stock {
        display: flex;
        height: 36px;
        margin-right: -4px;
        margin-bottom: 8px;
        margin-left: -4px;
        padding-left: 4px;
        color: @h1-white;
        font-size: 14px;
        line-height: 36px;
        background: linear-gradient(89.97deg, rgba(255, 237, 226, 0.48) 0.68%, rgba(255, 247, 241, 0.36) 101.45%);
        border-radius: 4px;

        .biaodi {
            max-width: calc(100vw - 16px - 38px);
        }
    }

    .outapp-quotation-time {
        margin: 20px 13px;
        color: @h3-white;
        font-size: 12px;
        line-height: 16px;
    }

    .footer {
        position: fixed;
        bottom: 0;
        display: flex;
        width: 100%;
        height: 90px;
        padding: 0 28px;
        padding-bottom: 34px;
        background: #fff;

        &.show-share {
            height: 83px;
            padding: 0 32px 0 12px;
            box-shadow: 0 0.5px 0 0 #efefef inset;
        }

        .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 44px;
            margin: 8px 0 4px;
            color: #fff;
            font-weight: bold;
            line-height: 20px;
            text-align: center;
            background: #ff6907;
            border-radius: 22px;
        }

        .share {
            margin-top: 5px;
            margin-left: 39px;
            text-align: center;

            .share-txt {
                color: @h3-white;
                font-size: 10px;
                line-height: 14px;
            }
        }

        .reinquiry-disable {
            opacity: 0.3;

            .disable {
                color: #fff;
                font-size: 12px;
                line-height: 16px;
            }
        }

        &.show-share:not(.double) {
            .btn {
                height: 36px;
                margin: 7px 0 6px;
                background: #ff6907;
            }

            .reinquiry {
                &.reinquiry-disable {
                    opacity: 0.3;

                    .disable {
                        color: rgba(255, 255, 255);
                    }
                }
            }
        }

        &.double:not(.show-share) {
            .btn {
                & + .btn {
                    margin-left: 12px;
                }
            }

            .reinquiry {
                color: @h1-white;
                background: #fff;
                #border_all_1px(#9c9c9c, 22px);

                &.reinquiry-disable {
                    color: rgba(47, 47, 47, 0.3);
                    opacity: 1;

                    .disable {
                        color: rgba(47, 47, 47, 0.3);
                    }
                }
            }

            .literature {
                &.literature-disable {
                    opacity: 0.3;
                }
            }
        }

        &.double.show-share {
            .btn {
                height: 36px;
                margin: 7px 0 6px;
                background: #ff6907;
            }

            .reinquiry {
                background: linear-gradient(90.13deg, #ff8d07 2.3%, #ff6907 99.86%);
                border-radius: 18px 0 0 18px;

                &.reinquiry-disable {
                    color: rgba(255, 255, 255, 0.3);
                    opacity: 1;

                    .disable {
                        color: rgba(255, 255, 255, 0.3);
                    }
                }
            }

            .literature {
                background: linear-gradient(90deg, #ffa724 0%, #ffba07 100%);
                border-radius: 0 18px 18px 0;

                &.literature-disable {
                    color: rgba(255, 255, 255, 0.3);
                    opacity: 1;
                }
            }
        }
    }

    .mask {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 21;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 90%;

        .lock {
            width: 28px;
            height: 28px;
            color: #453d3d;
        }

        p {
            margin: 8px 0 16px;
            color: #666;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
            text-align: center;
        }

        button {
            width: 114px;
            color: #fff;
            font-weight: @fontBold;
            font-size: 14px;
            line-height: 32px;
            text-align: center;
            background-color: @theme;
            border: none;
            border-radius: 16px;
            outline: none;

            span {
                display: inline-block;
            }
        }
    }

    ::v-deep .van-collapse-item__title {
        padding: 14px 12px;
        border-radius: 8px;
    }

    ::v-deep .van-collapse-item__title--expanded {
        border-radius: 8px 8px 0 0;
    }

    ::v-deep .van-collapse-item__content {
        padding: 0 12px 16px;
        border-radius: 0 0 8px 8px;
    }

    ::v-deep .van-cell::after {
        border-bottom: none;
    }
}

.picker {
    height: 80vh;
    padding: 0 0 calc(32px + 34px);
    overflow: scroll;

    .header {
        position: sticky;
        top: 0;
        height: 44px;
        padding: 0 12px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 44px;
        text-align: center;
        background: #fff;

        .cancel-btn {
            position: absolute;
            top: 10px;
            left: 16px;
            width: 24px;
            height: 24px;
        }

        .confirm-btn {
            position: absolute;
            right: 16px;
            color: #ff6907;
            font-size: 14px;

            &.disabled {
                opacity: 0.3;
            }
        }

        .search-wrapper {
            height: 44px;
            padding: 6px 0;

            ::v-deep .out-search {
                height: 32px;
            }

            ::v-deep .van-search .van-cell {
                padding: 6px 0;
            }

            ::v-deep .multi-img {
                width: 20px;
                height: 20px;
            }
        }
    }

    .popup-tips {
        padding: 8px 16px;
        color: @h3-white;
        font-size: 12px;
        line-height: 16px;
    }

    .picker-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 50px;
        margin: 0 8px;
        padding: 0 8px;
        font-size: 14px;
        line-height: 20px;
        text-align: left;
        border: 1px solid transparent;
        border-radius: 8px;

        &.selected {
            border: 1px solid #ff6907;
        }

        .pricer-no1 {
            width: 41px;
            height: 16px;
            margin-left: 4px;
        }

        .img-selected {
            width: 16px;
            height: 16px;
        }

        .not-best {
            color: @h3-white;
            font-size: 11px;
            line-height: 16px;
        }
    }
}

.custom-dialog {
    .dialog__content {
        padding: 0 16px 28px;
        color: @h1-white;
        font-size: 14px;
        line-height: 20px;
    }
}
</style>
