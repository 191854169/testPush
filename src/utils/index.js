export * from './utils.js'
export * from './tools.js'
export * from './calc.js'
// export * from './photoCompress.js'
// export * from './rotateBase64Img.js'

/**
 * 是否租户App
 * @returns
 */
export const isTenantApp = () => !!navigator.userAgent.toLowerCase().match(/lupu-hk/i)
