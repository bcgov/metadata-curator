import Vue from 'vue'
import Vuex from 'vuex'

import store from './modules/store'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    store
  },
  strict: process.env.NODE_ENV !== 'production'
})
