import ClientSettingMixin from '@/mixins/ClientSettingMixin.js'
// import { ClientSettingKey } from '@/config/common.js'
import { mapGetters } from 'vuex'

// const notRemindKey = ClientSettingKey.notRemindKey

export default {
    name: '',
    mixins: [ClientSettingMixin],
    components: {},
    props: {},
    data() {
        return {
            notRemind: {},
            showInvestmentProPopup: false,
        }
    },
    computed: {
        ...mapGetters({
            tzymAccountInfo: 'user/getTzymAccountInfo',
        }),
    },
    watch: {},
    created() {},
    mounted() {
        if (this.tzymAccountInfo?.subAcctId) {
            // this.requestClientSetting(notRemindKey, result => {
            //     if (result) {
            //         this.notRemind = result
            //     }
            //     this.showInvestmentProPopup = result?.InvestmentProKey !== 1
            // })
            this.showInvestmentProPopup = true
        }
    },
    destroyed() {},
    filters: {},
    methods: {},
}
