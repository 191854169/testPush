import { base64_to_bytes, AES_GCM, bytes_to_base64, string_to_bytes, bytes_to_string, hex_to_bytes } from 'asmcrypto.js'
// import { ec as EC } from 'elliptic'
import { compute } from 'js-crypto-hkdf'
import { isString } from './http.tool.js'
// import { KJUR, KEYUTIL } from 'jsrsasign'
// import Hash from 'js-crypto-hash'
// // import { STATE_MSG } from '../api/request'
// //返回状态描述文字字段名称
// export const STATE_MSG = 'msg'

// //服务端加解密公钥
// const { VUE_APP_PUBLIC_KEY } = process.env
// // const SERVER_PUBLIC_KEY = import.meta.env.VITE_SERVER_PUBLIC_KEY

// //服务端签名公钥
// const { VUE_APP_SIGN_KEY } = process.env
// // const SIGN_PUBLIC_KEY = import.meta.env.VITE_SIGN_PUBLIC_KEY

// // Create and initialize EC context, (better do it once and reuse it)
// const ec = new EC('p384')
// const server_key = ec.keyFromPublic(KEYUTIL.getKey(formatAsPem(VUE_APP_PUBLIC_KEY)).pubKeyHex, 'hex')
// const verify_key = ec.keyFromPublic(KEYUTIL.getKey(formatAsPem(VUE_APP_SIGN_KEY)).pubKeyHex, 'hex')

// /**
//  * 获取Base64 pem格式公私钥
//  * @param {String} hex 公私钥的Hex字符串
//  * @returns pem
//  */
//  export const BinToPem = hex=>{
//     let sequence = new KJUR.asn1.DERSequence({
//         array: [
//             new KJUR.asn1.DERObjectIdentifier({ oid: "1.2.840.10045.2.1" }), //ecPublicKey
//             new KJUR.asn1.DERObjectIdentifier({ oid: "1.3.132.0.34" }) //P-384
//         ]
//     })
//     let bit_string = new KJUR.asn1.DERBitString({
//         hex: "0x" + hex
//     })
//     let seq = new KJUR.asn1.DERSequence({
//         array: [
//             sequence,
//             bit_string
//         ]
//     });
//     return bytes_to_base64(hex_to_bytes(seq.getEncodedHex()))
// }

// //获取临时会话密钥及客户端公私钥
// export const GetECDHAndLocalKey = async ({localKey=null, server_ecdh_key=null}={}) => {
//     localKey = localKey || ec.genKeyPair()
//     server_ecdh_key = server_ecdh_key || server_key
//     let shared = localKey.derive(server_ecdh_key.getPublic());
//     let derivedKey = await compute(hex_to_bytes(shared.toString('hex')), 'SHA-256', 32, '', new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]))
//     let ECDHKey = bytes_to_string(derivedKey.key)
//     return {ECDHKey, localKey}
// }

// //临时会话返回数据验证及解密
// export const ECDHVerifyAndDecrypt = async params => {
//     let result = {jsonrpc:"2.0",id:"",error:{code:100003, [STATE_MSG]:'Decrypt error'}}
//     let msgNonce = Array.from(string_to_bytes(params.clientNonce))
//     msgNonce = msgNonce.concat.apply(msgNonce, [Array.from(string_to_bytes(params.serverNonce)), Array.from(string_to_bytes(params.serverPublicKey))])
//     let hashSign = await Hash.compute(new Uint8Array(msgNonce), 'SHA-384')
//     if(verify_key.verify(hashSign, params.signature)){
//         let server_ecdh_key = ec.keyFromPublic(KEYUTIL.getKey(formatAsPem(params.serverPublicKey)).pubKeyHex, 'hex')
//         let {ECDHKey} = await GetECDHAndLocalKey({localKey:params.localKey, server_ecdh_key})
//         result = JSON.parse(Decrypt(params.cdata, ECDHKey))
//     }
//     return result
// }

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

// /**
//  * 接收登陆账号,验证码/密码code,salt和ts，生成加密数据ticket及32位的安全随机数rndKey
//  * @param {String} id  登陆手机号/Uin
//  * @param {String} code  验证码/密码
//  * @param {String} salt  安全加密盐
//  * @param {String} ts  毫秒时间戳 */
// export function GetLoginRndkey(id, code, salt, ts) {
//     salt = string_to_bytes(salt)
//     let s1 = Pbkdf2HmacSha256(string_to_bytes(code), salt, 10000, 32)
//     let s1_password = new Uint8Array(Array.from(string_to_bytes(id)).concat(Array.from(s1)))
//     let key = Pbkdf2HmacSha256(s1_password, salt, 10000, 32)
//     let rndKey = createUUID()
//     let s2 = `${id} ${bytes_to_base64(s1)} ${ts} ${rndKey}`
//     let ticket = Encrypt(s2, key)
//     return { ticket, rndKey }
// }

// /**
//  * 接收登陆账号,重置类型，验证码code,证件号码，新密码生成加密数据ticket
//  * @param {String} type  重置密码类型：1指手机号验证；2指邮箱验证
//  * @param {String} id  登陆手机号/邮箱
//  * @param {String} code  验证码
//  * @param {String} idNumber  证件号码
//  * @param {String} newPassword  新密码
//  * @param {String} rndKey  32位加密密钥 */
// export function GetPasswordResetTicket({ type, id, code, idNumber, newPassword, rndKey }) {
//     let body = `${type} ${id} ${code} ${idNumber} ${newPassword}`
//     return Encrypt(body, rndKey)
// }

// /**
//  * 临时会话密钥加密
//  * @param {Object} data 需要加密的对象
//  * @param {String} ECDHKey  临时会话协商秘钥
//  * @param {String} localKey  客户端公私钥对 */
// export function ECDSAEncrypt(data, ECDHKey, localKey) {
//     let cdata = Encrypt(data, ECDHKey)
//     data = Object.assign({}, data)
//     data.params = {
//         kver:1,
//         cdata,
//         clientPublicKey: BinToPem(localKey.getPublic('hex')),
//         clientNonce: createUUID()
//     }
//     return data
// }

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
