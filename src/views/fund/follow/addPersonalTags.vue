<template>
    <div class="add-tags">
        <navigation-bar :color="'#ffffff'" :magicColor="'#f9f9f9'" @back="goBack"></navigation-bar>
        <div class="content">
            <div class="tip">{{ $t('addPersonalTags.tagsSelTip') }}</div>
            <empty v-show="!tagList.length" :show-img="true" :tip-text="$t('addPersonalTags.noData')"></empty>
            <div v-show="tagList.length" class="tagBox">
                <div v-for="(item, index) in tagList" :key="index" @click="clickCellAction(item)">
                    <div :class="{ 'tag normal': !selIndexList.includes(item.id), 'tag selected': selIndexList.includes(item.id) }">
                        <div :class="{ 'tag-text nor-text': !selIndexList.includes(item.id), 'tag-text sel-text': selIndexList.includes(item.id) }">
                            {{ getTagText(item) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="foot">
            <van-button :disabled="saveBtnDisable" class="btn" @click="clickSaveBtn">{{ $t('addPersonalTags.saved') }}</van-button>
        </div>
    </div>
</template>
<script>
import { TagList } from '@/apis/followInvest/index.js'
import Empty from '@/components/Empty.vue'
import { i18n } from '@/i18n/fund/index.js'
import customerDetailMixin from './mixins/customerDetailMixin.js'
import NavigationBar from '@/components/NavigationBar.vue'
import { Toast } from 'vant'

export default {
    name: 'add-personal-tags',
    mixins: [customerDetailMixin],
    data() {
        return {
            tagList: [],
            selIndexList: [],
            selItemList: [],
            initIndexList: [],
        }
    },
    created() {
        this.getListData()
    },
    computed: {
        saveBtnDisable() {
            return JSON.stringify(this.selIndexList) === JSON.stringify(this.initIndexList)
        },
    },
    components: { Empty, NavigationBar },
    methods: {
        async getListData() {
            try {
                const params = {
                    start: 0,
                    count: 999,
                }
                const { result } = await TagList(params)
                const list = result.list.filter(item => item.Status === 1)
                this.tagList = list || []
                if (this.$route.query?.tags) {
                    this.selIndexList = this.$route.query.tags.split(',').map(id => {
                        return Number(id)
                    })
                    this.initIndexList = [...this.selIndexList]
                }
                console.log(`Xiaopei Jin:: result ===> `, this.tagList, this.selIndexList)
            } catch (e) {
                console.error(e)
            }
        },

        clickCellAction(item) {
            if (this.selIndexList.includes(item.id)) {
                this.selIndexList = this.selIndexList.filter(id => {
                    return id != item.id
                })
            } else {
                if (this.selIndexList.length >= 4) {
                    const msg = i18n.t('addPersonalTags.maxSelToast')
                    msg && Toast(msg)
                    return
                }
                this.selIndexList.push(item.id)
            }
        },

        clickSaveBtn() {
            var resArray = []
            this.selIndexList.forEach(index => {
                const foundItem = this.tagList.find(item => item.id == index)
                if (foundItem) {
                    resArray.push(foundItem)
                }
            })
            const resList = JSON.stringify(resArray)
            localStorage.setItem('resList', resList)
            this.$router.go(-1)
        },
        goBack() {
            this.$router.go(-1)
        },
    },
}
</script>
<style lang="less" scoped>
.add-tags {
    #iosBottom();

    .content {
        margin: 12px 12px 32px;
        padding: 24px 0;
        background-color: #fff;
        border-radius: 8px;

        .tip {
            margin-left: 12px;
            color: #666;
            font-weight: 400;
            font-size: 14px;
            font-style: normal;
            line-height: 20px;
        }

        .tagBox {
            display: flex;
            flex-flow: row wrap;
            width: 100%;
        }

        .tag {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 32px;
            margin-top: 12px;
            margin-left: 12px;
            padding: 4px 12px;
            border-radius: 4px;
        }

        .tag-text {
            font-weight: 400;
            font-size: 14px;
            font-style: normal;
            line-height: 20px;
        }

        .normal {
            border: 1px solid #efefef;
        }

        .nor-text {
            #font_h1();
        }

        .selected {
            background-color: rgba(255, 105, 7, 0.1);
            border: 1px solid transparent;
        }

        .sel-text {
            color: #ff6907;
        }
    }

    .foot {
        padding: 0 38px;

        .btn {
            width: 100%;
            height: 44px;
            color: #fff;
            font-weight: 500;
            font-size: 16px;
            font-style: normal;
            line-height: 22px;
            background: #ff6907;
            border-radius: 22px;
        }
    }
}
</style>
