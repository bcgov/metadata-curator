import { Backend } from '../../services/backend';
const backend = new Backend();

const state = {
    repos: [],
    selectedRepo: null,
    selectedFilterBy: null,
    error: null,
};

const getters = {
}

const actions = {
    async getRepos({ commit }, {filterBy}) {
        const query = {filterBy: filterBy};

        try {
            const data = await backend.getRepos(query);
            commit('clearRepos');
            commit('setRepos', {repos: data});

        } catch(e) {
            // console.log("Retrieve data uploads error: ", e);
            commit('setError', {error: e.response.data.error});
        }

    },
}


const mutations = {
    setRepos(state, {repos}){
        // console.log("setDataUploads: ", dataUploads);
        state.repos = repos;
    },
    clearRepos(state){
        state.repos = null;
    },
    
    setSelectedFilterBy(state, selectedFilterBy){
        state.selectedFilterBy = selectedFilterBy
    },
    clearSelectedFilterBy(state){
        state.selectedFilterBy = null;
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
