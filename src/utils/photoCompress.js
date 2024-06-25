// photoCompress.js已提取至@fs/utils，后续移除，无需在项目单独调整。
/* eslint-disable */
/*图片比例压缩，设置长、宽最大值*/

/**
 三个参数
 file：一个是文件(类型是图片格式)，
 obj：{width:1080, height:1080, quality: 0.7} width、height文件压缩的最大宽、高; quality压缩质量,越小压缩率越高，但质量越差
 objDiv：一个是容器或者回调函数
 photoCompress()
 其它选择 npm i Compressor
 */
function photoCompress(file, obj, objDiv) {
    var reader = new FileReader()
    /*开始读取指定的Blob对象或File对象中的内容. 当读取操作完成时,readyState属性的值会成为DONE,如果设置了onloadend事件处理程序,则调用之.同时,result属性中将包含一个data: URL格式的字符串以表示所读取文件的内容.*/
    reader.readAsDataURL(file)
    reader.onloadend = function (e) {
        var re = this.result
        canvasDataURL(re, obj, objDiv, file)
    }
}

function canvasDataURL(path, obj, callback, file) {
    var img = new Image()
    img.src = path
    img.onload = function () {
        var that = this
        // 默认按比例压缩
        var w = that.width,
            h = that.height,
            oldscale = w / h,
            newscale = obj.width / obj.height
        if (oldscale > newscale) {
            w = obj.width && obj.width < w ? obj.width : w
            h = w / oldscale
        } else {
            h = obj.height && obj.height < h ? obj.height : h
            w = h * oldscale
        }
        var quality = 0.7 // 默认图片质量为0.7
        //生成canvas
        var canvas = document.createElement('canvas')
        var ctx = canvas.getContext('2d')
        // 创建属性节点
        var anw = document.createAttribute('width')
        anw.nodeValue = w
        var anh = document.createAttribute('height')
        anh.nodeValue = h
        canvas.setAttributeNode(anw)
        canvas.setAttributeNode(anh)
        ctx.drawImage(that, 0, 0, w, h)
        // 图像质量
        if (obj.quality && obj.quality <= 1 && obj.quality > 0) {
            quality = obj.quality
        }
        // quality值越小，所绘制出的图像越模糊
        var base64 = canvas.toDataURL('image/jpeg', quality)
        // 回调函数返回base64的值

        callback(convertBase64UrlToFile(base64, file), base64)
    }
}

/**
 * 将以base64的图片url数据转换为Blob对象
 * @param urlData
 * 用url方式表示的base64图片数据
 */
export function convertBase64UrlToBlob(urlData) {
    var arr = urlData.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
}

/**
 * 将以base64的图片url数据转换为File对象
 * @param urlData
 * 用url方式表示的base64图片数据
 * @file 文件信息
 */
export function convertBase64UrlToFile(urlData, file) {
    var b = convertBase64UrlToBlob(urlData)
    return new window.File([b], file.name, { type: file.type })
}
export { photoCompress }
export default photoCompress
