import { Backend } from '../../services/backend';
const backend = new Backend();

import Vue from 'vue';

const openpgp = require('openpgp');

const state = {
    content: [],
    fileHandles: {},
    fileName: "",
    blob: [],
    key: null,
    uploadUrl: "",
    fileSig: {},
    successfullyUploadedChunks: {},
};

const getters = {
    getStringContent: (state) => () => {
        var textEncoding = require('text-encoding');
        var TextDecoder = textEncoding.TextDecoder;
        return new TextDecoder("utf-8").decode(state.content[0]);
    },

    getPublicKey: (state) => async () => {
        if (state.publicKey == null){
            let data = await backend.getPublicKey();
            console.log("GET PK", data);
            return data.key
        }
        return state.publicKey;
    },
}

async function encrypt(commit, clear, content, key, replaceIndex){
    await openpgp.initWorker({ path: '/js/openpgp.worker.min.js' }, 3); // set the relative web worker path

    if (clear){
        commit('clearBlob');
    }

    return openpgp.encrypt({
        message: await openpgp.message.fromBinary(content), // input as Message object
        publicKeys: (await openpgp.key.readArmored(key)).keys,
        compression: openpgp.enums.compression.zip,
        format: 'binary',

    }).then( async (cipherText) => {
        if (replaceIndex === -1){
            commit('addBlob', {blob: new Blob([cipherText.data])} );
        }else{
            commit('setBlob', {index: replaceIndex, blob: new Blob([cipherText.data])} );
        }
    });

}

const actions = {
    async getUploadUrl({commit, state}){

        if ( (state.uploadUrl === null) || (state.uploadUrl === "") ){
            backend.getUploadUrl().then( (data) => {
                commit('setUploadUrl', {uploadUrl: data.url});
            });
        }


    },
    async encryptContent({commit, state}, {index, clear, content}){

        if (state.publicKey == null){
            let data = await backend.getPublicKey();
            commit('setPublicKey', {key: data.key});   
        }
    
        if (state.uploadUrl === ""){
            backend.getUploadUrl().then( (data) => {
                commit('setUploadUrl', {uploadUrl: data.url});
            });
        }

        let rI = index;
        if ( (content.length-1) <= index ){
            //add blob
            rI = -1;
        }

        await encrypt(commit, clear, content, state.key, rI);

        return true;
    }
}

const mutations = {
    clearContent(state){
        state.content = [];
    },

    setContent(state, {content, index}){
        if (index > state.content.length){
            state.content[index] = content;
        }else{
            state.content.push(content);
        }
    },

    setFileName(state, { fileName }){
        state.fileName = fileName;
    },

    setFileSig(state, { fileSig }){
        Vue.set(state.fileSig, fileSig, true);
    },

    clearFileSig(state, { fileSig }){
        Vue.delete(state.successfullyUploadedChunks, fileSig);
        Vue.delete(state.fileSig, fileSig);
    },

    setFileHandles(state, { handles }){
        state.fileHandles = handles;
    },

    addFileHandleIfNotPresent(state, { handle, fileSig }){
        if (typeof(state.fileHandles) !== "object"){
            state.fileHandles = {};
        }
        let keys = Object.keys(state.fileHandles);
        for (let i=0; i<keys.length; i++){
            if ( (typeof(state.fileHandles) !== "undefined") && (typeof(state.fileHandles[keys[i]]) !== "undefined") && (state.fileHandles[keys[i]] !== null) ){
                //if this is true it only has a signature which is what happens when the handle is removed from the store
                if (typeof(state.fileHandles[keys[i]].name) === "undefined"){
                    Vue.delete(state.fileHandles, keys[i]);
                }
            }
        }
        if (typeof(state.fileHandles[fileSig]) === "undefined"){
            Vue.set(state.fileHandles, fileSig, handle);
        }
    },

    clearFileHandles(state){
        state.fileHandles = {};
    },

    setSuccessfullyUploadedChunk(state, {fing, index, success}){
        if (typeof(state.successfullyUploadedChunks[fing]) === "undefined"){
            state.successfullyUploadedChunks[fing] = [];
        }
        state.successfullyUploadedChunks[fing][index] = success;
    },

    setBlob(state, { blob, index }){
        state.blob[index] = blob;
    },
    addBlob(state, { blob }){
        state.blob.push(blob);
    },
    clearBlob(state){
        state.blob = [];
    },
    setPublicKey(state, { key }){
        state.key = key;
    },
    setUploadUrl(state, { uploadUrl }){
        state.uploadUrl = uploadUrl;
    },
    
    // eslint-disable-next-line
    resetState(state){
        console.log("file.js resetState");

        state = {
            content: [],
            fileHandles: {},
            fileName: "",
            blob: [],
            key: null,
            uploadUrl: "",
            fileSig: {},
            successfullyUploadedChunks: {},
        }
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
