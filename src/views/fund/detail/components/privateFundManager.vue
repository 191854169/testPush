<template>
    <div class="profile" id="profile">
        <div class="profile-title">{{ $t('fundManager') }}</div>
        <div class="profile-body">
            <div class="tab-content" v-if="fundManager.list.length > 0">
                <div class="content-head">
                    <div>{{ $t('name') }}</div>
                    <div>{{ $t('presidency') }}</div>
                </div>
                <div class="content-item" v-for="(item, index) in fundManager.list" :key="index">
                    <div class="label line-elipsis">{{ item.name }}</div>
                    <div class="text">{{ item.date }}</div>
                </div>
            </div>
            <empty v-else class="tab-content"></empty>
        </div>
    </div>
</template>
<script>
import Empty from '@/components/Empty.vue'
import { getManager } from '@/apis/fund/fund'

export default {
    name: 'fundManager',
    components: {
        Empty,
    },
    data() {
        return {
            symbol: this.$route.query.symbol,
            fundManager: {
                title: this.$t('fundManager'),
                list: [],
            },
        }
    },
    created() {
        this.getManager()
    },
    methods: {
        async getManager() {
            try {
                const res = await getManager({ symbol: this.symbol })
                if (res.result && res.result.list) {
                    const list = res.result.list
                    this.fundManager.list = list.map(item => {
                        return {
                            name: item.name,
                            date: this.$t('fromFoundedToDay'),
                        }
                    })
                }
            } catch (e) {
                console.log('getManager=>e:', e)
            }
        },
    },
}
</script>
<style scoped lang="less">
.profile {
    margin: 12px;
    padding: 8px 12px 0;
    background: #fff;
    border-radius: 8px;
}

.profile-title {
    padding: 7px 0 15px;
    color: #2f2f2f;
    font-weight: 700;
    font-size: 16px;
    line-height: 22px;
}

.tab-content {
    margin-top: 12px;
    overflow: hidden scroll;

    .profile-info__item {
        display: flex;
        flex-direction: row;
        margin-bottom: 12px;
        font-weight: 400;
        font-size: 12px;
        line-height: 20px;

        .label {
            width: 82px;
            height: 20px;
            padding-right: 16px;
            color: #666;
        }

        .text {
            max-width: calc(100% - 98px);
            overflow: hidden;
            color: #2f2f2f;
            white-space: pre-wrap;
        }
    }

    .profile-info__item:last-of-type {
        margin-bottom: 8px;
    }

    .content-head {
        position: sticky;
        top: 0;
        display: flex;
        justify-content: space-between;
        height: 24px;
        color: #9c9c9c;
        font-weight: 400;
        font-size: 12px;
        line-height: 24px;
        background-color: #fff;
    }

    .content-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 40px;
        color: #2f2f2f;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;

        .label {
            display: flex;
            align-items: center;
            max-width: 206px;

            img {
                margin-right: 8px;
            }
        }
    }
}
</style>
