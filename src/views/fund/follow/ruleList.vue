<template>
    <div class="rule-list">
        <div class="list">
            <div class="list-item-title" @click="goToRule">
                <span class="name">{{ $t('follow.combinationDecript') }}</span>
                <multi-img name="icon_arrow_left" directory="fund" alt="icon_arrow_left" verifyTheme></multi-img>
            </div>
        </div>
        <div class="list2">
            <div class="list" v-for="(rule, index) in ruleList" :key="index">
                <div
                    class="list-item-title"
                    :class="{ 'border-bottom-1px': index !== ruleList.length - 1 || rule.isFlag }"
                    @click="rule.isFlag = !rule.isFlag"
                >
                    <span class="name">{{ rule.name }}</span>
                    <multi-img
                        name="icon_arrow_left"
                        directory="fund"
                        alt="icon_arrow_left"
                        verifyTheme
                        :class="rule.isFlag ? 'arrow-top' : 'arrow-bottom'"
                    ></multi-img>
                </div>
                <div class="list-content" v-show="rule.isFlag && rule.children">
                    <div
                        class="list-item"
                        :class="{ 'border-bottom-1px': index !== ruleList.length - 1 || cindex !== rule.children.length - 1 }"
                        v-for="(citem, cindex) in rule.children"
                        :key="cindex"
                        @click="goToDetail(citem)"
                    >
                        <span v-if="citem.isPdf">《{{ citem.fileType }}》</span>
                        <span v-else>{{ citem.name }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="protocol">
            <ul class="list" v-for="(protocol, index) in protocols" :key="index">
                <template v-if="protocol.type === 'collapseList'">
                    <li class="list-item" v-for="(item, index) in protocol.list" :key="index" @click="onJump(item)">
                        <a :href="item.link">{{ item.fileType }}</a>

                        <multi-img name="icon_arrow_left" directory="fund" alt="icon_arrow_left" class="arrow"></multi-img>
                    </li>
                </template>
                <template v-if="protocol.type === 'collapse'">
                    <van-collapse v-model="activeNames">
                        <van-collapse-item :title="protocol.label" :name="index + 1">
                            <div slot="right-icon" class="arrow" :class="{ 'arrow-down': activeNames.includes(index + 1) }">
                                <multi-img name="icon_arrow_left" directory="fund" alt="icon_arrow_left"></multi-img>
                            </div>
                            <div class="list-item" v-for="(item, index) in protocol.list" :key="index" @click="onJump(item)">
                                {{ item.isKh ? '' : '《' }}{{ item.fileType }}{{ item.isKh ? '' : '》' }}
                            </div>
                        </van-collapse-item>
                    </van-collapse>
                </template>
                <template v-if="protocol.type === 'path'">
                    <li class="list-item" @click="onRoute(item.path)" v-for="(item, index) in protocol.list" :key="index">
                        <a :href="protocol.path">{{ item.name }}</a>

                        <multi-img name="icon_arrow_left" directory="fund" alt="icon_arrow_left" class="arrow"></multi-img>
                    </li>
                </template>
            </ul>
        </div>
    </div>
</template>

<script>
import { getFiles } from '@/apis/fund/fund'
import pathnames from '@/config/H5Pathname.js'
import { isTenantApp, getLangType } from '@/utils/tools.js'
import { Collapse, CollapseItem } from 'vant'

export default {
    components: {
        [Collapse.name]: Collapse,
        [CollapseItem.name]: CollapseItem,
    },
    data() {
        return {
            isFlag: true,
            ruleList: [],
            activeNames: [1, 2, 3, 4, 5, 6],
        }
    },
    computed: {
        protocols() {
            return [
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
        relevantList() {
            return [
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
            ]
        },
    },
    created() {
        this.getData()
    },
    methods: {
        async getFilesList(symbol) {
            try {
                const { result } = await getFiles({ symbol: symbol })
                console.log('data==>reule', result.fileMap)
                this.ruleList.map(item => {
                    item.children = result.fileMap[item.fundId]
                    item.children.forEach(i => (i.isPdf = true))
                    const riskMatchResult = {
                        name: this.$t('riskMatchTitle'),
                        symbol: item.fundId,
                        fileUrl: `${location.origin}${location.pathname}#/no-matched-risk?symbol=${item.fundId}&user=1&investFocusDegree=${item.radio}`,
                        isPdf: false,
                    }
                    item.children.push(riskMatchResult)
                })
            } catch (e) {
                console.log('err', e)
            }
        },
        getData() {
            const dataList = JSON.parse(localStorage.getItem('investmentList') || '[]')
            const symbolList = []
            dataList.map(item => {
                this.ruleList.push({
                    name: item.name,
                    isFlag: false,
                    fundId: item.fundID,
                    radio: item.radio,
                })
                symbolList.push(item.fundID)
            })
            this.getFilesList(symbolList.join(','))
        },
        goToDetail(file) {
            if (isTenantApp() && this.$jsBridge) {
                this.$jsBridge[file.isPdf ? 'openPDF' : 'open']({ url: encodeURIComponent(file.fileUrl), title: file.fileType || '' })
            } else {
                window.open(file.fileUrl)
            }
        },
        goToRule() {
            const { VUE_APP_BUILDER_PAGE } = pathnames
            const url = `${VUE_APP_BUILDER_PAGE}?key=PORTFOLIO-ORDER-DISCLAIMER` // 投资组合免责声明
            if (this.$jsBridge) return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            location.href = url
        },
        onJump(item) {
            if (!item.fileUrl) return
            let url = item.fileUrl

            if (item.local) {
                url = `${location.origin}/wealth/static/${item.fileUrl}`
            }
            console.log('pdfUrl:', url)
            const title = item.fileType || ''
            if (isTenantApp() && this.$jsBridge) {
                this.$jsBridge.openPDF({ url: encodeURIComponent(url), title })
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
                    },
                })
        },
    },
}
</script>

<style lang="less" scoped>
.rule-list {
    padding: 12px;
}

.list {
    padding: 0 12px;
    background: #fff;
    border-radius: 8px;

    .list-item-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 50px;
        line-height: 50px;

        .name {
            color: #2f2f2f;
            font-size: 16px;
        }

        img {
            width: 12px;
            height: 12px;
        }

        .arrow-top {
            transform: rotate(-90deg);
        }

        .arrow-bottom {
            transform: rotate(90deg);
        }
    }

    .list-content {
        .list-item {
            height: 50px;
            color: #2f2f2f;
            font-size: 14px;
            line-height: 50px;
        }
    }
}

.list2 {
    margin-top: 12px;
    overflow: hidden;
    border-radius: 8px;

    .list {
        border-radius: 0;
    }
}

/deep/ .van-collapse {
    .van-collapse-item__wrapper {
        border-radius: 8px;
    }

    .van-cell {
        display: flex;
        align-items: center;
        padding-right: 0;
        padding-left: 0;
        overflow: initial;
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

    .arrow {
        &.arrow-down {
            transform: rotate(90deg);
        }

        img {
            width: 12px;
            height: 12px;
        }
    }

    .van-cell__right-icon {
        width: 0.08rem;
        height: 0.08rem;
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

    .van-collapse-item__title {
        &::after {
            right: 0;
            left: 0;
        }
    }

    .van-collapse-item__title--expanded {
        .van-icon {
            transform: rotate(45deg);
        }
    }

    .van-collapse-item__content {
        padding: 0;

        .list-item {
            padding: 15px 0;
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
        }
    }
}

.protocol {
    height: 100%;
    padding: 12px 0;
    background: #f9f9f9;

    .list {
        margin-bottom: 12px;
        background-color: #fff;
        border-radius: 8px;

        &-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 17px 0;
            box-shadow: inset 0 0 0 #fff, inset 0 -0.5px 0 #efefef;

            a {
                color: #1f1f1f;
                font-size: 16px;
                line-height: 16px;
            }

            .arrow {
                width: 12px;
                height: 12px;
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
