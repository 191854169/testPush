<template>
    <div class="advisor-container" v-if="isShowAdvisorContainer">
        <div class="advisor" @click="goAdvisor">
            <multi-img name="icon_service2" directory="common"></multi-img>
            {{ $t('dedicatedAdvisors') }}
        </div>
    </div>
</template>

<script>
import { isHLApp, isTHSApp, isTHSI18NApp } from '@/utils'
import pathnames from '@/config/H5Pathname'

export default {
    name: 'footer-dedicated-advisors',
    mixins: [],
    components: {},
    props: {},
    data() {
        return {}
    },
    computed: {
        isShowAdvisorContainer() {
            return !isTHSApp() && !isTHSI18NApp()
        },
    },
    watch: {},
    created() {},
    mounted() {},
    destroyed() {},
    filters: {},
    methods: {
        isHLApp,
        goAdvisor() {
            const { VUE_APP_WEALTH_COUNSELOR_PAGE: url } = pathnames
            if (!this.$root.isLogin) {
                return this.$root.login()
            }
            this.$goPage(url)
        },
    },
}
</script>

<style scoped lang="less">
.advisor-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 24px 0;

    .advisor {
        display: flex;
        align-items: center;
        height: 32px;
        padding-right: 20px;
        background-color: #fff;
        border-radius: 16px;

        img {
            width: 12px;
            height: 12px;
            margin-right: 4px;
            margin-left: 20px;
        }
    }
}
</style>
