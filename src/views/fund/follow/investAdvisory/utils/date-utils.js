import dayjs from 'dayjs'
import { floatToRatio, milliFormat } from '@/utils'

const yearDateFormat = date => dayjs(date).format('YYYY')

export const getFirstDayOfWeek = function (date) {
    const temp = new Date(date.getTime())
    temp.setDate(1)
    return temp.getDay()
}

export const getPrevMonthLastDays = (date, offset) => {
    if (offset <= 0) return []
    const temp = new Date(date.getTime())
    temp.setDate(0)
    const lastDay = temp.getDate()
    return range(offset).map((_, index) => lastDay - (offset - index - 1))
}

export const getPreMonthDate = date => {
    const preDate = new Date(date.getTime())
    preDate.setDate(0)
    return preDate
}

export const getMonthDays = date => {
    const temp = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    const days = temp.getDate()
    return range(days).map((_, index) => index + 1)
}

export const range = function (n) {
    return Array.apply(null, { length: n }).map((_, n) => n)
}

export const totalYears = function (maxDate = new Date(), startDate = new Date('2022/01/01')) {
    const maxYear = maxDate.getFullYear()
    const startYear = startDate.getFullYear()
    const years = []
    for (let year = startYear; year <= maxYear; year++) {
        years.push({
            year: year,
            key: '' + year,
        })
    }
    return years
}

export const totalMonths = function (maxDate = new Date(), startDate = new Date('2022/01/01')) {
    const maxYear = maxDate.getFullYear()
    const currentMonth = maxDate.getMonth()
    const startYear = startDate.getFullYear()
    const months = []
    for (let year = startYear; year <= maxYear; year++) {
        if (year === maxYear) {
            for (let month = 1; month <= currentMonth + 1; month++) {
                months.push({
                    year: year,
                    month: month,
                    key: year + '-' + (month < 10 ? '0' + month : month),
                })
            }
        } else {
            for (let month = 1; month <= 12; month++) {
                months.push({
                    year: year,
                    month: month,
                    key: year + '-' + (month < 10 ? '0' + month : month),
                })
            }
        }
    }
    return months
}

export const dayProfit = function (profit, isHide = false) {
    if (isHide) {
        return '****'
    }
    if (profit && Number(profit) === 0) {
        return '+0.00'
    }
    return profit ? milliFormat(floatToRatio(profit, { rate: false })) : ''
}
