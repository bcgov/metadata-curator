<template>
    <v-container>
        <formio
            v-if="formDef"
            ref="formioObj"
            :form="formDef"
            v-bind:options="formOptions"
            :submission="formSubmission"
            v-on:submit="onSubmit"
            v-on:render="renderDone"
            :key="'formio'+rerenderKey"
        >
        </formio>

<!--        <button @click="validateForm">validate</button>-->
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
        <link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css'>
        <link rel='stylesheet' href='https://unpkg.com/formiojs@4.10.0/dist/formio.full.min.css'>
    </v-container>
</template>

<script>
    import { Form } from 'vue-formio';
    //import { Form, Templates } from 'vue-formio';
    import Vue from 'vue';
    import {mapActions, mapMutations, mapState} from "vuex";

    export default {
        name: 'UploadForm',
        components:{
            formio: Form
        },
        props: {
        },
        async created() {
            await this.resetState();
            this.formSubmission = {...this.submission};

            if(this.upload) {
                this.uploadId = this.upload;
                //this.getUploadFormSubmission({formName: this.upload.form_name, submissionId: this.upload.upload_submission_id});
                await this.getUploadForm(this.upload.form_name);
            }else{
                await this.getDefaultUploadForm();
            }
            
        },
        mounted() {
            // let self = this;
            // Templates.current = {
            //     'input-datetime': {
            //         form: function(ctx){
            //             console.log(ctx);
            //             self.contexts[ctx.input.attr.name] = ctx;
            //             return '<div id="'+ctx.input.attr.name+'"></div>';
            //         }
            //     }
            // }

        },
        methods: {
            ...mapActions({
                getUploadForm: 'uploadForm/getUploadForm',
                getDefaultUploadForm: 'uploadForm/getDefaultUploadForm',
                getUploadFormSubmission: 'uploadForm/getUploadFormSubmission',
                createUploadFormSubmission: 'uploadForm/createUploadFormSubmission',
                updateUploadFormSubmission: 'uploadForm/updateUploadFormSubmission',
            }),
            ...mapMutations({
                resetState: 'uploadForm/resetState',
                clearUploadForm: 'uploadForm/clearUploadForm',
            }),

            renderDone(){
                let keys = Object.keys(this.contexts);
                let dpicker = Vue.component('VDatePicker');
                for (let i=0; i<keys.length; i++){
                    let ele = new dpicker();
                    ele.$vuetify = this.$vuetify;
                    ele.$mount();
                    document.getElementById(keys[i]).appendChild(ele.$el);
                    ele.$forceUpdate();
                }
                
            },

            async onSubmit(submission) {
                // console.log("onSubmit submission: ", submission);
                // console.log(`submission._id: ${submission._id}, newSubmissionCreated: ${this.newSubmissionCreated},
                //             this.createSubmissionInProgress: ${this.createSubmissionInProgress}`);
                if(!submission._id && !this.createSubmissionInProgress) {
                    // console.log("create new submission");
                    await this.createUploadFormSubmission(submission.data);
                }
                else {
                    // console.log("update existing upload submission");
                    await this.updateUploadFormSubmission({formName: this.upload.form_name, submission: this.formSubmission});
                }
                // this.$refs.formioObj.formio.emit('submitDone', submission);
            },
            submitForm() {
                // console.log("this.$refs.formioObj.formio: ", this.$refs.formioObj.formio);
                this.$refs.formioObj.formio.submit();
            },
            validateForm() {
                return this.$refs.formioObj.formio.checkValidity();
            },
            getSubmission() {
                return this.formSubmission;
            }
        },
        data () {
            return {
                uploadId: null,
                formOptions: {},
                formDef: {},
                formSubmission: {},
                contexts: {},
                rerenderKey: 0
            }
        },
        computed: {
            ...mapState({
                uploadForm: state => state.uploadForm.formDef,
                submission: state => state.uploadForm.submission,
                createSubmissionInProgress: state => state.uploadForm.createSubmissionInProgress,
                upload: state => state.upload.upload,
            }),
        },
        watch: {
            // eslint-disable-next-line no-unused-vars
            uploadForm: function (newVal, oldVal) {
                // console.log('uploadForm prop changed: ', newVal, ' | was: ', oldVal);
                this.formDef = JSON.parse(JSON.stringify(newVal));
            },
            // // eslint-disable-next-line no-unused-vars
            upload: async function (newVal, oldVal) {
                // console.log('uploadForm prop changed: ', newVal, ' | was: ', oldVal);
                if(newVal && !oldVal) {
                    this.uploadId = newVal._id;
                    // console.log("assigned upload id: " + this.uploadId);
                }

                if(this.upload) {
                    this.uploadId = this.upload;
                    //this.getUploadFormSubmission({formName: this.upload.form_name, submissionId: this.upload.upload_submission_id});
                    await this.getUploadForm(this.upload.form_name);
                }else{
                    await this.getDefaultUploadForm();
                }

                //this.getUploadFormSubmission({formName: this.upload.form_name, submissionId: this.upload.upload_submission_id});
            },
            // eslint-disable-next-line no-unused-vars
            submission: function (newVal, oldVal) {
                if(newVal) {
                    try{
                        newVal = JSON.parse(newVal);
                    // eslint-disable-next-line
                    }catch(ex){
                    }
                    Vue.set(this, 'formSubmission', {...newVal});
                    this.rerenderKey++;
                }

            },
        },
        beforeDestroy() {
            // console.log("uploadform reset state");
            this.resetState();
            this.clearUploadForm();
        },
    }
</script>

