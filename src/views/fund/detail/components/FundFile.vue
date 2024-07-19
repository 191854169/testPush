<template>
    <div class="fund-file">
        <div class="title">{{ $t('fundFile') }}</div>
        <div class="tab-content" v-if="list.length > 0">
            <div class="content-head">
                <span>{{ $t('type') }}</span>
                <span>{{ $t('updateDate') }}</span>
            </div>
            <div class="content-item" v-for="(item, index) in list" :key="index" @click="pdfClickHandler(item)">
                <div class="label">
                    <multi-img width="20" height="20" name="icon_pdf" directory="fund"></multi-img>
                    <span>{{ item.fileType }}</span>
                </div>
                <div>{{ item.Date | dateFormat }}</div>
            </div>
        </div>
        <empty v-else class="tab-content"></empty>
    </div>
</template>
<script>
import Empty from '@/components/Empty.vue'
import { getFile } from '@/apis/fund/fund'
import { isTenantApp } from '@/utils/tools.js'
export default {
    name: 'fundFile',
    components: {
        Empty,
    },
    filters: {
        dateFormat(v) {
            if (!v) return '--'
            const date = new Date(v)
            return isNaN(+date) ? '' : date.format('yyyy/MM/dd')
        },
    },
    data() {
        return {
            list: [],
            symbol: this.$route.query.symbol,
        }
    },
    created() {
        this.getFundFile()
    },
    methods: {
        async getFundFile() {
            try {
                const res = await getFile({ symbol: this.symbol })
                if (res.result && res.result.list) {
                    this.list = res.result.list
                }
            } catch (e) {
                console.log('getFile=>e:', e)
            }
        },
        pdfClickHandler(item) {
            if (isTenantApp() && this.$jsBridge) {
                this.$jsBridge.openPDF({ url: item.fileUrl, title: item.fileType })
            } else {
                window.open(item.fileUrl)
            }
        },
    },
}
</script>
<style scoped lang="less">
.fund-file {
    margin: 12px;
    padding: 8px 12px 12px;
    background: #fff;
    border-radius: 8px;

    .title {
        padding: 7px 0 15px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
    }
}

.tab-content {
    max-height: 332px;
    margin-top: 12px;
    overflow: hidden scroll;

    .content-head {
        position: sticky;
        top: 0;
        display: flex;
        justify-content: space-between;
        height: 24px;
        color: #9c9c9c;
        font-weight: 400;
        font-size: 12px;
        line-height: 24px;
        background-color: #fff;
    }

    .content-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 40px;
        color: #2f2f2f;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;

        .label {
            display: flex;
            align-items: center;
            max-width: 206px;

            img {
                margin-right: 8px;
            }
        }
    }
}
</style>
