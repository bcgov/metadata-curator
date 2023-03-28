import { Backend } from '../../services/backend';
const backend = new Backend();

const state = {
    dataUploads: [],
    dataProviders: [],
    selectedDataUpload: null,
    selectedFilterBy: null,
    selectedDataProviders: [],
    error: null,
};

const getters = {
    // eslint-disable-next-line no-unused-vars
    getDataUploadById: (state, getters) => (id) => {
        return state.dataUploads.find(upload => upload._id === id);
    },
    // eslint-disable-next-line no-unused-vars
    getSearchResults: (state, getters) => {
        return state.dataUploads;
    }
}

const actions = {
    async getDataUploads({ commit }, {filterBy, providerGroups}) {
        const query = {filterBy: filterBy, providerGroups: providerGroups ? providerGroups : undefined};

        try {
            const data = await backend.getDataUploads(query);
            commit('clearDataUploads');
            commit('setDataUploads', {dataUploads: data});

        } catch(e) {
            // console.log("Retrieve data uploads error: ", e);
            commit('setError', {error: e.response.data.error});
        }

    },

    async getDataProviders({ commit }) {
        try {
            const data = await backend.getDataProviders();
            let providers = data.map(item => {return {name: item, value: item}});
            providers.unshift({name: "All data providers", value: 'all'});
            commit('clearDataProviders');
            commit('setDataProviders', {dataProviders: providers});
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
    setDataProviders(state, {dataProviders}){
        state.dataProviders = dataProviders
    },
    clearDataProviders(state){
        state.dataProviders = null;
    },
    setSelectedFilterBy(state, selectedFilterBy){
        state.selectedFilterBy = selectedFilterBy
    },
    clearSelectedFilterBy(state){
        state.selectedFilterBy = null;
    },
    setSelectedDataProviders(state, selectedDataProviders){
        state.selectedDataProviders = [...selectedDataProviders];
    },
    clearSelectedDataProviders(state){
        state.selectedDataProviders = [];
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
