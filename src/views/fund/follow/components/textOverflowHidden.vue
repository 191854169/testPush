<template>
    <div class="text-overflow-hideen">
        <div class="wrapper">
            <input id="exp1" class="exp" type="checkbox" v-model="checked" />
            <div class="text" ref="textRef">
                <label class="btn" for="exp1" v-if="showBtn">{{ checked ? '' : $t('follow.unfold') }}</label>
                <span v-html="text"></span>
                <span v-if="checked" @click="checked = false" class="fold-btn">{{ $t('follow.fold') }}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'text-overflow-hideen',
    props: {
        text: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            checked: false,
            showBtn: false,
        }
    },
    mounted() {
        setTimeout(() => {
            this.showBtn = this.$refs.textRef.scrollHeight - this.$refs.textRef.clientHeight > 3
        }, 600)
    },
}
</script>

<style scoped lang="less">
.text-overflow-hideen {
    .wrapper {
        display: flex;
        overflow: hidden;
        border-radius: 8px;
    }

    .text {
        position: relative;
        max-height: 3em;
        overflow: hidden;
        color: #9c9c9c;
        font-size: 12px;
        line-height: 1.5;
        text-align: justify;
        transition: 0.3s max-height;
    }

    .text::before {
        float: right;
        height: calc(100% - 17px);
        content: '';
    }

    .btn {
        position: relative;
        float: right;
        clear: both;
        margin-left: 20px;
        color: #ff6907;
        font-size: 12px;
        line-height: 16px;
        cursor: pointer;

        /* margin-top: -30px; */
    }

    .btn::before {
        position: absolute;
        left: -5px;
        color: #9c9c9c;
        transform: translateX(-100%);
        content: '...';
    }

    .exp {
        display: none;
    }

    .exp:checked + .text {
        max-height: none;
    }

    .exp:checked + .text .btn::before {
        visibility: hidden; /* 在展开状态下隐藏省略号 */
    }

    .fold-btn {
        margin-left: 2px;
        color: #ff6907;
        font-size: 12px;
        line-height: 16px;
        cursor: pointer;
    }
}
</style>
