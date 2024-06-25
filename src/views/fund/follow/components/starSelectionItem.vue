<!-- 
    星选 item
 -->
<template>
    <div class="star_select_wrapper" @click="gotoFollowDetail(item.portfolioId)">
        <div class="flex-s">
            <div>
                <div class="creator_info flex-c">
                    <headerPortrait
                        v-if="showHeader"
                        class="header_icon"
                        :ossId="item.avatarOSSID"
                        :markTag="item.portfolioId"
                        :needDownloadImg="isFromShare"
                    ></headerPortrait>
                    <div class="nick_name line-elipsis">{{ item.creatorNick }}</div>
                </div>

                <div class="group_info">
                    <div class="flex-c">
                        <portfolio-tag :portfolioType="item.portfolioType"></portfolio-tag>
                        <span class="group_name">{{ item.portfolioName }}</span>
                    </div>
                </div>
            </div>
            <div class="profit_info">
                <p v-if="isFollower" class="profit_value">{{ profitValue | followerNumFilter }}</p>
                <p v-else class="profit_value" v-riseFall="{ value: profitValue, base: 2, rate: true }"></p>
                <p class="profit_title">{{ period | profitTitleFilter }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import { groupTypeFilter, profitTitleFilter, followerNumFilter } from '../utils/filters'
import portfolioTag from './portfolioTag.vue'
import gotoFollowDetailsMixin from '../mixins/gotoFollowDetailsMixin'
import headerPortrait from './headerPortrait'

export default {
    name: 'star-select-item',
    mixins: [gotoFollowDetailsMixin],
    props: {
        item: {
            type: Object,
            default: () => ({}),
        },
        period: {
            type: String,
            default: '',
        },
        showHeader: {
            type: Boolean,
            default: false,
        },
        isFromShare: {
            type: Boolean,
            default: false,
        },
    },
    components: { portfolioTag, headerPortrait },
    data() {
        return {}
    },
    computed: {
        profitValue() {
            const map = {
                w1: this.item.week1Return,
                m1: this.item.month1Return,
                m3: this.item.month3Return,
                y1: this.item.year1Return,
                follower: this.item.followerReturn,
            }
            return map[this.period]
        },
        isFollower() {
            return this.period == 'follower'
        },
    },
    watch: {},
    filters: {
        followerNumFilter,
        profitTitleFilter,
        groupTypeFilter,
    },
    created() {},
    mounted() {},
    methods: {},
}
</script>

<style scoped lang="less">
.star_select_wrapper {
    padding: 16px 12px;
    font-size: 12px;
    background-color: #fff;

    .creator_info {
        width: 100%;
        margin-bottom: 6px;

        .header_icon {
            width: 24px;
            height: 24px;
            margin-right: 12px;
            border-radius: 12px;
        }

        .nick_name {
            color: #2f2f2f;
            font-weight: bold;
            font-size: 14px;
            line-height: 24px;
            text-align: left;
        }
    }

    .group_info {
        display: flex;
        // align-items: center;
        justify-content: space-between;

        .group_name {
            margin-left: 6px;
            color: #666;
            font-size: 14px;
            line-height: 20px;
        }
    }

    .profit_info {
        width: 30%;
        text-align: right;

        .profit_value {
            margin-right: 4px;
            color: #2f2f2f;
            font-weight: bold;
            font-size: 16px;
            font-family: MIMUN;
            line-height: 22px;
        }

        .profit_title {
            margin-top: 8px;
            color: #9c9c9c;
            font-size: 12px;
            line-height: 16px;
        }
    }
}
</style>
