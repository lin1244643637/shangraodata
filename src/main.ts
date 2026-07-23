import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'element-plus/dist/index.css'
import currencyPlugin from './currencyPlugin'
import router from './router'
const app = createApp(App)
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
app.use(currencyPlugin);
app.use(router)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
app.mount('#app')
