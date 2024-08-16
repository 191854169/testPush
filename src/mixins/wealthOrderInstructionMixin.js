import { PRODUCT_TYPE_MAP } from '@/views/fund//config/common'
import { instructionCreate, instructionStatus } from '@/apis/wealth/index.js'
import { Dialog } from 'vant'
import { FREEZE_ERROR_CODE } from '@/config/common'

class NoInstructionIdError extends Error {}

const REPEAT_ORDER_CODE = 2560001 // 指令已被使用
const EXPIRED_CODE = 2560002 // 指令已过期

export default {
    data() {
        return {
            instructionProducType: '',
            instructionId: '',
            hasRetryInit: false,
        }
    },

    methods: {
        async initInstuction(productType) {
            this.instructionProducType = productType
            try {
                const { result } = await instructionCreate({
                    productType: PRODUCT_TYPE_MAP.keysMap[productType],
                })
                this.instructionId = result?.instructionId
            } catch (err) {
                this.instructionId = ''
            }
        },

        getInstructionId() {
            if (!this.instructionId) {
                throw new NoInstructionIdError()
            }
            return this.instructionId
        },

        /**
         * 处理下单异常
         * @param {*} config 配置
         * @param {*} config.error  异常
         * @param {*} config.orderFunction 下单函数
         * @param {*} config.callback 普通错误回调
         * @param {*} config.timeoutCallback 超时下单成功回调
         * @param {*} config.direction 买卖方向 subscribe买入 redeem卖出
         * @param {*} config.showOrderDetail 重复下单是否展示订单详情文字链（现金宝不展示）
         */
        async handleOrderError(config) {
            const { error, orderFunction, callback, timeoutCallback, direction, showOrderDetail = true } = config

            // 账户冻结
            if (FREEZE_ERROR_CODE.includes(error?.error?.code)) {
                return
            }

            // 没有指令Id, 重试后在执行一次下单
            if (error instanceof NoInstructionIdError && !this.hasRetryInit) {
                this.hasRetryInit = true
                await this.initInstuction(this.instructionProducType)
                await orderFunction()
                return
            }

            // APP下单超时 || 网厅下单超时
            if (error.code === 3005 || error.code === 'ECONNABORTED') {
                try {
                    const { result } = await instructionStatus({
                        instructionIds: [this.instructionId],
                    })
                    const orderList = result.list

                    // 下单超时后流程正常创建订单，前端根据instructionId查询订单状态可以拿到订单编码信息
                    if (orderList.length && orderList[0].orderId) {
                        timeoutCallback(orderList)
                    } else {
                        callback()
                    }
                } catch (e) {
                    callback()
                }
            } else if (REPEAT_ORDER_CODE === error?.error?.code) {
                // 调用参数错误不弹窗
                if (!['subscribe', 'redeem'].includes(direction)) {
                    callback()
                    return
                }

                //  查看订单详情事件监听
                const onGoOrderDetail = e => {
                    const { clickType, orderId, orderNumber } = e.target.dataset || {}
                    if (clickType === 'goOrderDetail') {
                        const inFundPage = location.href.startsWith(`${window.location.origin}/wealth/fund.html`)
                        Dialog.close()
                        if (inFundPage) {
                            this.$router.replace({
                                path: '/order-detail',
                                query: {
                                    orderId,
                                    orderNumber,
                                },
                            })
                        } else {
                            const url = `${window.location.origin}/wealth/fund.html#/order-detail?orderNumber=${orderNumber}&orderId=${orderId}`
                            window.location.replace(url)
                        }
                    }
                }

                if (showOrderDetail) {
                    document.addEventListener('click', onGoOrderDetail)
                    this.$once('hook:beforeDestory', () => {
                        document.removeEventListener('click', onGoOrderDetail)
                    })
                }

                const { orderId, orderNumber } = error?.error?.data || {}

                let message = `${this.$t('repeatOrderConfirm', {
                    direction: direction === 'subscribe' ? this.$t('buy') : this.$t('sell'),
                })}`

                if (showOrderDetail) {
                    message += `<span style="color: #043799" data-click-type='goOrderDetail' data-order-id="${orderId}" data-order-number="${orderNumber}">${this.$t(
                        'seeOrderDetail'
                    )}</span>`
                }

                Dialog.confirm({
                    title: this.$t('prompt'),
                    message,
                    beforeClose: async (action, done) => {
                        document.removeEventListener('click', onGoOrderDetail)
                        if (action === 'confirm') {
                            try {
                                done()
                                this.$loading.show = true
                                await this.initInstuction(this.instructionProducType)
                                this.$loading.show = false
                                await orderFunction()
                            } catch {
                                this.$loading.show = false
                            }
                        } else {
                            done()
                        }
                    },
                })
            } else if (EXPIRED_CODE === error?.error?.code) {
                // 指令已过期 重新请求并下单
                await this.initInstuction(this.instructionProducType)
                await orderFunction()
            } else {
                callback(error)
            }
        },
    },
}
