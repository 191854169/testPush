<template>
    <div class="country">
        <div class="search">
            <img src="@/assets/images/openAccount/tax-info/search.png" />
            <p>
                <input type="text" placeholder="请输入地区关键字搜索" v-model="inputVal" />
                <span @click="clear">取消</span>
            </p>
        </div>
        <div class="country-box">
            <van-index-bar :index-list="showList.indexList">
                <template v-if="!inputVal">
                    <van-index-anchor index="常用地区" />
                    <van-cell
                        v-for="(item, index) in showList.CommonlyList"
                        :key="index"
                        :title="item.zhCn"
                        :value="item.areaCode"
                        @click="changeList(item)"
                    />
                </template>

                <div v-for="item in Object.keys(showList.dataList)" :key="item">
                    <van-index-anchor :index="item" />
                    <van-cell
                        v-for="(i_item, i_index) in showList.dataList[item].list"
                        :key="i_index"
                        :title="i_item.zhCn"
                        :value="i_item.areaCode"
                        @click="changeList(i_item)"
                    />
                </div>
            </van-index-bar>
        </div>
    </div>
</template>
<script>
import { countrys } from '@/config/country.js'
export default {
    data() {
        return {
            inputVal: '',

            indexList: [],
            CommonlyList: [], // 常用列表

            countrys,
        }
    },
    props: {
        select: {
            type: String,
            default: () => 'CHN',
        },
        Commonly: {
            // 设置常用的选择
            type: Array,
            default: () => ['CHN', 'HKG', 'MAC', 'TWN', 'USA', 'GBR', 'SGP'],
        },
    },
    computed: {
        showList() {
            const dataList = []
            const indexList = []

            const CommonlyList = []
            this.countrys.forEach(item => {
                if (this.inputVal) {
                    if (
                        item.zhCn.indexOf(this.inputVal) >= 0 ||
                        item.zhTw.indexOf(this.inputVal) >= 0 ||
                        item.en.toUpperCase().indexOf(this.inputVal.toUpperCase()) >= 0 ||
                        item.areaCode.indexOf(this.inputVal) >= 0
                    ) {
                        const Initials = item.countryCode.slice(0, 1) //首字母
                        // 正常的列表
                        if (indexList.indexOf(Initials) >= 0) {
                            dataList[Initials].list.push(item)
                        } else {
                            indexList.push(Initials)
                            dataList[Initials] = {
                                Initials,
                                list: [item],
                            }
                        }
                    }
                } else {
                    //没有输入任何内容
                    const Initials = item.countryCode.slice(0, 1) //首字母

                    // 添加常用地区
                    if (this.Commonly.indexOf(item.countryCode) >= 0) {
                        CommonlyList.push(item)
                    } else {
                        // 常用地区的国家不加入列表
                        // 正常的列表
                        if (dataList[Initials]) {
                            dataList[Initials].list.push(item)
                        } else {
                            indexList.push(Initials)
                            dataList[Initials] = {
                                Initials,
                                list: [item],
                            }
                        }
                    }
                }
            })
            return {
                indexList,
                dataList,
                CommonlyList,
            }
        },
    },
    mounted() {
        // console.log(countrys)
        // this.showList
    },
    methods: {
        clear() {
            this.$emit('clear')
        },
        changeList(item) {
            this.$emit('change', item)
        },
    },
}
</script>
<style lang="less" scoped>
.country {
    padding: 12px 0;

    .search {
        position: relative;
        padding: 8px 14px 14px;

        img {
            position: absolute;
            top: 15px;
            left: 27px;
            width: 16px;
            height: 16px;
        }

        p {
            display: flex;
            align-items: center;

            input {
                width: 100%;
                height: 30px;
                margin-right: 16px;
                padding-left: 36px;
                line-height: 30px;
                background: #f8f8f8;
                border: 0 solid #f8f8f8;
                border-radius: 20px;

                &::placeholder {
                    color: #9c9c9c;
                }
            }

            span {
                width: 40px;
                color: #666;
            }
        }
    }

    .country-box {
        position: relative;
        height: calc(100vh - 64px);
        overflow: scroll;
    }
}
</style>
