<template>
    <span>
        <v-file-input v-model="file" :disabled="disabled" counter show-size label="File input" style="margin-top:0px;padding-top:0px;"></v-file-input>
        <v-btn v-if="showUploadButton" :disabled="disabled" @click="upload">Upload</v-btn>
        <v-btn v-if="showImportButton" :disabled="disabled" @click="onImportButtonClicked">Import</v-btn>
    </span>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { Backend } from '../services/backend';

let backendApi = new Backend();

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
            fileContent: "",
            offset: 0,
            chunkSize: 5 * 1024 * 1025, // 5mb
            disabled: false,
            numChunks: 0,
            uploads: [],
            currChunk: 0,
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
        })

    },

    watch: {
        async file(){
            this.uploads = [];
            this.numChunks = 0;
            this.currChunk = 0;
            
            if ( (this.readFile) && (this.file) ){    
                this.disabled = true;
                await this.getNextChunk();
                this.disabled = false;

            }else if ((!this.file) && (this.mutateVuex)){
                this.$store.commit('file/setContent', { content: new Uint8Array() } );
            }
        }
    },

    methods: {

        getNextChunk: function(){
            return new Promise((resolve, reject) => {

                var reader = new FileReader();
                var self = this;
                reader.onerror = function(e){
                    reject(e);
                }

                reader.onload = async function(e){
                    if (self.mutateVuex === true){
                        // console.log("watch filename: " + self.file.name);
                        if (self.offset === 0){
                            await self.$store.commit('file/setContent', { content: new Uint8Array(e.target.result)})
                            self.$store.commit('file/setFileName', { fileName: self.file.name})
                            await self.$store.dispatch('file/encryptContent');
                            resolve(e.target.result);
                        }else{
                            await self.$store.commit('file/setUploadContent', { content: new Uint8Array(e.target.result)})
                            await self.$store.dispatch('file/encryptUploadContent');
                            resolve(e.target.result);
                        }
                    }else{
                        self.fileContent = e.target.result;
                    }
                    //see below comment for why this is floor instead of ceil
                    self.numChunks = Math.floor(self.file.size / self.chunkSize);
                    self.offset += self.chunkSize;
                }
                
                this.currChunk += 1;
                if (this.currChunk < this.numChunks){
                    reader.readAsArrayBuffer(this.file.slice(this.offset, (this.offset + this.chunkSize)));
                }else{
                    //this last chunk can be bigger than the rest because each chunk needs to 
                    //be at least 5mb due to s3/minio restrictions 
                    //and with ceil that can't be guaranteed
                    //note it can be at most (2*chunkSize)-1
                    reader.readAsArrayBuffer(this.file.slice(this.offset));
                }
            });
            
        },

        upload: function(){
            this.disabled = true;
            var i = 0;
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
                    this.disabled = false;
                },
                onProgress: (bytesUploaded, bytesTotal) => {
                    // eslint-disable-next-line
                    console.log("Upload progress " + bytesUploaded + "/" + bytesTotal);
                },
                onSuccess: async() => {
                    i += 1;

                    if (i<=this.numChunks){
                        await this.getNextChunk();
                    }

                    if ((i<=this.numChunks) && (this.blob[0].size > 0)){
                        let u2 = new tus.Upload(this.blob[0], uploadOptions);
                        u2.start();
                        this.uploads.push(u2);
                    }else if ( (i !== 1) && (i >= this.numChunks) ){
                        let joinIds = [];
                        for (let j=0; j<this.uploads.length; j++){
                            let url = this.uploads[j].url.substring(this.uploads[j].url.substring(9).indexOf("/")+9);
                            joinIds.push(url);
                        }
                        backendApi.concatenateUpload(joinIds, this.uploadUrl, this.jwt, "1.0.0").then( () => {
                            this.disabled = false;
                        }).catch( (/*e*/) => {
                            // eslint-disable-next-line
                            console.log("Concatenation error", error);
                            this.disabled = false;
                        });
                        
                        //let u2 = new tus.Upload(this.blob[0], uploadOptions);
                        //u2.start();
                        
                    }
                },
            }
            if (this.blob.length === 1){
                uploadOptions.headers = {};
            }
            let u = new tus.Upload(this.blob[0], uploadOptions);
            this.uploads.push(u);
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
