<template>
    <v-container fluid>
        <v-alert
            type="error"
            v-if="error">
            {{error}}
        </v-alert>
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
                <v-file-input v-model="file" :disabled="disabled" show-size label="File input" class="mt-0 pt-0"></v-file-input>
            </v-col>
        </v-row>
        <v-row class="my-0 py-0" v-if="admin">
            <v-col cols=12>
                <span class="fineText">Using Chunksize for your computer: {{Math.ceil(chunkSize / 1024 / 1024)}}mb</span>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols=12>
                <v-btn v-if="showUploadButton" :disabled="disabled" @click="upload">Upload</v-btn>
                <v-btn v-if="showImportButton" :disabled="disabled" @click="onImportButtonClicked">Import</v-btn>
                <!-- <div v-if="pleaseWait">
                    <v-progress-circular
                        indeterminate
                    ></v-progress-circular>
                    <span>Please wait while the first bit of the file is encrypted...</span>
                </div> -->
                <div v-if="showProgress">
                    <div>
                        Please note: encryption and uploading occur in chunks.  It is not unusual for there to be a 
                        significant delay between one upload progress bar finishing and the next starting as encryption is 
                        occurring and can take quite some time to complete.
                    </div>
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

const openpgp = require('openpgp');

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
        clearFile: {
            type: Boolean,
            default: false
        },
        showUploadButton: {
            type: Boolean,
            default: true
        },
        showImportButton: {
            type: Boolean,
            default: false
        },
        triggerUpload: {
            type: Boolean,
            default: false,
        },
        index: {
            type: Number,
            default: 0
        },
        loadFromStore: {
            type: String,
            default: ""
        },
        disabledProp: {
            type: Boolean,
            default: false
        },
        ignoreDuplicates: {
            type: Boolean,
            default: false
        },
        appendMetadata: {
            type: Object,
            default: () => { return {} }
        }
    },

    mounted() {
        if (this.loadFromStore !== ""){
            this.file = this.handles[this.loadFromStore];
            this.openFile(true);
        }
    },

    data() {
        let defChunkSize = (5 * 1000 * 1000) + 1; // 5mb
        //ram converted to bytes divided by 128 (arbitrary)
        let customChunkSize = Math.ceil(navigator.deviceMemory * 1024 * 1024 * 1024 / 128);
        let disProp = this.disabledProp ? this.disabledProp : false;
        return {
            file: null,
            fileContent: "",
            offset: 0,
            chunkSize: (customChunkSize > defChunkSize) ? customChunkSize : defChunkSize,
            disabled: disProp,
            numChunks: 0,
            uploads: [],
            currChunk: 0,
            numEncrypted: 0,
            encContentBlobs: [],
            error: false,
            key: null,

            numUploaded: 0,
            up1Size: 0,
            up1Progress: 0,
            up2Size: 0,
            up2Progress: 0,
            showProgress: false,
            pleaseWait: false,
            confirmChange: false,
            confirmResume: false,
        }
    },

    computed: {
        ...mapState({
            blob: state => state.file.blob,
            encrypted: state => state.file.encrypted,
            jwt: state => state.user.jwt,
            uploadUrl: state => state.file.uploadUrl,
            fileSig: state => state.file.fileSig,
            successfullyUploadedChunks: state => state.file.successfullyUploadedChunks,
            user: state => state.user.user,
            handles: state => state.file.fileHandles,
        }),
        ...mapGetters({
            getStringContent: 'file/getStringContent',
            getPublicKey: 'file/getPublicKey'
        }),

        admin: function(){
            return this.user.isAdmin;
        },

        progressMessage1: function(){
            let num = (this.numChunks && this.numChunks > 0) ? this.numChunks : 1;
            return `Encrypted: ${(this.numEncrypted>=num) ? num : this.numEncrypted}/${num}`
        },
        progressMessage2: function(){
            let num = (this.numChunks && this.numChunks > 1) ? (this.numChunks+1) : 1;
            return `Uploaded: ${(this.numUploaded>=num) ? num : this.numUploaded}/${num}`
        },
        progressMessage3: function(){
            return `Upload 1 (Chunk): ${this.up1Progress}/${this.up1Size}`
        },
        progressMessage4: function(){
            return `Upload 2 (Chunk): ${this.up2Progress}/${this.up2Size}`
        },

        getFinger: function(){
            if ( (typeof(this.file) !== "undefined") && (this.file !== null) ){
                return this.file.name + "-" + this.file.type + "-" + this.file.size + "-" + this.file.lastModified;
            }
            return "";
        },


    },

    watch: {
        async triggerUpload(newVal){
            if (newVal){
                this.currChunk = 0;
                this.offset = 0;
                if (this.readFile){
                    await this.openFileSync(true);
                }
                this.upload();
            }
        },

        disabledProp(newVal, oldVal){
            if (newVal){
                this.disabled = true;
            }else if (oldVal && !newVal){
                this.disabled = false;
            }
        },

        clearFile(newVal){
            if (newVal){
                this.file = null;
            }
        },

        file(newVal){
            this.uploads = [];
            this.numChunks = 0;
            this.currChunk = 0;
            let newFing = this.getFinger;

            /*if (this.fileSig[newFing]){
                //Trying to change upload
                //this.confirmChange = true;
                //this.confirmResume = false;
            }else */if ( (this.fileSig[newFing]) && (!this.ignoreDuplicates) ){
                ///same upload resume
                this.confirmResume = true;
                this.confirmChange = false;
                if (this.loadFromStore){
                    this.confirmResume = false;
                    this.openFile(true);
                }

            }else{
                this.confirmChange = false;
                this.confirmResume = false;
                this.openFile();
            }
            this.$emit("file-opened", this.index, newVal, newFing);
        }
    },

    methods: {

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

        encrypt: async function(content, index){
            //await openpgp.initWorker({ path: '/js/openpgp.worker.min.js' }, 3); // set the relative web worker path
            if (this.key === null){
                this.key = await this.getPublicKey();
            }

            if (!this.uploadUrl){
                this.$store.dispatch('file/getUploadUrl');
            }

            let message = await openpgp.message.fromBinary(content)

            return openpgp.encrypt({
                message: message,
                publicKeys: (await openpgp.key.readArmored(this.key)).keys,
                compression: openpgp.enums.compression.uncompressed,
                format: 'binary',

            }).then( async (cipherText) => {
                if (index === -1){
                    this.encContentBlobs.push(new Blob([cipherText.data]));
                }else{
                    this.encContentBlobs[index] = new Blob([cipherText.data])
                }
                if (index <= 0){
                    this.$emit("encrypted", this.index);
                }
            }).catch( (e)=> {
                console.error("Error encrypting", e);
            });
        },

        openFileSync: async function(resume){
            if (typeof(resume) === "undefined"){
                resume = false;
            }



            if (this.file){
                let finger = this.getFinger;
                this.$store.commit('file/addFileHandleIfNotPresent', {handle: this.file, fileSig: finger});
                this.disabled = true;
                this.pleaseWait = true;
                this.offset = 0;
                await this.getNextChunk(0);
                this.numEncrypted += 1
                if ( (resume) && (this.successfullyUploadedChunks[this.getFinger]) ){
                    let i = 0;
                    for (; i<this.successfullyUploadedChunks[this.getFinger].length; i++){
                        if (typeof(this.successfullyUploadedChunks[this.getFinger][i])==="undefined"){
                            break;
                        }
                    }
                    let diff = i-1; //we read one chunk already
                    if ( diff > 0 ){
                        this.currChunk += diff;
                        this.numEncrypted = this.currChunk - 1;
                        this.numUploaded = this.currChunk - 1;
                        this.offset += (this.chunkSize * diff);
                        await this.getNextChunk(2);
                    }

                    if (this.currChunk<0){
                        this.currChunk = 0;
                    }
                }
                if (!this.disabledProp){
                    this.disabled = false;
                }
                this.pleaseWait = false;
            }else if ((!this.file) && (this.readFile)){
                this.$store.commit('file/clearContent');
            }

        },

        openFile: function(resume){
            if (typeof(resume) === "undefined"){
                resume = false;
            }

             if (this.file){
                let finger = this.getFinger;
                this.$store.commit('file/addFileHandleIfNotPresent', {handle: this.file, fileSig: finger});
                this.disabled = true;
                var self = this;
                this.pleaseWait = true;
                this.offset = 0;
                this.getNextChunk(0).then( async() => {
                    self.numEncrypted += 1
                    if ( (resume) && (this.successfullyUploadedChunks[this.getFinger]) ){
                        let i = 0;
                        for (; i<this.successfullyUploadedChunks[this.getFinger].length; i++){
                            if (typeof(this.successfullyUploadedChunks[this.getFinger][i])==="undefined"){
                                break;
                            }
                        }
                        let diff = i-1; //we read one chunk already
                        if ( diff > 0 ){
                            self.currChunk += diff;
                            self.numEncrypted = self.currChunk - 1;
                            self.numUploaded = self.currChunk - 1;
                            self.offset += (self.chunkSize * diff);
                            await this.getNextChunk(2);
                        }

                        if (this.currChunk<0){
                            this.currChunk = 0;
                        }
                    }
                    if (!self.disabledProp){
                        self.disabled = false;
                    }
                    self.pleaseWait = false;
                });

            }else if ((!this.file) && (this.readFile)){
                this.$store.commit('file/clearContent');
            }
        },

        getNextChunk: function(index){
            return new Promise((resolve, reject) => {

                var reader = new FileReader();
                var self = this;
                reader.onerror = function(e){
                    reject(e);
                }

                reader.onload = async function(e){
                    let content = new Uint8Array(e.target.result);

                    if (self.readFile === true){
                        // console.log("watch filename: " + self.file.name);

                        if (self.offset === 0){
                            let finger = self.getFinger;
                            self.$store.commit('file/setFileName', { fileName: self.file.name});
                            self.$store.commit('file/addFileHandleIfNotPresent', { handle: self.file, fileSig: finger});
                            await self.$store.commit('file/setContent', { content: content, index: index});

                            self.$store.commit('file/setFileSig', {fileSig: finger});
                        }

                        self.$store.dispatch('file/encryptContent', {clear: self.offset === 0, index: index, content: content}).then( () => {
                            resolve(e.target.result);
                            self.$emit('encrypted', self.index, index);
                        });

                    }else{
                        self.encrypt(content, index).then ( () => {
                            resolve(e.target.result);
                            self.$emit('encrypted', self.index, index);
                        })

                    }
                    
                }

                //this is floor because an upload has to be >= 5mb to be partial so need all chunks > 5mb
                this.numChunks = Math.floor(this.file.size / this.chunkSize);
                this.currChunk += 1;
                if (this.currChunk < this.numChunks){
                    let sli = this.file.slice(this.offset, (this.offset + this.chunkSize));
                    this.offset += this.chunkSize;
                    reader.readAsArrayBuffer(sli);

                }else{
                    let sli = this.file.slice(this.offset);
                    this.offset += 0;
                    //this last chunk can be bigger than the rest because each chunk needs to
                    //be at least 5mb due to s3/minio restrictions
                    //and with ceil that can't be guaranteed
                    //note it can be at most (2*chunkSize)-1
                    reader.readAsArrayBuffer(sli);
                }
            });

        },

        upload: async function(){
            this.disabled = true;
            this.showProgress = true;
            var i = 0;
            var self = this;
            var tus = require("tus-js-client");
            var fing = function(file, options, callback){
                return callback(null, [
                    "tus-br",
                    self.file.name,
                    self.file.type,
                    self.file.size,
                    self.file.lastModified,
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
                    ...this.appendMetadata,
                    filename: this.file.name,
                    filetype: this.file.type,
                    jwt: this.jwt
                },
                jwt: this.jwt,
                filename: this.file.name,
                filetype: this.file.type,
                retryDelays: [0, 1000, 3000, 5000],
                chunkSize: this.chunkSize*10,
                onError: error => {
                    // eslint-disable-next-line
                    console.error("Upload error", error)
                    if (!self.disabledProp){
                        self.disabled = false;
                    }
                    this.error = error;
                },
                onProgress: (bytesUploaded, bytesTotal) => {
                    self.up1Progress = bytesUploaded;
                    self.up1Size = bytesTotal;
                },
                onSuccess: async() => {
                    self.$store.commit('file/setSuccessfullyUploadedChunk', {fing: this.getFinger, index: i, success: true});
                    i += 1;
                    self.numUploaded += 1;

                    if (i < self.numChunks){
                        let chunkIndex = ((i%2)==0) ? 2 : 1;
                        await self.getNextChunk(chunkIndex);
                        self.numEncrypted += 1
                        
                        if (i%2 == 0){
                            uploadOptions.onProgress = function(byteUp, byteTot){
                                self.up1Progress = byteUp;
                                self.up1Size = byteTot;
                            }
                        }else{
                            uploadOptions.onProgress = function(byteUp, byteTot){
                                self.up2Progress = byteUp;
                                self.up2Size = byteTot;
                            }
                        }
                        let u2 = null;
                        if (this.readFile){
                            u2 = new tus.Upload(self.blob[chunkIndex], uploadOptions);
                        }else{
                            u2 = new tus.Upload(self.encContentBlobs[chunkIndex], uploadOptions);
                        }
                        u2.start();
                        self.uploads.push(u2);
                    
                    }else if (self.numChunks > 1){
                        let joinIds = Array(self.uploads.length);
                        for (let j=0; j<self.uploads.length; j++){
                            let url = self.uploads[j].url.substring(self.uploads[j].url.substring(9).indexOf("/")+9);
                            let f = self.uploads[j]._fingerprint
                            let httpStart = f.indexOf('-http');
                            let indStart = f.lastIndexOf('-', (httpStart-1));
                            let ind = parseInt(f.substring((indStart+1), (httpStart)));
                            
                            joinIds[ind] = url;
                        }
                        backendApi.concatenateUpload(joinIds, self.uploadUrl, self.jwt, "1.0.0", self.file.name, self.file.type).then( (concatResponse) => {
                            self.$store.commit('file/clearFileSig', {fileSig: self.getFinger});
                            
                            let concatLocation = concatResponse.headers.location;
                            var slashInd = concatLocation.lastIndexOf("/");
                            var plusInd = concatLocation.lastIndexOf("+");
                            
                            self.$emit('upload-finished', concatLocation.substring(slashInd+1, plusInd), this.file.name, this.file.size);
                            self.numUploaded += 1;
                            if (!self.disabledProp){
                                self.disabled = false;
                            }
                        }).catch( (e) => {
                            // eslint-disable-next-line
                            console.error("Concatenation error", e);
                            if (!self.disabledProp){
                                self.disabled = false;
                            }
                        });
                    }else{
                        var slashInd = self.uploads[0].url.lastIndexOf("/");
                        var plusInd = self.uploads[0].url.lastIndexOf("+");
                        self.$emit('upload-finished', self.uploads[0].url.substring(slashInd+1, plusInd), this.file.name, this.file.size);
                        self.numUploaded += 1;
                        self.$store.commit('file/clearFileSig', {fileSig: self.getFinger});
                        if (!self.disabledProp){
                            self.disabled = false;
                        }
                    }
                },
            }

            let u = null;
            let size = this.readFile ? this.blob[0].size : this.encContentBlobs[0].size;
            if (size <= this.chunkSize){
                uploadOptions.headers = {};
            }


            let initialUpIndex = (this.currChunk > 1) ? 2 : 0;
            await this.getNextChunk(initialUpIndex);
            if (this.readFile){
                u = new tus.Upload(this.blob[initialUpIndex], uploadOptions);
            }else{
                u = new tus.Upload(this.encContentBlobs[initialUpIndex], uploadOptions);
            }
            this.uploads.push(u);

            //is more than one chunk do parallel work
            if (size > ((this.chunkSize*2)-1)){
                this.getNextChunk(1).then( () => {
                    self.numEncrypted += 1
                    let chunkIndex = 1;
                    i += 1;
                    
                    let u2 = null;
                    let u2Options = JSON.parse(JSON.stringify(uploadOptions));
                    u2Options.onProgress = function(byteUp, byteTot){
                        self.up2Progress = byteUp;
                        self.up2Size = byteTot;
                    }
                    if (this.readFile){
                        u2 = new tus.Upload(self.blob[chunkIndex], u2Options);
                    }else{
                        u2 = new tus.Upload(self.encContentBlobs[chunkIndex], u2Options);
                    }
                    u2.start();
                    self.uploads.push(u2);
                });
            }
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

.fineText{
    font-size: 8px;
}

</style>
