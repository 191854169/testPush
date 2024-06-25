<!-- 新增询价 -->
<template>
    <div class="add-fcn">
        <template v-if="!showResultPage">
            <div class="card">
                <div class="title">
                    {{ $t('fcn.productOptions') }}
                </div>
                <div class="product-type">
                    <div class="info-area border-bottom-1px">
                        <div class="type">{{ $t('fcn.productType') }}</div>
                        <div class="type-fcn">FCN</div>
                    </div>
                </div>
                <FCNAddItem
                    v-for="item in productList"
                    :ref="item.id"
                    :key="item.id"
                    v-model="selectedMap[item.id].label"
                    :item="item"
                    :type="item.type"
                    @onClick="onSelect(item)"
                    @focus="onFocus(item.id)"
                    @blur="onBlur(item.id)"
                ></FCNAddItem>
            </div>

            <div class="card">
                <div class="title">
                    {{ $t('fcn.observeOptions') }}
                </div>
                <FCNAddItem
                    v-for="item in observeList"
                    :ref="item.id"
                    :key="item.id"
                    v-model="selectedMap[item.id].label"
                    :item="item"
                    :type="item.type"
                    @onClick="onSelect(item)"
                    @focus="onFocus(item.id)"
                    @blur="onBlur(item.id)"
                ></FCNAddItem>
            </div>

            <div :style="{ height: `${fixedFooterHeight}px` }"></div>
            <div v-if="!showAndroidKeyboard" class="footer">
                <div class="btn" v-debounce="onSubmit">{{ $t('bills.submit') }}</div>
            </div>
        </template>
        <template v-else>
            <div class="result-page">
                <div class="container-top">
                    <div class="content-top">
                        <multi-img name="submit-success" width="60" height="60" directory="common"></multi-img>
                        <div class="text1">{{ $t('trade.tijiaochenggong') }}</div>
                        <div class="desc">{{ $t('fcn.plsWait') }}</div>
                    </div>
                    <div class="content-center border-8">
                        <div class="form-item" :style="item.style || {}" v-for="(item, index) in resultInfoList" :key="index">
                            <span class="key">{{ item.title }}</span>
                            <span class="value">{{ item.value }}</span>
                        </div>
                    </div>
                </div>
                <div class="complete" @click="backPreviousPage">{{ $t('complete') }}</div>
            </div>
        </template>

        <!-- 选择框 -->
        <van-popup v-model="selectVisible" round position="bottom">
            <div class="picker">
                <div
                    class="picker-item"
                    :class="{ selected: selectedMap[popupItem.id].key === item.key }"
                    v-for="item in popupOptions"
                    :key="item.key"
                    @click="handleProductConfirm(item)"
                >
                    {{ item.label }}
                </div>
            </div>
        </van-popup>

        <addObjectStock v-model="objectCodeVisible" :selectedList="selectedObjectStock" @confirm="onObjectStockConfirm"></addObjectStock>
    </div>
</template>

<script>
import FCNAddItem from './components/FCNAddItem.vue'
import addObjectStock from './components/addObjectStock.vue'
import { currencyMap } from '@/config/common'
import { InquiryItemMap, InquiryTypeMap, knockOutTypeMap, knockInTypeMap } from './common'
import { calcRem } from '@/utils'
import { NoteInquiryOrderCreate } from '@/apis/fund/noteApi'
import platformDifferenceMixin from '@/mixins/platformDifferenceMixin'
import dayjs from 'dayjs'
import MonitorKeyboard from '@/utils/monitorKeyboard'

const Key = {
    currency: 'currency', // 货币
    objectCodeList: 'objectCodeList', // 标的
    inquiryItem: 'inquiryItem', // 询价项
    observationFrequency: 'observationFrequency', // 观察频率(月)
    effectiveDateOffset: 'effectiveDateOffset', // 交收时间
    inquiryType: 'inquiryType', // 询价类型
    inquiryPeriod: 'inquiryPeriod', // 期限
    notePrice: 'notePrice', //票面价格
    coupon: 'coupon', // 年化票息
    strikePrice: 'strikePrice', // 	执行价
    knockOutType: 'knockOutType', // 敲出方式
    knockOutPrice: 'knockOutPrice', // 敲出价格
    knockInType: 'knockInType', // 敲入方式
    knockInPrice: 'knockInPrice', // 敲入价格
}
const dateFormat = v => {
    return v ? dayjs(v).format('YYYY/MM/DD HH:mm:ss') : '--'
}
export default {
    name: '',
    mixins: [platformDifferenceMixin],
    components: { FCNAddItem, addObjectStock },
    props: {},
    data() {
        return {
            selectVisible: false,
            objectCodeVisible: false,
            popupItem: {},
            selectedObjectStock: [],
            showAndroidKeyboard: false,
            monitorKeyboard: null,
            oldScrollTop: 0,
            selectedMap: {
                currency: { key: '', label: '' }, // 货币
                objectCodeList: { key: [], label: '' }, // 标的
                inquiryItem: { key: '', label: '' }, // 询价项
                observationFrequency: { key: '', label: '' }, // 观察频率(月)
                effectiveDateOffset: { key: '', label: '' }, // 交收时间
                inquiryType: { key: '', label: '' }, // 询价类型
                inquiryPeriod: { label: '' }, // 期限
                notePrice: { label: '' }, // 票面价格
                coupon: { label: '' }, // 年化票息
                strikePrice: { label: '' }, // 	执行价
                knockOutType: { key: '', label: '' }, // 敲出方式
                knockOutPrice: { label: '' }, // 敲出价格
                knockInType: { key: '', label: '' }, // 敲入方式
                knockInPrice: { label: '' }, // 敲入价格
            },
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
        productList() {
            let list = [
                {
                    id: Key.currency,
                    label: this.$t('fundList.currency'),
                    type: 'options',
                },
                {
                    id: Key.objectCodeList,
                    label: this.$t('fcn.biaodi'),
                    type: 'options',
                },
                {
                    id: Key.inquiryItem,
                    label: this.$t('fcn.inquiryItem'),
                    type: 'options',
                },
                {
                    id: Key.inquiryPeriod,
                    label: this.$t('fcn.inquiryPeriod'),
                    type: 'input',
                    base: 0,
                    range: {
                        min: 1,
                        max: 60,
                    },
                },
                {
                    id: Key.observationFrequency,
                    label: this.$t('fcn.observationFrequency'),
                    type: 'options',
                },
                {
                    id: Key.coupon,
                    label: this.$t('fcn.coupon'),
                    type: 'input',
                    suffix: '%',
                    range: {
                        min: 0.01,
                        max: 100,
                    },
                },
                {
                    id: Key.notePrice,
                    label: this.$t('fcn.notePrice'),
                    type: 'input',
                    suffix: '%',
                    range: {
                        min: 90,
                        max: 100,
                    },
                },
                {
                    id: Key.effectiveDateOffset,
                    label: this.$t('fcn.effectiveDateOffset'),
                    type: 'options',
                },
                {
                    id: Key.inquiryType,
                    label: this.$t('fcn.inquiryType'),
                    type: 'options',
                    infoTips: this.$t('fcn.fxfcntips'),
                },
            ]

            list = list.filter(item => {
                return item.id !== this.inquiryItemKey
            })

            return list
        },
        observeList() {
            const list = [
                {
                    id: Key.strikePrice,
                    label: this.$t('fcn.strikePrice'),
                    type: 'input',
                    suffix: '%',
                    range: {
                        min: 40,
                        max: 100,
                    },
                },
                {
                    id: Key.knockOutType,
                    label: this.$t('fcn.knockOutType'),
                    type: 'options',
                },
                {
                    id: Key.knockOutPrice,
                    label: this.$t('fcn.knockOutBid'),
                    type: 'input',
                    suffix: '%',
                    range: {
                        min: 60,
                        max: 999,
                    },
                },
                {
                    id: Key.knockInType,
                    label: this.$t('fcn.knockInType'),
                    type: 'options',
                },
            ]

            if (this.selectedMap.inquiryItem.key === 1) {
                list.shift()
            }
            if (this.selectedMap.knockInType.key && this.selectedMap.knockInType.key !== knockInTypeMap.KeyInteralMap.NONE) {
                list.push({
                    id: Key.knockInPrice,
                    label: this.$t('fcn.knockInPrice'),
                    type: 'input',
                    suffix: '%',
                    range: {
                        min: 40,
                        max: 100,
                    },
                })
            }
            return list
        },
        popupOptions() {
            switch (this.popupItem.id) {
                case Key.currency: // 货币
                    return [
                        {
                            key: currencyMap.keysMap.USD,
                            label: currencyMap.keyValueMap.USD,
                        },
                        {
                            key: currencyMap.keysMap.HKD,
                            label: currencyMap.keyValueMap.HKD,
                        },
                        {
                            key: currencyMap.keysMap.CNH,
                            label: currencyMap.keyValueMap.CNH,
                        },
                        {
                            key: currencyMap.keysMap.EUR,
                            label: currencyMap.keyValueMap.EUR,
                        },
                    ]
                case Key.objectCodeList: // 标的
                    return []
                case Key.inquiryItem: // 询价项
                    return [
                        {
                            key: InquiryItemMap.KeyInteralMap.strikePrice,
                            label: InquiryItemMap.keyValueMap.strikePrice,
                        },
                        {
                            key: InquiryItemMap.KeyInteralMap.coupon,
                            label: InquiryItemMap.keyValueMap.coupon,
                        },
                        {
                            key: InquiryItemMap.KeyInteralMap.notePrice,
                            label: InquiryItemMap.keyValueMap.notePrice,
                        },
                    ]
                case Key.observationFrequency: // 观察频率(月)
                    return [
                        {
                            key: 1,
                            label: '1',
                        },
                        {
                            key: 2,
                            label: '2',
                        },
                        {
                            key: 3,
                            label: '3',
                        },
                        {
                            key: 6,
                            label: '6',
                        },
                        {
                            key: 12,
                            label: '12',
                        },
                    ]
                case Key.effectiveDateOffset: // 交收时间
                    return [
                        {
                            key: 7,
                            label: '7',
                        },
                        {
                            key: 14,
                            label: '14',
                        },
                    ]
                case Key.inquiryType: // 询价类型
                    return [
                        {
                            key: InquiryTypeMap.KeyInteralMap.normal,
                            label: InquiryTypeMap.keyValueMap.normal,
                        },
                        {
                            key: InquiryTypeMap.KeyInteralMap.trade,
                            label: InquiryTypeMap.keyValueMap.trade,
                        },
                    ]
                case Key.knockOutType: // 敲出方式
                    return [
                        {
                            key: knockOutTypeMap.KeyInteralMap.periodEnd,
                            label: knockOutTypeMap.keyValueMap.periodEnd,
                        },
                        {
                            key: knockOutTypeMap.KeyInteralMap.periodEndMemory,
                            label: knockOutTypeMap.keyValueMap.periodEndMemory,
                        },
                        {
                            key: knockOutTypeMap.KeyInteralMap.daily,
                            label: knockOutTypeMap.keyValueMap.daily,
                        },
                        {
                            key: knockOutTypeMap.KeyInteralMap.dailyMemory,
                            label: knockOutTypeMap.keyValueMap.dailyMemory,
                        },
                    ]
                case Key.knockInType: // 敲入方式
                    return [
                        {
                            key: knockInTypeMap.KeyInteralMap.NONE,
                            label: knockInTypeMap.keyValueMap.NONE,
                        },
                        {
                            key: knockInTypeMap.KeyInteralMap.AKI,
                            label: knockInTypeMap.keyValueMap.AKI,
                        },
                        {
                            key: knockInTypeMap.KeyInteralMap.EKI,
                            label: knockInTypeMap.keyValueMap.EKI,
                        },
                    ]
                default:
                    break
            }
            return []
        },
        inquiryItemKey() {
            return InquiryItemMap.keysMap[this.selectedMap.inquiryItem.key]
        },
        fixedFooterHeight() {
            return calcRem(document, 90)
        },
        resultInfoList() {
            const r = this.createResult
            const item = InquiryItemMap.interalLabelMap[r.inquiryItem] || '--'
            const type = InquiryTypeMap.interalLabelMap[r.inquiryType] || '--'

            const objectCode = r.objectCodeList
                .map(item => {
                    return `${item.code}.${item.mkt.toUpperCase()}`
                })
                .join('  ')
            let style = {}
            if (r.objectCodeList.length === 4) {
                style = {
                    'line-height': '21px',
                    padding: '7px 0',
                }
            }
            return [
                { title: this.$t('fcn.productType'), value: 'FCN' },
                {
                    title: this.$t('fcn.InquiryObj'),
                    value: objectCode,
                    style: style,
                },
                { title: this.$t('fcn.inquiryItem'), value: item },
                { title: this.$t('fcn.inquiryPeriod'), value: r.inquiryPeriod },
                { title: this.$t('fcn.inquiryType'), value: type },
                { title: this.$t('bills.submitTime'), value: dateFormat(r.submitTime) },
                { title: this.$t('fcn.InquiryID'), value: r.orderNumber },
            ]
        },
        showResultPage() {
            return this.$route.name === 'add-enquiry-result'
        },
    },
    watch: {},
    created() {
        if (this.showResultPage) {
            this.createResult = JSON.parse(sessionStorage.getItem('createResult') || '') || {}
        }
        this.getKeyboardState()
    },
    beforeDestroy() {
        this.monitorKeyboard?.onEnd()
    },
    mounted() {},
    destroyed() {},
    filters: { dateFormat },
    methods: {
        onSelect(item) {
            this.popupItem = item
            if (item.id === Key.objectCodeList) {
                this.objectCodeVisible = true
            } else {
                this.selectVisible = true
            }
        },
        async onFocus(refid) {
            await this.$nextTick()
            let dom = this.$refs[`${refid}`]
            if (Array.isArray(dom) && dom.length > 0) {
                dom = dom[0]
            }

            /// 当前滚动的高度
            this.oldScrollTop = window.pageYOffset
            const itemTop = dom.$el.getBoundingClientRect().bottom
            const deviceHeight = document.body.clientHeight
            window.setTimeout(() => {
                const keyboardHeight = 450
                if (deviceHeight - itemTop < keyboardHeight) {
                    window.scrollTo(0, this.oldScrollTop + keyboardHeight - (deviceHeight - itemTop))
                }
            }, 100)
        },
        onBlur() {
            window.setTimeout(() => {
                window.scrollTo(0, this.oldScrollTop)
            }, 100)
        },
        onObjectStockConfirm(list) {
            this.selectedObjectStock = list
            this.selectedMap[this.popupItem.id].label = list
                .map(item => {
                    return `${item.rawSymbol}${item.mkt.toUpperCase()}`
                })
                .join('  ')
            this.selectedMap[this.popupItem.id].key = list.map(item => {
                return {
                    mkt: item.mkt,
                    code: item.rawSymbol,
                }
            })
            console.log(`yinlong`, this.selectedMap[this.popupItem.id])
        },
        getKeyboardState() {
            this.monitorKeyboard = new MonitorKeyboard()
            this.monitorKeyboard.onStart()
            // 监听虚拟键盘弹出事件
            this.monitorKeyboard.onShow(() => {
                this.showAndroidKeyboard = true
            })
            //监听键盘收起的事件
            this.monitorKeyboard.onHidden(() => {
                this.showAndroidKeyboard = false
            })
        },
        handleProductConfirm(item) {
            this.selectedMap[this.popupItem.id] = item
            this.selectVisible = false
            if (this.popupItem.id === Key.inquiryItem) {
                this.selectedMap[this.inquiryItemKey].label = ''
            } else if (this.popupItem.id === Key.knockInType) {
                this.selectedMap.knockInPrice.label = ''
            }
            console.log(`yinlong`, this.selectedMap)
        },
        // 提交
        onSubmit() {
            // 需要校验的项目
            const verifyKeyList = Object.keys(Key)
            if (this.inquiryItemKey) {
                verifyKeyList.remove(this.inquiryItemKey)
            }
            if (this.selectedMap.knockInType.key === knockInTypeMap.KeyInteralMap.NONE) {
                verifyKeyList.remove(Key.knockInPrice)
            }
            let hasEmpty = false
            let hasError = false
            let firstErrorDom = undefined
            const verifyFunc = (list, callback) => {
                list.forEach(key => {
                    const value = this.selectedMap[key].label
                    let dom = this.$refs[`${key}`]

                    if (Array.isArray(dom) && dom.length > 0) {
                        dom = dom[0]
                    }
                    if (!value) {
                        hasEmpty = true
                        if (!firstErrorDom) {
                            firstErrorDom = dom
                        }
                        if (dom) {
                            callback(dom)
                        }
                    }
                    if (dom?.anyError) {
                        if (!firstErrorDom) {
                            firstErrorDom = dom
                        }
                        hasError = true
                    }
                })
            }
            verifyFunc(verifyKeyList, dom => {
                dom.showEmptyError = true
            })

            const scrollToDom = dom => {
                if (!dom) return
                const itemTop = dom.$el.getBoundingClientRect().top
                window.setTimeout(() => {
                    window.scrollTo(0, itemTop + window.pageYOffset)
                }, 100)
            }

            if (hasEmpty) {
                scrollToDom(firstErrorDom)
                this.$toast(this.$t('fcn.inputCannotEmpty'))
                return
            }
            if (hasError) {
                scrollToDom(firstErrorDom)
                return
            }
            this.requestNoteInquiryCreate(verifyKeyList)
        },
        async requestNoteInquiryCreate(verifyKeyList) {
            this.$loading.show = true
            const toInt = [Key.inquiryPeriod]
            const toFloat = [Key.notePrice, Key.strikePrice, Key.coupon, Key.knockOutPrice, Key.knockInPrice]
            const params = {}
            verifyKeyList.forEach(key => {
                let value = this.selectedMap[key].key || this.selectedMap[key].label
                if (toInt.includes(key)) {
                    value = Number.parseInt(value)
                } else if (toFloat.includes(key)) {
                    value = Number.parseFloat(value)
                }
                params[key] = value
            })
            params['objectProductType'] = 1
            console.log(`yinlong params`, params)
            try {
                const { result = {} } = (await NoteInquiryOrderCreate(params)) ?? {}
                console.log(`yinlong NoteInquiryOrderCreate result`, result)
                this.$loading.show = false

                Object.keys(this.createResult).forEach(key => {
                    this.createResult[key] = result[key]
                })
                sessionStorage.setItem('createResult', JSON.stringify(this.createResult))
                this.$router.replace({
                    path: '/bill-add-enquiry-result',
                })
            } catch (error) {
                console.error(`NoteInquiryOrderCreate`, error)
                this.$loading.show = false
            }
        },
    },
}
</script>

<style scoped lang="less">
.card {
    margin: 12px;
    padding: 8px 12px;
    background: #fff;
    border-radius: 8px;

    .title {
        height: 36px;
        margin-bottom: 8px;
        color: @h1-white;
        font-weight: 500;
        font-size: 16px;
        line-height: 36px;
    }

    .product-type {
        height: 80px;
        background: #fff;

        .info-area {
            padding: 6px 0;
            background-color: #f9f9f9;

            .type {
                margin-bottom: 6px;
                color: @h2-white;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }

            .type-fcn {
                color: @h1-white;
                font-weight: 400;
                font-size: 16px;
                line-height: 22px;
            }
        }
    }
}

.footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 90px;
    padding-bottom: 34px;
    background: #fff;

    .btn {
        height: 44px;
        margin: 8px 28px 4px;
        color: #fff;
        font-weight: bold;
        line-height: 44px;
        text-align: center;
        background: #ff6907;
        border-radius: 22px;
    }
}

.picker {
    padding: 20px 8px;
    padding-bottom: calc(32px + 34px);

    .picker-item {
        width: 100%;
        padding: 16px 8px;
        font-size: 14px;
        line-height: 20px;
        text-align: left;
        border-radius: 8px;

        &.selected {
            background: #fff5ef;
        }
    }
}

.result-page {
    display: flex;
    flex-direction: column;

    .container-top {
        overflow: auto;
    }

    .content-top {
        display: flex;
        flex-direction: column;
        align-items: center;

        img {
            margin-top: 37px;
            margin-bottom: 20px;
        }

        .text1 {
            margin-bottom: 4px;
            color: #2f2f2f;
            font-weight: bold;
            font-size: 18px;
            line-height: 26px;
        }

        .desc {
            color: #9c9c9c;
            font-size: 14px;
            line-height: 20px;
        }
    }

    .content-center {
        margin: 32px 12px 24px;
        padding: 8px 12px;
        background: #fff;

        .form-item {
            display: flex;
            // align-items: center;
            justify-content: space-between;
            padding: 8px 0;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;

            .key {
                color: #666;
            }

            .value {
                width: 225px;
                color: #2f2f2f;
                white-space: pre-wrap;
                text-align: right;
            }
        }
    }

    .border-8 {
        border-radius: 8px;
    }

    .complete {
        height: 44px;
        margin: 0 28px;
        color: #fff;
        font-weight: bold;
        font-size: 16px;
        line-height: 44px;
        text-align: center;
        background: #ff6907;
        border-radius: 22px;
    }
}
</style>
