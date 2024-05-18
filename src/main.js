import 'normalize.css/normalize.css'
import '@/styles/element/index.scss'
import '@/styles/index.scss'

import './permission'

import { createApp } from 'vue'

import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import App from './App.vue'
import router from './router/index'
import { createPinia } from 'pinia'

import SvgIcon from '@/components/SvgIcon/index.vue'
import 'virtual:svg-icons-register'

import { toHorizontalLine } from '@/utils/index'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(ElementPlus, {
  locale: zhCn,
  size: 'default',
})

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
  const iconName = 'el-icon-' + toHorizontalLine(key)
  app.component(iconName, component)
}
app.component('SvgIcon', SvgIcon)

app.mount('#app')
