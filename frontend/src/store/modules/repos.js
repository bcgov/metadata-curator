import { Backend } from '../../services/backend';
const backend = new Backend();

import Vue from 'vue';

const state = {
    repos: [],
    branches: [],
    branch: {},
    repo: {},
    selectedRepo: null,
    selectedFilterBy: null,
    error: null,
};

const getters = {
}

const actions = {

    async getRepo({state, dispatch, commit}, {id}) {
        if ((typeof(state.repos) === "undefined") || (state.repos.length === 0)) {
            await dispatch('getRepos', {filterBy: ''});
        }
        let r = state.repos.find(repo => repo._id === id);
        commit('setRepo', {repo: r});
        return state.repo;
    },

    async getBranches({state, commit}, {repoId}) {
        const data = await backend.getRepoBranches(repoId);
        commit('setBranches', {branches: data});
        return state.branches;
    },

    async getBranchesByUpload({state, commit}, {uploadId}) {
        if (uploadId == -1){
            const data = await backend.getBranches();
            commit('setBranches', {branches: data});
            return state.branches; 
        }else{
            const data = await backend.getBranches({upload_id: uploadId});
            commit('setBranches', {branches: data});
            return state.branches;
        }
        
    },

    async getBranch({state, commit}, {id}) {
        let b = state.branches.find(branch => branch._id === id);
        commit('setBranch', {branch: b});
        return state.branch;
    },

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

    async saveRepo(){
        return backend.postRepo(state.repo);
    },

    async updateRepo(){
        return backend.putRepo(state.repo);
    },

    async saveBranch(){
        return backend.postRepoBranch(state.repo._id, state.branch);
    },

    async updateBranch(){
        return backend.putRepoBranch(state.repo._id, state.branch);
    },
}


const mutations = {
    setRepos(state, {repos}){
        state.repos = repos;
    },
    setRepo(state, {repo}){
        state.repo = repo;
    },

    setBranches(state, {branches}){
        state.branches = branches;
    },

    setBranch(state, {branch}){
        Vue.set(state, 'branch', branch);
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
    editRepo(state, {name, value}){
        state.repo[name] = value;
    },
    editBranch(state, {name, value}){
        state.branch[name] = value;
    },
    clearRepo(state){
        state.repo = {};
        state.branches = [];
    },
    clearBranch(state){
        state.branch = {};
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
