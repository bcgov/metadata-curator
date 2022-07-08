<template>
    <v-container>
        <span :key="'container'+spanKey">
            <v-row>
                <v-col cols=12>
                    <v-alert
                        v-if="(formSubmission && (formSubmission.num_files === 0))"
                        type="error">
                            {{$tc('You can\'t provide 0 files and still upload')}}
                    </v-alert>
                    <v-alert
                        v-else-if="(formSubmission && formSubmission.num_files && (formSubmission.num_files !== files.length))"
                        type="error">
                            {{$tc('You said you were providing')}} {{formSubmission.num_files}} {{$tc('files but have currently provided', formSubmission.num_files)}} {{files.length}}    
                    </v-alert>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols=10>
                    <v-progress-circular
                        indeterminate
                        color="primary"
                        v-if="wait"
                    ></v-progress-circular>
                    <FileReader
                                :show-encrypt-button="false"
                                :show-upload-button="false"
                                :show-import-button="false"
                                :read-file="true"
                                :disabled="wait"
                                :clear-file="clearFile"
                                @reading-file="wait=true"
                                :index="files.length"
                                @file-opened="fileOpened"
                                id="fileForm-reader"
                    >
                    </FileReader>
                </v-col>
                <v-col cols=1>
                    <!-- <v-checkbox label="Data File" v-model="dataFile[files.length]"></v-checkbox> -->
                </v-col>
            </v-row>
            <v-row v-for="(val, index) in files" :key="'fileReader'+index">
                <v-col cols=10>
                    <v-text-field
                                :disabled="true"
                                :key="'fileR'+index"
                                v-model="files[index].name"
                    >
                    </v-text-field>
                </v-col>
                <v-col cols=1>
                    <v-btn @click="removeFile(index)" color="error"><v-icon>mdi-delete</v-icon></v-btn>
                </v-col>
            </v-row>   
        </span>    
    </v-container>
</template>

<script>
    import { mapState, mapActions, mapMutations } from "vuex";
    import FileReader from '../FormElements/FileReader';

    export default {
        name: 'FileForm',
        components:{
            FileReader
        },
        props: {
        },
        
        mounted() {
            this.buildFiles();
        },
        methods: {

            ...mapActions({
                modifyStoreUpload: 'upload/modifyStoreUpload',
            }),

            ...mapMutations({
                removeContent: 'file/removeContent'
            }),
            
            removeFile(index){
                this.fileReaders.splice(index, 1);
                this.files.splice(index, 1);
                this.removeContent({index: index});
                this.spanKey++
                this.$emit('changed', this.files.length);
                this.updateFormSubmission();
            },

            fileOpened(index, file, sig){
                this.clearFile = false;
                this.wait = false;
                this.spanKey++;
                this.clearFile = true;
                this.fileReaders[this.fileReaders.length] = {}
                this.files[index] = file;
                this.files[index].sig = sig;
                this.dataFile.push(this.dataFile[this.dataFile.length-1]);
                this.updateFormSubmission();
                this.$emit('changed', this.files.length);
                this.spanKey++;
            },

            updateFormSubmission(){
                if (this.uploadStore && Object.keys(this.formSubmission).length === 0){
                    this.formSubmission = {...this.uploadStore};
                }
                let f = JSON.parse(JSON.stringify(this.formSubmission));
                f.files = [];

                for (let i=0; i<this.files.length; i++){
                    if (i >= f.files.length){
                        f.files[i] = {};
                    }
                    f.files[i].name = this.files[i].name;
                    f.files[i].id = "Not yet uploaded";
                    f.files[i].size = this.files[i].size;
                    f.files[i].sig = this.files[i].sig;
                    f.files[i].data = (this.dataFile[i]) ? this.dataFile[i] : false;
                }
                this.modifyStoreUpload(f);
            },

            buildFiles(){
                if (this.uploadStore && Object.keys(this.formSubmission).length === 0){
                    this.formSubmission = {...this.uploadStore};
                }
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
                this.$emit('changed', this.files.length);
            }
        },
        data () {
            return {
                uploadId: null,
                formOptions: {},
                formSubmission: {},
                fileReaders: [],
                dataFile: [false],
                spanKey: 0,
                clearFile: false,
                files: [],
                wait: false,
            }
        },
        computed: {
            ...mapState({
                uploadStore: state => state.upload.upload,
                handles: state => state.file.fileHandles,
            }),
        },
        watch: {

            // eslint-disable-next-line no-unused-vars
            uploadStore: function (newVal, oldVal) {
                // eslint-disable-next-line no-undef
                if(newVal) {
                    this.formSubmission = {...newVal};
                }
                this.buildFiles();
            },
        },
    }
</script>







