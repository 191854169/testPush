import SJCL from './sjcl'
import { getRndStr } from './utils'

const IV = getRndStr(12)

/**
 * aes-gcm 加密
 * @param dataStr 待加密数据，utf8字符串
 * @param key 秘钥, 32位utf8字符串
 * @param sourceEncode 编码
 * @returns 加密后数据，bits
 */
// eslint-disable-next-line max-params
export const aesgcmEncrypt = function (dataStr, key, dataEncode = 'utf8String', keyEncode = 'utf8String', ad = '', tag = '') {
    let keyBit
    if (keyEncode === 'bits') {
        keyBit = key
    } else {
        keyBit = SJCL.codec[keyEncode].toBits(key)
    }
    const aes = new SJCL.cipher.aes(keyBit)
    const dataBit = SJCL.codec[dataEncode].toBits(dataStr)
    // const iv = getRndStr(12) // 计数器CTR的初始值，12位utf8字符串
    const iv = IV // 计数器CTR的初始值，12位utf8字符串
    console.log('iv', iv)
    const ivBit = SJCL.codec.utf8String.toBits(iv)
    const adBit = SJCL.codec.utf8String.toBits(ad)
    const tlen = tag.length * 4
    const cipherBit = SJCL.mode.gcm.encrypt(aes, dataBit, ivBit, adBit, tlen)
    const cipherByte = SJCL.codec.bytes.fromBits(cipherBit)
    const ivByte = stringToBytes(iv)
    // const tagByte = stringToBytes(tag)
    const totalArr = Array.from(ivByte).concat(Array.from(cipherByte))
    // .concat(Array.from(tagByte))
    const totalBit = SJCL.codec.bytes.toBits(totalArr)
    const totalBase64 = SJCL.codec.base64.fromBits(totalBit)
    return totalBase64
}

export const loginEncrypt = function (phone, code, salt) {
    console.log('loginEncrypt in=============')
    console.log('phone', phone)
    console.log('code', code)
    console.log('salt', salt)
    const count = 10000 // 迭代次数
    const length = 32 * 8 // 输出长度为32个字节
    const S1 = SJCL.misc.pbkdf2(code, salt, count, length)
    console.log('S1 base64', SJCL.codec.base64.fromBits(S1))
    // const phoneArr: Array<any> = Array.from(stringToBytes(phone))
    // const S1Arr: Array<any> = Array.from(SJCL.codec.bytes.fromBits(S1))
    // const phoneS1 = new Uint8Array(phoneArr.concat(S1Arr))
    console.log('S1 hex', SJCL.codec.hex.fromBits(S1))
    const phoneHex = SJCL.codec.hex.fromBits(SJCL.codec.utf8String.toBits(phone))
    console.log('phone hex', phoneHex)
    const phoneS1 = `${phoneHex}${SJCL.codec.hex.fromBits(S1)}`
    const S1PhoneBits = SJCL.codec.hex.toBits(phoneS1)

    const S2 = SJCL.misc.pbkdf2(S1PhoneBits, salt, count, length)
    console.log('S2 base64', SJCL.codec.base64.fromBits(S2))

    const ts = new Date().getTime().toString()
    // const ts = TS
    const rndkey = getRndStr(32)
    // const rndkey = Rndkey
    const data = `${phone} ${SJCL.codec.base64.fromBits(S1)} ${ts} ${rndkey}`
    console.log('data', data)
    const A1 = aesgcmEncrypt(data, S2, 'utf8String', 'bits')
    console.log('A1', A1)
    return {
        A1,
        rndkey,
    }
}

/**
 * 字符串转字节
 * @param str 字符串
 * @param utf8 是否utf8字符串
 * @returns bytes of Array
 */
export const stringToBytes = function (str, utf8 = false) {
    const len = str.length
    const bytes = new Uint8Array(utf8 ? 4 * len : len)
    let j = 0
    for (let i = 0; i < len; i++) {
        let c = str.charCodeAt(i)
        if (utf8 && c >= 0xd800 && c <= 0xdbff) {
            if (++i >= len) throw new Error(`Malformed string, low surrogate expected at position ${i}`)
            c = ((c ^ 0xd800) << 10) | 0x10000 | (str.charCodeAt(i) ^ 0xdc00)
        } else if (!utf8 && c >>> 8) {
            throw new Error('Wide characters are not allowed.')
        }
        if (!utf8 || c <= 0x7f) {
            bytes[j++] = c
        } else if (c <= 0x7ff) {
            bytes[j++] = 0xc0 | (c >> 6)
            bytes[j++] = 0x80 | (c & 0x3f)
        } else if (c <= 0xffff) {
            bytes[j++] = 0xe0 | (c >> 12)
            bytes[j++] = 0x80 | ((c >> 6) & 0x3f)
            bytes[j++] = 0x80 | (c & 0x3f)
        } else {
            bytes[j++] = 0xf0 | (c >> 18)
            bytes[j++] = 0x80 | ((c >> 12) & 0x3f)
            bytes[j++] = 0x80 | ((c >> 6) & 0x3f)
            bytes[j++] = 0x80 | (c & 0x3f)
        }
    }
    return bytes.subarray(0, j)
}
