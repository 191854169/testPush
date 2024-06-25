import { customerService } from '@/utils'

export const showVirturlAssetDialog = function (ref) {
    ref.$dialog.alert({
        closeOnClickOverlay: false,
        title: ref.$t('virturlAssetDialog.title'),
        message: ref.$t('virturlAssetDialog.content'),
        messageAlign: 'left',
        confirmButtonText: ref.$t('virturlAssetDialog.okBtn'),
        confirmButtonColor: '#FF6907',
        showConfirmButton: true,
        showCancelButton: false,
        beforeClose(action, done) {
            if (action == 'confirm') {
                gotoOnlineService(ref)
                done()
            } else {
                done()
            }
        },
    })
}

export const gotoOnlineService = function (ref) {
    let link = customerService({
        url: true,
    })
    if (ref.$jsBridge) {
        ref.$jsBridge
            .getUserinfo()
            .then(data => {
                console.log('gotoOnlineService', 'data', data)
                const subAcctId = (((data?.clientInfo || {}).accts || [])[0] || {}).subAcctId || ''
                const hlid = data?.clientInfo?.hlId || ''
                link = customerService({
                    url: true,
                    userid: subAcctId,
                    hlid: hlid,
                })
                ref.$jsBridge.open({ url: encodeURIComponent(link), title: '' })
            })
            .catch(() => {
                ref.$jsBridge.open({ url: encodeURIComponent(link), title: '' })
            })
    } else {
        window.open(link)
    }
}
