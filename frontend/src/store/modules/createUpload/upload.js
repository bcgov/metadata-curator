import { Backend } from '../../../services/backend';
const backend = new Backend();

const state = {
    newUploadCreated: false,
    createUploadInProgress: false,
    upload: null,
    error: false
};

const getters = {

}


const actions = {
    async createInitialUpload({ commit }, upload) {
        try {
            commit('setCreateUploadInProgress', true);
            commit('setError', {error: false});
            const data = await backend.postDataUpload(upload);
            commit('setUpload', data);
            commit('setCreateUploadInProgress', false);
            commit('setNewUploadCreated', true);
            return data;
        } catch(e) {
            commit('setError', {error: e.response.data.error});
            return e;
        }
    },
    async getUpload({ commit }, id) {
        try {
            const data = await backend.getDataUpload(id);
            commit('setUpload', data);
        } catch(e) {
            commit('setError', {error: e.response.data.error});
        }
    },
    async addSubmissionIdToUpload({ commit }, submissionId) {
        try {
            const upload = {...this.state.upload.upload, upload_submission_id: submissionId};
            const data = await backend.putDataUpload(upload);
            commit('setUpload', data);
        } catch(e) {
            commit('setError', {error: e.response.data.error});
        }
    },

    async modifyStoreUpload({ commit }, upload) {
        commit('setUpload', upload);
    },

    async updateUpload({ commit }, upload) {
        try {
            commit('setError', {error: false});
            const data = await backend.putDataUpload(upload);
            commit('setUpload', data);
            return data;
        } catch(e) {
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
        state.error = error
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