<template>
    <v-container>
        <span :key="'container'+spanKey">
            <v-row v-for="(val, index) in fileReaders" :key="'fileReader'+index">
                <v-col cols=10>
                    <FileReader
                                :key="'fileR'+index"
                                :show-encrypt-button="false"
                                :show-upload-button="false"
                                :show-import-button="false"
                                :read-file="false"
                                :index="index"
                                @file-opened="fileOpened"
                    >
                    </FileReader>
                </v-col>
                <v-col cols=1>
                    <v-checkbox label="Data File" v-model="dataFile[index]">
                    </v-checkbox>
                </v-col>
                <v-col cols=1 v-if="index>0">
                    <v-btn @click="removeFile(index)" color="error"><v-icon>mdi-minus</v-icon></v-btn>
                </v-col>
            </v-row>   
        </span>    
        <v-btn @click="addFile" color="success"><v-icon>mdi-plus</v-icon></v-btn>
    </v-container>
</template>

<script>
    import { mapState, mapActions } from "vuex";
    import FileReader from './FileReader';

    export default {
        name: 'UploadForm',
        components:{
            FileReader
        },
        props: {
            upload: {
                type: Object,
                required: false,
                default: () => null
            },
        },
        
        mounted() {
        },
        methods: {

            ...mapActions({
                modifyStoreUpload: 'upload/modifyStoreUpload',
            }),

            addFile(){
                this.files[this.fileReaders.length]={};
                this.fileReaders[this.fileReaders.length]={key: 'val'}; 
                this.spanKey++;
                this.updateFormSubmission();
            },
            
            removeFile(index){
                delete this.fileReaders[index];
                delete this.files[index];
                this.spanKey++
                this.updateFormSubmission();
            },

            // async startUploadFiles(){
            //     Vue.set(this.triggerUpload, this.uploading, true);
            // },

            fileOpened(index, file){
                this.files[index] = file;
                this.updateFormSubmission();
            },

            updateFormSubmission(){
                let f = JSON.parse(JSON.stringify(this.formSubmission));
                if ( (typeof(f.files) !== "object") || (f.files.length === 0) ){
                    f.files = [];
                }
                for (let i=0; i<f.files.length; i++){
                    if (i >= f.files.length){
                        f.files[i] = {};
                    }
                    f.files[i].name = this.files[i].name;
                    f.files[i].id = "Not yet uploaded";
                    f.files[i].size = this.files[i].size;
                    f.files[i].data = this.dataFile[i];
                }
                this.modifyStoreUpload(f);
            },
        },
        data () {
            return {
                uploadId: null,
                formOptions: {},
                formSubmission: {},
                fileReaders: [{}],
                dataFile: [false],
                spanKey: 0,
                files: []
            }
        },
        computed: {
            ...mapState({
                createSubmissionInProgress: state => state.uploadForm.createSubmissionInProgress,
                uploadStore: state => state.upload.upload,
            }),
        },
        watch: {
            // // eslint-disable-next-line no-unused-vars
            upload: function (newVal, oldVal) {
                // console.log('uploadForm prop changed: ', newVal, ' | was: ', oldVal);
                if(newVal && !oldVal) {
                    this.uploadId = newVal._id;
                    // console.log("assigned upload id: " + this.uploadId);
                }
            },

            // eslint-disable-next-line no-unused-vars
            uploadStore: function (newVal, oldVal) {
                // eslint-disable-next-line no-undef
                if(newVal) {
                    // console.log("update  submission");
                    this.formSubmission = {...newVal};
                }
            },
        },
    }
</script>







