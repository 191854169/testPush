<template>
    <div>
        <fosun-tags class="bill-tags" :class="{ 'empty-tags': tags.length === 0 }" :tags="tags"></fosun-tags>
    </div>
</template>

<script>
import FosunTags from '@/components/FosunTags.vue'

export default {
    name: 'bill-tags',
    components: {
        FosunTags,
    },
    props: {
        data: {
            required: true,
            type: Object,
            default: () => ({}),
        },
        label: {
            type: String,
        },
    },
    data() {
        return {}
    },
    computed: {
        tags() {
            // let tagsArr = [
            //     this.data?.currency,
            //     (this.data?.riskOverall || this.data?.riskOverall === 0) && this.$t(`bills.riskLevel.${this.data?.riskOverall ?? 0}`),
            // ]

            // if (this.data?.isComplex) {
            //     tagsArr.push(this.$t('bills.complexProduct'))
            // }
            let tagsArr = []
            if (this.label) {
                const list = this.label.split('；')
                tagsArr = tagsArr.concat(list)
            }

            return tagsArr.filter(item => !!item)
        },
    },
}
</script>

<style scoped lang="less">
.bill-tags {
    display: flex;
    align-items: center;
    margin-top: 10px;
    font-weight: normal;
    font-size: 10px;

    .tag-item {
        padding: 0 4px;
        color: #278aff;
        line-height: 14px;
        background: #e6f2ff;
        border-radius: 2px;

        & + .tag-item {
            margin-left: 8px;
        }
    }
}

.empty-tags {
    margin-top: 0;
}
</style>
