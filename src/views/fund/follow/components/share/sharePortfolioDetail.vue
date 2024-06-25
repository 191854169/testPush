<!-- 组合详情分享 UI -->
<template>
    <div class="container">
        <logo-ad class="logo"></logo-ad>
        <!-- 组合基本信息 -->
        <section class="pad-rl4 border-bottom-1px">
            <basic-info :obj="data" :needHeader="false" />
        </section>
        <!-- 资产分布 -->
        <section>
            <div class="pad-rl16 pad-t24">
                <share-portfolio-distribution class="distribution" ref="positionRef" />
            </div>
        </section>
        <section>
            <div class="flex-c pad-rl16 pad-t16 pad-b16">
                <headerPortrait v-if="createrIsPI" class="master_header" :ossId="data?.creator?.avatarOSSID" :needDownloadImg="true" />
                <div class="name-label">
                    <div class="nick_name line-elipsis">
                        {{ data.creator?.nickName || '--' }}
                    </div>
                    <div v-if="labels.length > 0" class="lable_container">
                        <span v-for="(label, index) in labels" :key="`${index}_${label}}`" class="creator_label mar-r8">
                            {{ label }}
                        </span>
                    </div>
                    <div v-else class="share-desc mar-t4">
                        {{ $t('follow.shareFollowDetailDesc') }}
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import basicInfo from '../basicInfo.vue'
import headerPortrait from '../headerPortrait.vue'
import sharePortfolioDistribution from './sharePortfolioDistribution.vue'
import { CUSTOMER_TYPE } from '../../../config/common'

export default {
    name: 'share-portfolio-detail',
    props: {
        data: {
            type: Object,
            default: () => {},
        },
    },
    components: {
        basicInfo,
        sharePortfolioDistribution,
        headerPortrait,
    },
    computed: {
        // 当前组合创建者是持牌用户
        createrIsPI() {
            return this.data?.creator?.type === CUSTOMER_TYPE.professional
        },
        labels() {
            return this.data.creator?.label || []
        },
    },
}
</script>

<style scoped lang="less">
.container {
    background: #fff;
}

::v-deep .logo {
    header {
        padding-bottom: 14px;
    }
}

.pad-rl4 {
    padding-right: 4px;
    padding-left: 4px;
}

.master_header {
    width: 40px;
    height: 40px;
    margin-right: 12px;
    border-radius: 50%;
}

.name-label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
}

.nick_name {
    flex-shrink: 3;
    max-width: 140px;
    margin-right: 8px;
    color: #2f2f2f;
    font-weight: bold;
    font-size: 16px;
    line-height: 22px;
}

.lable_container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-right: 12px;
}

.creator_label {
    display: flex;
    flex-shrink: 0;
    align-items: center; /* 垂直方向居中对齐 */
    justify-content: center; /* 水平方向居中对齐 */
    margin-top: 4px;
    padding: 0 4px;
    color: #ae7218;
    font-size: 11px;
    line-height: 16px;
    border: 1px solid #dbcdb9;
    border-radius: 3px;
}

.share-desc {
    color: #9c9c9c;
    font-size: 14px;
    line-height: 20px;
}
</style>
