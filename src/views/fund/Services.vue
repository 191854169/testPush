// 服务页
<template>
    <div class="services">
        <p class="service-time-tip">{{ $t('serviceTimeTip') }}</p>
        <div class="body">
            <h3 class="title">{{ $t('services') }}</h3>
            <div class="card manager">
                <div class="bg">
                    <multi-img name="kefu_bg_card" directory="fund"></multi-img>
                </div>
                <div class="left">
                    <div class="name">
                        <p class="label">{{ $t('servicesManager') }}</p>
                        <p class="value">{{ $t('servicer') }}</p>
                    </div>
                    <div class="concat-info">
                        <div class="label">
                            <span>{{ $t('phone') }}</span>
                            <div class="line"></div>
                            <span>{{ $t('wechat') }}</span>
                        </div>
                        <div class="value">
                            <span class="phone-number">188 2338 6648</span>
                            <multi-img name="icon_copy" directory="fund" @click="copyConcatInfo"></multi-img>
                        </div>
                    </div>
                </div>
                <div class="right">
                    <img name="manager_qrcode" directory="fund" src="~@/assets/images/fund/service_qrcode.png" />
                    <p class="tip">{{ $t('saveQrcodeForTouch') }}</p>
                </div>
            </div>
            <h3 class="title">{{ $t('serviceOnline') }}</h3>
            <ul class="list">
                <li class="list-item">
                    <a href="tel:4008120922">
                        <span>{{ $t('mainlandService') }} 400 812 0922</span>
                        <div class="phone-icon">
                            <i class="fsfont">&#xe629;</i>
                        </div>
                    </a>
                </li>
                <li class="list-item">
                    <a href="tel:+85229796988">
                        <span>{{ $t('hkService') }} +852 2979 6988</span>
                        <div class="phone-icon">
                            <i class="fsfont">&#xe629;</i>
                        </div>
                    </a>
                </li>
            </ul>
        </div>
        <div class="footer">
            <button class="online-service" @click="onOnlineService">
                <i class="fsfont service-icon">&#xe62a;</i>
                <span>{{ $t('onlineService') }}</span>
            </button>
        </div>
    </div>
</template>

<script>
import { copyText, customerService } from '@/utils/utils.js'
import { getRunEnv } from '@/utils/env.js'
export default {
    name: 'services',
    computed: {
        isHlApp() {
            return getRunEnv() === 1
        },
    },
    methods: {
        copyConcatInfo() {
            if (copyText('.phone-number')) {
                this.$toast({
                    message: this.$t('copySuccess'),
                    className: 'copy-toast',
                })
            }
        },

        onOnlineService() {
            let link = customerService({
                url: true,
            })
            if (this.$jsBridge) {
                this.$jsBridge
                    .getUserinfo()
                    .then(data => {
                        const subAcctId = (((data?.clientInfo || {}).accts || [])[0] || {}).subAcctId || ''
                        const hlid = data?.clientInfo?.hlId || ''
                        link = customerService({
                            url: true,
                            userid: subAcctId,
                            hlid: hlid,
                        })
                        console.log(link) // test
                        this.$jsBridge.open({ url: encodeURIComponent(link), title: '' })
                    })
                    .catch(() => {
                        console.log(link) // test
                        this.$jsBridge.open({ url: encodeURIComponent(link), title: '' })
                    })
            } else {
                window.open(link)
            }
        },

        onConcatClick() {
            if (this.$jsBridge) {
                this.$jsBridge.contactUs()
            }
        },
    },
}
</script>

<style scoped lang="less">
@import url('~@/assets/css/mixins.less');

.services {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    padding: 0 12px 12px;
    background: #fff;
    #iosBottom();

    .service-time-tip {
        margin-top: 8px;
        color: #9c9c9c;
        font-size: 12px;
        line-height: 16px;
        text-align: center;
    }

    .body {
        flex: 1 0 auto;
        margin-top: 12px;
    }

    .title {
        color: #000;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
    }

    .card {
        position: relative;
        display: flex;
        justify-content: space-between;
        box-sizing: border-box;
        margin-top: 12px;
        margin-bottom: 32px;
        padding: 20px 20px 20px 16px;
        background: transparent;
        // @media screen and (device-pixel-ratio) {
        //     background: url('~@/assets/images/fund/kefu_bg_card@2x.png');

        // }
        border: 0.5px solid #e6eeff;
        border-radius: 8px;

        .bg {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            // z-index: -1;
        }

        .left {
            position: relative;
            z-index: 1;

            .name {
                .label {
                    color: #9c9c9c;
                    font-size: 12px;
                    line-height: 16px;
                }

                .value {
                    margin-top: 4px;
                    color: #1f1f1f;
                    font-size: 18px;
                    line-height: 26px;
                }
            }

            .concat-info {
                margin-top: 12px;

                .label {
                    display: flex;
                    align-items: center;
                    color: #9c9c9c;
                    font-size: 12px;
                    line-height: 16px;

                    .line {
                        width: 1px;
                        height: 8px;
                        margin: 0 6px;
                        background: #ddd;
                    }
                }

                .value {
                    display: flex;
                    align-items: center;
                    margin-top: 4px;
                    color: #1f1f1f;
                    font-size: 18px;
                    line-height: 26px;

                    img {
                        width: 20px;
                        height: 20px;
                        margin-left: 8px;
                    }
                }
            }
        }

        .right {
            position: relative;
            z-index: 1;
            text-align: right;

            img {
                width: 86px;
            }

            .tip {
                color: #9c9c9c;
                font-size: 10px;
                line-height: 14px;
                text-align: center;
            }
        }
    }

    .list {
        &-item a {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 56px;
            margin-top: 12px;
            padding: 0 16px;
            background: #f9f9f9;
            border-radius: 8px;

            span {
                color: #2f2f2f;
                font-size: 16px;
                line-height: 22px;
            }

            .phone-icon {
                width: 28px;
                color: #2f2f2f;
                font-size: 14px;
                line-height: 28px;
                text-align: center;
                background: #fff;
                border-radius: 50%;
            }
        }
    }

    .footer {
        margin-bottom: 44px;
        text-align: center;

        .online-service {
            display: inline-block;
            margin: 0 auto;
            padding: 0 20px;
            color: #2f2f2f;
            line-height: 32px;
            background: #f2f2f2;
            border: none;
            border-radius: 19.5px;
            box-shadow: none;

            span {
                margin-left: 4px;
                font-size: 14px;
                vertical-align: middle;
            }

            .service-icon {
                font-size: 15px;
                vertical-align: middle;
            }
        }
    }
}
</style>

<style lang="less">
.copy-toast {
    min-width: auto;
    padding-right: 16px;
    padding-left: 16px;
}
</style>
