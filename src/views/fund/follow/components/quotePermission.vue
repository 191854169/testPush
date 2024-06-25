<template>
    <div class="user-quote-permission" :class="{ immersive: isImmersive }" v-if="tips">{{ tips }}</div>
</template>

<script>
import { isHLApp } from '@/utils'
export default {
    name: 'user-quote-permission',
    components: {},
    props: {
        market: {
            type: Array,
            required: true,
        },
        displayStatus: {
            type: Boolean,
        },
        // 是否为沉浸式
        immersive: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            delayCount: 0,
            permissionMap: {},
        }
    },
    computed: {
        tips() {
            if (this.delayCount == 0) {
                return ''
            } else if (this.market.length == this.delayCount) {
                return this.$t('follow.delayText')
            } else if (this.permissionMap['hk']) {
                return this.$t('follow.HKDelayText')
            } else if (this.permissionMap['us']) {
                return this.$t('follow.USDelayText')
            }
            return ''
        },
        syncDisplayStatus: {
            get() {
                return this.displayStatus
            },
            set(v) {
                this.$emit('update:displayStatus', v)
            },
        },
        isImmersive() {
            return this.immersive && isHLApp()
        },
    },
    mounted() {
        this.updatePermissions()
    },
    methods: {
        updatePermissions() {
            const list = [1, 4]
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
            this.market.forEach(mkt => {
                const permission = (userInfo?.permission?.[mkt] || {}).type || ''
                const delay = !permission || list.includes(permission)
                this.permissionMap[mkt] = delay
                if (delay) {
                    this.delayCount += 1
                }
            })
            this.syncDisplayStatus = this.delayCount > 0
            console.log('updatePermissions', this.permissionMap, this.delayCount)
        },
    },
}
</script>

<style scoped lang="less">
.user-quote-permission {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 11;
    width: 100%;
    padding-left: 12px;
    color: #af7213;
    line-height: 32px;
    background: #fff6e8;
    border-radius: 4px;

    &.immersive {
        width: calc(100% - 24px);
        margin-left: 12px;
    }
}
</style>
