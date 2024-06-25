<template>
    <div class="private-list">
        <div class="private-list-bg">
            <multi-img name="private-list-bg" directory="fund"></multi-img>
            <p class="product-mechanism" @click="gotoMechanism">
                {{ $t('productChooseMechanism') }}
                <multi-img name="icon_arrow_right" directory="fund"></multi-img>
            </p>
            <h2>{{ $t('privateEnjoy') }}</h2>
            <h4>{{ $t('withUp') }}</h4>
            <div class="tags">
                <div class="tag">
                    <multi-img name="icon_zhuanshi" directory="fund"></multi-img>
                    <span>{{ $t('optionProduct') }}</span>
                </div>
                <div class="tag">
                    <multi-img name="icon_zhuanshi" directory="fund"></multi-img>
                    <span>{{ $t('multiAsset') }}</span>
                </div>
                <div class="tag">
                    <multi-img name="icon_zhuanshi" directory="fund"></multi-img>
                    <span>{{ $t('specificServe') }}</span>
                </div>
            </div>
        </div>
        <recommend-private-fund
            class="outter-recommend"
            :list="recommendList"
            @click="onPermissoinalCheck"
            :isProfessional="isProfessional"
        ></recommend-private-fund>
        <div class="list-content">
            <div class="header">
                <div>{{ $t('selectRefer') }}</div>
                <div class="more-product" @click="gotoAll">
                    {{ $t('allProduct') }}
                    <multi-img name="icon_arrow_right" directory="fund"></multi-img>
                </div>
            </div>
            <fund-item
                @click="onPermissoinalCheck"
                v-for="(item, index) in list"
                :key="item.symbol + index"
                :fundInfo="item"
                class="list-item"
                :isProfessional="isProfessional"
            ></fund-item>
        </div>
        <div v-if="hasInit && list.length === 0" class="noData">
            <multi-img name="noHold" directory="common" />
            <h4>{{ $t('fundList.noFund') }}</h4>
        </div>
        <div class="service-btns" @click="onServiceBtns">
            <button class="relative mask" data-name="service">
                <multi-img name="icon_kefu" directory="fund"></multi-img>
                {{ $t('specificService') }}
            </button>
            <button class="relative mask" data-name="mechanism">
                <multi-img name="icon_zhenxuan" directory="fund"></multi-img>
                {{ $t('productChooseMechanism') }}
            </button>
        </div>
        <disclaimer></disclaimer>
    </div>
</template>
<script>
import fundItem from '@/views/fund/list/components/private-item'
// import fundItemHide from '@/views/fund/list/components/private-itemHide'
import { getRecommendListV1 } from '@/apis/fund/fund.js'
import RecommendPrivateFund from './components/recommend-private-fund.vue'
import Disclaimer from './components/disclaimer.vue'
import PrivateMixin from './mixins/private'
import checkPIMixin from '@/mixins/business/checkPIMixin'

export default {
    name: 'privateList',
    components: {
        fundItem,
        RecommendPrivateFund,
        Disclaimer,
    },
    mixins: [PrivateMixin, checkPIMixin],
    data() {
        return {
            start: 1,
            // isProfessional: false,
            professionalType: null, // 专业投资者  'A'： Professional Investor - A；'B' ： Professional Investor - B；'O'： Offshore Company；'N'： Na/A
            count: 100, // TODO: 私募目前没有分页，设置一个固定数去查
            list: [],
            hasInit: false,
            recommendList: [],
        }
    },
    created() {
        this.getList()
        this.getRecommendList()
        // this.checkPI()
    },
    methods: {
        // 获取私募推荐基金列表
        async getRecommendList() {
            try {
                this.$loading.show = true
                const RECOMMEND = 1 // 重磅推荐
                const params = {
                    type: RECOMMEND,
                }
                const { result } = await getRecommendListV1(params)
                console.log(`Feng.chen:: 13:29:19 res ===> `, result, params)
                const { list } = result || {}
                this.recommendList = (list || [])[0]?.info || []
            } catch (e) {
                console.log('getPriList===>e:', e)
            } finally {
                this.$loading.show = false
                this.hasInit = true
            }
        },
        gotoAll() {
            const url = `${location.origin}/wealth/fund.html#/filter-private-fund`
            this.$jsBridge ? this.$jsBridge.open({ url: encodeURIComponent(url), title: '' }) : this.$router.push('filter-private-fund')
        },
    },
}
</script>
<style lang="less">
.private-tip {
    z-index: 10001 !important;
    width: 280px !important;
    border-radius: 12px;

    .van-dialog__content {
        min-height: auto;
    }

    .van-dialog__message {
        padding: 28px 16px;

        > span {
            display: block;
            margin-left: 8px;
            color: #1f1f1f;
            font-size: 14px;
            line-height: 20px;
            text-align: left;

            span {
                display: inline;
                color: #ff6907;
            }
        }
    }

    .van-dialog__footer {
        .van-dialog__confirm {
            height: 44px;
        }

        box-shadow: inset 0 0.5px 0 #efefef;
    }
}
</style>
<style scoped lang="less">
.private-list {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100%;
    padding-bottom: 48px;
    overflow: hidden;
    background: #080000;
}
</style>
<style lang="less" scoped>
.private-list-bg {
    position: absolute;
    width: 100%;
    height: 274px;

    & > img {
        position: absolute;
        top: -20px;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .product-mechanism {
        position: absolute;
        right: 0;
        display: flex;
        align-items: center;
        margin-top: 16px;
        padding: 4px 8px 4px 12px;
        color: #eeb992;
        font-size: 12px;
        line-height: 16px;
        background: rgba(#fff, 0.15);
        border-radius: 16px 0 0 16px;

        img {
            width: 8px;
            margin-left: 2px;
        }
    }

    h2 {
        position: relative;
        margin: 68px 0 0 24px;
        font-weight: @fontBold;
        font-size: 28px;
        line-height: 34px;
        background: linear-gradient(324.22deg, #ffb28e 31.78%, #ffe1ce 105.79%);
        background-clip: text;
        -webkit-text-fill-color: transparent;
        /* stylelint-disable-next-line property-no-unknown */
        text-fill-color: transparent;
    }

    h4 {
        position: relative;
        margin: 8px 0 0 24px;
        color: #ffb694;
        font-size: 12px;
        line-height: 16px;
    }

    .tags {
        display: flex;
        margin-top: 45px;
        margin-left: 24px;

        .tag {
            z-index: 1;
            display: flex;
            align-items: center;
            margin-right: 12px;
            color: #ddd4ca;
            font-size: 12px;
            line-height: 16px;

            img {
                width: 14px;
                height: 14px;
                margin-right: 4px;
            }
        }
    }
}

.outter-recommend {
    margin-top: 200px;
}

.list-content {
    margin-top: 39px;
    background: black;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 7px 16px;
        color: #ffc3a6;

        div:first-child {
            font-weight: @fontBold;
            font-size: 16px;
            line-height: 22px;
        }

        div:last-child {
            font-size: 12px;
            line-height: 16px;
        }

        .more-product {
            display: flex;
            align-items: center;

            img {
                width: 12px;
                margin-left: 4px;
            }
        }
    }

    .list-item {
        margin: 12px 16px 0;
    }

    .content-item:last-child {
        .tip {
            margin-top: 8px;
            margin-bottom: 0;
        }

        .list-item {
            margin-bottom: 0;
        }
    }
}

.noData {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 210px;
    margin: 14px 16px 0;
    background: #fff;
    border-radius: 8px;

    img {
        width: 104px;
        height: 104px;
        margin-bottom: 12px;
    }

    h4 {
        color: #9c9c9c;
        font-size: 14px;
        line-height: 20px;
    }
}

.service-btns {
    display: flex;
    justify-content: space-between;
    margin-top: 32px;
    padding: 0 51px;

    button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 124px;
        color: #ffc3a6;
        font-size: 14px;
        line-height: 32px;
        background: #2a2929;
        border: none;
        border-radius: 19.5px;
        outline: none;

        img {
            width: 12px;
            height: 12px;
            margin-right: 4px;
        }
    }
}

.disclaimer {
    margin-top: 32px;
}
</style>
