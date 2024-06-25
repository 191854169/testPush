<template>
    <div class="feature-card">
        <div class="card features">
            <ul class="features-list" @click="onFeatureClick">
                <li class="features-list-item mask" data-name="record">
                    <multi-img class="icon" name="trade_record" directory="fund"></multi-img>
                    <h4>{{ $t('orderRecord') }}</h4>
                </li>
                <li class="features-list-item mask" data-name="detail">
                    <multi-img class="icon" name="trade_detail" directory="fund"></multi-img>
                    <h4>{{ $t('profitDetail') }}</h4>
                </li>
                <li class="features-list-item mask" data-name="risk">
                    <multi-img class="icon" name="trade_ceping" directory="fund"></multi-img>
                    <h4>{{ $t('riskAssessment') }}</h4>
                </li>
                <li v-if="isShowPIEntry" class="features-list-item mask" data-name="pi">
                    <multi-img class="icon" name="PI" directory="fund"></multi-img>
                    <h4>{{ $t('piAuthenticate') }}</h4>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { getPiApplyDetail } from '@/apis/client.js'
import { ASSET_TYPE_MAP, CLIENT_TYPE, PRODUCT_TYPE_MAP } from '@/views/fund/config/common'
import riskAssessmentMixin from '@/mixins/business/riskAssessmentMixin.js'
import checkPIMixin from '@/mixins/business/checkPIMixin'
import { throttle } from 'lodash'
import pathnames from '@/config/H5Pathname'
export default {
    name: 'feature-card',
    props: {
        assetType: {
            type: String,
        },
        haveDoingOrder: {
            type: Boolean,
            default: false,
        },
        currency: {
            type: String,
        },
    },
    mixins: [riskAssessmentMixin, checkPIMixin],
    data() {
        return {
            onFeatureClick: throttle(this.clickAction, 500, { leading: true, trailing: false }),
            isPersonalAccountOrCorporate: true, // 是否是个人账户或者公司户
        }
    },
    computed: {
        isShowPIEntry() {
            return !this.isProfessional && this.isPersonalAccountOrCorporate
        },
    },
    created() {
        this.getPersonType()
    },
    methods: {
        goPageWithH5(url, title = '') {
            url = this.$addCurParamsForUrl(url)
            if (this.$openPageInThs(url)) return
            if (this.$openPageInI18NThs(url)) return
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title })
            } else {
                location.href = url
            }
        },
        clickAction(e) {
            console.warn('click:')
            const { name } = e.target.dataset || {}
            if (!name) return
            const map = {
                record: () => {
                    const productKeysMap = PRODUCT_TYPE_MAP.keysMap
                    const assetKeyInteralMap = ASSET_TYPE_MAP.KeyInteralMap
                    const map = {
                        [assetKeyInteralMap[1]]: productKeysMap.PUBLIC,
                        [assetKeyInteralMap[2]]: productKeysMap.PRIVATE,
                        [assetKeyInteralMap[3]]: productKeysMap.BOND,
                        [assetKeyInteralMap[8]]: productKeysMap.BILL,
                        [assetKeyInteralMap[9]]: productKeysMap.CASHBOX,
                    }
                    let url = `${location.origin}/wealth/fund.html#/order-list?haveDoing=${this.haveDoingOrder ? 1 : 0}`
                    this.assetType && (url = `${url}&productType=${map[this.assetType] || ''}`)
                    this.goPageWithH5(url)
                },
                detail: () => {
                    let url = `${location.origin}/wealth/fund.html#/profit`
                    if (this.currency) {
                        url += `?currency=${this.currency}`
                    }
                    this.goPageWithH5(url)
                },
                risk: () => {
                    const url = pathnames.VUE_APP_RISK_PAGE

                    this.getAssessStatus().then(data => {
                        const { isAssessed, isExpired } = data?.result
                        let link = url
                        if (isAssessed === this.ASSESSED && isExpired === this.NO_EXPIRED) {
                            // 跳转结果页
                            link = `${url}result`
                        } else {
                            link = url
                        }
                        this.goPageWithH5(link)
                    })
                },
                pi: () => {
                    const url = pathnames.VUE_APP_PI_APPLY
                    this.goPageWithH5(url)
                },
            }
            const exec = map[name]
            exec && exec()
        },

        async getPersonType() {
            try {
                // 判断用户是否是个人账户 1个人户/2Esop/3联名户/4公司户/5机构户
                const subAcctId = this.$route.query.sub || this.$store.getters['user/getSubAccountId']
                const params = { data: { subAcctId: subAcctId || undefined } }
                const { result } = await getPiApplyDetail(params)
                this.isPersonalAccountOrCorporate = [CLIENT_TYPE.CLIENT_INDIVIDUAL, CLIENT_TYPE.CLIENT_CORPORATE].includes(result?.clientType)
            } catch (e) {
                console.error(e)
            }
        },
    },
}
</script>

<style scoped lang="less">
.feature-card {
    .card {
        margin-top: 12px;
        background: #fff;
        border-radius: 8px;
    }

    .features {
        margin-right: 12px;
        margin-left: 12px;

        &-list {
            display: flex;
            justify-content: space-between;
            height: 80px;
            padding: 12px 0;

            &-item {
                position: relative;
                flex: 1 1 auto;
                text-align: center;

                .icon {
                    width: 24px;
                }

                h4 {
                    position: absolute;
                    // 设置居中
                    left: 50%;
                    margin-top: 8px;
                    color: #1f1f1f;
                    font-size: 12px;
                    line-height: 16px;
                    word-break: keep-all;
                    transform: translateX(-50%);
                }
            }
        }
    }
}
</style>
