import md5 from 'md5';

const state = {
    content: "",
    fileName: ""
};

const getters = {
}

const actions = { 
    encryptContent({commit, state}){
        commit('setContent', { content: md5(state.content) });
    }
}

const mutations = {
    setContent(state, {content}){
        state.content = content;
    },
    setFileName(state, { fileName }){
        state.fileName = fileName;
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}