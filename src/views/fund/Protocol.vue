// 协议页
<template>
    <div class="protocol" :class="{ 'is-in-ry': isInOutside }">
        <H5BroserTitle></H5BroserTitle>
        <ul class="list" v-for="(protocol, index) in protocols" :key="index">
            <template v-if="protocol.type === 'collapseList'">
                <li class="list-item" v-for="(item, index) in protocol.list" :key="index" @click="onJump(item)">
                    <a :href="item.link">{{ item.fileType }}</a>
                    <div class="arrow"></div>
                </li>
            </template>
            <template v-if="protocol.type === 'collapse'">
                <van-collapse v-model="activeNames">
                    <van-collapse-item :title="protocol.label" :name="index + 1">
                        <div class="list-item" v-for="(item, index) in protocol.list" :key="index" @click="onJump(item)">
                            {{ item.isKh ? '' : '《' }}{{ item.fileType }}{{ item.isKh ? '' : '》' }}
                        </div>
                    </van-collapse-item>
                </van-collapse>
            </template>
            <template v-if="protocol.type === 'path'">
                <li class="list-item" @click="onRoute(item.path)" v-for="(item, index) in protocol.list" :key="index">
                    <a :href="protocol.path">{{ item.name }}</a>
                    <div class="arrow"></div>
                </li>
            </template>
        </ul>
        <div class="content-item"></div>
    </div>
</template>

<script>
import { Collapse, CollapseItem } from 'vant'
import { getFile, getPriDocument } from '@/apis/fund/fund'
import { getFile as getBondFile } from '@/apis/bond/index'
import { isHLApp, isTHSI18NApp } from '@/utils/tools.js'
import { getLangType } from '../../utils'
import { getBillsFiles } from '@/apis/fund/note'
import pathnames from '@/config/H5Pathname.js'
import H5BroserTitle from './components/H5BroserTitle.vue'
import { isInOutsideH5 } from '@/utils'

export default {
    name: 'protocol',
    components: {
        [Collapse.name]: Collapse,
        [CollapseItem.name]: CollapseItem,
        H5BroserTitle,
    },
    data() {
        return {
            symbol: this.$route.query.symbol,
            type: this.$route.query.type,
            activeNames: [1, 2, 3, 4, 5, 6],
            fileList: [
                {
                    fileType: this.$t('protocol.publicRisk').replace(/《|》/g, ''),
                    fileUrl: `风险披露&免责声明_${getLangType()}.pdf`,
                    local: true,
                },
            ],
            riskFile: [], // 风险提示文件
            // 私募风险披露 匹配 有无拓展类型：有-true，无-false
            priRiskExtendMap: {
                'FHANIGCSBF-SP': true,
                'FHANIGHSF-SP': false,
                'FHANICNEF-SP': false,
                'FHANISCBF-SP': true,
            },
            relevantList: [
                {
                    fileType: this.$t('protocol.publicRisk2'),
                    fileUrl: `使用条款及免责声明_${getLangType()}.pdf`,
                    local: true,
                    isKh: true,
                },
                {
                    fileType: this.$t('protocol.clientNotice'),
                    fileUrl: `客户须知_${getLangType()}.pdf`,
                    local: true,
                    isKh: true,
                },
                {
                    fileType: this.$t('protocol.productRisk'),
                    fileUrl: `产品风险评级与客户分类方法_${getLangType()}.pdf`,
                    local: true,
                    isKh: true,
                },
            ],
        }
    },
    computed: {
        isHome() {
            return this.$route.query.from === 'home'
        },
        isPrivate() {
            return this.symbol && this.symbol.slice(0, 2) === 'pf'
        },
        isBond() {
            return this.type === 'bond'
        },
        isBills() {
            return this.type === 'bills'
        },
        priRiskCode() {
            if (!this.isPrivate) {
                return ''
            }
            const key = Object.keys(this.priRiskExtendMap).find(key => this.symbol.includes(key))
            if (!key) return ''
            const isExtend = this.priRiskExtendMap[key]
            if (!isExtend) {
                return `PRIVATE-RISK-${key}`
            }
            const suffix = this.symbol.replace(`pf${key}-`, '')[0]
            return suffix ? `PRIVATE-RISK-${key}-${suffix}` : ''
        },
        protocols() {
            // 如果是债券
            if (this.isBond) {
                return [
                    {
                        label: this.$t('protocol.tradeFile'),
                        type: 'collapse',
                        list: this.fileList,
                    },
                    {
                        label: '',
                        type: 'path',
                        list: !this.hideMatchResult
                            ? [
                                  {
                                      name: this.$t('protocol.fitRecord'),
                                      path: '/no-matched-risk',
                                  },
                              ]
                            : [],
                    },
                    {
                        label: '',
                        type: 'collapseList',
                        list: [...this.riskFile],
                    },
                    {
                        label: '',
                        type: 'collapseList',
                        list: [
                            {
                                fileType: this.$t('protocol.clientStatement'),
                                fileUrl: `客户声明_${getLangType()}.pdf`,
                                local: true,
                            },
                        ],
                    },
                    {
                        label: this.$t('protocol.relevantFile'),
                        type: 'collapse',
                        list: this.relevantList,
                    },
                ]
            }

            // 票据
            if (this.isBills) {
                return [
                    {
                        label: this.$t('protocol.tradeFile'),
                        type: 'collapse',
                        list: this.fileList.map(item => ({
                            ...item,
                            fileType: item.fileName,
                        })),
                    },
                    {
                        label: '',
                        type: 'path',
                        list: !this.hideMatchResult
                            ? [
                                  {
                                      name: this.$t('protocol.fitRecord'),
                                      path: '/no-matched-risk',
                                  },
                              ]
                            : [],
                    },
                    {
                        label: '',
                        type: 'collapseList',
                        list: [
                            {
                                fileType: this.$t('protocol.clientStatement'),
                                fileUrl: `客户声明_${getLangType()}.pdf`,
                                local: true,
                            },
                        ],
                    },
                    {
                        label: this.$t('protocol.relevantFile'),
                        type: 'collapse',
                        list: this.relevantList,
                    },
                ]
            }
            if (this.isPrivate) {
                return [
                    {
                        label: this.$t('protocol.fundTradeFile'),
                        type: 'collapse',
                        list: this.fileList,
                    },
                    {
                        label: '',
                        type: 'path',
                        list: !this.hideMatchResult
                            ? [
                                  {
                                      name: this.$t('protocol.fitRecord'),
                                      path: '/no-matched-risk',
                                  },
                              ]
                            : [],
                    },
                    {
                        label: '',
                        type: 'collapseList',
                        list: [...this.riskFile],
                    },
                    {
                        label: '',
                        type: 'collapseList',
                        list: [
                            {
                                fileType: this.$t('protocol.clientStatement'),
                                fileUrl: `客户声明_${getLangType()}.pdf`,
                                local: true,
                                isKh: true,
                            },
                        ],
                    },
                    {
                        label: this.$t('protocol.relevantFile'),
                        type: 'collapse',
                        list: this.relevantList,
                    },
                ]
            }
            // 如果是公募基金
            if (this.isHome) {
                return [
                    {
                        label: '',
                        type: 'collapseList',
                        list: [
                            {
                                fileType: this.$t('protocol.publicRisk'),
                                fileUrl: `使用条款及免责声明_${getLangType()}.pdf`,
                                local: true,
                            },
                            {
                                fileType: this.$t('protocol.productRisk'),
                                fileUrl: `产品风险评级与客户分类方法_${getLangType()}.pdf`,
                                local: true,
                            },
                            {
                                fileType: this.$t('protocol.clientNotice'),
                                fileUrl: `客户须知_${getLangType()}.pdf`,
                                local: true,
                            },
                            {
                                fileType: this.$t('protocol.clientStatement'),
                                fileUrl: `客户声明_${getLangType()}.pdf`,
                                local: true,
                            },
                        ],
                    },
                ]
            }
            return [
                {
                    label: this.$t('protocol.fundTradeFile'),
                    type: 'collapse',
                    list: this.fileList,
                },
                {
                    label: '',
                    type: 'path',
                    list: !this.hideMatchResult
                        ? [
                              {
                                  name: this.$t('protocol.fitRecord'),
                                  path: '/no-matched-risk',
                              },
                          ]
                        : [],
                },
                {
                    label: '',
                    type: 'collapseList',
                    list: [
                        {
                            fileType: this.$t('protocol.clientStatement'),
                            fileUrl: `客户声明_${getLangType()}.pdf`,
                            local: true,
                        },
                    ],
                },
                {
                    label: this.$t('protocol.relevantFile'),
                    type: 'collapse',
                    list: this.relevantList,
                },
            ]
        },
        hideMatchResult() {
            return this.$route.query.showMatchResult === 'false'
        },
        isInOutside() {
            return isInOutsideH5()
        },
    },
    created() {
        this.getFile()
    },
    methods: {
        async getFile() {
            if (this.isBond) {
                await this.getBondFile()
            } else if (this.isBills) {
                await this.getBillsFile()
            } else if (this.isPrivate) {
                await this.getPrivateFile()
            } else {
                await this.getFundFile()
            }
        },
        async getFundFile() {
            try {
                if (this.isHome || !this.symbol) return

                const res = await getFile({ symbol: this.symbol })
                if (res.result && res.result.list) {
                    const resList = res.result.list || []
                    console.log('getFundFilegetFundFile22', ...res.result.list)
                    const arrlist = resList
                    this.fileList.unshift(...arrlist)
                }
            } catch (e) {
                console.log('getFile=>e:', e)
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
        async getBondFile() {
            try {
                if (!this.symbol) return
                const res = await getBondFile({ symbol: this.symbol })
                if (res.result && res.result.list) {
                    this.fileList = res.result.list
                    this.riskFile = res.result.riskFile ? [res.result.riskFile] : []
                }
            } catch (e) {
                console.log('getFile=>e:', e)
            }
        },
        async getBillsFile() {
            try {
                if (!this.symbol) return
                const res = await getBillsFiles({ symbol: this.symbol, type: 2 })

                this.fileList = res?.result?.list ?? []
            } catch (e) {
                console.log('getFile=>e:', e)
            }
        },
        onJump(item) {
            if (!item.fileUrl) return
            let url = item.fileUrl
            // 私募 风险披露
            if (item.local && this.isPrivate && !item.isKh) {
                url = `${pathnames.VUE_APP_BUILDER_PAGE}?key=${this.priRiskCode}`
                console.log('private-url', url)
                if (!this.priRiskCode) return
                if (isHLApp() && this.$jsBridge) {
                    this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
                } else {
                    window.open(url)
                }
                return
            }

            if (item.local) {
                url = `${location.origin}/wealth/static/${item.fileUrl}`
                if (isTHSI18NApp()) url = `${location.origin}/wealth/static/${encodeURIComponent(item.fileUrl)}`
            }
            console.log('pdfUrl:', url)
            if (isHLApp() && this.$jsBridge) {
                this.$jsBridge.openPDF({ url: encodeURIComponent(url), title: item.fileType })
            } else {
                window.open(url)
            }
        },
        onRoute(path) {
            console.log('path:', path, this.symbol)
            this.symbol &&
                this.$router.push({
                    path,
                    query: {
                        user: 1, // 需要一个查询标识
                        symbol: this.symbol,
                        investFocusDegree: this.$route.query.investFocusDegree,
                        type: this.$route.query.type,
                    },
                })
        },
    },
}
</script>
<style lang="less" scoped>
/deep/ .van-collapse {
    .van-collapse-item__wrapper {
        border-radius: 8px;
    }

    .van-cell {
        display: flex;
        align-items: center;
        padding-left: 12px;
        border-radius: 8px;
    }

    .van-cell__title {
        display: flex;
        align-items: center;
        color: #2f2f2f;
        font-weight: 400;
        font-size: 16px;
        line-height: 30px;
    }

    .van-cell__right-icon {
        width: 0.06rem;
        height: 0.06rem;
        line-height: 30px;
        border: 0.01rem solid #979797;
        border-top: none;
        border-left: none;
        transform: rotate(-45deg);
        transition: transform 0.3s;
    }

    .van-cell__right-icon::before {
        content: '';
    }

    .van-collapse-item__title--expanded {
        .van-icon {
            transform: rotate(45deg);
        }
    }

    .van-collapse-item__content {
        padding: 0;

        .list-item {
            margin: 0 12px;
            padding: 15px 0;
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
        }
    }
}
</style>

<style scoped lang="less">
.protocol {
    height: 100%;
    padding: 12px;
    background: #f9f9f9;

    &.is-in-ry {
        padding-top: 0;
        overflow-x: hidden;
        overflow-y: auto;
    }

    .list {
        margin-bottom: 12px;
        background-color: #fff;
        border-radius: 8px;

        &-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 0 16px 0 12px;
            padding: 17px 0;
            box-shadow: inset 16px 0 0 #fff, inset 0 -0.5px 0 #efefef;

            a {
                color: #1f1f1f;
                font-size: 16px;
                line-height: 16px;
            }

            .arrow {
                width: 6px;
                height: 6px;
                border: 1px solid #979797;
                border-top: none;
                border-left: none;
                transform: rotate(-45deg);
            }
        }

        .list-item:last-of-type {
            box-shadow: unset;
        }

        /deep/ .van-hairline--top-bottom::after {
            border-width: 0;
        }
    }
}
</style>
