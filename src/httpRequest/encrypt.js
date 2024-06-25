import { base64_to_bytes, AES_GCM, bytes_to_base64, string_to_bytes, bytes_to_string, hex_to_bytes } from 'asmcrypto.js'
// import { ec as EC } from 'elliptic'
import { compute } from 'js-crypto-hkdf'
import { isString } from './http.tool.js'
//生成随机数代码
const getArrayRound = (length = 12) => {
    const arr = []
    for (let i = 0; i < length; i++) {
        const randomNum6 = Math.round(Math.random() * 128)
        arr.push(randomNum6)
    }
    return arr
}

//AES-GCM-256 加密函数
export function Encrypt(word, key) {
    word = isString(word) ? word : JSON.stringify(word)
    const text = string_to_bytes(word, true)
    key = isString(key) ? string_to_bytes(key) : key
    const nonce = new Uint8Array(getArrayRound())
    const encText = AES_GCM.encrypt(text, key, nonce)
    return bytes_to_base64(new Uint8Array(Array.from(nonce).concat(Array.from(encText))))
}

//AES-GCM-256 解密函数
export function Decrypt(cipherText, cipherKey) {
    const cipher_int_array = Array.from(base64_to_bytes(cipherText))
    const cipherNonce = new Uint8Array(cipher_int_array.slice(0, 12))
    cipherText = new Uint8Array(cipher_int_array.slice(12))
    cipherKey = string_to_bytes(cipherKey)
    const rst = AES_GCM.decrypt(cipherText, cipherKey, cipherNonce)
    return bytes_to_string(rst, true)
}

export const ENCRYPT_TYPES = {
    NO_ENCRYPT: 0, // 不加密
    EDCH: 1, // 临时加密
    LOGIN: 2, // 登录加密
    APP_TRADE_ENC: 3, // APP内部交易加密 - 前置校验登录密码的时候需要采用这种加密方式
    APP_TRADE_FORCE_ENC: 4, // APP内部交易加密 - 强制校验
}

export const getHKDFEncryptKey = async ticket => {
    const derivedKey = await compute(
        string_to_bytes(ticket),
        'SHA-256',
        32,
        '',
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    )
    return bytes_to_string(derivedKey.key)
}
