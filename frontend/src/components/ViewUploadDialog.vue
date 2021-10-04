<template>
    <v-dialog v-model="dialog" persistent fullscreen>
        <link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css'>
        <v-card :key="'uploadCard-'+spanKey">
            <v-card-title>
                <span class="headline">{{$tc('Data Upload')}} <span v-if="uploadStore && uploadStore.name">{{uploadStore.name}}</span></span>
                <v-spacer></v-spacer>
                <v-icon @click="onCloseClicked">mdi-close</v-icon>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols=12>
                            <span v-if="uploadStore">
                                <v-row v-for="(file, index) in uploadStore.files" :key="'fileReader'+index">
                                    <v-col cols=12>
                                        <v-row v-if="file.name">{{file.name}}</v-row>
                                        <v-row v-if="file.title">{{$tc('Title')}}: {{file.title}}</v-row>
                                        <v-row v-if="file.type">{{$tc('Type')}}: {{file.type}}</v-row>
                                        <v-row v-if="file.size">{{$tc('Size')}}: {{file.size}}</v-row>
                                        <v-row v-if="file.start_date">{{$tc('Date Range')}}: {{formatDate(file.start_date)}} - {{formatDate(file.end_date)}} </v-row>
                                        <v-row v-if="file.description">{{$tc('Description')}}: {{file.description}}</v-row>
                                    </v-col>
                                </v-row>
                            </span>
                        </v-col>
                        <v-col cols="12">
                            <span>
                                <formio
                                    v-if="formDef"
                                    ref="formioObj"
                                    :form="formDef"
                                    :submission="formSubmission"
                                    v-bind:options="formOptions"
                                >
                                </formio>
                            </span>
                        </v-col>
                        
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="onCloseClicked">{{$tc('Close')}}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>

    import {mapActions, mapState} from "vuex";
    import { Form } from 'vue-formio';

    export default {
        mixins: [],
        components:{
            formio: Form
        },
        props: {
            dialog: {
                type: Boolean,
                required: true,
                default: () => false
            },
            uploadId: {
                type: String,
                required: true
            }
        },
        data: () => ({
            formDef: {},
            formOptions: {
                readOnly: true
            },
            formSubmission: {},
            spanKey: 0,
        }),
        methods: {
            ...mapActions({
                getUpload: 'upload/getUpload',
                getUploadFormSubmission: 'uploadForm/getUploadFormSubmission',
                getUploadForm: 'uploadForm/getUploadForm',
                
            }),
            onCloseClicked: function(){
                // console.log("onCloseClicked");
                // console.log("commentVal: " + this.commentVal);
                this.$emit('close-button-clicked');
            },
            formatDate(d){
                if (d.substring(d.length-1) === "Z"){
                    d = d.substring(0,d.length-1);
                }
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

        computed: {
            ...mapState({
                uploadStore: state => state.upload.upload,
                uploadForm: state => state.uploadForm.formDef,
                submission: state => state.uploadForm.submission,
            }),
        },

        mounted(){
            this.getUpload(this.uploadId);
            if (this.uploadStore){
                this.getUploadForm(this.uploadStore.form_name);
            }
            
        },

        watch: {
            // commentVal: function (newVal, oldVal) {
            //     console.log(`commentVal changed - oldVal: ${oldVal}, newVal: ${newVal}`);
            // },
            // eslint-disable-next-line no-unused-vars
            uploadStore: function (newVal, oldVal) {
                // eslint-disable-next-line no-undef
                if(newVal) {
                    // console.log("update  submission");
                    this.formSubmission = {...newVal};
                    
                    this.getUploadForm(this.uploadStore.form_name);
                    this.getUploadFormSubmission({formName: this.uploadStore.form_name, submissionId: this.formSubmission.upload_submission_id});
                }
            
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
                    this.formSubmission = {...newVal};
                    if (this.$refs.formioObj){
                        this.$refs.formioObj.formio.submission = this.formSubmission;
                    }
                }
            },

            dialog: function (newVal, oldVal) {
                // console.log(`dialog changed - oldVal: ${oldVal}, newVal: ${newVal}`);
                if(oldVal === false && newVal) {
                    // console.log("model opening");
                    // this.$nextTick(() => this.$refs.comment.focus())
                    
                    if (this.$refs.formioObj){
                        this.$refs.formioObj.formio.submission = this.formSubmission;
                        this.spanKey++;
                    }
                }
            }
        }
    };
</script>

<style scoped>

</style>
