<template>
    <span>
        <v-file-input v-model="file" :disabled="disabled" counter show-size label="File input" style="margin-top:0px;padding-top:0px;"></v-file-input>
        <v-btn v-if="showUploadButton" :disabled="disabled" @click="upload">Upload</v-btn>
        <v-btn v-if="showImportButton" :disabled="disabled" @click="onImportButtonClicked">Import</v-btn>
        <div v-if="pleaseWait">
            <v-progress-circular
                indeterminate
            ></v-progress-circular>
            <span>Please wait while the first bit of the file is encrypted...</span>
        </div>
        <div v-if="showProgress">
            <span>
                {{progressMessage1}}
            </span>
            <br />
            <span>
                {{progressMessage2}}
            </span> 
            <br />
            <span>
                {{progressMessage3}}
                <v-progress-linear :value="(up1Progress/up1Size)*100"></v-progress-linear>
            </span>
            <br />
            <span>
                {{progressMessage4}}
                <v-progress-linear :value="(up2Progress/up2Size)*100"></v-progress-linear>
            </span>
            <br />
        </div>
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
            numEncrypted: 0,

            numUploaded: 0,
            up1Size: 0,
            up1Progress: 0,
            up2Size: 0,
            up2Progress: 0,
            showProgress: false,
            pleaseWait: false,
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

        progressMessage1: function(){
            return `Encrypted: ${this.numEncrypted}/${this.numChunks}` 
        },
        progressMessage2: function(){
            return `Uploaded: ${this.numUploaded}/${this.numChunks}` 
        },
        progressMessage3: function(){
            return `Upload 1: ${this.up1Progress}/${this.up1Size}` 
        },
        progressMessage4: function(){
            return `Upload 2: ${this.up2Progress}/${this.up2Size}` 
        }

    },

    watch: {
        file(){
            this.uploads = [];
            this.numChunks = 0;
            this.currChunk = 0;
            
            if ( (this.readFile) && (this.file) ){    
                this.disabled = true;
                var self = this;
                this.pleaseWait = true;
                this.getNextChunk(0).then( () => {
                    self.numEncrypted += 1
                    self.disabled = false;
                    self.pleaseWait = false;
                });

            }else if ((!this.file) && (this.mutateVuex)){
                this.$store.commit('file/clearContent');
            }
        }
    },

    methods: {

        getNextChunk: async function(index){
            return new Promise((resolve, reject) => {

                var reader = new FileReader();
                var self = this;
                reader.onerror = function(e){
                    reject(e);
                }

                reader.onload = async function(e){
                    if (self.mutateVuex === true){
                        // console.log("watch filename: " + self.file.name);
                        
                        let content = new Uint8Array(e.target.result);

                        if (self.offset === 0){
                            self.$store.commit('file/setFileName', { fileName: self.file.name})
                            await self.$store.commit('file/setContent', { content: content, index: index})
                        }

                        self.$store.dispatch('file/encryptContent', {clear: self.offset === 0, index: index, content: content}).then( () => {
                            resolve(e.target.result);
                        });
                        
                    }else{
                        self.fileContent = e.target.result;
                        resolve(e.target.result)
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
            this.showProgress = true;
            var i = 0;
            var self = this;
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
                    this.up1Progress = bytesUploaded;
                    this.up1Size = bytesTotal;
                },
                onSuccess: async() => {
                    i += 1;
                    this.numUploaded += 1;

                    if ( (i+1) <= this.numChunks){
                        let chunkIndex = 2;
                        this.getNextChunk(chunkIndex).then( () => {
                            self.numEncrypted += 1
                            if ((i<self.numChunks) && (self.blob[chunkIndex].size > 0)){
                                uploadOptions.onProgress = function(byteUp, byteTot){
                                    self.up2Progress = byteUp;
                                    self.up2Size = byteTot;
                                }
                                let u2 = new tus.Upload(self.blob[chunkIndex], uploadOptions);
                                u2.start();
                                self.uploads.push(u2);
                            }else if ( (i !== 1) && (i >= self.numChunks) ){
                                let joinIds = [];
                                for (let j=0; j<self.uploads.length; j++){
                                    let url = self.uploads[j].url.substring(self.uploads[j].url.substring(9).indexOf("/")+9);
                                    joinIds.push(url);
                                }
                                backendApi.concatenateUpload(joinIds, self.uploadUrl, self.jwt, "1.0.0").then( () => {
                                    self.numUploaded += 1;
                                    self.disabled = false;
                                }).catch( (/*e*/) => {
                                    // eslint-disable-next-line
                                    console.log("Concatenation error", error);
                                    self.disabled = false;
                                });
                            }
                        });
                    }                        
                },
            }

            if (this.blob[0].size <= this.chunkSize){
                uploadOptions.headers = {};
            }

            let u = new tus.Upload(this.blob[0], uploadOptions);
            this.uploads.push(u);
            this.getNextChunk(1).then( () => {
                self.numEncrypted += 1
                let chunkIndex = 1;
                i += 1;
                if ((i<self.numChunks) && (self.blob[chunkIndex].size > 0)){
                    let u2 = new tus.Upload(self.blob[chunkIndex], uploadOptions);
                    u2.start();
                    self.uploads.push(u2);
                }else if ( (i !== 1) && (i >= self.numChunks) ){
                    let joinIds = [];
                    for (let j=0; j<self.uploads.length; j++){
                        let url = self.uploads[j].url.substring(self.uploads[j].url.substring(9).indexOf("/")+9);
                        joinIds.push(url);
                    }
                    backendApi.concatenateUpload(joinIds, self.uploadUrl, self.jwt, "1.0.0").then( () => {
                        self.numUploaded += 1;
                        self.disabled = false;
                    }).catch( (/*e*/) => {
                        // eslint-disable-next-line
                        console.log("Concatenation error", error);
                        self.disabled = false;
                    });
                }
            });
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
