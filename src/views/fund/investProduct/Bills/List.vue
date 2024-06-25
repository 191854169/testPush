<!-- 另类投资 - 票据列表 -->
<template>
    <div class="alter-investments">
        <section :class="{ locked: isNotPI && !inWhiteList }">
            <div class="alter-content" :style="{ height: `${showOnlyFCN() ? calcRem(44) : calcRem(80)}px` }">
                <!-- 搜索 -->
                <BillSearch></BillSearch>
                <!-- 导航栏 -->
                <div class="flex tabs" v-if="!showOnlyFCN()">
                    <div
                        class="flex flex1 tab"
                        :class="{ 'active-tab': item.id === activeTabID }"
                        v-for="item in tabs"
                        :key="item.id"
                        @click="handleTabClick(item)"
                    >
                        {{ item.lable }}
                    </div>
                </div>
            </div>
            <div :style="{ height: `${showOnlyFCN() ? calcRem(44) : calcRem(80)}px`, background: '#f9f9f9' }"></div>
            <KeepAlive>
                <component class="page-container" :is="componentId" ref="pageContainerRef"></component>
            </KeepAlive>
        </section>

        <div v-if="isNotPI && !inWhiteList" class="mask" @click="handleLockClick">
            <svg-icon iconClass="lock" className="lock"></svg-icon>
            <p>
                {{ $t('verifyText1') }}
                <br />
                {{ $t('verifyText2') }}
            </p>
            <button>
                <span class="skew_top1">{{ $t('willVerify') }}</span>
            </button>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import ListStandard from './ListStandard.vue'
import ListFCN from './ListFCN.vue'
import ListCustom from './CustomizeIndex.vue'
import BillSearch from './bill-search.vue'
import { calcRem, toFixed } from '@/utils'
import { getProfessionalStatus } from '@/utils'
import PrivateMixin from '../../list/mixins/private'
import checkPIMixin from '@/mixins/business/checkPIMixin'
import { NoteInquiryWhiteList } from '@/apis/fund/noteApi'
import { isInOutsideH5 } from '@/utils'
import NP from 'number-precision'
const BILL_ACTIVE_TAB = 'billListActiveTab'

export default {
    name: 'bills-list',
    mixins: [PrivateMixin, checkPIMixin],
    components: {
        ListStandard,
        ListCustom,
        ListFCN,
        BillSearch,
    },
    props: {},
    data() {
        return {
            activeTabID: 0,
            inWhiteList: false,
        }
    },
    computed: {
        ...mapState('user', ['userInfo']),
        isNotPI() {
            const acctObj = this.$store.getters['user/getAccts']
            const isPi = !getProfessionalStatus(acctObj.professionalType)
            return isPi
        },
        // 已登录且为PI
        loginedAndisPI() {
            return this.$root.isLogin && !this.isNotPI
        },

        subAcctId() {
            return this.$store.getters['user/getSubAccountId']
        },
        tabs() {
            const list = [
                { id: 0, lable: this.$t('fcn.standardProduct') },
                { id: 1, lable: this.$t('fcn.customBill') },
            ]
            if (this.inWhiteList) {
                list.push({ id: 2, lable: this.$t('fcn.billInquiry') })
            }
            return list
        },
        componentId() {
            const ids = {
                0: 'ListStandard',
                1: 'ListCustom',
            }

            if (this.inWhiteList) {
                ids[2] = 'ListFCN'
            }
            return ids[this.activeTabID]
        },
    },
    watch: {
        '$root.isLogin': {
            handler(v) {
                if (typeof v === 'boolean' && v) {
                    this.getNoteInquiryWhiteList()
                }
            },
        },
    },
    created() {
        this.getNoteInquiryWhiteList()
    },
    mounted() {
        const storageActiveTab = sessionStorage.getItem(BILL_ACTIVE_TAB)
        if (storageActiveTab && isInOutsideH5()) {
            this.activeTabID = Number(storageActiveTab)
        }
    },
    destroyed() {},
    filters: {},
    methods: {
        calcRem(v) {
            return calcRem(document, v)
        },
        showOnlyFCN() {
            return this.isNotPI && this.inWhiteList
        },
        //处理登录 和 PI认证
        handleLockClick() {
            this.viewDetailHnader(null, '')
        },

        async getNoteInquiryWhiteList() {
            if (!this.$root.isLogin) {
                return
            }
            try {
                const { result = {} } = (await NoteInquiryWhiteList()) ?? {}
                console.log(`NoteInquiryWhiteList result`, result)
                this.inWhiteList = result.inWhiteList // 白名单
                if (this.showOnlyFCN()) {
                    this.activeTabID = 2
                }
            } catch (error) {
                console.error(`NoteInquiryWhiteList`, error)
            }
        },
        saveBillsActiveTab() {
            sessionStorage.setItem(BILL_ACTIVE_TAB, this.activeTabID + '')
        },
        handleTabClick(item) {
            this.activeTabID = item.id
            sessionStorage.removeItem(BILL_ACTIVE_TAB)
            this.$nextTick(() => {
                this.setTableActualHeight()
            })
        },

        setTableActualHeight() {
            // 获取页面的高度
            const viewHeight = document.documentElement.clientHeight
            const rootFontSize = Number.parseFloat(document.documentElement.style.fontSize)
            console.log(`Feng.chen:: 16:02:07 rootFontSize ===> `, rootFontSize)
            // 手动计算table的实际高度
            const height = toFixed(NP.minus(viewHeight, NP.times(NP.divide(80, 100), rootFontSize)), 2)
            console.log(`Feng.chen:: 15:46:54 table height ===> `, viewHeight, height)
            // 设置元素对应高度
            const pageContainerRef = document.querySelector('.main-wrapper')
            console.log(`Feng.chen:: 16:36:47 pageContainerRef ===> `, pageContainerRef)
            const index = document.querySelector('.index')
            if (pageContainerRef) {
                pageContainerRef.style.height = `${height}px`
                index && (index.style.height = 'auto')
            } else {
                index && (index.style.height = `100vh`)
            }
        },
    },
}
</script>

<style scoped lang="less">
.alter-investments {
    position: relative;
    background-color: #fff;

    .locked {
        opacity: 0.8;
        filter: blur(4px);
    }

    .alter-content {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 20;
        width: 100%;
        background-color: #fff;
    }

    .tabs {
        width: 100%;
        height: 36px;
        background-color: #fff;

        .tab {
            align-items: center; // 上下居中
            justify-content: center; // 左右居中
            height: 36px;
            color: @h2-white;
            font-weight: 400;
            font-size: 15px;
            line-height: 21px;
        }

        .active-tab {
            color: @h1-white;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
        }
    }

    .page-container {
        height: calc(100vh - 80px);
        overflow-y: scroll;
    }

    .mask {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 21;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 90%;

        .lock {
            width: 28px;
            height: 28px;
            color: #453d3d;
        }

        p {
            margin: 8px 0 16px;
            color: #666;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
            text-align: center;
        }

        button {
            width: 114px;
            color: #fff;
            font-weight: @fontBold;
            font-size: 14px;
            line-height: 32px;
            text-align: center;
            background-color: @theme;
            border: none;
            border-radius: 16px;
            outline: none;

            span {
                display: inline-block;
            }
        }
    }
}
</style>
