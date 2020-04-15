import { Backend } from '../../services/backend';
const backend = new Backend();

const openpgp = require('openpgp');

const state = {
    content: "",
    fileName: "",
    encrypted: false,
    blob: [],
    uploadContent: "",
    key: null,
    uploadUrl: "",
};

const getters = {
    getStringContent: (state) => () => {
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

        // let uint8 = new TextEncoder("utf-8").encode(state.content);
        // eslint-disable-next-line
        // console.log("uint8 size", uint8.length);
        var cipherText = await openpgp.encrypt({
            message: await openpgp.message.fromBinary(state.content), // input as Message object
            publicKeys: (await openpgp.key.readArmored(state.key)).keys,
            compression: openpgp.enums.compression.zip,
            format: 'binary',

        })//.then( async (cipherText) => {
            // eslint-disable-next-line
            //console.log("encrypted text", cipherText.data)
            //commit('setBlob', {content: cipherText.data} );

            commit('addBlob', {blob: new Blob([cipherText.data])} );
            // commit('addBlob', {blob: new Blob([state.content])} );

            // openpgp.decrypt({
            //     message: await openpgp.message.readArmored(cipherText.data),
            //     passwords: ['secret stuff'],
            //     armor: true
            // }).then( decryp => {
            //     console.log("sanity check", decryp);
            // });

        //});

        commit('setEncrypted', { encrypted: true });
        return true;
    },

    async encryptUploadContent({commit, state}){
        await openpgp.initWorker({ path: '/js/openpgp.worker.min.js' }, 3); // set the relative web worker path

        commit('clearBlob');

        var cipherText = await openpgp.encrypt({
            message: await openpgp.message.fromBinary(state.uploadContent), // input as Message object
            publicKeys: (await openpgp.key.readArmored(state.key)).keys,
            compression: openpgp.enums.compression.zip,
            format: 'binary',
        });

        commit('addBlob', {blob: new Blob([cipherText.data])} );
        // commit('addBlob', {blob: new Blob([state.uploadContent])} );
    },
}

const mutations = {
    setContent(state, {content}){
        state.content = content;
        state.encrypted = false;
    },

    setUploadContent(state, {content}){
        var textEncoding = require('text-encoding');
        var TextDecoder = textEncoding.TextDecoder;
        
        var currC = new TextDecoder("utf-8").decode(state.content);
        var newC = new TextDecoder("utf-8").decode(content);

        console.log("upload c = c", currC === newC);
        if (state.uploadContent !== ""){
            var prevC = new TextDecoder("utf-8").decode(state.uploadContent);
            console.log("upload c = prev upload c", prevC === newC);
        }
        state.uploadContent = content;
    },

    setFileName(state, { fileName }){
        state.fileName = fileName;
    },
    setEncrypted(state, { encrypted }){
        state.encrypted = encrypted;
    },
    setBlob(state, { content }){
        let blobParts = [];
        let piece = content;
        blobParts.push(new Blob([piece]));
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
