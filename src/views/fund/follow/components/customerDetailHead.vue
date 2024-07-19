<template>
    <div class="customer-head">
        <div v-show="!isProfessional">
            <!-- 已下架用户提示 -->
            <div class="soldout-tip" v-if="isSoldOut">
                <soldoutTip :isCreater="isSelf" />
            </div>
            <div class="margin-t12" v-if="isSoldOut"></div>
            <div class="padding-t24" v-else></div>
            <div class="customer-head-front">
                <div class="info">
                    <div class="info-top">
                        <div class="nickname">{{ dataModel.nickName }}</div>
                        <followBtn
                            v-show="!isSelf"
                            v-model="dataModel.follower"
                            :other-uin="otherUin"
                            :isCreater="isSelf"
                            :releaseStatus="dataModel.releaseStatus"
                            class="attentionBtn"
                            @followedSuccess="$emit('followedSuccess')"
                        ></followBtn>
                        <div v-show="isSelf" class="editInfo" @click="gotoEditPage">
                            <multi-img class="editInfo-icon" name="icon_edit" directory="fund"></multi-img>
                            <div class="editInfo-title">{{ $t('customerDetail.editInfo') }}</div>
                        </div>
                    </div>
                    <div v-if="getTags().length > 0" class="tag margin-l12">
                        <div class="tag-item" v-for="item in getTags()" :key="item.id">
                            <span :data-key="item.id">{{ getTagText(item) }}</span>
                        </div>
                    </div>
                    <div class="info-bottom pad-t20 padding-b16">
                        <div class="info-bottom-item" v-for="(item, index) in infoBottomList" :key="index" @click="clickBottomItem(index)">
                            <div class="info-bottom-item-key">
                                <div class="info-bottom-item-number_key">{{ item.key | infoBottomDataFilter(dataModel, expsList, true) }}</div>
                                {{ item.key | infoBottomDataFilter(dataModel, expsList, false) }}
                            </div>
                            <div class="info-bottom-item-label">{{ item.label }}</div>
                        </div>
                    </div>
                    <div v-show="this.showBriefBox()" class="descriptionBox">
                        <portfolioBrief class="description" :text="dataModel.brief" @onClick="showBriefDialog"></portfolioBrief>
                    </div>
                    <div v-show="this.isSelf && !this.showBriefBox()" class="briefTipBox" @click="gotoEditPage">
                        <p>{{ $t('customerDetail.introduceTip') }}</p>
                        <multi-img class="briefTipBox-icon" name="icon_edit_brief" directory="fund"></multi-img>
                    </div>
                </div>
            </div>
        </div>
        <div v-show="isProfessional">
            <div class="professionalCard">
                <div class="professionalCard-top">
                    <headerPortrait class="headerPortrait" :ossId="dataModel.avatarOSSID"></headerPortrait>
                    <span>
                        <div class="nickname">{{ dataModel.nickName }}</div>
                        <div class="tag">
                            <div class="tag-item" v-for="item in getTags()" :key="item.id">
                                <span :data-key="item.id">{{ getTagText(item) }}</span>
                            </div>
                        </div>
                    </span>
                </div>
            </div>
            <!-- 已下架用户提示 -->
            <div class="padding-b16" v-if="isSoldOut"></div>
            <div class="soldout-tip" v-if="isSoldOut">
                <soldoutTip :isCreater="isSelf" />
            </div>
            <div class="margin-t12" v-if="isSoldOut"></div>
            <div class="padding-t24" v-else></div>
            <div class="customer-head-front">
                <div class="info">
                    <div class="professionalCard-mid">
                        <div class="info-bottom pad-t16 padding-b16">
                            <div class="info-bottom-item" v-for="(item, index) in infoBottomList" :key="index" @click="clickBottomItem(index)">
                                <div class="info-bottom-item-key">
                                    <div class="info-bottom-item-number_key">{{ item.key | infoBottomDataFilter(dataModel, expsList, true) }}</div>
                                    {{ item.key | infoBottomDataFilter(dataModel, expsList, false) }}
                                </div>
                                <div class="info-bottom-item-label">{{ item.label }}</div>
                            </div>
                        </div>
                        <followBtn
                            v-show="!isSelf"
                            v-model="dataModel.follower"
                            :other-uin="otherUin"
                            :isCreater="isSelf"
                            :releaseStatus="dataModel.releaseStatus"
                            class="attentionBtn"
                            @followedSuccess="$emit('followedSuccess')"
                        ></followBtn>
                        <div v-show="isSelf" class="editInfo" @click="gotoEditPage">
                            <multi-img class="editInfo-icon" name="icon_edit" directory="fund"></multi-img>
                            <div class="editInfo-title">{{ $t('customerDetail.editInfo') }}</div>
                        </div>
                    </div>
                    <div v-show="this.showBriefBox()" class="descriptionBox">
                        <portfolioBrief class="description" :text="dataModel.brief" @onClick="showBriefDialog"></portfolioBrief>
                    </div>
                    <div v-show="!isSoldOut && this.isSelf && !this.showBriefBox()" class="briefTipBox" @click="gotoEditPage">
                        <p>{{ $t('customerDetail.introduceTip') }}</p>
                        <multi-img class="briefTipBox-icon" name="icon_edit_brief" directory="fund"></multi-img>
                    </div>
                </div>
            </div>
        </div>
        <van-dialog width="75%" v-model="isShowDialog" :title="$t('customerDetail.personalIntroduce')" :confirm-button-text="$t('confirm')">
            <div class="dialog-content">{{ dataModel.brief }}</div>
        </van-dialog>
    </div>
</template>
<script>
import { isNull, isUndefined } from '@/utils/tools'
import followBtn from './followBtn.vue'
import headerPortrait from './headerPortrait.vue'
import { i18n } from '@/i18n/fund/index.js'
import customerDetailMixin from '../mixins/customerDetailMixin'
import { followerNumFilter } from '../utils/filters'
import { isTenantApp } from '@/utils'
import portfolioBrief from './portfolioBrief.vue'
import soldoutTip from './soldoutTip.vue'
import { checkReleaseStatus } from '../utils/dialogUtil'

export default {
    name: 'customer-detail-head',
    mixins: [customerDetailMixin],
    data() {
        return {
            infoBottomList: [
                {
                    key: 'investExp',
                    label: i18n.t('customerDetail.investExp'),
                },
                {
                    key: 'followingNum',
                    label: i18n.t('customerDetail.follow'),
                },
                {
                    key: 'followersNum',
                    label: i18n.t('customerDetail.fans'),
                },
            ],
            expsList: [
                '',
                i18n.t('editCustomerInfo.lessOneYear'),
                i18n.t('editCustomerInfo.lessSixYears'),
                i18n.t('editCustomerInfo.lessElevenYears'),
                i18n.t('editCustomerInfo.moreThanTenYears'),
            ],
            isShowDialog: false,
        }
    },
    components: {
        followBtn,
        headerPortrait,
        portfolioBrief,
        soldoutTip,
    },
    filters: {
        followerNumFilter,
        // eslint-disable-next-line max-params
        infoBottomDataFilter(v, model, expsList, onlyNum) {
            const data = model[v]
            let str = ''
            if (v == 'investExp') {
                if (!isNull(data) && !isUndefined(data) && data != 0) {
                    str = expsList[data] + ''
                } else {
                    return onlyNum ? '--' : ''
                }
            } else {
                if (!isNull(data) && !isUndefined(data)) {
                    str = followerNumFilter(data) + ''
                } else {
                    return onlyNum ? '0' : ''
                }
            }
            const num = str.replace(/[^0-9\-/.]/gi, '')
            if (onlyNum) {
                return num.toString()
            } else if (str.length > num.length) {
                return str.replace(num, '')
            }
            return ''
        },
    },
    props: {
        dataModel: {
            type: Object,
            default: () => ({}),
        },
        isProfessional: {
            //是否专业投资者
            type: Boolean,
            default: false,
        },
        isSelf: {
            //是否本人查看
            type: Boolean,
            default: false,
        },
        otherUin: {
            type: String,
            default: '',
        },
    },
    computed: {
        // 当前用户是否已下架
        isSoldOut() {
            return this.dataModel.releaseStatus === 2
        },
    },
    mounted() {
        console.log(this.isSelf)
    },
    methods: {
        clickBottomItem(index) {
            var type = ''
            //非本人不支持跳转粉丝关注列表
            if (!this.isSelf || index == 0 || index > 2) {
                return
            } else if (index == 1) {
                type = 'following'
            } else if (index == 2) {
                type = 'follower'
            }

            const url = `${location.origin}${location.pathname}#/attention?pageType=${type}&otherUin=${this.otherUin}`
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: `/attention`,
                    query: {
                        pageType: type,
                        otherUin: this.otherUin,
                    },
                })
            }
        },
        gotoEditPage() {
            if (checkReleaseStatus(this, this.isSelf, this.dataModel.releaseStatus)) return
            const isPro = this.isProfessional ? '1' : '0'
            const url = `${location.origin}${location.pathname}#/edit-customer-info?isProfessional=${isPro}`

            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '', mode: 'immersive', inapp: isTenantApp() })
            } else {
                this.$router.push({
                    path: `/edit-customer-info`,
                    query: {
                        isProfessional: isPro,
                    },
                })
            }
        },
        showBriefDialog() {
            this.isShowDialog = true
        },
        //筛除被下架标签
        getTags() {
            if (this.dataModel.tags) {
                const list = this.dataModel.tags.filter(item => item.Status === 1)
                return list
            }
            return []
        },
        showBriefBox() {
            if (this.dataModel.brief && this.dataModel.brief != '') {
                return true
            }
            return false
        },

        getViewHeight(h) {
            const offset = this.showBriefBox() ? 0 : this.isSelf ? 30 : 67
            const res = h - offset
            return res.toString() + 'px'
        },
    },
}
</script>
<style scoped lang="less">
.padding-t24 {
    padding-top: 24px;
}

.padding-b16 {
    padding-bottom: 16px;
}

.margin-t12 {
    margin-top: 12px;
}

.margin-t20 {
    margin-top: 20px;
}

.margin-l12 {
    margin-left: 12px;
}

.height16 {
    height: 16px;
}

.customer-head {
    position: relative;
    width: 100vw;
    // margin-bottom: 12px;

    /deep/ .van-dialog {
        width: 280px;
    }

    .soldout-tip {
        position: relative;
        width: 100%;
        padding-right: 12px;
        padding-left: 12px;
    }

    .customer-head-bg {
        position: absolute;
        z-index: 0;
        width: 100vw;
    }

    .customer-head-front {
        position: relative;
        z-index: 1;
        display: flex;
        width: 100%;
        height: 100%;
        padding-right: 12px;
        padding-left: 12px;

        .info {
            width: 100%;
            background-color: #fff;
            border-radius: 8px;

            .info-top {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                height: 28px;
                margin: 16px 12px 5px;
            }

            .info-bottom {
                display: flex;
                flex-direction: row;
                flex-shrink: 0;
                align-items: center;
                justify-content: flex-start;
                padding-left: 16px;

                .info-bottom-item {
                    width: 76px;
                    margin-right: 8px;

                    &:last-of-type {
                        margin-right: 0;
                    }

                    .info-bottom-item-key {
                        display: flex;
                        align-items: first baseline;
                        color: @h1-white;
                        font-weight: bold;
                        font-size: 12px;
                        line-height: 16px;
                    }

                    .info-bottom-item-number_key {
                        color: @h1-white;
                        font-weight: bold;
                        font-size: 18px;
                        line-height: 26px;
                    }

                    .info-bottom-item-label {
                        margin-top: 4px;
                        color: @h3-white;
                        font-weight: 400;
                        font-size: 12px;
                        font-style: normal;
                        line-height: 16px;
                    }
                }
            }

            .descriptionBox {
                padding: 0 12px 12px;

                .description {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                    max-height: 60px;
                    padding: 12px 8px;
                    background-color: #f9f9f9;
                    border-radius: 4px;

                    &-text {
                        color: #9c9c9c;
                        font-weight: 400;
                        font-size: 12px;
                        font-style: normal;
                        line-height: 18px;
                    }

                    &-arrow {
                        width: 12px;
                        height: 12px;
                    }
                }
            }

            .briefTipBox {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: flex-start;
                margin-bottom: 12px;
                margin-left: 12px;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                line-height: 30px;

                &-icon {
                    width: 16px;
                    height: 16px;
                }
            }
        }
    }

    .professionalCard-mid {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding-right: 12px;
    }

    .professionalCard {
        position: relative;
        z-index: 1;
        width: 100%;
        padding: 16px 20px 0;

        .professionalCard-top {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            width: 100%;
        }

        .headerPortrait {
            width: 56px;
            height: 56px;
            margin-right: 12px;
            border-radius: 50%;
        }
    }

    .nickname {
        color: #000;
        font-weight: 500;
        font-size: 18px;
        font-style: normal;
        line-height: 26px;
    }

    .attentionBtn {
        width: 72px;
        height: 28px;
        border-radius: 14px;
    }

    .tag {
        display: flex;
        flex-flow: row wrap;
        align-items: center;
        justify-content: flex-start;

        &-item {
            height: 16px;
            margin-top: 6px;
            margin-right: 8px;
            padding: 0 4px;
            color: #ae7218;
            font-weight: 400;
            font-size: 11px;
            font-style: normal;
            line-height: 16px;
            text-align: center;
            #border_all_1px(#ae7218, 3px);
        }
    }

    .editInfo {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        height: 24px;
        // width: 80px;
        padding: 0 8px;
        color: #666;
        background-color: #f3f3f3;
        border-radius: 12px;

        .editInfo-icon {
            width: 12px;
            height: 12px;
            margin-right: 2px;
        }

        .editInfo-title {
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }
    }

    .dialog-content {
        width: 100%;
        padding: 10px 16px 28px;
        color: #2f2f2f;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
    }
}
</style>
