import Vue from 'vue'
import Vuex from 'vuex'

import createPersistedState from 'vuex-persistedstate';

import user from './modules/user'
import file from './modules/file'


Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    file
  },
  plugins: [createPersistedState({
    paths: [
      'user.user',
      'user.userPermissions',
      'user.loggedIn',
      'user.loading',
      'user.useDark',
      'file.content',
      'file.fileName'
    ]
  })],
  strict: process.env.NODE_ENV !== 'production'
})
