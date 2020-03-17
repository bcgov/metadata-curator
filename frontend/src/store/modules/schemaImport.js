import { Backend } from '../../services/backend';
const backend = new Backend();

const state = {
    schema: null,
    schemaValidated: false,
    imported: false,
    error: null,
    successMsg: null
};

const getters = {
    errorMsg: ({error}) => {
      if(error) {
          return error.message;
          // if(error.validationErrors) { return error.message; }
          // return error;
      }
      return null;
    },
    validationErrorMsgs: ({error}) => {
        console.log("getters.validationErrorsDetails error: ", error);
        // let errorMsgs = [];

        if(error && error.validationErrors && error.validationErrors.length > 0) {
            const errorMsgs = error.validationErrors.map(item => item.message);
            return errorMsgs;
            // console.log("found error: ", error.validationErrors[0].message);
            // return error.validationErrors[0].message;
        }
        return null;
    }
}


const actions = {
    createSchema({ commit, state }) {
        // console.log("createSchema action: ", state.schema);
        commit('clearSuccessMsg');
        commit('clearError');

        backend.postSchema(state.schema).then(() => {
            commit('clearSchema');
            commit('setSuccessMsg', {message: "Successfully saved schema"});
        }).catch((e) => {
            console.log("create schema error: ", e);
            commit('setError', {error: e.response.data.error});
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
    setSuccessMsg(state, {message}){
        console.log("setSuccessMsg: ", message);
        state.successMsg = message;
    },
    clearSuccessMsg(state) {
        state.successMsg = null;
    },
    setError(state, { error }) {
        state.error = Object.assign({}, error);
    },
    clearError(state) {
        state.error = null;
    },
    // eslint-disable-next-line no-unused-vars
    resetState(state) {
        state = {
            schema: null,
            schemaValidated: false,
            imported: false,
            error: null,
            successMsg: null
        };
    }

}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
