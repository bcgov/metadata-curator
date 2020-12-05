import { Backend } from '../../services/backend';
const backend = new Backend();

const state = {
    mc_version: "",
    mc_hash: "",
    mc_v: "",
    mc_name: "",

    forum_version: "",
    forum_hash: "",
    forum_v: "",
    forum_name: "",

    tus_version: "",
    tus_hash: "", 
    tus_built: "", 
    tus_name: "",
};

const getters = {
}

const actions = {

    async getMC({state, commit}) {
        
        if ( (typeof(state.mc_version) === "undefined") || (state.mc_version === "") ){
            const data = await backend.getMcVersion();
            commit('setMC', {mc: data});
        }
        let mc = {version: state.mc_version, hash: state.mc_hash, v: state.mc_v, name: state.mc_name};
        return mc;
    },

    async getForum({state, commit}) {
        
        if ( (typeof(state.forum_version) === "undefined") || (state.forum_version === "") ){
            const data = await backend.getForumVersion();
            commit('setForum', {f: data});
        }
        let f = {version: state.forum_version, hash: state.forum_hash, v: state.forum_v, name: state.forum_name};
        return f;
    },

    async getTus({state, commit}) {
        
        if ( (typeof(state.tus_version) === "undefined") || (state.tus_version === "") ){
            const data = await backend.getTusVersion();
            commit('setTus', {tus: data});
        }
        let t = {version: state.tus_version, hash: state.tus_hash, built: state.tus_built, name: state.tus_name};
        return t;
    },
}


const mutations = {
    setMC(state, {mc}){
        state.mc_version = mc.version;
        state.mc_hash = mc.hash;
        state.mc_v = mc.v;
        state.mc_name = mc.name;
    },

    setForum(state, {f}){
        state.forum_version = f.version;
        state.forum_hash = f.hash;
        state.forum_v = f.v;
        state.forum_name = f.name;
    },

    setTus(state, {tus}){
        state.tus_version = tus.v;
        state.tus_hash = tus.hash;
        state.tus_built = tus.built;
        state.tus_name = tus.name;
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
