import { get, post, path_version } from '@/httpRequest/http'
import { loginEncrypt } from '@/utils/crypto'
import { isHLApp } from '@/utils'
// console.log(process)
// const { VUE_APP_UC = '', VUE_APP_ENV = 'sit' } = process.env
// const BASEURL = VUE_APP_ENV === 'local' ? VUE_APP_UC : VUE_APP_UC
const { VUE_APP_UC, NODE_ENV } = process.env

let domain = ''
if (isHLApp() || NODE_ENV === 'production') domain = `${VUE_APP_UC}`

// https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001000142@toc23
export const getUserDetail = () => {
    return get(`${domain}/uc/${path_version}/UserDetail`)
}

export const CodeSend = data => {
    return post(`${VUE_APP_UC}/uc/v1/CodeSend`, {
        data,
        encrypt: 0,
    })
}

export const CodeVerify = data => {
    const { value, code, salt } = data
    const { A1 } = loginEncrypt(value, code, salt)

    return post(`${VUE_APP_UC}/uc/v1/CodeVerify`, {
        data: {
            salt,
            ticket: A1,
        },
        encrypt: 0,
    })
}

export const CodeLogin = data => {
    const { value, code, salt } = data
    const { A1, rndkey } = loginEncrypt(value, code, salt)

    return new Promise((resolve, reject) => {
        post(`${VUE_APP_UC}/uc/v1/LoginCode`, {
            data: {
                salt,
                id: value,
                ticket: A1,
            },
            encrypt: 0,
        })
            .then(res => {
                resolve(
                    Object.assign(
                        {
                            rndkey,
                        },
                        res
                    )
                )
            })
            .catch(err => {
                reject(err)
            })
    })
}
