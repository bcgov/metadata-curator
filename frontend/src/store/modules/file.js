import { Backend } from '../../services/backend';
const backend = new Backend();

const openpgp = require('openpgp');

const state = {
    content: [],
    fileName: "",
    blob: [],
    key: null,
    uploadUrl: "",
};

const getters = {
    getStringContent: (state) => () => {
        var textEncoding = require('text-encoding');
        var TextDecoder = textEncoding.TextDecoder;
        return new TextDecoder("utf-8").decode(state.content[0]);
    }
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
    // eslint-disable-next-line no-unused-vars
    resetState(state){
        console.log("file.js resetState");
        state =  {
            content: "",
            fileName: "",
            encrypted: false,
            blob: [],
            key: null,
            uploadUrl: "",
        };
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
