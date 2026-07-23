import { App } from 'vue';
import currency from 'currency.js';
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $currency: (value: number) => currency;
  }
}

export default {
  install(app: App) {
    app.config.globalProperties.$currency = v=>currency(v,{symbol: '￥'});
  },
};
