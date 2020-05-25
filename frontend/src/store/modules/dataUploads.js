import { Backend } from '../../services/backend';
const backend = new Backend();

const state = {
    dataUploads: [],
    selectedDataUpload: null,
    error: null,
};

const getters = {
    // eslint-disable-next-line no-unused-vars
    getDataUploadById: (state, getters) => (id) => {
        return state.dataUploads.find(upload => upload._id === id);
    }
}

const actions = {
    async getDataUploads({ commit }, {filterBy}) {
        // console.log("getDataUploads action");
        const query = {filterBy: filterBy};

        try {
            const data = await backend.getDataUploads(query);
            commit('clearDataUploads');
            commit('setDataUploads', {dataUploads: data});

        } catch(e) {
            // console.log("Retrieve data uploads error: ", e);
            commit('setError', {error: e.response.data.error});
        }

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
