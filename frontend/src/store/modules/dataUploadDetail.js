import { Backend } from '../../services/backend';
const backend = new Backend();

const state = {
    dataUpload: null,
    error: null,
};

const getters = {

}

const actions = {
    async getDataUpload({ commit }, dataUploadId) {
        await backend.getDataUpload(dataUploadId).then((data) => {
            commit('clearDataUpload');
            commit('setDataUpload', {dataUpload: data});

        }).catch((e) => {
            // console.log("Retrieve data upload error: ", e);
            commit('setError', {error: e.response.data.error});
        });
    },
   
    async updateDataUpload({ commit }, dataUpload) {
        try {
            dataUpload = await backend.putDataUpload(dataUpload);
            commit('setDataUpload', {dataUpload: dataUpload});
        } catch(e) {
            console.error("Unable to update data upload error: ", e);
            commit('setError', {error: e.response.data.error});
        }
    },


}


const mutations = {
    setDataUpload(state, {dataUpload}){
        state.dataUpload = dataUpload;
    },
    clearDataUpload(state){
        state.dataUpload = null;
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
