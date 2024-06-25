<template>
    <div class="flex-c flex-shrink0">
        <multi-img class="icon" name="icon_master_daycount" directory="fund"></multi-img>
        <div class="f12 c-9c mar-14" :style="{ 'margin-right': marginStyle }">{{ remainingDay || '--' }}{{ $t('day') }}</div>
        <multi-img class="icon" name="icon_master_follower" directory="fund"></multi-img>
        <div class="f12 c-9c mar-14">{{ follower | followerNumFilter }}</div>
    </div>
</template>

<script>
import { followerNumFilter } from '../utils/filters'
export default {
    name: 'remainingDayFollower',
    components: {},
    props: {
        remainingDay: {
            type: [String, Number],
            default: '',
        },
        follower: {
            type: Number,
            default: 0,
        },
        marginStyle: {
            type: String,
            default: '8px',
        },
    },
    data() {
        return {}
    },
    filters: { followerNumFilter },
    created() {},
    methods: {},
}
</script>

<style lang="less" scoped>
.icon {
    width: 12px;
    height: 12px;
}

.c-9c {
    color: #9c9c9c;
}
</style>
