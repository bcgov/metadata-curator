import { Backend } from '../../../services/backend';
const backend = new Backend();

const state = {
    newUploadCreated: false,
    createUploadInProgress: false,
    upload: null,
    error: null
};

const getters = {

}


const actions = {
    async createInitialUpload({ commit }, upload) {
        try {
            commit('setCreateUploadInProgress', true);
            const data = await backend.postDataUpload(upload);
            commit('setUpload', data);
            commit('setCreateUploadInProgress', false);
            commit('setNewUploadCreated', true);
            return data;
        } catch(e) {
            console.log("Create initial upload error: ", e);
            commit('setError', {error: e.response.data.error});
            return e;
        }
    },
    async getUpload({ commit }, id) {
        try {
            const data = await backend.getDataUpload(id);
            commit('setUpload', data);
        } catch(e) {
            console.log("Get upload error: ", e);
            commit('setError', {error: e.response.data.error});
        }
    },
    async addSubmissionIdToUpload({ commit }, submissionId) {
        try {
            const upload = {...this.state.upload.upload, upload_submission_id: submissionId};
            const data = await backend.putDataUpload(upload);
            commit('setUpload', data);
        } catch(e) {
            console.log("addSubmissionIdToUpload error: ", e);
            commit('setError', {error: e.response.data.error});
        }
    },

    async modifyStoreUpload({ commit }, upload) {
        commit('setUpload', upload);
    },

    async updateUpload({ commit }, upload) {
        try {
            const data = await backend.putDataUpload(upload);
            commit('setUpload', data);
            return data;
        } catch(e) {
            console.log("addSubmissionIdToUpload error: ", e);
            commit('setError', {error: e.response.data.error});
            return e;
        }
    },

}


const mutations = {
    setNewUploadCreated(state, newUploadCreated){
        state.newUploadCreated = newUploadCreated;
    },
    setUpload(state, upload){
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
    // eslint-disable-next-line no-unused-vars
    resetState(state) {
        state.newUploadCreated = false;
        state.createUploadInProgress = false;
        state.upload = null;
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