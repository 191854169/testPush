<!-- 星选组合页分享 UI -->
<template>
    <div class="star-selection">
        <logo-ad class="logo"></logo-ad>
        <multi-img class="bgimage" verifyLang name="star_selection_big_bg" directory="fund"></multi-img>
        <!-- 分享时图片中间展示的文案-->
        <div class="share-info">
            <p class="title">{{ shareLeadboradTitle }}</p>
            <p class="subtitle" v-if="shareLeadboradPeriodText">{{ shareLeadboradPeriodText }}</p>
        </div>

        <div class="list_bg">
            <div class="item" v-for="(dataItem, index) in dataList.slice(0, 5)" :key="dataItem.portfolioId">
                <starSelectItem class="star_select_item" :item="dataItem" :period="periodTab" :showHeader="showHeader" :isFromShare="true" />
                <div class="ranking-icon">
                    <multi-img :name="getRankingIconName(index)" directory="fund" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import starSelectItem from '../../components/starSelectionItem.vue'

export default {
    name: 'share-portfolio-star-selection',
    props: {
        dataList: {
            type: Array,
            default: () => [],
        },
        shareLeadboradTitle: {
            type: String,
            default: '',
        },
        shareLeadboradPeriodText: {
            type: String,
            default: '',
        },
        periodTab: {
            type: String,
            default: 'w1',
        },
        showHeader: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        starSelectItem,
    },
    data() {
        return {
            rankingIndexIconMap: {
                1: 'img_top1',
                2: 'img_top2',
                3: 'img_top3',
                4: 'img_top4',
                5: 'img_top5',
            },
        }
    },
    computed: {},
    mounted() {},
    methods: {
        getRankingIconName(index) {
            return this.rankingIndexIconMap[index + 1]
        },
    },
}
</script>

<style scoped lang="less">
.star-selection {
    padding: 0 0 12px;
    background: #f9f9f9;
}

.logo {
    padding-bottom: 14px;
}

.bgimage {
    position: relative;
    z-index: 1;
    height: 194px;
}

.share-info {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: -84px;
    color: #fbd6b0;
    text-align: center;

    .title {
        font-weight: bold;
        font-size: 16px;
        line-height: 24px;
    }

    .subtitle {
        font-size: 12px;
        line-height: 18px;
    }
}

.list_bg {
    position: relative;
    z-index: 2;
    margin: 8px 12px;

    .item {
        position: relative;
        margin-bottom: 12px;
        background-color: #f9f9f9;
        border-radius: 8px;

        .star_select_item {
            background-color: #fff;
            border-radius: 8px;

            ::v-deep .profit_info {
                margin-right: 44px;
            }
        }

        .ranking-icon {
            position: absolute;
            top: 0;
            right: 12px;
            width: 32px;
            height: 38px;
        }
    }
}
</style>
