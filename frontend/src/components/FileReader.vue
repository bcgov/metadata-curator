<template>
    <span>
        <v-file-input v-model="file" counter show-size label="File input" style="margin-top:0px;padding-top:0px;"></v-file-input>
        <v-btn v-if="showEncryptButton" @click="encrypt">Encrypt</v-btn>
        <v-btn v-if="showUploadButton" @click="upload">Upload</v-btn>
        <v-btn v-if="showImportButton" @click="onImportButtonClicked">Import</v-btn>
    </span>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {

    props: {
        label: {
            type: String,
            default: "File input"
        },
        readFile: {
            type: Boolean,
            default: true
        },
        mutateVuex: {
            type: Boolean,
            default: true
        },
        showEncryptButton: {
            type: Boolean,
            default: true
        },
        showUploadButton: {
            type: Boolean,
            default: true
        },
        showImportButton: {
            type: Boolean,
            default: false
        },
    },

    data() {
        return {
            file: null,
            fileContent: ""
        }
    },

    computed: {
        ...mapState({
            blob: state => state.file.blob,
            encrypted: state => state.file.encrypted,
            jwt: state => state.user.jwt,
            uploadUrl: state => state.file.uploadUrl
        }),
        ...mapGetters({
            getStringContent: 'file/getStringContent'
        }),

    },

    watch: {
        file(){

            if (this.readFile){
                var reader = new FileReader();
                var self = this;
                reader.onload = function(e){
                    if (this.mutateVuex !== ""){
                        // console.log("watch filename: " + self.file.name);
                        self.$store.commit('file/setContent', { content: new Uint8Array(e.target.result)})
                        self.$store.commit('file/setFileName', { fileName: self.file.name})
                    }else{
                        self.fileContent = e.target.result;
                    }
                }
                reader.readAsArrayBuffer(this.file);

            }
        }
    },

    methods: {
        encrypt: function(){
            this.$store.dispatch('file/encryptContent');
        },
        upload: function(){
            var i = 0;
            var uploads = [];
            var tus = require("tus-js-client");
            var fing = function(file, options, callback){
                return callback(null, [
                    "tus-br",
                    file.name,
                    file.type,
                    file.size,
                    file.lastModified,
                    i, //the chunk
                    options.endpoint
                ].join("-"));
            }
            var uploadOptions = {
                endpoint: this.uploadUrl,
                fingerprint: fing,
                headers: {
                    "Upload-Concat": "partial"
                },
                metadata: {
                filename: this.file.name,
                    filetype: this.file.type,
                    jwt: this.jwt
                },
                retryDelays: [0, 1000, 3000, 5000],
                chunkSize: 52000000,
                onError: error => {
                    // eslint-disable-next-line
                    console.log("Upload error", error)
                },
                onProgress: (bytesUploaded, bytesTotal) => {
                    // eslint-disable-next-line
                    console.log("Upload progress " + bytesUploaded + "/" + bytesTotal);
                },
                onSuccess: () => {
                    i += 1;
                    // eslint-disable-next-line
                    console.log("Upload " + (i) + "/" + (this.blob.length) +"finished",);

                    if (i<this.blob.length){

                        let u2 = new tus.Upload(this.blob[i], uploadOptions);
                        u2.start();
                        uploads.push(u2);
                    }else if ( (i !== 1) && (i == this.blob.length) ){
                        let joinIds = [];
                        for (let j=0; j<uploads.length; j++){
                            joinIds.push(uploads[j].url);
                        }
                        uploadOptions.headers = {
                            "Upload-Concat": "final; " + joinIds.join(" ")
                        };
                        let u2 = new tus.Upload(this.blob[i-1], uploadOptions);
                        u2.start();
                    }
                },
            }
            if (this.blob.length === 1){
                uploadOptions.headers = {};
            }
            let u = new tus.Upload(this.blob[i], uploadOptions);
            uploads.push(u);
            u.start();
        },
        onImportButtonClicked: function(){
            // console.log("onImportButtonClicked");
            const content = this.getStringContent();
            this.$emit('import-button-clicked', content);
        },
    }

}
</script>

<style scoped>

</style>
