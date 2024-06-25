# http 请求说明文档

axios 参考文档： http://www.axios-js.com/zh-cn/docs/

## 1、使用方法：
```javascript
// 全部引入
import http from '@/httpRequest/http.js'

// 按需引入
import { get, post, request, path_version } from '@/httpRequest/http.js'
```

## 2、GET请求示例：
```javascript
import { get, path_version } from '@/httpRequest/http.js'
/**
 * get(url, option).then().catch()
 * 注：get 在 axios 的基础上增加了如下参数
 * 
 * @option {*} option.jsBridge      默认 true 在自研APP中使用 JSB 发送请求,不使用http
 */



get(`/cash/${path_version}/UserBankList`,{
  params:{
    subAccountId: '086003780'
  }
  /** 
   * axios 的所有参数 http://www.axios-js.com/zh-cn/docs/index.html#axios-get-url-config
   */
}).then(({ data })=>{
    console.log(data)
}).catch()
```


## 3、POST请求示例：

```javascript
import { post, path_version } from '@/httpRequest/http.js'
/**
 * post(url, option).then().catch()
 * 
 * 注：post 在 axios 的基础上增加了如下参数
 * 
 * @option {*} option.jsonRpc       默认 true  是否开启 jsonRpc (仅 post 请求)
 * @option {*} option.jsBridge      默认 true 在自研APP中使用 JSB 发送请求,不使用http
 * @option {*} option.type          默认 不传，提交 from 表单时候 设置为 'from' 
 * @option {*} option.encrypt       post 默认为 2；=》 1: 临时加密； 2 登录加密  0:所有状态不加密 
 */
post(`/cash/${path_version}/EddiIn`,{
  jsonRpc: true,
  jsBridge: true,
  data:{
    amount: "1.00",
    currency: "HKD",
    eddaId: 256,
    origin: 3,
    subAccountId: "886600101"
  }

}).then(res=>{
  console.log(res)
}).catch()

```

## 

