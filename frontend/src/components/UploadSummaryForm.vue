<template>
    <v-container>
        <span :key="'uploadSummary'+spanKey">
            <v-row>
                <v-col cols=12>
                    <v-icon color="primary">mdi-check</v-icon> Data Uploaded Successfully
                </v-col>
            </v-row>
            <span v-if="uploadStore">
                <v-row>
                    <v-col cols=12>Upload Date: {{uploadDate}}</v-col>
                </v-row>
                <v-row v-for="(file, index) in uploadStore.files" :key="'fileReader'+index">
                    <v-col cols=12>
                        <v-row v-if="file.name">{{file.name}}</v-row>
                        <v-row v-if="file.title">Title: {{file.title}}</v-row>
                        <v-row v-if="file.type">Type: {{file.type}}</v-row>
                        <v-row v-if="file.size">Size: {{file.size}}</v-row>
                        <v-row v-if="file.start_date">Date Range: {{formatDate(file.start_date)}} - {{formatDate(file.end_date)}} </v-row>
                        <v-row v-if="file.description">Description: {{file.description}}</v-row>
                    </v-col>
                </v-row>
            </span>
            <span>
                <formio
                    v-if="formDef"
                    ref="formioObj"
                    :form="formDef"
                    @formLoad="formLoad"
                    :submission="formSubmission"
                    v-bind:options="formOptions"
                >
                </formio>
            </span>
        </span>
    </v-container>
</template>

<script>
    import { mapActions, mapState } from "vuex";
    import { Form } from 'vue-formio';

    export default {
        name: 'UploadSummaryForm',
        components:{
            formio: Form
        },
        props: {
        },
        
        methods: {
            ...mapActions({
                getUploadFormSubmission: 'uploadForm/getUploadFormSubmission',
            }),

            formLoad(){
                try{
                    this.$refs.formioObj.formio.submission = JSON.parse(this.submission);
                }catch(ex){
                    try{
                        this.$refs.formioObj.formio.submission = this.submission;
                    }catch(ex2){
                        console.log("Error loading submission");
                    }
                }
            },

            formatDate(d){
                var date = new Date(d);
                let month = new Array();
                month[0] = "January";
                month[1] = "February";
                month[2] = "March";
                month[3] = "April";
                month[4] = "May";
                month[5] = "June";
                month[6] = "July";
                month[7] = "August";
                month[8] = "September";
                month[9] = "October";
                month[10] = "November";
                month[11] = "December";
                return month[date.getMonth()] + " " + date.getDate() + ", " +date.getFullYear()
            }
        },

        data () {
            return {
                uploadId: null,
                spanKey: 0,
                formDef: {},
                formOptions: {
                    readOnly: true
                },
                formData: {},
                formSubmission: {},
            }
        },
        computed: {
            ...mapState({
                uploadStore: state => state.upload.upload,
                uploadForm: state => state.uploadForm.formDef,
                submission: state => state.uploadForm.submission,
            }),
            uploadDate: function(){
                return this.uploadStore.upload_date.substring(0, this.uploadStore.upload_date.indexOf(".")).replace("T", " ");
            }
        },
        mounted(){
            this.formDef = this.uploadForm;
        },

        watch: {

            // eslint-disable-next-line no-unused-vars
            uploadStore: function (newVal, oldVal) {
                // eslint-disable-next-line no-undef
                if(newVal) {
                    // console.log("update  submission");
                    this.formSubmission = {...newVal};
                }
                    
                this.getUploadFormSubmission(this.formSubmission.upload_submission_id);
                this.spanKey++;
            },
            // eslint-disable-next-line no-unused-vars
            uploadForm: function (newVal, oldVal) {
                // console.log('uploadForm prop changed: ', newVal, ' | was: ', oldVal);
                this.formDef = JSON.parse(JSON.stringify(newVal));
            },
            // eslint-disable-next-line no-unused-vars
            submission: function (newVal, oldVal) {
                // eslint-disable-next-line no-undef
                if(newVal) {
                    if (typeof(newVal) === "string"){
                        newVal = JSON.parse(newVal);
                    }
                    this.formData = {...newVal};
                }
                this.$refs.formioObj.formio.submission = this.formData;
            },

        },
    }
</script>







