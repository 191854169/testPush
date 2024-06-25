import { Toast, Dialog } from 'vant'

Toast.setDefaultOptions('success', {
    icon: require('@/assets/images/common/icon-toast-success@3x.png'),
})

Dialog.setDefaultOptions({
    messageAlign: 'left',
    width: '2.80rem',
    className: 'custom-dialog',
    overlayClass: 'custom-overlay',
})
