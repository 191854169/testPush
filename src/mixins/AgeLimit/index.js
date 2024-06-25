import store from '@/store/fund.js'
import dayjs from 'dayjs'
import { Dialog } from 'vant'
import './index.less'
import { getLangType } from '@/utils/tools.js'

const $t = (key, lang = getLangType()) => {
    const langs = {
        zhcn: {
            limitTip: '65岁及以上用户暂不支持线上交易。如有疑问，请 ',
            concatUs: '联系客服',
            iknow: '已了解',
        },
        zhtc: {
            limitTip: '65歲及以上用戶暫不支持線上交易。如有疑問，請 ',
            concatUs: '聯繫客服',
            iknow: '已了解',
        },
        // 目前英文默认为繁体
        enus: {
            limitTip: '65歲及以上用戶暫不支持線上交易。如有疑問，請 ',
            concatUs: '聯繫客服',
            iknow: '已了解',
        },
    }[(lang || '').toLowerCase()]
    return langs[key] || key
}

// return Promise<> True(大于等于65) | false(小于65)
export default () => {
    return store
        .dispatch('user/getUserInfo', false)
        .then((data = {}) => {
            const acct = data?.clientInfo?.accts?.[0] || {} //登录账号信息
            let { birthday } = acct
            const isTesting = false
            if (isTesting) {
                birthday = '1957-06-13'
            }
            const isLimited = birthday ? isOlderAge65(birthday) : false
            if (isLimited) {
                // 增加展示
                showTip()
                return true
            }
            false
        })
        .catch(e => {
            console.error(e)
            Promise.reject(e)
            // 获取用户信息出错|代码出错 验证返回false
            return false
        })
}

export function showTip() {
    const message = `<span>${$t('limitTip')}<span onclick="location.href='${`${location.origin}/wealth/fund.html#/services`}'">${$t(
        'concatUs'
    )}</span>。</span>`
    Dialog.confirm({
        value: true,
        message,
        overlayStyle: { backgroundColor: 'rgba(0, 0, 0, 0.3)', zIndex: 10000 },
        showCancelButton: false,
        confirmButtonText: $t('iknow'),
        confirmButtonColor: '#ff6907',
        className: 'age-limit',
    })
}

export const AGE_LIMIT_CODE = 255001 // 65年龄限制错误码

function isOlderAge65(date) {
    const getDate = dayjs(date)
    const currentDate = dayjs()

    const year = currentDate.$y - getDate.$y
    const month = currentDate.$M + 1 - (getDate.$M + 1)
    const Day = currentDate.$D - getDate.$D

    let oldAge65 = false // 大于65
    if (year > 65) {
        oldAge65 = true
    } else if (year == 65) {
        if (month > 0) {
            oldAge65 = true
        } else if (month == 0) {
            if (Day > 0) {
                oldAge65 = true
            }
        }
    }
    return oldAge65
}
