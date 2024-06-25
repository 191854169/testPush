<template>
    <van-popup class="outter-popup" v-model="showPopup" position="bottom">
        <div class="outter-popup-content">
            <div class="header">
                <multi-img name="icon-cancel" directory="common" @click="showPopup = false" />
                <span>{{ title }}</span>
            </div>
            <ul @click="activeHandler($event)" class="list">
                <li class="list-item" v-for="item in columns" :class="{ 'current-active': item.key === type }" :key="item.key" :data-key="item.key">
                    <multi-img v-if="item.icon" :name="`icon_${item.icon}`" :directory="icon.directory || 'fund'" />
                    <p>{{ item.label }}</p>
                </li>
            </ul>
        </div>
    </van-popup>
</template>

<script>
export default {
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        typeKey: {
            type: [String, Number],
            default: 'all',
        },
        columns: {
            type: Array,
            default: () => [],
        },
        title: {
            type: String,
            default: '',
        },
    },
    computed: {
        showPopup: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v)
            },
        },
        type: {
            get() {
                return this.typeKey
            },
            set(v) {
                this.$emit('on-change', v)
                this.showPopup = false
            },
        },
    },
    methods: {
        activeHandler(e) {
            const key = e.target.dataset.key
            if (!key) return
            this.type = key
        },

        open() {
            this.showPopup = true
        },

        close() {
            this.showPopup = false
        },
    },
}
</script>

<style lang="less" scoped>
.outter-popup {
    border-radius: 12px 12px 0 0;
}

/deep/ .outter-popup-content {
    .header {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 5px;
        padding: 11px 16px 9px;
        text-align: center;

        img {
            position: absolute;
            top: 11px;
            left: 16px;
            width: 24px;
        }

        span {
            color: #2f2f2f;
            font-weight: 500;
            font-size: 16px;
            line-height: 22px;
            text-align: center;
        }
    }

    .list {
        padding: 0 8px 98px;

        &-item {
            display: flex;
            align-items: center;
            padding: 20px 16px;

            &:active,
            &.current-active {
                background: #fff5ef;
                border-radius: 8px;
            }

            img {
                width: 24px;
                margin-right: 12px;
                pointer-events: none;
            }

            p {
                color: #000;
                font-size: 16px;
                line-height: 22px;
                pointer-events: none;
            }
        }
    }
}
</style>
>
