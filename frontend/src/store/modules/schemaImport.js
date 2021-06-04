import { Backend } from '../../services/backend';
const backend = new Backend();

const state = {
    tableSchema: null,
    dataPackageSchema: null,
    imported: false,
    error: null,
    successMsg: null
};

const getters = {
    errorMsg: ({error}) => {
      if(error) {
          return error.message;
      }
      return null;
    },
    validationErrorMsgs: ({error}) => {
        // let errorMsgs = [];

        if(error && error.validationErrors && error.validationErrors.length > 0) {
            const errorMsgs = error.validationErrors.map(item => item.message);
            return errorMsgs;
            // console.log("found error: ", error.validationErrors[0].message);
            // return error.validationErrors[0].message;
        }
        return [];
    },
    validationErrorsByResource: ({error}) => {

        if(error && error.validationErrorsByResource && error.validationErrorsByResource.length > 0) {
            return error.validationErrorsByResource;
        }
        return [];
    }
}


const actions = {
    createTableSchema({ commit, state }) {
        // console.log("createSchema action: ", state.tableSchema);
        commit('clearSuccessMsg');
        commit('clearError');

        backend.postTableSchema(state.tableSchema).then(() => {
            commit('clearTableSchema');
            commit('setSuccessMsg', {message: "Successfully saved table schema"});
        }).catch((e) => {
            commit('setError', {error: e.response.data.error});
        });
    },
    createDataPackageSchema({ commit, state }) {
        // console.log("createSchema action: ", state.tableSchema);
        commit('clearSuccessMsg');
        commit('clearError');

        backend.postDataPackageSchema(state.dataPackageSchema).then(() => {
            commit('clearDataPackageSchema');
            commit('setSuccessMsg', {message: "Successfully saved data package schema"});
        }).catch((e) => {
            commit('setError', {error: e.response.data.error});
        });
    },

}


const mutations = {
    setTableSchema(state, {schema}){
        // console.log("setSchema: ", schema);
        state.tableSchema = schema;
    },
    clearTableSchema(state){
        state.tableSchema = null;
    },
    setDataPackageSchema(state, {schema}){
        // console.log("setSchema: ", schema);
        state.dataPackageSchema = schema;
    },
    clearDataPackageSchema(state){
        state.dataPackageSchema = null;
    },
    setSuccessMsg(state, {message}){
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
            tableSchema: null,
            dataPackageSchema: null,
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
