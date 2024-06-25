<template>
    <div class="indicator-declare">
        <section>
            <p class="title">{{ $t('indicatorDeclare.h1') }}</p>
            <p class="desc">{{ $t('indicatorDeclare.text1') }}</p>
        </section>
        <section>
            <p class="title">{{ $t('indicatorDeclare.h2') }}</p>
            <p class="desc">{{ $t('indicatorDeclare.text2') }}</p>
            <multi-img class="chart" :name="chart1" directory="fund/static/indicatorDeclare" />
        </section>
        <section>
            <p class="title">{{ $t('indicatorDeclare.h3') }}</p>
            <p class="desc">{{ $t('indicatorDeclare.text3') }}</p>
            <multi-img class="chart" :name="chart2" directory="fund/static/indicatorDeclare" />
        </section>
        <section>
            <p class="title">{{ $t('indicatorDeclare.h4') }}</p>
            <p class="desc">{{ $t('indicatorDeclare.text4') }}</p>
            <multi-img class="calc" :name="calc1" directory="fund/static/indicatorDeclare" />
        </section>
        <section>
            <p class="title">{{ $t('indicatorDeclare.h5') }}</p>
            <p class="desc">{{ $t('indicatorDeclare.text5') }}</p>
            <multi-img class="calc" :name="calc2" directory="fund/static/indicatorDeclare" />
        </section>
        <section>
            <p class="title">{{ $t('indicatorDeclare.h6') }}</p>
            <p class="desc">{{ $t('indicatorDeclare.text6') }}</p>
            <multi-img class="calc" :name="calc3" directory="fund/static/indicatorDeclare" />
        </section>
    </div>
</template>
<script>
import { getLangType } from '@/utils/tools.js'
const langType = getLangType() // zhCn | zhTc
console.log('langType:', langType)
export default {
    name: 'indicatorDeclare',
    data() {
        return {
            chart1: `chart1-${langType}`,
            chart2: `chart2-${langType}`,
            calc1: `calc1-${langType}`,
            calc2: `calc2-${langType}`,
            calc3: `calc3-${langType}`,
        }
    },
}
</script>
<style scoped lang="less">
.indicator-declare {
    padding: 16px 16px 36px;
    background-color: #fff;

    section {
        padding-top: 24px;
        color: #2f2f2f;
        text-align: justify;

        .title {
            padding-bottom: 8px;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
        }

        .desc {
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
        }

        img {
            margin-top: 16px;
        }

        .chart {
            width: 100%;
            height: 185px;
        }

        .calc {
            width: 100%;
            height: 76px;
        }
    }

    section:first-of-type {
        padding-top: 0;
    }
}
</style>
