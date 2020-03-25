import Vue from 'vue'
import Vuex from 'vuex'

import createPersistedState from 'vuex-persistedstate';

import user from './modules/user'
import file from './modules/file'
import schemaImport from './modules/schemaImport'
import dataUploads from "./modules/dataUploads";
import dataUploadRevisions from "./modules/dataUploadRevisions";


Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    file,
    schemaImport,
    dataUploads,
    dataUploadRevisions
  },
  plugins: [createPersistedState({
    paths: [
      'user.user',
      'user.userPermissions',
      'user.loggedIn',
      'user.loading',
      'user.useDark',
      'file.fileName'
    ]
  })],
  strict: process.env.NODE_ENV !== 'production'
})
