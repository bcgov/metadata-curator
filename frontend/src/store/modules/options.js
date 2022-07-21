import { Backend } from '../../services/backend';
const backend = new Backend();

import Vue from 'vue';

const state = {
    options: [],
    option: {},
    optionsByType: {},
    error: null,
};

const getters = {
    getOptionById: (state) => (id) => {
        if (state.options.length > 0){
            return state.options.find(option => option._id === id);
        }
        return {};
    },

    getOptionFromListByType: (state, dispatch) => async function(type){
        if (state.options.length <= 0){
            await dispatch('getOptions');
        }

        return state.options.find( (opt) => { opt.type.toLowerCase() === type.toLowerCase() });

    },
}

const actions = {
    async getOptions({ state, commit }, {filterBy, refresh}) {
        if (typeof(refresh) === 'undefined'){
            refresh = true;
        }

        const query = {filterBy: filterBy};

        try {
            if (refresh || state.options.length <= 0){
                const data = await backend.getOptions(query);
                commit('clearOptions');
                commit('setOptions', {options: data});
            }

        } catch(e) {
            // console.log("Retrieve data uploads error: ", e);
            commit('setError', {error: e.response.data.error});
        }

    },

    async getOptionById({commit}, {id}){
        try{
            commit('clearOption');
            const data = await backend.getOption(id);
            commit('setOption', {option: data});
        }catch(e){
            commit('setError', {error: e.response.data.error})
        }
    },

    async saveOption({commit}, {option}){
        try{
            const data = await backend.postOption(option);
            commit('setOption', {option: data});
        }catch(e){
            commit('setError', {error: e.response.data.error})
        }
    },
    
    async updateOption({commit}, {option}){
        try{
            const data = await backend.putOption(option);
            commit('setOption', {option: data});
        }catch(e){
            commit('setError', {error: e.response.data.error})
        }
    },
}


const mutations = {
    setOptions(state, {options}){
        Vue.set(state, 'options', options);
    },
    clearOptions(state){
        Vue.set(state, 'options', {});
    },

    setOption(state, {option}){
        Vue.set(state, 'option', option);
    },
    
    setError(state, { error }) {
        state.error = Object.assign({}, error);
    },
    clearError(state) {
        state.error = null;
    },

    clearOption(state){
        Vue.set(state, 'option', {});
    },
    
    editOption(state, {name, value}){
        Vue.set(state.option, name, value);
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
