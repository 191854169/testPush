<template>
    <div class="country">
        <div class="search">
            <img src="@/assets/images/openAccount/tax-info/search.png" alt srcset />
            <p>
                <input type="text" placeholder="请输入地区关键字搜索" v-model="inputVal" />
                <span>取消</span>
            </p>
        </div>
        <div class="country-box">
            <div v-for="(item, index) in showList" :key="index" class="select-list">
                <p class="title" v-if="item.title">{{ item.title }}</p>
                <p
                    :class="['list', { active: l_item.countryCode == select }]"
                    v-for="(l_item, l_index) in item.list"
                    :key="l_index"
                    @click="changeCountry(l_item)"
                >
                    {{ l_item.zhCn }}
                </p>
            </div>
        </div>
    </div>
</template>
<script>
// config
import { countrys } from '@/config/country.js'
export default {
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
            if (this.inputVal) {
                const callbackList = []
                this.countrys.forEach(item => {
                    if (
                        item.zhCn.indexOf(this.inputVal) >= 0 ||
                        item.zhTw.indexOf(this.inputVal) >= 0 ||
                        item.en.indexOf(this.inputVal) >= 0 ||
                        item.initial.indexOf(this.inputVal) >= 0
                    ) {
                        callbackList.push(item)
                    }
                })
                return [
                    {
                        title: false,
                        list: callbackList,
                    },
                ]
            }
            const allList = {
                com: {
                    title: '常用地区',
                    list: [],
                },
            }
            this.countrys.forEach(item => {
                if (this.Commonly.indexOf(item.countryCode) >= 0) {
                    // 常用
                    allList.com.list.push(item)
                } else {
                    const code = item.countryCode.slice(0, 1)
                    if (allList[code] == undefined) {
                        allList[code] = {
                            title: code,
                            list: [item],
                        }
                    } else {
                        allList[code].list.push(item)
                    }
                }
            })

            // 针对对象重新排序生成数组
            const newAllList = []
            Object.keys(allList)
                .sort()
                .forEach(key => {
                    newAllList.push(allList[key])
                })
            // 常用地区排在最前面来
            const com = newAllList.pop()
            newAllList.unshift(com)
            return newAllList
        },
    },
    data() {
        return {
            // 输入框的内容
            inputVal: '',
            countrys,
        }
    },
    methods: {
        changeCountry(item) {
            this.$emit('change', item)
        },
    },
}
</script>
<style lang="less" scoped>
.country {
    padding: 12px 16px;

    .search {
        position: relative;
        padding-top: 8px;
        padding-bottom: 14px;

        img {
            position: absolute;
            top: 15px;
            left: 13px;
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
        height: 50vh;
        overflow: scroll;
    }

    .select-list {
        .list {
            padding: 12px 0;
            font-size: 14px;
        }

        .active {
            color: #ff6907;
        }

        .title {
            height: 24px;
            padding-bottom: 8px;
            color: #9c9c9c;
            font-size: 12px;
            line-height: 24px;
        }
    }
}
</style>
