<template>
    <v-container>
        <span :key="'container'+spanKey">
            <v-row>
               <v-col cols=4 class="mx-2" v-for="(file, index) in files" :key="'fileinfo-'+index">
                   
                    <v-row>
                        <v-icon>mdi-file</v-icon>{{file.name}}
                    </v-row>
                    <v-row>
                        <v-text-field
                            v-model="title[index]"
                            label="Title"
                            @change="updateFormSubmission"
                            placeholder="Title">
                        </v-text-field>
                    </v-row>

                    <v-row>
                        <v-select
                            v-model="type[index]"
                            :items="typeOptions"
                            label="File Type"
                            @change="updateFormSubmission"
                            placeholder="File Type">
                        </v-select>
                    </v-row>

                    <v-row>
                        <v-menu
                            v-model="menu[index]"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                        >
                            <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                                v-model="start[index]"
                                :rules="[
                                    () => !!start[index] || 'This field is required',
                                ]"
                                label="Date Range Start*"
                                prepend-icon="mdi-calendar"
                                readonly
                                v-bind="attrs"
                                v-on="on"
                                @change="updateFormSubmission"
                            ></v-text-field>
                            </template>
                            <v-date-picker v-model="start[index]" @input="menu[index] = false"></v-date-picker>
                        </v-menu>
                    </v-row>

                    <v-row>
                        <v-menu
                            v-model="menu2[index]"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                        >
                            <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                                v-model="end[index]"
                                :rules="[
                                    () => !!end[index] || 'This field is required',
                                ]"
                                label="Date Range End*"
                                prepend-icon="mdi-calendar"
                                readonly
                                v-bind="attrs"
                                @change="updateFormSubmission"
                                v-on="on"
                            ></v-text-field>
                            </template>
                            <v-date-picker v-model="end[index]" @input="menu2[index] = false"></v-date-picker>
                        </v-menu>
                    </v-row>

                    <v-row>
                        <v-textarea
                            v-model="description[index]"
                            label="File Description"
                            @change="updateFormSubmission"
                            placeholder="Description">
                        </v-textarea>
                    </v-row>
                </v-col>
            </v-row>   
        </span>    
    </v-container>
</template>

<script>
    import { mapState, mapActions } from "vuex";

    export default {
        name: 'FileInfoForm',
        components:{
        },
        props: {
            visible: {
                type: Boolean,
                default: false,
            }
        },
        
        methods: {

            ...mapActions({
                modifyStoreUpload: 'upload/modifyStoreUpload',
                getUploadFormSubmission: 'uploadForm/getUploadFormSubmission',
            }),

            async updateFormSubmission(){
                let f = JSON.parse(JSON.stringify(this.formSubmission));

                for (let i=0; i<f.files.length; i++){
                    f.files[i].start_date = this.start[i];
                    f.files[i].end_date = this.end[i];
                    f.files[i].title = this.title[i];
                    f.files[i].type = this.type[i];
                    f.files[i].description = this.description[i];
                }
                await this.modifyStoreUpload(f);
            },

            buildFiles(){
                if ( (typeof(this.formSubmission.files) !== "undefined") && (this.formSubmission.files.length > 0) ){
                    let usingADefault = false;
                    for (let i=0; i<this.formSubmission.files.length; i++){

                        //if its 1 it's only sig
                        if ( (typeof(this.handles[this.formSubmission.files[i].sig]) !== "undefined") && (typeof(this.handles[this.formSubmission.files[i].sig].name) !== "undefined") ){
                            let formStart = (this.formioSubmission && this.formioSubmission.daterangestart) ? this.formioSubmission.daterangestart : false;
                            if (!formStart){
                                formStart = (this.formioSubmission && this.formioSubmission.dateRangeStart) ? this.formioSubmission.dateRangeStart : ""
                            }

                            let formEnd = (this.formioSubmission && this.formioSubmission.daterangeend) ? this.formioSubmission.daterangeend : false;
                            if (!formEnd){
                                formEnd = (this.formioSubmission && this.formioSubmission.dateRangeEnd) ? this.formioSubmission.dateRangeEnd : ""
                            }
                            
                            let fileName = (this.formSubmission.files[i].title) ? this.formSubmission.files[i].title : ((this.files[i] && this.files[i].name) ? this.files[i].name : '');
                            let type = (this.formSubmission.files[i].type) ? this.formSubmission.files[i].type : "Other"
                            let start = (this.formSubmission.files[i].start_date) ? this.formSubmission.files[i].start_date : formStart;
                            let end = (this.formSubmission.files[i].end_date) ? this.formSubmission.files[i].end_date :  formEnd;

                            if (start){
                                let formST = start.indexOf("T");
                                if (formST != -1){
                                    start = start.substring(0, formST);
                                }
                            }
                            
                            if (end){
                                let formET = end.indexOf("T");

                                if (formET != -1){
                                    end = end.substring(0, formET);
                                }
                            }
                            
                            if ( (!this.formSubmission.files[i].title) || (!this.formSubmission.files[i].type) || (!this.formSubmission.files[i].start_date) || (!this.formSubmission.files[i].end_date)){
                                usingADefault = true;
                            }

                            if (!this.formSubmission.files[i].type){
                                if ( (this.files[i]) && (this.files[i].type) ){
                                    switch(this.files[i].type) {
                                        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                                            type = 'Data';
                                            break;
                                        case 'text/plain':
                                            type = 'Data';
                                            break;
                                        case 'text/csv':
                                            type = 'Data';
                                            break;
                                        case 'application/json':
                                            type = 'Metadata'
                                            break;
                                    }
                                }
                            }
                            

                            this.files[i] = this.handles[this.formSubmission.files[i].sig]
                            this.start[i] = start;
                            this.end[i] = end;
                            this.title[i] = fileName;
                            this.type[i] = type;
                            this.description[i] = this.formSubmission.files[i].description;
                        }
                    }
                    if (usingADefault){
                        this.updateFormSubmission();
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
                formSubmission: {},
                formioSubmission: {},
                spanKey: 0,
                files: [],
                description: [],
                title: [],
                end: [],
                start: [],
                type: [],
                typeOptions: ['Metadata', 'Documentation', 'Data', 'Other'],
                menu: [],
                menu2: [],
            }
        },
        computed: {
            ...mapState({
                uploadStore: state => state.upload.upload,
                submission: state => state.uploadForm.submission,
                handles: state => state.file.fileHandles
            }),
        },
        mounted(){
            this.formSubmission = {...this.uploadStore};
            this.buildFiles();
        },
        watch: {

            // eslint-disable-next-line no-unused-vars
            uploadStore: function (newVal, oldVal) {
                // eslint-disable-next-line no-undef
                if(newVal) {
                    // console.log("update  submission");
                    this.formSubmission = {...newVal};
                }
                this.getUploadFormSubmission(this.formSubmission.form_name, this.formSubmission.upload_submission_id);
                if (JSON.stringify(newVal) !== JSON.stringify(oldVal)){
                    this.buildFiles();
                }
            },

            submission: function (newVal, oldVal) {
                
                if( (newVal) && (newVal !== oldVal)) {
                    if (typeof(newVal) === "string"){
                        try{
                            newVal = JSON.parse(newVal);
                        }catch(ex){
                            oldVal = newVal;
                        }
                    }
                    this.formioSubmission = newVal.data;
                    this.buildFiles();
                }
            },
        },
    }
</script>







