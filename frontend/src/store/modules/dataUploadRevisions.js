import { Backend } from '../../services/backend';
const backend = new Backend();

const state = {
    dataUploadId: null,
    revisions: [],
    error: null,
};

const getters = {

}


const actions = {

    async getRevisions({ commit }, dataUploadId) {
        console.log("getRevisions action");

        await backend.getRevisionsByDataUpload(dataUploadId).then((data) => {
            // console.log("getRevisionsByDataUpload action: ", data);
            commit('clearRevisions');
            commit('setRevisions', {revisions: data, dataUploadId: dataUploadId});

        }).catch((e) => {
            console.log("Retrieve revisions error: ", e);
            commit('setError', {error: e.response.data.error});
        });
    },

}


const mutations = {
    setRevisions(state, {revisions, dataUploadId}){
        console.log("setRevisions: ", revisions);
        state.dataUploadId = dataUploadId;
        state.revisions = revisions;
    },
    clearRevisions(state){
        state.dataUploadId = null,
        state.revisions = null;
    },
    setError(state, { error }) {
        state.error = Object.assign({}, error);
    },
    clearError(state) {
        state.error = null;
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
