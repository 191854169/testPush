<template>
    <div class="table">
        <van-list v-show="!isEmpty" ref="list" @load="loadHandler" v-model="listLoading" :finished="loadingOver" :immediate-check="false">
            <table-item v-for="(item, index) in list" @click.native="clickHandler(item)" :key="index" :row="item"></table-item>
            <template v-slot:loading>
                <div class="loadingText" v-show="!initLoading">
                    <multi-img class="loading-icon" width="20" height="20" name="icon-footer-loading" directory="fund" />
                    <span>{{ `${$t('loading')}...` }}</span>
                </div>
            </template>
            <template v-slot:finished>
                <div class="loading-over">
                    <span>{{ $t('noMore') }}</span>
                </div>
            </template>
        </van-list>
        <div class="noData" v-if="isEmpty">
            <multi-img class="noDataImg" name="noData" directory="common" alt="noData"></multi-img>
            <span>{{ $t('noRecord') }}</span>
        </div>
    </div>
</template>
<script>
import tableItem from './table-item'
import { throttle } from 'lodash'
export default {
    name: 'orderTable',
    components: {
        tableItem,
    },
    props: {
        list: {
            type: Array,
            default: () => [],
        },
        loading: {
            type: Boolean,
            default: false,
        },
        initLoading: {
            type: Boolean,
            default: false,
        },
        loadingOver: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        listLoading: {
            get() {
                return this.loading
            },
            set() {},
        },
        isEmpty() {
            return this.loadingOver && !this.list.length
        },
    },
    watch: {
        listLoading(v) {
            if (v && this.$refs.list) {
                this.$refs.list.$el.scrollTo({
                    top: this.$refs.list.clientHeight,
                })
            }
        },
    },
    data() {
        return {
            loadHandler: throttle(this.getList, 1000, { leading: true, trailing: false }),
        }
    },
    mounted() {},
    methods: {
        clickHandler(item) {
            this.$emit('rowClick', item)
        },
        getList() {
            this.$emit('loadMore')
        },
        loadingText() {
            console.warn('loading')
        },
    },
}
</script>
<style scoped lang="less">
.table {
    flex: 1;
    height: 100%;
    padding: 0 12px;
    overflow: scroll;
    background-color: #fff;

    .buy {
        color: #ff6907;
        font-size: 14px;
        line-height: 20px;
    }

    .sell {
        color: #29c277;
        font-size: 14px;
        line-height: 20px;
    }

    .noData {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-top: 142px;

        .noDataImg {
            width: 104px;
            height: 104px;
            margin-bottom: 8px;
        }
    }
}

.loadingText {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 56px;

    .loading-icon {
        margin-right: 12px;
        animation: circle 1.5s infinite linear;
    }

    span {
        display: inline-block;
        color: #9c9c9c;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
    }
}

@keyframes circle {
    0% {
        transform: rotate(0deg);
    }

    25% {
        transform: rotate(90deg);
    }

    50% {
        transform: rotate(180deg);
    }

    75% {
        transform: rotate(270deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.loading-over {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 56px;

    span {
        color: #9c9c9c;
        font-weight: 400;
        font-size: 12px;
    }
}
</style>
