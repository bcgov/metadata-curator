import { Backend } from '../../services/backend';
const backend = new Backend();

const state = {
    formName: "uploadForm",
    newUploadCreated: false,
    createUploadInProgress: false,
    upload: null,
    submission: {data: {}},
    uploadForm: {},
    error: null
};

const getters = {

}


const actions = {
    async getUploadForm({ commit }) {
        // console.log("getUploadForm action");
        try {
            // eslint-disable-next-line no-unused-vars
            const data = await backend.getForm(state.formName);
            commit('clearUploadForm');
            commit('setUploadForm', data);
        } catch(e) {
            console.log("Retrieve upload form error: ", e);
            commit('setError', {error: e.response.data.error});
        }

    },
    async createInitialUpload({ commit }, upload) {
        console.log("createInitialUpload action");
        try {
            commit('setCreateUploadInProgress', true);
            const data = await backend.postDataUpload(upload);
            // console.log("setNewUploadCreated: ", state.newUploadCreated);
            commit('setUpload', data);
            commit('setCreateUploadInProgress', false);
            commit('setNewUploadCreated', true);
        } catch(e) {
            console.log("Create initial upload error: ", e);
            commit('setError', {error: e.response.data.error});
        }
    },
    async getUpload({ commit, dispatch }, id) {
        console.log("getUpload action");
        try {
            const data = await backend.getDataUpload(id);
            commit('setUpload', data);

            if(data.upload_submission_id) {
                dispatch('getUploadFormSubmission', data.upload_submission_id);
            }
        } catch(e) {
            console.log("Get upload error: ", e);
            commit('setError', {error: e.response.data.error});
        }
    },
    async createUploadFormSubmission({ commit, dispatch }, submission) {
        console.log("postUploadFormSubmission action: ", submission);
        try {
            const data = await backend.postFormSubmission(state.formName, submission);
            commit('setFormSubmission', data);
            dispatch('addSubmissionIdToUpload', data._id);
        } catch(e) {
            console.log("Post upload form submission error: ", e);
            commit('setError', {error: e.response.data.error});
        }
    },
    async getUploadFormSubmission({ commit }, submissionId) {

        try {
            const data = await backend.getFormSubmission(state.formName, submissionId);
            commit('setFormSubmission', data);
        } catch(e) {
            console.log("get upload form submission error: ", e);
            commit('setError', {error: e.response.data.error});
        }
    },
    async updateUploadFormSubmission({ commit }, submission) {
        console.log("updateUploadFormSubmission action: ", submission);
        try {
            const data = await backend.putFormSubmission(state.formName, submission._id, submission.data);
            commit('setFormSubmission', data);
        } catch(e) {
            console.log("put upload form submission error: ", e);
            commit('setError', {error: e.response.data.error});
        }
    },
    async addSubmissionIdToUpload({ commit }, submissionId) {
        console.log("addSubmissionIdToUpload action: ", submissionId);
        try {

            const upload = {...this.state.upload.upload, upload_submission_id: submissionId};
            const data = await backend.putDataUpload(upload);
            commit('setUpload', data);
        } catch(e) {
            console.log("addSubmissionIdToUpload error: ", e);
            commit('setError', {error: e.response.data.error});
        }
    },
}


const mutations = {
    setNewUploadCreated(state, newUploadCreated){
        state.newUploadCreated = newUploadCreated;
    },
    setUploadForm(state, form){
        // console.log("setUploadForm: ", form);
        state.uploadForm = form;
    },
    clearUploadForm(state){
        state.uploadForm = null;
    },
    setUpload(state, upload){
        // console.log("setUpload: ", form);
        state.upload = upload;
    },
    clearUpload(state){
        state.upload = null;
    },
    setError(state, { error }) {
        state.error = Object.assign({}, error);
    },
    clearError(state) {
        state.error = null;
    },
    setCreateUploadInProgress(state, createInProgress) {
        state.createUploadInProgress = createInProgress;
    },
    setFormSubmission(state, submission){
        state.submission = submission;
    },
    clearFormSubmission(state){
        state.submission = {data: {firstName: "janee"}};
    },
    // eslint-disable-next-line no-unused-vars
    resetState(state) {
        state.formName = "uploadForm";
        state.newUploadCreated = false;
        state.createUploadInProgress = false;
        state.upload = null;
        state.submission = {data: {}},
        state.uploadForm = null;
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
