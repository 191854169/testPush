import { queryClientSetting, setClientSetting } from '@/apis/uc.js'
import { isFunction, isTenantApp } from '@/utils'

export default {
    name: '',
    mixins: [],
    components: {},
    props: {},
    data() {
        return {}
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {},
    destroyed() {},
    filters: {},
    methods: {
        async requestClientSetting(k, callback) {
            const execute = value => {
                if (callback && isFunction(callback)) {
                    callback(value)
                }
            }
            //YLTODO: 站外先不请求接口, 等产品确认站外是否需要提示, 如果需要提示使用 localstorage
            if (!isTenantApp()) {
                execute(undefined)
                return
            }
            try {
                const { result } = await queryClientSetting({ k })
                if (result[k]) {
                    console.log(`requestClientSetting ${k}`, result[k])
                    execute(JSON.parse(result[k]))
                } else {
                    execute(undefined)
                }
            } catch (err) {
                console.error(`err queryClientSetting ${k}`, err)
                execute(undefined)
            }
        },
        setClientSetting(k, value) {
            const v = JSON.stringify(value)
            setClientSetting({ k, v })
                .then(res => {
                    console.log(`setClientSetting ${k} success`, res, value)
                })
                .catch(err => {
                    console.error(`setClientSetting ${k}  error`, err, value)
                })
        },
    },
}
