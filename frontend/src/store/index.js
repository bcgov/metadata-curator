import Vue from 'vue'
import Vuex from 'vuex'

import createPersistedState from 'vuex-persistedstate';

import user from './modules/user'
import file from './modules/file'
import schemaImport from './modules/schemaImport'
import dataUploads from "./modules/dataUploads";
import dataUploadRevisions from "./modules/dataUploadRevisions";
import dataUploadComments from "./modules/dataUploadComments";
import dataUploadDetail from "./modules/dataUploadDetail";

import { build } from './modules/items';

const permissions = build('getPermissions', 'newPermission', 'putPermission', 'deletePermission');
const forms = build('getForms', 'newForm', 'putForm', 'deleteForm');


Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    file,
    schemaImport,
    dataUploads,
    dataUploadRevisions,
    dataUploadComments,
    dataUploadDetail,
    permissions,
    forms
  },
  plugins: [createPersistedState({
    paths: [
      'user.user',
      'user.userPermissions',
      'user.loggedIn',
      'user.loading',
      'user.useDark',
      'file.fileName',
      'file.fileSig',
      'file.key',
      'file.uploadUrl',
      'file.successfullyUploadedChunks'
    ]
  })],
  strict: process.env.NODE_ENV !== 'production'
})
