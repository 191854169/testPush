<template>
    <div class="search-main">
        <van-search class="out-search" v-bind="$attrs" v-on="$listeners">
            <template v-slot:left-icon>
                <multi-img width="16" height="16" name="icon-search" directory="fund"></multi-img>
            </template>
        </van-search>
    </div>
</template>

<script>
import { Search } from 'vant'
export default {
    name: 'search',
    components: {
        [Search.name]: Search,
    },
    methods: {},
}
</script>

<style lang="less" scoped>
.out-search {
    height: 30px;
    background-color: #fff;
}

/deep/ .van-search {
    padding: 0;

    .van-cell {
        padding: 4px 0;
        line-height: 20px;
    }

    .van-cell__value {
        display: flex;
    }

    i.van-icon-search::before {
        content: '';
    }

    .van-field__body {
        width: 100%;
    }

    .van-field__left-icon {
        display: flex;
        align-items: center;
        margin-right: 10px;
        margin-left: 18px;
    }

    .van-search__content {
        padding: 0;
        background: #f8f8f8;
        border-radius: 14px;

        .van-field {
            input {
                color: #2f2f2f;
                font-weight: normal;

                &::placeholder {
                    color: #9c9c9c;
                    font-size: 14px;
                }
            }
        }
    }

    .van-search__action {
        padding: 0 0 0 16px;
        line-height: 28px;
    }

    .van-icon-clear {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 0;
    }
}
</style>
