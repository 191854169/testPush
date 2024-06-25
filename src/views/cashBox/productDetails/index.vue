<template>
    <div class="details">
        <div class="title">
            <div class="left">{{ $t('cpmc') }}</div>
            <div class="right">{{ $t('jqrnh') }}({{ getDate }})</div>
        </div>
        <div class="list">
            <ul ref="list" v-show="list.length > 0">
                <li v-for="(item, index) in list" :key="index">
                    <product-item :item="item" :index="index"></product-item>
                </li>
                <!-- 加载 -->
                <div class="loading-down" v-show="showLoadingDowm">
                    <div class="loading-content">
                        <multi-img class="loading-icon" name="icon-footer-loading" directory="fund" />
                        <span>{{ `${$t('loading')}...` }}</span>
                    </div>
                </div>
                <div class="loading-over">
                    <span>{{ $t('noMoreProduct') }}</span>
                </div>
            </ul>
            <!-- 无数据 -->
            <div class="noData" v-show="list.length == 0">
                <multi-img class="noDataImg" name="noData" directory="common" alt="noData"></multi-img>
                <span>{{ $t('noRecord') }}</span>
            </div>
        </div>
    </div>
</template>
<script>
import productItem from './productItem.vue'
import { debounce } from '@/utils/utils.js'
import { getPubList } from '@/apis/fund/fund'

export default {
    name: 'productDetails',
    components: {
        productItem,
    },
    data() {
        return {
            finished: false,
            showLoadingDowm: false,
            showLoadingOver: false,
            list: [],
        }
    },
    computed: {
        getDate() {
            if (this.list.length) {
                const [{ returnD7ToY1Date = '' } = {}] = this.list
                return returnD7ToY1Date.replace(/-/g, '/')
            }
            return '--'
        },
    },
    created() {
        this.getList()
    },
    mounted() {
        const list = this.$refs.list
        const scrollHandler = e => {
            if (this.showLoadingDowm || this.showLoadingOver) return
            const { scrollTop, clientHeight, scrollHeight } = e.target
            if (parseInt(clientHeight + scrollTop) + 2 >= parseInt(scrollHeight)) {
                debounce(this.getList(), 500)
            }
        }
        list.addEventListener('scroll', scrollHandler)
        this.$once('hook:beforeDestroy', () => {
            list.removeEventListener('scroll', scrollHandler)
        })
    },
    methods: {
        testAPI() {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve()
                }, 1000)
            })
        },
        async getList() {
            try {
                const { result } = await getPubList({
                    start: 0,
                    count: 99,
                    sort: 'desc',
                    f: 'returnD7ToY1',
                    filter: [
                        {
                            type: 'fundType',
                            items: ['mmf'],
                        },
                    ],
                })
                const list = result?.list || []
                this.list = list
            } catch (e) {
                console.log('getPubList===>e:', e)
            }
        },
        // triggerDetail(index) {
        //     const date = this.list[index].date
        //     if (this.$jsBridge) {
        //         const url = location.origin + `/cashBox.html#/profitInfo?date=${date}`
        //         this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
        //     } else {
        //         this.$router.push({
        //             path: '/profitInfo',
        //             query: {
        //                 date: date,
        //             },
        //         })
        //     }
        // },
    },
}
</script>
<style scoped lang="less">
.details {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.account {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 12px 0 16px;
    line-height: 36px;
    background: #fff;
    box-shadow: inset 0 -0.5px 0 #efefef;

    span {
        color: #2f2f2f;
        font-weight: 400;
        font-size: 14px;
    }

    img {
        width: 12px;
        height: 12px;
        transform: rotateX(180deg);
    }
}

.title {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    height: 24px;
    padding: 0 12px;
    color: #9c9c9c;
    font-size: 12px;
    line-height: 24px;
    background: #fff;

    .left {
        width: 160px;
        font-weight: 400;
        line-height: 21px;
    }
    // .mid{
    //     flex: 1;
    // }

    .right {
        min-width: 90px;
        color: #9c9c9c;
        line-height: 16px;
        text-align: right;
    }
}

.list {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 12px;
    overflow: hidden;
    background: #fff;
    border-radius: 8px 8px 0 0;

    ul {
        flex: 1;
        height: 100%;
        overflow-y: scroll;

        li {
            border-bottom: 0.5px solid #efefef;
        }
    }

    ul::-webkit-scrollbar {
        display: none;
    }

    .loading-down {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 56px;

        .loading-content {
            display: flex;
            align-items: center;
            justify-content: center;

            img {
                width: 20px;
                height: 20px;
                margin-right: 12px;
                animation: circle 1.5s infinite linear;
            }

            span {
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }
        }
    }

    .loading-over {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 56px;

        span {
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }
    }
}

.noData {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 87px 0;

    .noDataImg {
        width: 104px;
        height: 104px;
        margin-bottom: 8px;
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
</style>
