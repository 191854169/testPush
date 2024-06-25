import { customerService } from '@/utils'

export const checkReleaseStatus = function (ref, isCreater, releaseStatus) {
    console.log('checkReleaseStatus', isCreater, releaseStatus)
    if (releaseStatus === 2) {
        showSoldOutDilag(ref, isCreater)
        return true
    }

    return false
}

export const showSoldOutDilag = function (ref, isCreater) {
    if (isCreater) {
        ref.$dialog.alert({
            closeOnClickOverlay: false,
            title: ref.$t('prompt'),
            message: ref.$t('customServiceOutageContactTip'),
            messageAlign: 'left',
            cancelButtonText: ref.$t('concatUs'),
            cancelButtonColor: '#2F2F2F',
            confirmButtonText: ref.$t('confirm'),
            confirmButtonColor: '#FF6907',
            showConfirmButton: true,
            showCancelButton: true,
            beforeClose(action, done) {
                if (action == 'cancel') {
                    gotoOnlineService(ref)
                    done()
                } else {
                    done()
                }
            },
        })
    } else {
        ref.$dialog.alert({
            closeOnClickOverlay: false,
            title: ref.$t('prompt'),
            message: ref.$t('customServiceOutageTip'),
            messageAlign: 'left',
            confirmButtonText: ref.$t('iKnow'),
            confirmButtonColor: '#FF6907',
            showConfirmButton: true,
            showCancelButton: false,
        })
    }
}

export const gotoOnlineService = function (ref) {
    let link = customerService({
        url: true,
    })
    if (ref.$jsBridge) {
        console.log('gotoOnlineService')
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
        console.log('gotoOnlineService', 'link', link)
        window.open(link)
    }
}
