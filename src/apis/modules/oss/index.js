import { get, post } from '@/httpRequest/http'
import { isTenantApp } from '@/utils'

const { VUE_APP_OSS = '', VUE_APP_ENV = 'sit', NODE_ENV } = process.env
const BASEURL = VUE_APP_ENV === 'local' ? '' : VUE_APP_OSS

export const fileUpload = (category, { file, md5, filename } = {}) => {
    const data = new FormData()
    data.append(file)

    if (md5) {
        data.append(md5)
    }
    if (filename) {
        data.append(filename)
    }

    return post(`${BASEURL}/oss/v1/Upload/${category}`, {
        data,
    })
}

let domain = ''
if (isTenantApp() || NODE_ENV === 'production') domain = `${BASEURL}`
export const fileDownload = ossId => {
    return get(`${domain}/oss/v1/Download?ossid=${ossId}`, {
        encrypt: 0,
    })
}

export const ossDownloadURL = function (ossId) {
    return `${BASEURL}/oss/v1/Download/?preview=1&ossid=${ossId}`
}
