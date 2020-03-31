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

        await backend.getCommentsByDataUpload(dataUploadId).then((data) => {
            // console.log("getCommentsByDataUpload action: ", data);
            commit('clearComments');
            commit('setComments', {comments: data, dataUploadId: dataUploadId});

        }).catch((e) => {
            console.log("Retrieve comments error: ", e);
            commit('setError', {error: e.response.data.error});
        });
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
