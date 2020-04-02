import { Backend } from '../../services/backend';
const backend = new Backend();

const state = {
    dataUploads: [],
    selectedDataUpload: null,
    error: null,
};

const getters = {

}


const actions = {
    async getDataUploads({ commit }) {
        // console.log("getDataUploads action");

        await backend.getDataUploads().then((data) => {
            // console.log("getDataUploads action: ", data);
            commit('clearDataUploads');
            commit('setDataUploads', {dataUploads: data});

        }).catch((e) => {
            // console.log("Retrieve data uploads error: ", e);
            commit('setError', {error: e.response.data.error});
        });
    },

}


const mutations = {
    setDataUploads(state, {dataUploads}){
        // console.log("setDataUploads: ", dataUploads);
        state.dataUploads = dataUploads;
    },
    clearDataUploads(state){
        state.dataUploads = null;
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
