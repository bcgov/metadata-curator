import { Backend } from '../../services/backend';
const backend = new Backend();

const openpgp = require('openpgp');

const CHUNK_SIZE = 5242880;

const state = {
    content: "",
    fileName: "",
    encrypted: false,
    blob: [],
    key: null,
    uploadUrl: "",
};

const getters = {
    getStringContent: (state) => {
        var textEncoding = require('text-encoding'); 
        var TextDecoder = textEncoding.TextDecoder;
        return new TextDecoder("utf-8").decode(state.content);
    }
}

const actions = { 
    async encryptContent({commit, state}){
        await openpgp.initWorker({ path: '/js/openpgp.worker.min.js' }, 3); // set the relative web worker path

        if (state.encrypted){
            return true;
        }

        if (state.publicKey == null){
            let data = await backend.getPublicKey();
            commit('setPublicKey', {key: data.key});
        }

        if (state.uploadUrl === ""){
            let data = await backend.getUploadUrl();
            commit('setUploadUrl', {uploadUrl: data.url});
        }
        commit('clearBlob');
        // var textEncoding = require('text-encoding'); 
        // var TextEncoder = textEncoding.TextEncoder;
        for (let i=0; i<state.content.length; i+=CHUNK_SIZE){
            //let uint8 = new TextEncoder("utf-8").encode(state.content.substring(i, i+CHUNK_SIZE));
            // let uint8 = new TextEncoder("utf-8").encode(state.content);
            // eslint-disable-next-line
            // console.log("uint8 size", uint8.length);
            var cipherText = await openpgp.encrypt({
                message: await openpgp.message.fromBinary(state.content.slice(i, i+CHUNK_SIZE)), // input as Message object
                publicKeys: (await openpgp.key.readArmored(state.key)).keys,
                compression: openpgp.enums.compression.zip,
                format: 'binary',
            
            })//.then( async (cipherText) => {
                // eslint-disable-next-line
                //console.log("encrypted text", cipherText.data)
                //commit('setBlob', {content: cipherText.data} );
                
                while (cipherText.data.length < CHUNK_SIZE){
                    cipherText.data+= (cipherText.data.length === CHUNK_SIZE-1) ? "\n" : " ";
                }
    
                
                commit('addBlob', {blob: new Blob([cipherText.data])} );

                // openpgp.decrypt({
                //     message: await openpgp.message.readArmored(cipherText.data),
                //     passwords: ['secret stuff'],
                //     armor: true
                // }).then( decryp => {
                //     console.log("sanity check", decryp);
                // });

            //});
        }
        commit('setEncrypted', { encrypted: true });
            

        
    },
}

const mutations = {
    setContent(state, {content}){
        state.content = content;
        state.encrypted = false;
    },
    setFileName(state, { fileName }){
        state.fileName = fileName;
    },
    setEncrypted(state, { encrypted }){
        state.encrypted = encrypted;
    },
    setBlob(state, { content }){
        let blobParts = [];
        for (let i=0; i<content.length; i+=CHUNK_SIZE){
            let piece = content.substring(i, (i+CHUNK_SIZE));
            blobParts.push(new Blob([piece]));
        }
        state.blob = blobParts;
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
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}