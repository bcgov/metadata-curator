import { Backend } from '../../services/backend';
const backend = new Backend();

const state = {
    schema: null,
    schemaValidated: false,
    imported: false,
    error: null
};

const getters = {

}


const actions = {
    createSchema({ commit, state }) {
        // console.log("createSchema action: ", state.schema);
        backend.postSchema(state.schema).then(() => {
            commit('clearSchema');

        }).catch((e) => {
            commit('setError', {error: e});
        });
    },


}

const mutations = {
    setSchema(state, {schema}){
        // console.log("setSchema: ", schema);
        state.schema = schema;
    },
    clearSchema(state){
        state.schema = null;
    },
    setError(state, { error }) {
        state.error = Object.assign({}, error);
    },
    clearError(state) {
        state.error = null;
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
