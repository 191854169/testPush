<template>
    <div class="sell-account-type">
        <fosun-popup v-model="visible" :title="$t('sellTo')" :columns="accountColumns" @on-change="onChangeType"></fosun-popup>
    </div>
</template>

<script>
import { i18n } from '@/i18n/common'
import FosunPopup from '@/components/FosunPopup.vue'
import pathnames from '@/config/H5Pathname.js'
import { addQueryStr } from '@/utils/tools'
import goPage from '@/config/globalProterties/goPage'
import { env } from '@/config/globalProterties/env'

const $t = v => i18n.t(v)
const accountColumns = [
    {
        key: 'stock',
        label: $t('stockAccount'),
    },
    {
        key: 'bank',
        label: $t('bankAccount'),
    },
]

function goTransferOutPage(data = {}) {
    const { VUE_APP_TRANSFER_OUT_APP, VUE_APP_TRANSFER_OUT_H5 } = pathnames

    const url = addQueryStr(env === 2 ? VUE_APP_TRANSFER_OUT_H5 : VUE_APP_TRANSFER_OUT_APP, {
        source: 'cashBox',
        ...data,
    })

    goPage(url)
}

export default {
    components: {
        FosunPopup,
    },
    props: {
        value: {
            type: Boolean,
        },
    },
    data() {
        return {
            accountColumns,
        }
    },
    computed: {
        visible: {
            get() {
                return this.value
            },

            set(v) {
                this.$emit('input', v)
            },
        },
    },
    methods: {
        onChangeType(type) {
            this.$emit('choose', {
                type,
                goTransferOutPage,
            })
        },
    },
}
</script>
<style scoped lang="less"></style>
