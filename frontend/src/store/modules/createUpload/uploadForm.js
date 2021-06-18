import { Backend } from '../../../services/backend';
const backend = new Backend();

import Vue from 'vue';


const state = {
    formName: "",
    createSubmissionInProgress: false,
    upload: null,
    submission: {data: {}},
    formDef: {},
    error: null
};

const getters = {

}


const actions = {
    async getDefaultUploadForm({commit, state}){
        let loadedForm = (state.formName) ? state.formName : false;
        let formName;
        if ( (typeof(state.formName) === "undefined") || (state.formName === "") ){
            try{
                let d = await backend.getConfig('uploadForm');
                formName = d.value;
                commit('setFormName', d.value);
            }catch(e){
                formName = 'uploadForm';
                commit('setFormName', 'uploadForm');
            }
        }
        try {
            let data = state.formDef;
            if (loadedForm !== formName){
                data = await backend.getForm(state.formName);
            }
            commit('clearUploadForm');
            commit('setUploadForm', data);
        } catch(e) {
            commit('setError', {error: e.response.data.error});
        }
    },

    async getUploadForm({ commit, state }, uploadForm) {
        let loadedForm = (state.formName) ? state.formName : false;

        if ( (uploadForm && (loadedForm !== uploadForm)) || (!uploadForm && (state.formName !== loadedForm)) ){
            commit('clearUploadForm');
        }

        if ( (typeof(state.formName) === "undefined") || (state.formName === "") ){
            try{
                let d = await backend.getConfig('uploadForm');
                commit('setFormName', d.value);
            }catch(e){
                commit('setFormName', 'uploadForm');
            }
        }
        try {
            let data = state.formDef;
            if (typeof(uploadForm) !== "undefined"){
                if (loadedForm !== uploadForm){
                    data = await backend.getForm(uploadForm);
                }
            }else{
                if (loadedForm !== uploadForm){
                    data = await backend.getForm(state.formName);
                }
            }
            commit('clearUploadForm');
            commit('setUploadForm', data);
        } catch(e) {
            commit('setError', {error: e.response.data.error});
        }

    },
    async createUploadFormSubmission({ commit, dispatch, state}, submission) {
        if ( (typeof(state.formName) === "undefined") || (state.formName === "") ){
            try{
                let d = await backend.getConfig('uploadForm');
                commit('setFormName', d.value);
            }catch(e){
                commit('setFormName', 'uploadForm');
            }
        }
        try {
            commit('setCreateSubmissionInProgress', true);
            const data = await backend.postFormSubmission(state.formName, submission);
            commit('setCreateSubmissionInProgress', false);
            commit('setFormSubmission', data);
            dispatch('upload/addSubmissionIdToUpload', data._id, {root:true});
        } catch(e) {
            commit('setError', {error: e.response.data.error});
        }
    },
    async getUploadFormSubmission({ commit }, {formName, submissionId}) {
        try {
            if ( (typeof(submissionId) !== "undefined") && (submissionId != "undefined") && (submissionId !== null) ){
                const data = await backend.getFormSubmission(formName, submissionId);
                commit('setFormSubmission', data);
            }
        } catch(e) {
            commit('setError', {error: e.response.data.error});
        }
    },
    async updateUploadFormSubmission({ commit }, {formName, submission}) {
        try {
            const data = await backend.putFormSubmission(formName, submission._id, submission.data);
            commit('setFormSubmission', data);
        } catch(e) {
            commit('setError', {error: e.response.data.error});
        }
    },
}


const mutations = {
    setUploadForm(state, form){
        // console.log("setUploadForm: ", form);
        state.formDef = form;
    },
    clearUploadForm(state){
        state.formDef = null;
    },
    setError(state, { error }) {
        state.error = Object.assign({}, error);
    },
    clearError(state) {
        state.error = null;
    },
    setFormName(state, formName){
        state.formName = formName;
    },
    setCreateSubmissionInProgress(state, createInProgress) {
        state.createSubmissionInProgress = createInProgress;
    },
    setFormSubmission(state, submission){
        state.submission = submission;
    },
    clearFormSubmission(state){
        state.submission = {data: {firstName: "janee"}};
    },
    // eslint-disable-next-line no-unused-vars
    resetState(state) {
        state.formName = "";
        state.createSubmissionInProgress = false;
        state.upload = null;
        state.submission = {data: {}},
        Vue.set(state, 'formDef', null);
        state.error = null;
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}