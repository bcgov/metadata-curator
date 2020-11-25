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
import upload from "./modules/createUpload/upload";
import uploadForm from "./modules/createUpload/uploadForm";
import repos from "./modules/repos";
import version from "./modules/version";

import { build } from './modules/items';

const permissions = build('getPermissions', 'newPermission', 'putPermission', 'deletePermission');
const forms = build('getForms', 'newForm', 'putForm', 'deleteForm');
const topics = build('getTopics', 'newTopic', 'putTopic', 'deleteTopic');
const comments = build('getComments', 'newComment', 'putComment', 'deleteComment');
const adminDUploads = build('getDataUploads');
const submissions = build('getFormSubmissions','postFormSubmission', 'putFormSubmission', 'deleteFormSubmission' );
const config = build('getConfigs','newConfig', 'putConfig', 'deleteConfig' );

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
    forms,
    topics,
    comments,
    adminDUploads,
    submissions,
    upload,
    uploadForm,
    repos,
    version,
    config,
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
      'file.successfullyUploadedChunks',
      'file.fileHandles'
    ]
  })],
  strict: process.env.NODE_ENV !== 'production'
})
