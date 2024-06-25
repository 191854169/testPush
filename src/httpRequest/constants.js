// wiki链接：https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001003613
// IOS请求头值需要是String，不然无法解析
export const X_SOURCES_MAP = {
    HLAPP: '100', // 星财富APP
    HLAPP_WEB: '102', // 星财富H5 web
    HLAPP_MOBILE: '103', // 星财富H5 移动端
    THS_OEM_APP: '110', // 同花顺 APP 同花顺 OEM 版本
    THS_PC: '111', // 同花顺 PC
    WANG_TING: '112', // 网厅
    THS_APP: '113', // 同花顺公版
    THS_I18N_APP: '116', // 同花顺国际版
    PAY_WEB: '122', // 派安盈 Web
    MYLINK_APP: '130', // 中移动香港 APP MyLink
}

export const APP_ERROR_CODE_MAP = {
    SUCCESS: 0, //,成功

    ERROR: -1, //通用错误
    EXCEPTION: -2, //异常错误
    NO_JS_EVENT: -3, //没有找到要调用的Api
    NO_NETWORK: -4, //没有网络

    NO_LOGIN: 1001, //用户没有登录
    NO_OPEN_ACCOUNT: 1002, //用户没有开通交易账户
    USER_CANCELED: 1003, //被用户取消
    NO_PERMISSION: 1004, //没有权限， 具体没有是缺少什么权限， 见desc字段
    OSS_UPLOAD_FILE_FAILED: 1005, //OSS上传文件失败
    DEVICE_NOT_SUPPORT: 1006, //设备不支持
    FILE_FORMAT_ERROR: 1007, //文件格式错误
    FILE_TOO_LARGE: 1008, //文件太大
    GET_LOCATION_FAILED: 1009, //获取定位失败

    NO_TRADE_LOGIN: 1010, //交易没有登录
    NO_TRADE_VERIFY_LOGIN: 1011, //交易校验没有登录

    STOCK_INVALID: 2003, //股票代码非法
    FAV_STOCK_NOT: 2004, //不是一个自选股
    FAV_STOCK_REPEAT: 2005, //添加自选失败，自选股列表已存在该股票
    FAV_STOCK_REACHED_MAXIMUM: 2006, //添加自选失败，自选股已达到最大数量

    HTTP_METHOD_NOT_SUPPORT: 3001, //Http方法不支持
    HTTP_REQUEST_PARAMS_INVALID: 3002, //Http请求参数错误
    UPLOAD_FILE_NAME_EMPTY: 3003, //上传文件名缺失
    UPLOAD_FILE_DATA_EMPTY: 3004, //上传文件数据缺失
    HTTP_REQUEST_TIMEOUT: 3005, //http请求超时
    HTTP_ENCRYPT_ERROR: 3006, //加解密错误

    GOTO_PATH_NOT_FOUND: 4001, //goto url没找到
}

export const ERROR_CODE_MAP = {
    ERROR_UIN: 100033, // ErrUin             100033
    ERROR_SESSION: 100008, // ErrSession         100008
    ERROR_SESSION_EXPIRE: 100031, // ErrSessionExpire   100031
    ERR_SESSION_REJECTED: 100034, // ErrSessionRejected 100034
    IASIA_UNVALID_SESSION: 201004, // 柜台登录session无效 201004
    ERROR_TRADE_SESSION_EXPIRE: 100032, // 交易密码过期
    MR: 100029, // mr测试会统一返回的错误码
}

export const ENCRYPT_TYPES = {
    NO_ENCRYPT: 0, // 不加密
    EDCH: 1, // 临时加密
    LOGIN: 2, // 登录加密
    APP_TRADE_ENC: 3, // APP内部交易加密 - 前置校验登录密码的时候需要采用这种加密方式
    APP_TRADE_FORCE_ENC: 4, // APP内部交易加密 - 强制校验
}

// 错误代码
export const ERROR_COCES = {
    SYSTEM_MAINTENANCE: 100029, // 系统维护错误码
    MYLINK_REJECT: 100034, //互踢
    MYLINK_TOKEN_EXPIRED: 100033, // token过期
}
