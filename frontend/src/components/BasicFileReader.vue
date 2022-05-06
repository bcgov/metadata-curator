<template>
    <v-container fluid>
        <v-alert
            type="error"
            v-if="error">
            {{error}}
        </v-alert>
        
        <v-row>
            <v-col cols=12>
                <v-file-input 
                    v-model="file" 
                    :disabled="disabled" 
                    show-size 
                    :accept="accept"
                    :label="$tc('File input')" 
                    class="mt-0 pt-0"></v-file-input>
            </v-col>
        </v-row>
        <v-row class="my-0 py-0" v-if="admin">
            <v-col cols=12>
                <span class="fineText">{{$tc('Using Chunksize for your computer')}}: {{Math.ceil(chunkSize / 1024 / 1024)}}mb</span>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols=12>
                <v-btn v-if="showUploadButton" :disabled="disabled" @click="upload">{{$tc('Uploads')}}</v-btn>
                <div v-if="showProgress">
                    <div>
                        {{$tc('FileUploadNote')}}
                    </div>
                    <span>
                        <v-progress-linear :value="(up1Progress/up1Size)*100"></v-progress-linear>
                    </span>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>

import { mapState } from 'vuex';

export default {

    props: {
        label: {
            type: String,
            default: "File input"
        },
        
        showUploadButton: {
            type: Boolean,
            default: true
        },
        
        appendMetadata: {
            type: Object,
            default: () => { return {} }
        },
        accept: {
            type: String,
            default: '*'
        },
        
        uploadUrl: {
            type: String,
            default: '',
            required: false
        },
    },

    data() {
        let defChunkSize = (5 * 1000 * 1000) + 1; // 5mb
        //ram converted to bytes divided by 128 (arbitrary)
        let customChunkSize = navigator.deviceMemory ? Math.ceil(navigator.deviceMemory * 1024 * 1024 * 1024 / 128) : Math.ceil(8 * 1024 * 1024 * 1024 / 128);
        return {
            file: null,
            fileContent: "",
            offset: 0,
            chunkSize: (customChunkSize > defChunkSize) ? customChunkSize : defChunkSize,
            disabled: false,
            tusUpload: null,
            
            error: false,
            key: null,

            numUploaded: 0,
            up1Size: 0,
            up1Progress: 0,
            
            showProgress: false,
            pleaseWait: false,
        }
    },

    computed: {
        ...mapState({
            jwt: state => state.user.jwt,
            user: state => state.user.user,
        }),

        admin: function(){
            return this.user.isAdmin;
        },

        getFinger: function(){
            if ( (typeof(this.file) !== "undefined") && (this.file !== null) ){
                return this.file.name + "-" + this.file.type + "-" + this.file.size + "-" + this.file.lastModified;
            }
            return "";
        },


    },

    methods: {

        upload: async function(){
            this.disabled = true;
            this.showProgress = true;
            var self = this;
            var tus = require("tus-js-client");
            var fing = function(file, options){
                return Promise.resolve([
                    "tus-br",
                    self.file.name,
                    self.file.type,
                    self.file.size,
                    self.file.lastModified,
                    options.endpoint
                ].join("-"));
            }
            var uploadOptions = {
                endpoint: this.uploadUrl,
                fingerprint: fing,
                metadata: {
                    ...this.appendMetadata,
                    filename: this.file.name,
                    filetype: this.file.type,
                    jwt: this.jwt
                },
                jwt: this.jwt,
                filename: this.file.name,
                filetype: this.file.type,
                overridePatchMethod: true,
                retryDelays: [0, 1000, 3000, 5000],
                chunkSize: this.chunkSize,
                onError: error => {
                    // eslint-disable-next-line
                    console.error("Upload error", error)
                    if (!self.disabledProp){
                        self.disabled = false;
                    }
                    this.error = error;
                },
                onShouldRetry: async(err, retryAttempt, options) => {
                    console.log("SHOULD RETRY ", err, retryAttempt, options);
                    var status = err.originalResponse ? err.originalResponse.getStatus() : 0
                    // If the status is a 403, we do not want to retry.
                    if (status === 403) {
                        if (!self.disabledProp){
                            self.disabled = false;
                        }
                        this.error = "Permission Denied";
                        return false
                    }
                    
                    // For any other status code, tus-js-client should retry.
                    const delay = ms => new Promise(res => setTimeout(res, ms));
                    await delay(1000);
                    return true
                },
                onProgress: (bytesUploaded, bytesTotal) => {
                    self.up1Progress = bytesUploaded;
                    self.up1Size = bytesTotal;
                },
                onSuccess: async() => {
                    self.disabled = false;
                    self.$emit('upload-finished', self.tusUpload)
                    self.showProgress = false;
                    self.file = null;
                },
            }

            let u = null;
            
            u = new tus.Upload(this.file, uploadOptions);
            u.start();
            this.tusUpload = u;
        },
    }

}
</script>

<style scoped>

.fineText{
    font-size: 8px;
}

</style>
