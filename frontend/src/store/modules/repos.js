import { Backend } from '../../services/backend';
const backend = new Backend();

import Vue from 'vue';

const state = {
    allRepos: [],
    repos: [],
    branches: [],
    branch: {},
    repo: {},
    selectedRepo: null,
    selectedFilterBy: null,
    error: null,
    comments: [],
    branchComments: [],
    recentlyFetchedBranchComments: false,
    revisions: [],
    revisionsLoading: false,
    branchRevisions: [],
    branchRevisionsLoading: false,
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

        dispatch('getRevisions', {id: r._id});

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

    async getBranch({state, commit, dispatch}, {id}) {
        let b = state.branches.find(branch => branch._id === id);
        commit('setBranch', {branch: b});
        dispatch('getBranchRevisions', {id: b._id});
        return state.branch;
    },

    async getBranchById({state, commit, dispatch}, {id}) {
        const data = await backend.getBranchById(id);
        commit('setBranch', {branch: data});
        dispatch('getBranchRevisions', {id: data._id});
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

    async getRevisions({commit}, {id}){
        commit('setRevisionsLoading', {loading: true});
        const data = await backend.getRepoRevs(id);
        commit('setRevisions', {revisions: data.revisions});
        commit('setRevisionsLoading', {loading: false});
    },

    async getBranchRevisions({commit}, {id}){
        commit('setBranchRevisionsLoading', {loading: true});
        const data = await backend.getBranchRevsById(id);
        commit('setBranchRevisions', {branchRevisions: data.revisions});
        commit('setBranchRevisionsLoading', {loading: false});
    },

    async getAllRepos({ commit }) {
        const query = {filterBy: null};

        try {
            const data = await backend.getRepos(query);
            commit('setAllRepos', {repos: data});

        } catch(e) {
            // console.log("Retrieve data uploads error: ", e);
            commit('setError', {error: e.response.data.error});
        }

    },

    async saveRepo({state}){
        return backend.postRepo(state.repo);
    },

    async updateRepo({state}){
        return backend.putRepo(state.repo);
    },

    async saveBranch({state}){
        let rId = (state.repo._id) ? state.repo._id : state.branch.repo_id;
        return backend.postRepoBranch(rId, state.branch);
    },

    async updateBranch({state}){
        return backend.putRepoBranch(state.repo._id, state.branch);
    },

    async getComments({ commit }, repoId) {
        
        try {
            const data = await backend.getCommentsByRepo(repoId);
            commit('clearComments');
            commit('setComments', {comments: data});
        } catch(e) {
            console.error("Retrieve comments error: ", e);
            commit('setError', {error: e.response.data.error});
        }
    },
    async addComment({ commit, dispatch }, {repoId, comment}) {
        
        try {
            await backend.postCommentByRepo(repoId, comment);
            dispatch('getComments', repoId);
        } catch(e) {
            console.error("Unable to add comment error: ", e);
            commit('setError', {error: e.response.data.error});
        }
    },

    async getBranchComments({ commit, state }, {branchId, force}) {
        if (typeof(force) === "undefined"){
            force = true;
        }

        try {
            let now = new Date();
            
            if (force || (now-state.recentlyFetchedBranchComments) >= 5000){ //force or not checked in last 5 seconds
                commit('setRecentlyFetchedBranchComments')
                const data = await backend.getCommentsByBranch(branchId);
                commit('clearBranchComments');
                if (data){
                    commit('setBranchComments', {comments: data});
                }
            }
        } catch(e) {
            console.error("Retrieve comments error: ", e);
            commit('setError', {error: e.response.data.error});
        }
    },
    async addBranchComment({ commit, dispatch }, {branchId, comment}) {
        
        try {
            await backend.postCommentByBranch(branchId, comment);
            dispatch('getBranchComments', {branchId: branchId});
        } catch(e) {
            console.error("Unable to add comment error: ", e);
            commit('setError', {error: e.response.data.error});
        }
    },
}


const mutations = {
    setRepos(state, {repos}){
        state.repos = repos;
    },
    setAllRepos(state, {repos}){
        state.allRepos = repos;
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

    setRevisions(state, { revisions }) {
        state.revisions = revisions;
    },
    setRevisionsLoading(state, { loading }) {
        state.revisionsLoading = loading
    },

    setBranchRevisions(state, { branchRevisions }) {
        state.branchRevisions = branchRevisions;
    },
    setBranchRevisionsLoading(state, { loading }) {
        state.branchRevisionsLoading = loading
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
        Vue.set(state.branch, name, value);
    },
    clearRepo(state){
        state.repo = {};
        state.branches = [];
    },
    clearBranch(state){
        state.branch = {};
    },
    setComments(state, {comments}){
        // console.log("setComments: ", comments);
        state.comments = comments;
    },
    clearComments(state){
        state.comments = [];
    },

    setBranchComments(state, {comments}){
        // console.log("setComments: ", comments);
        state.branchComments = comments;
    },
    setRecentlyFetchedBranchComments(state){
        state.recentlyFetchedBranchComments = new Date();
    },
    clearBranchComments(state){
        state.branchComments = [];
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
