<template>
    <div class="bg-white border-radius-8px basic-info pad-rl12 pad-b12">
        <div v-if="needHeader" class="creator_content flex-s border-bottom-1px" @click="gotoPersonalPage">
            <div class="flex-c">
                <headerPortrait v-if="createrIsPI" class="master_header" :ossId="obj?.creator?.avatarOSSID" />
                <div class="nick_name line-elipsis">
                    {{ obj.creator?.nickName || '' }}
                </div>
                <div v-if="obj.creator?.label?.length > 0" class="creator_label">
                    {{ obj.creator?.label[0] }}
                </div>
            </div>
            <div v-if="isInApp" class="flex-c">
                <div class="personal">{{ $t('follow.personalPage') }}</div>
                <multi-img class="arrow_icon" directory="fund" name="icon_arrow_left" alt="icon_arrow_left"></multi-img>
            </div>
        </div>
        <div class="flex-s h-36 mar-t12">
            <div class="flex-c name">
                <h5 class="portfolio_name f16 bold mar-r8 line-elipsis">{{ obj.portfolioName }}</h5>
                <portfolio-tag :portfolioType="obj.portfolioType"></portfolio-tag>
            </div>
            <remainingDayFollower class="mar-14" :remainingDay="obj.foundDayNum" :follower="obj.followersNum" />
        </div>
        <div v-if="!runStatusStop" class="body mar-b16 mar-t16">
            <div class="body_left">
                <div class="mar-b16">
                    <p class="big_value" v-riseFall="{ value: obj.totalReturn, base: 2, sign: true }"></p>
                    <p class="label">{{ $t('accumulatedProfit') }}</p>
                </div>
                <div class="flex">
                    <p class="label mar-r6">{{ $t('follow.dayProfit') }}</p>
                    <p class="value" v-riseFall="{ value: obj.day1Return, base: 2, sign: true }"></p>
                </div>
            </div>
            <div class="body_right">
                <div class="mar-b16">
                    <p class="big_value" v-riseFall="{ value: obj.week1Return, base: 2, sign: true }"></p>
                    <p class="label">{{ $t('master.nearOneWeekProfit') }}</p>
                </div>
                <div class="flex">
                    <p class="label mar-r6">{{ $t('master.nearOneMonthProfit') }}</p>
                    <p class="value" v-riseFall="{ value: obj.month1Return, base: 2, sign: true }"></p>
                </div>
            </div>
        </div>
        <div v-else class="stop_body">
            <div class="profit_value">
                <p class="big_value">{{ obj.totalReturn | amountFilter }}</p>
                <p class="label">{{ $t('accumulatedProfit') }}</p>
            </div>

            <multi-img
                class="stop_icon"
                :class="{ 'mar-top-22': isEmpty(obj.portfolioBrief) }"
                verifyLang
                name="icon_portfolio_stop"
                directory="fund"
            />
        </div>
        <div v-if="!!obj.portfolioBrief" class="footer pad-tb12 pad-rl8">
            <portfolioBrief :text="obj.portfolioBrief" :bold-text="$t('follow.brief')" @onClick="showBriefDialog"></portfolioBrief>
        </div>
        <div v-if="isEmpty(obj.portfolioBrief) && isCreater && !runStatusStop && !isSoldOut" class="brief_empty" @click="gotoEdit">
            <div>{{ $t('editPortfolioInfo.briefPlaceholder2') }}</div>
            <multi-img class="briefTipBox-icon" name="icon_edit_brief" directory="fund"></multi-img>
        </div>
    </div>
</template>

<script>
import portfolioTag from './portfolioTag.vue'
import remainingDayFollower from './remainingDayFollower.vue'
import headerPortrait from './headerPortrait'
import portfolioBrief from './portfolioBrief.vue'
import { Dialog } from 'vant'
import { milliFormat, floatToRatio, isHLApp } from '@/utils'
import customerDetailMixin from '../mixins/customerDetailMixin'
import { CUSTOMER_TYPE } from '../../config/common'
import { isEmpty } from 'lodash'

export default {
    name: 'followDetaisBasicInfo',
    mixins: [customerDetailMixin],
    components: {
        portfolioTag,
        remainingDayFollower,
        headerPortrait,
        portfolioBrief,
        [Dialog.name]: Dialog,
    },
    props: {
        obj: {
            type: Object,
            default: () => ({}),
        },
        needHeader: {
            type: Boolean,
            default: true,
        },
        isSoldOut: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            checked: true,
        }
    },
    filters: {
        dateFilter(v) {
            return v ? `(${v.replace(/-/g, '/')})` : '--'
        },
        amountFilter(v) {
            v = v || 0
            let ret = floatToRatio(v, { rate: true, base: 2, sign: true })
            ret = milliFormat(ret)
            return ret
        },
    },

    computed: {
        // 当前组合创建者是持牌用户
        createrIsPI() {
            return this.obj?.creator?.type === CUSTOMER_TYPE.professional
        },
        // 当前用户是当前组合创建者
        isCreater() {
            return Number(localStorage.getItem('uin')) == this.obj?.creator?.uin
        },
        runStatusStop() {
            return this.obj?.runStatus === 2
        },
        isInApp() {
            return this.$env.isInApp
        },
    },
    created() {},
    methods: {
        isEmpty,
        gotoPersonalPage() {
            if (this.$env.isInApp) {
                const uin = this.obj.creator?.uin || 0
                this.pushToCustomerDetail(uin)
            }
        },
        gotoEdit() {
            const url = `${location.origin}${location.pathname}#/edit-portfolio-info?portfolioId=${this.$route.query.portfolioId}`
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '', mode: 'immersive', inapp: isHLApp() })
            } else {
                this.$router.push({
                    path: '/edit-portfolio-info',
                    query: {
                        portfolioId: this.$route.query.portfolioId,
                    },
                })
            }
        },
        showBriefDialog() {
            this.$dialog.alert({
                closeOnClickOverlay: true,
                title: this.$t('follow.brief').replace(/：|:/g, ''),
                message: this.obj.portfolioBrief,
                messageAlign: 'left',
                confirmButtonText: this.$t('confirm'),
            })
        },
    },
}
</script>

<style lang="less" scoped>
.lh-18 {
    line-height: 18px;
}

.basic-info {
    .creator_content {
        height: 48px;

        .master_header {
            width: 24px;
            height: 24px;
            margin-right: 6px;
            border-radius: 50%;
        }

        .nick_name {
            flex-shrink: 3;
            max-width: 140px;
            margin-right: 8px;
            color: #2f2f2f;
            font-weight: bold;
            font-size: 14px;
            line-height: 20px;
        }

        .creator_label {
            flex-shrink: 0;
            height: 16px;
            padding: 0 4px;
            color: #ae7218;
            font-size: 11px;
            line-height: 16px;
            text-align: center;
            #border_all_1px(#dbcdb9, 3px);
        }

        .personal {
            flex-shrink: 0;
            color: #9c9c9c;
            font-size: 12px;
            line-height: 16px;
        }

        .arrow_icon {
            width: 12px;
            height: 12px;
        }
    }

    .name {
        width: calc(100% - 98px);

        .portfolio_name {
            line-height: 22px;
        }
    }

    .body {
        display: flex;
        align-items: flex-end;

        .body_left {
            width: 132px;
        }

        .body_right {
            margin-left: 20px;
        }

        .big_value {
            margin-bottom: 4px;
            font-weight: 700;
            font-size: 24px;
            line-height: 34px;
        }

        .value {
            font-weight: bold;
            font-size: 12px;
            line-height: 16px;
        }

        .label {
            color: #9c9c9c;
            font-size: 12px;
            line-height: 16px;
        }
    }

    .stop_body {
        display: flex;
        justify-content: space-between;
        height: 66px;
        color: #9c9c9c;

        .profit_value {
            display: flex;
            align-items: baseline;
            padding: 16px 0;

            .big_value {
                margin-right: 8px;
                font-weight: bold;
                font-size: 24px;
                line-height: 34px;
            }

            .label {
                font-size: 12px;
                line-height: 16px;
            }
        }

        .stop_icon {
            width: 76px;
            height: 56px;
            margin-top: 10px;
            margin-right: 24px;
        }

        .mar-top-22 {
            margin-top: 22px;
        }
    }

    .footer {
        background: #f9f9f9;
        border-radius: 4px;

        .footer_arrow_icon {
            width: 12px;
            height: 12px;
        }
    }

    .brief_empty {
        display: flex;
        padding: 6px 0;
        color: @h3-white;
        font-size: 12px;
        line-height: 18px;

        img {
            width: 16px;
            height: 16px;
            margin-left: 8px;
        }
    }
}
</style>
