import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store' // vuex
import fastclick from 'fastclick'
import VueLazyload from 'vue-lazyload'

import 'common/stylus/index.styl'

fastclick.attach(document.body)

// vue-lazyload
Vue.use(VueLazyload, {
  loading: require('common/image/default.png'), // 默认图片
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
