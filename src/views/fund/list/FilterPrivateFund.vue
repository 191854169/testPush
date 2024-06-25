<template>
    <div class="filter-private-fund">
        <div class="tabs-box">
            <div class="tabs" @click="onTabClick">
                <div
                    class="tab"
                    :class="{ 'tab--active': idx === activeTab }"
                    v-for="(item, idx) in labels"
                    :key="item.key"
                    :data-tab="idx"
                    :data-label="item.label"
                    :data-name="item.name"
                >
                    {{ `${item.name}${item.count ? `(${item.count})` : ''}` }}
                </div>
            </div>
        </div>
        <div class="list-content">
            <fund-item
                v-for="(item, index) in list"
                :key="item.symbol + index"
                :fundInfo="item"
                class="list-item"
                :isProfessional="isProfessional"
                @click="viewDetailHnader(item)"
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
import Disclaimer from './components/disclaimer.vue'
import { Swipe, SwipeItem } from 'vant'
import PrivateMixin from './mixins/private'
import checkPIMixin from '@/mixins/business/checkPIMixin'

export default {
    name: 'privateList',
    components: {
        fundItem,
        Disclaimer,
        [Swipe.name]: Swipe,
        [SwipeItem.name]: SwipeItem,
    },
    mixins: [PrivateMixin, checkPIMixin],
    data() {
        return {
            start: 1,
            isProfessional: false,
            professionalType: null, // 专业投资者  'A'： Professional Investor - A；'B' ： Professional Investor - B；'O'： Offshore Company；'N'： Na/A
            count: 100, // TODO: 私募目前没有分页，设置一个固定数去查
            list: [],
            hasInit: false,
            activeTab: 0,
            labels: [{ key: '0', label: '', name: this.$t('quanbu'), count: 0 }],
            listObject: {},
        }
    },
    async created() {
        // this.checkPI()
        await this.getList()
        this.listObject[0] = this.list
    },
    methods: {
        async onTabClick(e) {
            const { tab, name } = e.target.dataset
            if (!tab || tab == this.activeTab) return
            this.activeTab = +tab
            let activeList = this.listObject[this.activeTab]
            if (activeList) {
                this.list = activeList
                return
            }
            const allList = this.listObject[0] || []
            activeList = allList.filter(i => i.label === name)
            this.list = activeList
            this.listObject[this.activeTab] = activeList
        },
    },
}
</script>
<style scoped lang="less">
.filter-private-fund {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100%;
    padding-bottom: 48px;
    background: #080000;
}
</style>
<style lang="less" scoped>
.tabs-box {
    height: 28px;
    margin-top: 14px;
    overflow: hidden;

    .tabs {
        display: flex;
        padding-bottom: 10px;
        overflow: auto;

        .tab {
            margin-left: 12px;
            padding: 4px 12px;
            color: #eeb992;
            font-size: 14px;
            line-height: 20px;
            white-space: pre;
            text-align: center;
            background: #413b3b;
            border-radius: 25px;

            &:last-child {
                margin-right: 12px;
            }

            &--active {
                color: #2f2f2f;
                background: #fdc69a;
            }
        }
    }
}

.list-content {
    background: black;

    .list-item {
        margin: 12px 12px 0;

        &:first-child {
            margin-top: 14px;
        }
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
