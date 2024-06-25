<template>
    <div class="back-next-btn flex">
        <p class="back">
            <van-button type="default" round block @click="clickBack">上一步</van-button>
        </p>
        <p class="next">
            <van-button type="primary" :disabled="disabled" round block color="#FF6907" @click="clickNext">{{ corrNextBtnText }}</van-button>
        </p>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
    props: {
        disabled: {
            type: Boolean,
            default() {
                return false
            },
        },
        nextBtnText: {
            type: String,
            default: '下一步',
        },
        goNext: {
            type: Function,
            default: next => {
                /**
                    * 1、回调方法进行下一步，进入默认的下一步
                    * next()
                    * 
                    * 
                    * 2、强制传入 router.push() 的信息
                    * next = this.$router.push 
                    * 只是会有默认传入参数
                    * //强制传入参数方法如下
                    next({
                       path: '/IDcard',
                       name: 'IDCARD',
                       query: ...
                   })
                */
                next()
            },
        },
        goBack: {
            type: Function,
            default: next => {
                next()
            },
        },
    },
    data() {
        return {
            corrNextBtnText: '',
        }
    },
    computed: {
        ...mapState('account', ['applySteps']),
    },
    mounted() {
        this.handleNextBtnText(this.$route)
    },
    methods: {
        ...mapActions('account', ['getIndex', 'goPrevPage', 'goNextPage']),
        async handleNextBtnText(route) {
            const isLast = (await this.getIndex(route)) === this.applySteps.length - 1
            console.log('🚀 ~ handleNextBtnText ~ isLast', isLast)

            this.corrNextBtnText = isLast ? '提交' : this.nextBtnText
        },
        // 点击上一步
        clickBack() {
            this.goBack(async option => await this.goPrevPage({ route: this.$route, option }))
        },

        // 点击下一步
        clickNext() {
            this.goNext(async option => await this.goNextPage({ route: this.$route, option }))
        },
    },
}
</script>
<style lang="less" scoped>
.back-next-btn {
    justify-content: space-between;
}

.back {
    width: calc(35% - 6px);
}

.next {
    width: calc(65% - 6px);
}
</style>
