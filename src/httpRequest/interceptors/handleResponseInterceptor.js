const getBooleanProperty = (obj, property, defaultValue) => {
    if (typeof obj[property] === 'boolean') {
        return obj[property]
    }
    return defaultValue
}

function getHandleResponse(type) {
    return function handleResponse(response) {
        const { config, name } = response || {}

        try {
            // 直接返回完整响应体，报错也如此(兼容之前同事的返回值处理)
            const origin = getBooleanProperty(config, 'origin', true)
            if (origin) {
                if (type === 'rejected') {
                    return Promise.reject(response)
                }
                return Promise.resolve(response)
            }

            if (type === 'rejected') {
                // axios的错误信息，直接抛出去(兼容0.x，1.x版本)
                if (name === 'AxiosError' || name === 'Error') {
                    return Promise.reject(response)
                }
                /*------- 接口请求正常，但是结果存在错误信息则抛出去，通过error interceptor来处理 -------*/
                if (response?.data?.error) {
                    // 正常错误支持responseHandler处理
                    return Promise.reject(response.data)
                }
                return Promise.reject(response)
            }
            /*------- 接口请求正常，但是结果存在错误信息则抛出去，通过error interceptor来处理 -------*/
            if (response?.data?.error) {
                // 正常错误支持responseHandler处理
                return Promise.reject(response.data)
            }
            // 正常响应体response.data支持responseHandler处理
            return Promise.resolve(response.data)
        } catch (e) {
            return Promise.reject(response.data)
        }
    }
}

export default options => {
    return {
        onFulfilled: getHandleResponse('fulfilled', options),
        onRejected: getHandleResponse('rejected', options),
        options: {},
    }
}
