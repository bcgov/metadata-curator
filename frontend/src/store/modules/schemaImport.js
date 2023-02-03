import Vue from 'vue';
import { Backend } from '../../services/backend';
const backend = new Backend();

const state = {
    tableSchema: null,
    dataPackageSchema: null,
    inferredSchema: null,
    imported: false,
    error: null,
    successMsg: null,
    tableSchemaId: -1,
    revisions: [],
    revisionsLoading: false,
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
    getTableSchema: async function({commit, dispatch}, {id: id}){
        commit('setTableSchemaId', {id: -1});
        let s = await backend.getTableSchema(id);
        if (s && s._id){
            commit('setTableSchemaId', {id: s._id});
            dispatch('getRevisions', {id: s._id});
        }
        commit('setTableSchemaM', {schema: s});
        return s;
    },

    async setTableSchema({commit}, {schema}){
        try{
            commit('clearSuccessMsg');
            commit('clearError');
            const Schema = require('tableschema').Schema;
            const DSchema = require('datapackage').Package
            if (schema && schema.resources && schema.resources[0] && schema.resources[0].schema){
                delete schema._id;
                delete schema.profile;
                delete schema.__v;
                delete schema.version;

                await DSchema.load(schema);
            }else if (schema){
                let s = schema;
                if (typeof(s) === "string"){
                    s = JSON.parse(s);
                }

                await Schema.load(s);
            }
            commit('setTableSchemaM', {schema: schema})
        }catch(ex){
            commit('setError', {error: "Invalid schema: " + ex.message});
        }
    },

    async getRevisions({commit}, {id}){
        commit('setRevisionsLoading', {loading: true});
        const data = await backend.getDataPackageRevs(id);
        commit('setRevisions', {revisions: data.revisions});
        commit('setRevisionsLoading', {loading: false});
    },

    getInferredSchema: async function({commit}, {id: id}){
        commit('setInferredSchema', {schema: null});
        let s = await backend.getTableSchema(id, false, true);
        commit('setInferredSchema', {schema: s});
        return s;
    },

    getDataPackage: async function({commit, dispatch}, {id: id}){
        commit('setDataPackageSchema', {schema: null});
        let s = await backend.getTableSchema(id);
        commit('setDataPackageSchema', {schema: s});
        if (s && s._id){
            dispatch('getRevisions', {id: s._id});
        }
        return s;
    },

    getDataPackageByUploadId: async function({commit, dispatch}, {id: id}){
        commit('setDataPackageSchema', {schema: null});
        let s = await backend.getTableSchema(id, true);
        if (s && s.length > 0){
            commit('setDataPackageSchema', {schema: s[0]});
            if (s && s[0] && s[0]._id){
                dispatch('getRevisions', {id: s[0]._id});
            }
        }
        return s;
    },

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

    createDataPackageSchemaInferred({ commit, state }){
        let i = JSON.parse(JSON.stringify(state.dataPackageSchema));
        i.inferred = true;

        backend.postDataPackageSchema(i).then(() => {
            commit('clearDataPackageSchema');
            commit('setSuccessMsg', {message: "Successfully saved data package schema"});
        }).catch((e) => {
            commit('setError', {error: {message: e.response.data.error}});
        });

    },

    async updateDataPackageSchema({commit, state}){

        commit('clearSuccessMsg');
        commit('clearError');

        try{
            let res = await backend.putDataPackageSchema(state.tableSchemaId, state.tableSchema);
            console.log('UPDATE_RESULT:= ');
            console.log(res);
            commit('setSuccessMsg', {message: "Successfully updated data package schema"});
        }catch(e){
            console.log('UPDATE_DATA_PACKAGE_SCHEMA_ERROR:==');
            console.log(e);
            commit('setError', {error: e.response.data.error});
        }
    }

/*    async updateDataPackageSchema({commit, state}){

        commit('clearSuccessMsg');
        commit('clearError');

        await backend.putDataPackageSchema(state.tableSchemaId, state.tableSchema).then(() => {
            commit('setSuccessMsg', {message: "Successfully updated data package schema"});
        }).catch((e) => {
            commit('setError', {error: {message:e.response.data.error}});
        });
    }
*/
}


const mutations = {
    setTableSchemaM(state, {schema}){
        // console.log("setSchema: ", schema);
        Vue.set(state, 'tableSchema', schema);
    },
    setTableSchemaId(state, {id}){
        // console.log("setSchema: ", schema);
        Vue.set(state, 'tableSchemaId', id);
    },
    clearTableSchema(state){
        state.tableSchema = null;
    },
    setDataPackageSchema(state, {schema}){
        // console.log("setSchema: ", schema);
        state.dataPackageSchema = schema;
    },
    setInferredSchema(state, {schema}){
        // console.log("setSchema: ", schema);
        state.inferredSchema = schema;
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
        state.error = error;
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
    },

    setRevisions(state, { revisions }) {
        state.revisions = revisions;
    },
    setRevisionsLoading(state, { loading }) {
        state.revisionsLoading = loading
    },

}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
