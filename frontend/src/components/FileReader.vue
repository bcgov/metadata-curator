<template>
    <v-container fluid>
        <v-row v-if="confirmChange" class="mb-2">
            <span>Warning, you have an upload in progress, if you change to uploading this file some progress will be lost</span>
            <v-btn color="warning" @click="changeConfirmed()">Confirm</v-btn>
        </v-row>
        <v-row v-if="confirmResume" class="mb-2">
            <span>We believe that this upload has already been started, resume? (if you believe this to be an error clear your cache)</span>
            <v-btn color="success" @click="resumeConfirmed()">Confirm</v-btn>
        </v-row>
        <v-row>
            <v-col cols=12>
                <v-file-input v-model="file" :disabled="disabled" counter show-size label="File input" style="margin-top:0px;padding-top:0px;"></v-file-input>
            </v-col>
            <v-col cols=12>
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
            </v-col>
        </v-row>
    </v-container>
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
            confirmChange: false,
            confirmResume: false,
            nextChunk: 1,
        }
    },

    computed: {
        ...mapState({
            blob: state => state.file.blob,
            encrypted: state => state.file.encrypted,
            jwt: state => state.user.jwt,
            uploadUrl: state => state.file.uploadUrl,
            fileSig: state => state.file.fileSig,
            successfullyUploadedChunks: state => state.file.successfullyUploadedChunks
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
        file(newVal){
            this.uploads = [];
            this.numChunks = 0;
            this.currChunk = 0;
            this.nextChunk = 1;
            let newFing = this.getFinger(newVal);

            if (this.fileSig !== "" && this.fileSig !== newFing){
                //Trying to change upload
                this.confirmChange = true;
                this.confirmResume = false;
            }else if (this.fileSig !== "" && this.fileSig === newFing){
                ///same upload resume
                this.confirmResume = true;
                this.confirmChange = false;
            }else{
                this.confirmChange = false;
                this.confirmResume = false;
                this.openFile();
            }
        }
    },

    methods: {
        getFinger: function(file){
            return file.name + "-" + file.type + "-" + file.size + "-" + file.lastModified;
        },

        resumeConfirmed: function(){
            this.confirmChange = false;
            this.confirmResume = false;
            this.openFile(true);
        },

        changeConfirmed: function(){
            this.confirmChange = false;
            this.confirmResume = false;
            this.openFile();
        },

        openFile: function(resume){
            if (typeof(resume) === "undefined"){
                resume = false;
            }

             if ( (this.readFile) && (this.file) ){    
                this.disabled = true;
                var self = this;
                this.pleaseWait = true;
                this.getNextChunk(0).then( () => {
                    self.numEncrypted += 1
                     if (resume){
                        this.nextChunk = -1;
                        let i = 0;
                        for (; i<this.successfullyUploadedChunks.length; i++){
                            if (typeof(this.successfullyUploadedChunks[i])==="undefined"){
                                this.currChunk = i-1;
                                this.nextChunk = i;
                                break;
                            }
                        }
                        if ((this.nextChunk === -1) && (i < this.numChunks) ){
                            this.nextChunk = i;
                        }else if(this.nextChunk === -1){
                            this.nextChunk = 1;
                        }
                        if (this.currChunk<0){
                            this.currChunk = 0;
                            this.nextChunk = 1;
                        }
                    }
                    self.disabled = false;
                    self.pleaseWait = false;
                });

            }else if ((!this.file) && (this.mutateVuex)){
                this.$store.commit('file/clearContent');
                self.$store.commit('file/setFileSig', {fileSig: ""});
            }
        },

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
                            self.$store.commit('file/setFileSig', {fileSig: ""});
                            self.$store.commit('file/setFileName', { fileName: self.file.name})
                            await self.$store.commit('file/setContent', { content: content, index: index});
                            let finger = self.getFinger(self.file);
                            self.$store.commit('file/setFileSig', {fileSig: finger});
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
                    self.$store.commit('file/setSuccessfullyUploadedChunk', {index: i, success: true});
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
                                    self.$store.commit('file/setFileSig', {fileSig: ""});
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
            this.getNextChunk(this.nextChunk).then( () => {
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
                        self.$store.commit('file/setFileSig', {fileSig: ""});
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
