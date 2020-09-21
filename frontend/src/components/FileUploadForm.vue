<template>
    <v-container>
        <span :key="'uploadForm-'+spanKey">
            <v-row v-for="(val, index) in files" :key="'fileReader'+index">
                <v-col cols=12>
                    <FileReader
                        :show-encrypt-button="false"
                        :show-upload-button="false"
                        :show-import-button="false"
                        :read-file="false"
                        :index="index"
                        :loadFromStore="files[index].sig"
                        :trigger-upload="startUpload[index]"
                        :disabled="true"
                        @file-opened="fileOpened"
                        @upload-finished="uploadFinished"
                    >
                    </FileReader>
                </v-col>
            </v-row>   
            <v-row>
                <v-col cols="2">
                    <v-btn color="primary" @click="startUploads">Upload</v-btn>
                </v-col>
            </v-row>
        </span>    
    </v-container>
</template>

<script>
    import Vue from 'vue';
    import { mapState, mapActions } from "vuex";
    import FileReader from './FileReader';

    export default {
        name: 'FileUploadForm',
        components:{
            FileReader
        },
        props: {
            active: Boolean,
        },
        
        methods: {

            ...mapActions({
                modifyStoreUpload: 'upload/modifyStoreUpload',
                updateUploadFormSubmission: 'uploadForm/updateUploadFormSubmission',
            }),

            async uploadFinished(id){
                Vue.set(this.startUpload, this.uploadIndex, false);
                this.fileIds[this.uploadIndex] = id;
                this.uploadIndex++;
                
                if (this.uploadIndex >= this.files.length){
                    await this.updateFormSubmission(true);
                    this.$emit("uploads-finished");
                }else{
                    Vue.set(this.startUpload, this.uploadIndex, true);
                    
                }
            },

            fileOpened(index/*, handle, finger*/){
                if (index === 0){
                    this.readyToUpload = true;
                }
            },

            startUploads(){
                if (this.readyToUpload){
                    // await this.updateFormSubmission(false, true);
                    // await this.updateUploadFormSubmission(this.formSubmission);
                    Vue.set(this.startUpload, 0, true);
                }
            },
            

            async updateFormSubmission(done, start){
                if (typeof(done) === "undefined"){
                    done = false;
                }

                if (typeof(start) === "undefined"){
                    start = false;
                }

                let f = JSON.parse(JSON.stringify(this.formSubmission));
                for (let i=0; i<this.files.length; i++){
                    f.files[i].id = this.fileIds[i];
                }

                if (start){
                    f.status = 'upload_in_progress';
                }

                if (done){
                    f.status = 'submitted';
                }
                await this.modifyStoreUpload(f);
            },

            buildFiles(){
                if ( (typeof(this.formSubmission.files) !== "undefined") && (this.formSubmission.files.length > 0) ){
                    for (let i=0; i<this.formSubmission.files.length; i++){

                        //if its 1 it's only sig
                        if ( (typeof(this.handles[this.formSubmission.files[i].sig]) !== "undefined") && (typeof(this.handles[this.formSubmission.files[i].sig].name) !== "undefined") ){
                            this.files[i] = this.handles[this.formSubmission.files[i].sig]
                        }
                    }
                }else{
                    this.files = [];
                }
                this.spanKey++;
            }
        },
        data () {
            return {
                uploadId: null,
                formOptions: {},
                formSubmission: {},
                fileReaders: [],
                files: [],
                startUpload: [],
                uploadIndex: 0,
                fileIds: [],
                spanKey: 0,
                readyToUpload: false,
            }
        },
        computed: {
            ...mapState({
                uploadStore: state => state.upload.upload,
                handles: state => state.file.fileHandles
            }),
        },
        watch: {

            // eslint-disable-next-line no-unused-vars
            uploadStore: function (newVal, oldVal) {
                // eslint-disable-next-line no-undef
                if(newVal) {
                    // console.log("update  submission");
                    this.formSubmission = {...newVal};
                }
                this.buildFiles();
            },

            active: function(newVal){
                if (newVal && this.files.length > 0){
                    for (let i=0; i<this.files.length; i++){
                        this.startUpload[i] = false;
                        this.fileIds[i] = '';
                    }
                }
            },
        },
    }
</script>







