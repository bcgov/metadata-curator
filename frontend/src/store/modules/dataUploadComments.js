import { Backend } from '../../services/backend';
const backend = new Backend();

const state = {
    dataUploadId: null,
    comments: [],
    error: null,
};

const getters = {

}


const actions = {

    async getComments({ commit }, dataUploadId) {
        // console.log("getComments action");
        try {
            const data = await backend.getCommentsByDataUpload(dataUploadId);
            commit('clearComments');
            commit('setComments', {comments: data, dataUploadId: dataUploadId});
        } catch(e) {
            console.log("Retrieve comments error: ", e);
            commit('setError', {error: e.response.data.error});
        }
    },
    async addComment({ commit, dispatch }, {dataUploadId, comment}) {
        // console.log("addComments action: " + comment);
        try {
            await backend.postCommentByDataUpload(dataUploadId, comment);
            // console.log("postCommentByDataUpload action: ", data);
            dispatch('getComments', dataUploadId);
        } catch(e) {
            console.log("Unable to add comment error: ", e);
            commit('setError', {error: e.response.data.error});
        }
    },

}


const mutations = {
    setComments(state, {comments, dataUploadId}){
        // console.log("setComments: ", comments);
        state.dataUploadId = dataUploadId;
        state.comments = comments;
    },
    clearComments(state){
        state.dataUploadId = null,
        state.comments = [];
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
