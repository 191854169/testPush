<template>
    <van-popup class="popup" v-model="showPopup" position="bottom">
        <div class="popup-content">
            <div class="header">
                <multi-img name="icon-cancel" directory="common" @click="showPopup = false" />
                <span>{{ $t('chooseFundAccount') }}</span>
            </div>
            <ul @click="activeHandler($event)">
                <li v-for="item in list" :class="{ 'current-active': item.type === type }" :key="item.type" :data-type="item.type">
                    <multi-img :name="`account-type__${item.type}`" directory="common" />
                    <p>{{ item.label }}</p>
                </li>
            </ul>
        </div>
    </van-popup>
</template>
<script>
import { WEALTH_ACCOUNT_MAP } from '@/config/common'

const accountKeyMap = WEALTH_ACCOUNT_MAP.keysMap
const accountKeyValueMap = WEALTH_ACCOUNT_MAP.keyValueMap
export default {
    name: 'accountChoose',
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            default: '',
        },
        symbolList: {
            type: Array,
            default: () => [accountKeyMap.allAccount, accountKeyMap.hkdAccount, accountKeyMap.usdAccount],
        },
    },
    data() {
        return {
            listMap: accountKeyValueMap,
        }
    },
    computed: {
        list() {
            const list = []
            for (const key of this.symbolList) {
                if (key in this.listMap) {
                    list.push({ type: key, label: this.listMap[key] })
                }
            }
            return list
        },
        showPopup: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v)
            },
        },
    },
    methods: {
        async activeHandler(e) {
            const type = e.target.dataset?.type
            if (type) {
                this.$emit('choose', type)
                this.showPopup = false
            }
        },
    },
}
</script>
<style scoped lang="less">
.popup {
    border-radius: 12px 12px 0 0;
}

.popup-content {
    max-height: 60vh;
    padding-bottom: 64px;
    overflow: scroll;
    background: #fff;
    border-radius: 12px 12px 0 0;

    .header {
        position: sticky;
        top: 0;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 44px;
        text-align: center;
        background: #fff;

        img {
            position: absolute;
            top: 10px;
            left: 16px;
            width: 24px;
            height: 24px;
        }
    }

    ul {
        display: flex;
        flex-direction: column;
        padding: 0 8px;

        li {
            display: flex;
            align-items: center;
            height: 64px;
            padding: 20px 16px;
            background: #fff;
            border-radius: 8px;

            img {
                width: 24px;
                height: 24px;
                pointer-events: none;
            }

            p {
                padding-left: 12px;
                color: #000;
                font-weight: 400;
                font-size: 16px;
                line-height: 22px;
                pointer-events: none;
            }
        }

        .current-active {
            background-color: #fff5ef;
        }
    }
}
</style>
