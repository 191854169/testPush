<template>
    <div class="content">
        <div class="topdec">
            <multi-img name="jieshao" directory="cashBox" />
            <div class="left">
                <span c>{{ $t('cashBox') }}</span>
                <p>{{ $t('xzzjzdlc') }}</p>
            </div>
        </div>
        <div class="item cus-rel">
            <div class="first">
                <div class="jstop">
                    <div class="left"></div>
                    <div class="title">{{ $t('smsxcb') }}</div>
                </div>
                <div class="txt">{{ $t('xcbsm') }}</div>
                <div class="txt">{{ $t('xcbsm2') }}</div>
            </div>
        </div>
        <!-- <div class="bg-border">
            <div class="jstop_">
                <div class="left"></div>
                <div class="title">{{ $t('tradingScenario') }}</div>
            </div>
            <div class="cust">
                <div class="desc">
                    <multi-img name="gupiaojiaoyi" directory="cashBox" />
                    <p>{{ $t('buysellstocks') }}</p>
                </div>
                <div class="desc">
                    <multi-img name="gupiaojiaoyi" directory="cashBox" />
                    <p>{{ $t('repaymentAccount') }}</p>
                </div>
            </div>
        </div> -->
        <div class="bg-border">
            <div class="jstop_">
                <div class="left"></div>
                <div class="title">{{ $t('tradingStrategy') }}</div>
            </div>
            <div class="cust1">
                <div class="buy">
                    <multi-img name="mairucelue" directory="cashBox" />
                    <div class="contxt">
                        <p>{{ $t('buyingStrategy') }}</p>
                        {{ $t('xuanzexcb') }}
                    </div>
                </div>
                <!-- <div class="sell">
                    <multi-img name="maichucelue" directory="cashBox" />
                    <div class="contxt">
                        <p>{{ $t('sellingStrategy') }}</p>
                        {{ $t('xuyaozhuanchu') }}
                    </div>
                </div> -->
            </div>
        </div>
        <div class="bg-border">
            <div class="jstop_">
                <div class="left"></div>
                <div class="title">{{ $t('syRule') }}</div>
            </div>
            <div class="custrule">
                <div class="ruletxt">
                    {{ $t('xcbsysj') }}
                </div>
                <div class="table">
                    <div class="left">
                        <div class="top">
                            {{ $t('toTheTime') }}
                        </div>
                        <div class="time">T-1日09:30{{ $t('hou') }}～T日09:30</div>
                        <!-- <div class="time">{{ $t('zhou') }}二09:45{{ $t('hou') }}～{{ $t('zhou') }}三09:45</div>
                        <div class="time">{{ $t('zhou') }}三09:45{{ $t('hou') }}～{{ $t('zhou') }}四09:45</div>
                        <div class="time">{{ $t('zhou') }}四09:45{{ $t('hou') }}～{{ $t('zhou') }}五09:45</div>
                        <div class="time no-border-bottom">{{ $t('zhou') }}五09:45{{ $t('hou') }}～下{{ $t('zhou') }}一09:45</div> -->
                    </div>
                    <div class="mid">
                        <div class="top midbor">
                            {{ $t('acknowledgingTime') }}
                        </div>
                        <div class="time">T日</div>
                        <!-- <div class="time">{{ $t('zhou') }}三</div>
                        <div class="time">{{ $t('zhou') }}四</div>
                        <div class="time">{{ $t('zhou') }}五</div>
                        <div class="time no-border-bottom">下{{ $t('zhou') }}一</div> -->
                    </div>
                    <div class="right">
                        <div class="top">
                            {{ $t('cksy') }}
                        </div>
                        <div class="time no-border-right">T日</div>
                        <!-- <div class="time no-border-right">{{ $t('zhou') }}四</div>
                        <div class="time no-border-right">{{ $t('zhou') }}五</div>
                        <div class="time no-border-right">下{{ $t('zhou') }}一</div>
                        <div class="time no-border-bottom no-border-right">下{{ $t('zhou') }}二</div> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'incomeDetails',
    components: {},
}
</script>
<style scoped lang="less">
.content {
    // height: 100%;
    padding-bottom: 70px;
    /* stylelint-disable-next-line number-max-precision */
    // background: linear-gradient(180deg, #fff9f4 0%, rgba(255, 229, 205, 0.782851) 19.85%, rgba(255, 246, 238, 0.794282) 24.26%, #fff3e8 100%);
    background: linear-gradient(180deg, #fffcec 0%, rgba(255, 235, 195, 0.782851) 19.85%, rgba(255, 249, 238, 0.794282) 36.5%, #fff8ea 100%);

    .clear {
        clear: both;
    }

    .topdec {
        position: relative;

        .left {
            position: absolute;
            top: 42px;
            left: 24px;
            color: #d7903b;

            span {
                font-weight: 600;
                font-size: 34px;
                line-height: 44px;
            }

            p {
                margin-top: 4px;
                font-weight: 400;
                font-size: 15px;
                line-height: 21px;
            }
        }
    }

    .cus-rel {
        position: relative;
        height: 188px;
    }

    .first {
        position: absolute;
        top: -45px;
        right: 12px;
        // margin: 0 12px;
        // margin-right: 12px;
        // margin-left: 12px;
        left: 12px;
        background: linear-gradient(180deg, #fff0df 0%, #fffcfb 18.75%, #fff 100%);
        border-radius: 8px;
        box-shadow: inset -0.5px 0.5px 0 #fff;
        backdrop-filter: blur(13.5914px);
    }

    .bg-border {
        margin: 0 12px;
        margin-bottom: 12px;
        padding: 20px 12px;
        background: #fff;
        border-radius: 8px;
        box-shadow: inset -0.5px 0.5px 0 #fff;
        backdrop-filter: blur(13.5914px);

        .jstop_ {
            display: flex;
            flex-direction: row;
            align-items: center;

            .left {
                width: 6px;
                height: 18px;
                margin-right: 4px;
                background: @theme;
                border-radius: 2px;
            }
        }

        .cust {
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            width: 100%;
            margin-top: 12px;
            margin-bottom: 8px;
            padding: 0 20px;

            .desc {
                img {
                    width: 70px;
                    height: 70px;
                }

                p {
                    color: #2f2f2f;
                    font-weight: 600;
                    font-size: 16px;
                    line-height: 22px;
                    text-align: center;
                }
            }
        }

        .cust1 {
            margin-top: 20px;
            padding-right: 10px;

            .contxt {
                color: #2f2f2f;
                font-weight: 400;
                font-size: 14px;
                line-height: 21px;

                p {
                    margin-bottom: 2px;
                    font-weight: 600;
                    font-size: 16px;
                    line-height: 22px;
                }
            }

            .buy {
                display: flex;
                flex-direction: row;

                img {
                    width: 60px;
                    height: 60px;
                    margin: 0 18px 0 10px;
                }
            }

            .sell {
                display: flex;
                flex-direction: row;
                margin-top: 20px;

                img {
                    width: 60px;
                    height: 60px;
                    margin: 0 18px 0 10px;
                }
            }
        }

        .custrule {
            margin-top: 10px;
            padding: 0 10px;

            .ruletxt {
                font-weight: 400;
                font-size: 14px;
                line-height: 21px;
            }

            .table {
                display: flex;
                flex-direction: row;
                margin-top: 18px;
                border: 1px solid #ffdaa4;
                border-radius: 2px;

                .no-border-right {
                    border-right: none !important;
                }

                .no-border-bottom {
                    border-bottom: none !important;
                }

                .time {
                    color: #4c2620;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 30px;
                    text-align: center;
                    border-right: 1px solid #ffdaa4;
                    border-bottom: 1px solid #ffdaa4;
                }

                .top {
                    padding: 7px 8px;
                    color: #fff;
                    font-weight: 500;
                    font-size: 14px;
                    line-height: 22px;
                    text-align: center;
                    background: @theme;
                }

                .left {
                    width: 50%;
                }

                .mid {
                    width: 25%;

                    .midbor {
                        border-right: 1px solid #ffdaa4;
                        border-left: 1px solid #ffdaa4;
                    }
                }

                .right {
                    width: 25%;
                }
            }
        }

        .title {
            color: #2f2f2f;
            font-size: 18px;
            line-height: 26px;
        }

        .txt {
            margin: 10px 22px;
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
            line-height: 21px;
            text-align: justify;
        }
    }

    .jstop {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 20px 12px 0;

        .left {
            width: 6px;
            height: 18px;
            margin-right: 4px;
            background: @theme;
            border-radius: 2px;
        }
    }

    .item {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 14px;
        line-height: 18px;

        .title {
            color: #2f2f2f;
            font-size: 18px;
            line-height: 26px;
        }

        .txt {
            margin: 10px 22px;
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
            line-height: 21px;
            text-align: justify;
        }

        p {
            margin-bottom: 8px;
            line-height: 18px;
        }
    }
}
</style>
