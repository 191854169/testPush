// 协议页
<template>
    <div class="protocol">
        <ul class="list">
            <li class="list-item" @click="goServiceProtocol">
                <a>{{ cashService.fileType }}</a>
                <div class="arrow"></div>
            </li>
        </ul>
        <ul class="list" v-for="item in fundList" :key="item.symbol">
            <van-collapse v-model="activeNames">
                <van-collapse-item :title="item.name" :name="item.symbol">
                    <div class="list-item" v-for="(i, index) in fundFileMap[item.symbol] || []" :key="index" @click="onJump(i)">
                        《{{ i.fileType }}》
                    </div>
                </van-collapse-item>
            </van-collapse>
        </ul>
        <ul class="list">
            <li class="list-item" @click="onJump(statement)">
                <a :href="statement.link">{{ statement.fileType }}</a>
                <div class="arrow"></div>
            </li>
        </ul>
        <ul class="list">
            <van-collapse v-model="activeNames">
                <van-collapse-item :title="$t('protocol.relevantFile')" name="relevantFile">
                    <div class="list-item" v-for="(item, index) in relevantList" :key="index" @click="onJump(item)">
                        {{ item.isKh ? '' : '《' }}{{ item.fileType }}{{ item.isKh ? '' : '》' }}
                    </div>
                </van-collapse-item>
            </van-collapse>
        </ul>
    </div>
</template>

<script>
import { Collapse, CollapseItem } from 'vant'
import { getFile, getBrief } from '@/apis/fund/fund'
import { isHLApp, getLangType } from '@/utils'
import pathnames from '@/config/H5Pathname.js'

export default {
    name: 'protocol',
    components: {
        [Collapse.name]: Collapse,
        [CollapseItem.name]: CollapseItem,
    },
    data() {
        return {
            symbols: [],
            activeNames: [1, 2, 3, 4, 5, 6],
            // 星财宝服务
            cashService: {
                fileType: this.$t('cashTradeProtocolSimple'),
            },

            // 客户声明
            statement: {
                fileType: this.$t('protocol.clientStatement'),
                fileUrl: `客户声明_${getLangType()}.pdf`,
                local: true,
            },

            // 基金文件
            fundFileMap: {},
            // 基金名称
            fundNameMap: {},
            fundBaseFile: {
                fileType: this.$t('protocol.publicRisk').replace(/《|》/g, ''),
                fileUrl: `风险披露&免责声明_${getLangType()}.pdf`,
                local: true,
            },
            // 相关文件
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
        fundList() {
            return Object.entries(this.fundNameMap).map(([symbol, name]) => {
                return { symbol, name }
            })
        },
    },
    created() {
        try {
            if (this.$route.query.symbols) {
                this.symbols = JSON.parse(decodeURIComponent(this.$route.query.symbols)) || []
            }
        } catch (e) {
            console.log('获取错误this.$route.query.symbol===>e:', e)
        }
        this.getFunds()
        this.getFiles()
    },
    methods: {
        async getFunds() {
            const trackList = this.symbols.map(async symbol => {
                return await this.getFundBrief(symbol)
            })
            await Promise.all(trackList)
        },
        async getFundBrief(symbol) {
            if (!symbol) return
            try {
                const { result = {} } = await getBrief({ symbol })
                const pubBrief = result.pubBrief || {}
                if (pubBrief.name) {
                    this.$set(this.fundNameMap, symbol, pubBrief.name)
                }
            } catch (e) {
                console.log('getBrief===>e:', e)
            }
        },
        async getFiles() {
            const trackList = this.symbols.map(async symbol => {
                return await this.getFundFile(symbol)
            })
            Promise.all(trackList)
        },
        async getFundFile(symbol) {
            try {
                if (!symbol) return
                const fileList = [this.fundBaseFile]
                const res = await getFile({ symbol: symbol })
                if (res.result && res.result.list) {
                    const arrlist = res.result.list
                    fileList.unshift(...arrlist)
                    this.$set(this.fundFileMap, symbol, fileList)
                }
            } catch (e) {
                console.log('getFile=>e:', e)
            }
        },
        onJump(item) {
            if (!item.fileUrl) return
            let url = item.fileUrl
            if (item.local) {
                url = `${location.origin}/wealth/static/${item.fileUrl}`
                if (this.$thsI18NJsBridge.isTHSI18NApp()) url = `${location.origin}/wealth/static/${encodeURIComponent(item.fileUrl)}`
            }
            console.log('pdfUrl:', url)
            const title = item.fileType
            if (isHLApp() && this.$jsBridge) {
                this.$jsBridge.openPDF({ url: encodeURIComponent(url), title })
            } else if (this.$thsI18NJsBridge.isTHSI18NApp()) {
                this.$thsI18NJsBridge.openPDF({ url, title })
            } else {
                window.open(url)
            }
        },

        // (星财宝)货币基金自动买入及赎回服务协议
        goServiceProtocol() {
            const { VUE_APP_BUILDER_PAGE } = pathnames
            const key = 'CASH_BOX'
            const url = `${VUE_APP_BUILDER_PAGE}?key=${key}`
            if (this.$openPageInThs(url)) return
            if (this.$jsBridge) return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            location.href = url
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
