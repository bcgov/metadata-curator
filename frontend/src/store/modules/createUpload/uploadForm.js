import { Backend } from '../../../services/backend';
const backend = new Backend();

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
    async getDefaultUploadForm({commit}){
        if ( (typeof(state.formName) === "undefined") || (state.formName === "") ){
            try{
                let d = await backend.getConfig('uploadForm');
                commit('setFormName', d.value);
            }catch(e){
                commit('setFormName', 'uploadForm');
            }
        }
        try {
            let data = "";
            data = await backend.getForm(state.formName);
            commit('clearUploadForm');
            commit('setUploadForm', data);
        } catch(e) {
            console.log("Retrieve upload form error: ", e);
            commit('setError', {error: e.response.data.error});
        }
    },

    async getUploadForm({ commit }, uploadForm) {
        commit('clearUploadForm');
        if ( (typeof(state.formName) === "undefined") || (state.formName === "") ){
            try{
                let d = await backend.getConfig('uploadForm');
                commit('setFormName', d.value);
            }catch(e){
                commit('setFormName', 'uploadForm');
            }
        }
        try {
            let data = "";
            if (typeof(uploadForm) !=="undefined"){
                data = await backend.getForm(uploadForm);
            }else{
                data = await backend.getForm(state.formName);
            }
            commit('clearUploadForm');
            commit('setUploadForm', data);
        } catch(e) {
            console.log("Retrieve upload form error: ", e);
            commit('setError', {error: e.response.data.error});
        }

    },
    async createUploadFormSubmission({ commit, dispatch}, submission) {
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
            console.log("Post upload form submission error: ", e);
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
            console.log("get upload form submission error: ", e);
            commit('setError', {error: e.response.data.error});
        }
    },
    async updateUploadFormSubmission({ commit }, formName, submission) {
        try {
            const data = await backend.putFormSubmission(formName, submission._id, submission.data);
            commit('setFormSubmission', data);
        } catch(e) {
            console.log("put upload form submission error: ", e);
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
        state.formDef = null;
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