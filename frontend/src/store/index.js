import Vue from 'vue'
import Vuex from 'vuex'

import user from './modules/user'
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user
  },
  plugins: [createPersistedState({
    paths: [
      'user/user',
      'user/userPermissions',
      'user/loggedIn',
      'user/loading',
    ]
  })],
  strict: process.env.NODE_ENV !== 'production'
})
