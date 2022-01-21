<template>
    <v-container>
        <span :key="'container'+spanKey">
            <v-row>
               <v-col cols=5 class="mx-2" v-for="(file, index) in files" :key="'fileinfo-'+index">
                   
                    <v-row>
                        <v-col cols=12>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <div class="ellipsis" v-on="on" v-bind="attrs"><v-icon>mdi-file</v-icon>{{file.name}}</div>
                                </template>
                                <span>{{file.name}}</span>
                            </v-tooltip>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols=12>
                            <TextInput
                                :label="$tc('Title')"
                                :placeholder="$tc('Title')"
                                name="title"
                                :editing="true"
                                :value="(title[index]) ? title[index] : ''"
                                helpPrefix="upload"
                                :idName="'fileinfo-'+ index + '-title'"
                                @edited="(newValue) => { ( title[index] = newValue) && updateFormSubmission }"
                            ></TextInput>
                        </v-col>
                    </v-row>

                    <v-row>
                        <Select
                            :label="$tc('File Type')"
                            :placeholder="$tc('File Type')"
                            name="filetype"
                            :id="'fileinfo-'+ index + '-type'"
                            :editing="true"
                            :value="(type[index]) ? type[index] : ''"
                            :items="typeOptions"
                            helpPrefix="upload"
                            @edited="(newValue) => { (type[index] = newValue) && updateFormSubmission }"
                        ></Select>
                    </v-row>

                    <v-row>
                        <v-col cols=12>
                            <DateInput
                                :label="$tc('Date Range Start')"
                                :placeholder="(new Date()).toISOString().split('T')[0]"
                                name="dateRangeStart"
                                :editing="true"
                                validation-rules="required"
                                helpPrefix="upload"
                                :idName="'fileinfo-'+ index + '-start'"
                                :value="(start[index]) ? start[index] : ''"
                                @edited="(newValue) => { (start[index] = newValue) && updateFormSubmission() }">
                            </DateInput>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols=12>
                            <DateInput
                                :label="$tc('Date Range End')"
                                :placeholder="(new Date()).toISOString().split('T')[0]"
                                name="dateRangeEnd"
                                :editing="true"
                                validation-rules="required"
                                helpPrefix="upload"
                                :value="(end[index]) ? end[index] : ''"
                                :idName="'fileinfo-'+ index + '-end'"
                                @edited="(newValue) => { (end[index] = newValue) && updateFormSubmission() }">
                            </DateInput>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols=12>
                            <TextArea
                                :label="$tc('File Description')"
                                :placeholder="$tc('File Description')"
                                name="fileDescription"
                                :editing="true"
                                :value="(description && description[index]) ? description[index] : ''"
                                helpPrefix="upload"
                                :idName="'fileinfo-'+ index + '-desc'"
                                @edited="(newValue) => { (description[index] = newValue) && updateFormSubmission() }"
                            ></TextArea>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>   
        </span>    
    </v-container>
</template>

<script>
    import { mapState, mapActions } from "vuex";
    import DateInput from './DateInput'
    import TextArea from './TextArea'
    import Select from './Select'
    import TextInput from './TextInput'

    export default {
        name: 'FileInfoForm',
        components:{
            DateInput,
            TextArea,
            Select,
            TextInput
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
                            // let formStart = (this.formioSubmission && this.formioSubmission.daterangestart) ? this.formioSubmission.daterangestart : false;
                            // if (!formStart){
                            //     formStart = (this.formioSubmission && this.formioSubmission.dateRangeStart) ? this.formioSubmission.dateRangeStart : ""
                            // }

                            // let formEnd = (this.formioSubmission && this.formioSubmission.daterangeend) ? this.formioSubmission.daterangeend : false;
                            // if (!formEnd){
                            //     formEnd = (this.formioSubmission && this.formioSubmission.dateRangeEnd) ? this.formioSubmission.dateRangeEnd : ""
                            // }
                            
                            let fileName = (this.formSubmission.files[i].title) ? this.formSubmission.files[i].title : ((this.files[i] && this.files[i].name) ? this.files[i].name : '');
                            let type = (this.formSubmission.files[i].type) ? this.formSubmission.files[i].type : "Other"
                            let start = (this.formSubmission.files[i].start_date) ? this.formSubmission.files[i].start_date : "";
                            let end = (this.formSubmission.files[i].end_date) ? this.formSubmission.files[i].end_date :  "";

                            // if (start){
                            //     let formST = start.indexOf("T");
                            //     if (formST != -1){
                            //         start = start.substring(0, formST);
                            //     }
                            // }else{
                            //     let d = new Date();
                            //     let m = (d.getMonth()+1)
                            //     m = m<10 ? "0"+m : m;
                            //     let day = d.getDate();
                            //     day = day<10 ? "0"+day : day
                            //     start = d.getFullYear() + "-" + m + "-" + day;
                            // }
                            
                            // if (end){
                            //     let formET = end.indexOf("T");

                            //     if (formET != -1){
                            //         end = end.substring(0, formET);
                            //     }
                            // }else{
                            //     let d = new Date();
                            //     let m = (d.getMonth()+1)
                            //     m = m<10 ? "0"+m : m;
                            //     let day = d.getDate();
                            //     day = day<10 ? "0"+day : day
                            //     end = d.getFullYear() + "-" + m + "-" + day;
                            // }
                            
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
                //this.getUploadFormSubmission(this.formSubmission.form_name, this.formSubmission.upload_submission_id);
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


<style scoped>
    .ellipsis{
        text-overflow: ellipsis;
        overflow: hidden;
        width: 100%;
        white-space: nowrap;
        height: 24px;
    }
</style>