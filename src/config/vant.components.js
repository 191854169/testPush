//全局批量导入vant 组件
import {
    Button,
    List,
    Dialog,
    NavBar,
    PullRefresh,
    Image as VanImage,
    Icon,
    Form,
    Field,
    Toast,
    Locale,
    Checkbox,
    RadioGroup,
    Radio,
    Popup,
    DatetimePicker,
    Popover,
    Row,
    Col,
    CountDown,
    IndexBar,
    IndexAnchor,
    Cell,
    Picker,
    ActionSheet,
} from 'vant'

export default function (Vue) {
    //全局注册vant引用组件
    Vue.use(Button)
    Vue.use(List)
    Vue.use(Dialog)
    Vue.use(NavBar)
    Vue.use(PullRefresh)
    Vue.use(VanImage)
    Vue.use(Icon)
    Vue.use(Form)
    Vue.use(Field)
    Vue.use(Toast)
    Vue.use(Locale)
    Vue.use(Checkbox)
    Vue.use(Radio)
    Vue.use(RadioGroup)
    Vue.use(Popup)
    Vue.use(DatetimePicker)
    Vue.use(Popover)
    Vue.use(IndexBar)
    Vue.use(IndexAnchor)
    Vue.use(Cell)
    Vue.use(Col)
    Vue.use(Row)
    Vue.use(CountDown)
    Vue.use(Picker)
    Vue.use(ActionSheet)
}
