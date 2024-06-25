/* 旋转base64图片
@src 图片地址或base64图片编码
@edg 旋转角度 要求是90的整数倍 */
const rotateBase64Img = function (src, edg) {
    return new Promise((resolve, reject) => {
        var canvas = document.createElement('canvas')
        var ctx = canvas.getContext('2d')

        var imgW //图片宽度
        var imgH //图片高度
        var size //canvas初始大小

        if (edg % 90 != 0) {
            reject('旋转角度必须是90的倍数!')
            return
        }
        edg < 0 && (edg = (edg % 360) + 360)
        const quadrant = (edg / 90) % 4 //旋转象限
        const cutCoor = { sx: 0, sy: 0, ex: 0, ey: 0 } //裁剪坐标

        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.src = src

        image.onload = function () {
            imgW = image.width
            imgH = image.height
            size = imgW > imgH ? imgW : imgH

            canvas.width = size * 2
            canvas.height = size * 2
            switch (quadrant) {
                case 0:
                    cutCoor.sx = size
                    cutCoor.sy = size
                    cutCoor.ex = size + imgW
                    cutCoor.ey = size + imgH
                    break
                case 1:
                    cutCoor.sx = size - imgH
                    cutCoor.sy = size
                    cutCoor.ex = size
                    cutCoor.ey = size + imgW
                    break
                case 2:
                    cutCoor.sx = size - imgW
                    cutCoor.sy = size - imgH
                    cutCoor.ex = size
                    cutCoor.ey = size
                    break
                case 3:
                    cutCoor.sx = size
                    cutCoor.sy = size - imgW
                    cutCoor.ex = size + imgH
                    cutCoor.ey = size + imgW
                    break
                default:
                    break
            }

            ctx.translate(size, size)
            ctx.rotate((edg * Math.PI) / 180)
            ctx.drawImage(image, 0, 0)

            const imgData = ctx.getImageData(cutCoor.sx, cutCoor.sy, cutCoor.ex, cutCoor.ey)
            if (quadrant % 2 == 0) {
                canvas.width = imgW
                canvas.height = imgH
            } else {
                canvas.width = imgH
                canvas.height = imgW
            }
            ctx.putImageData(imgData, 0, 0)
            resolve(canvas.toDataURL())
        }
    })
}
export { rotateBase64Img }
export default rotateBase64Img
