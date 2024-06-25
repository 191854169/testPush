<template>
    <svg :class="svgClass" aria-hidden="true">
        <use :xlink:href="iconName"></use>
    </svg>
</template>
<script>
export default {
    name: 'svg-icon',
    props: {
        iconClass: {
            type: String,
            required: true,
        },
        className: {
            type: String,
        },
        directory: {
            type: String,
            default: 'fund/svgIcon/',
        },
    },
    computed: {
        iconName() {
            return `#icon-${this.iconClass}`
        },
        svgClass() {
            if (this.className) {
                return 'svg-icon ' + this.className
            }
            return 'svg-icon'
        },
    },
    mounted() {
        let path = this.directory + '/' + this.iconClass + '.svg'
        path = path.replace(/^\/|^\/\//, '').replace(/\/\//g, '/')
        require('@/assets/images/' + path)
    },
}
</script>

<style scoped>
.svg-icon {
    width: 1em;
    height: 1em;
    overflow: hidden;
    vertical-align: -0.15em;
    fill: currentcolor;
}
</style>
