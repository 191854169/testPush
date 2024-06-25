<template>
    <div class="invest-detail">
        <header>{{ $t('investExpressionDetail') }}</header>
        <ul class="table">
            <li>
                <span>{{ $t('dimension') }}</span>
                <span>{{ $t('me') }}</span>
                <span>{{ $t('platformInvestor') }}</span>
            </li>
            <li v-for="item in result" :key="item.key">
                <span>{{ keyMap[item.key] }}</span>
                <template v-if="riseFallKeys.includes(item.key)">
                    <span v-riseFall="item.user"></span>
                    <span v-riseFall="item.platform"></span>
                </template>
                <template v-else>
                    <span>{{ item.user | valueFilter }}</span>
                    <span>{{ item.platform | valueFilter }}</span>
                </template>
            </li>
        </ul>
    </div>
</template>
<script>
import { floatToRatio } from '@/utils'
import { CLIENT_RADAR_MAP } from '@/views/fund/config/common'
const clientRadarKeyValueMap = CLIENT_RADAR_MAP.keyValueMap
const clientRadarKeysMap = CLIENT_RADAR_MAP.keysMap
export default {
    name: 'investDetail',
    props: {
        userData: {
            type: Object,
            default: () => ({}),
        },
        platformData: {
            type: Object,
            default: () => ({}),
        },
    },
    filters: {
        valueFilter(v) {
            return v && v !== 0 ? floatToRatio(v, { sign: false }) : '--'
        },
    },
    data() {
        return {
            riseFallKeys: [clientRadarKeysMap.yield, clientRadarKeysMap.upCapture, clientRadarKeysMap.downCapture],
            keyMap: clientRadarKeyValueMap,
        }
    },
    computed: {
        result() {
            return Object.keys(clientRadarKeyValueMap).map(key => {
                return { key, user: this.userData[key]?.value, platform: this.platformData[key]?.value }
            })
        },
    },
}
</script>
<style scoped lang="less">
.invest-detail {
    padding: 10px 12px 8px;

    header {
        padding: 7px 0;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
    }

    .table {
        li:first-of-type {
            padding: 4px 0;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }

        li {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;

            span:nth-of-type(1) {
                flex: 0 0 auto;
                width: 100px;
                color: #666;
                text-align: left;
            }

            span:nth-of-type(2) {
                flex: 1;
                text-align: right;
            }

            span:nth-of-type(3) {
                flex: 0 0 auto;
                width: 101px;
                text-align: right;
            }
        }
    }
}
</style>
