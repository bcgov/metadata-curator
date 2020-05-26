<template>
    <v-container>
        <formio
            v-if="formDef"
            ref="formioObj"
            :form="formDef"
            :submission="formSubmission"
            v-bind:options="formOptions"
            v-on:submit="onSubmit"
        >
        </formio>
<!--        <button @click="validateForm">validate</button>-->
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
        <link ref="bsCSS" rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css'>
        <link ref="formioCSS" rel='stylesheet' href='https://unpkg.com/formiojs@latest/dist/formio.full.min.css'>
    </v-container>
</template>

<script>

    import { Form } from 'vue-formio';
    import {mapActions, mapMutations, mapState} from "vuex";

    export default {
        name: 'UploadForm',
        components:{
            formio: Form
        },
        props: {
            upload: {
                type: Object,
                required: false,
                default: () => null
            },
        },
        async created() {
            this.resetState();
            this.formSubmission = {...this.submission};
            await this.getUploadForm();

            if(this.upload) {
                this.uploadId = this.upload;
                this.getUploadFormSubmission(this.upload.upload_submission_id);
            }
        },
        mounted() {
        },
        methods: {
            ...mapActions({
                getUploadForm: 'uploadForm/getUploadForm',
                getUploadFormSubmission: 'uploadForm/getUploadFormSubmission',
                createUploadFormSubmission: 'uploadForm/createUploadFormSubmission',
                updateUploadFormSubmission: 'uploadForm/updateUploadFormSubmission',
            }),
            ...mapMutations({
                resetState: 'uploadForm/resetState',
            }),
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
                    await this.updateUploadFormSubmission(this.formSubmission);
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
            }
        },
        computed: {
            ...mapState({
                uploadForm: state => state.uploadForm.formDef,
                submission: state => state.uploadForm.submission,
                createSubmissionInProgress: state => state.uploadForm.createSubmissionInProgress,
            }),
        },
        watch: {
            // eslint-disable-next-line no-unused-vars
            uploadForm: function (newVal, oldVal) {
                // console.log('uploadForm prop changed: ', newVal, ' | was: ', oldVal);
                this.formDef = JSON.parse(JSON.stringify(newVal));
            },
            // // eslint-disable-next-line no-unused-vars
            upload: function (newVal, oldVal) {
                // console.log('uploadForm prop changed: ', newVal, ' | was: ', oldVal);
                if(newVal && !oldVal) {
                    this.uploadId = newVal._id;
                    // console.log("assigned upload id: " + this.uploadId);
                }
            },
            // eslint-disable-next-line no-unused-vars
            submission: function (newVal, oldVal) {
                // eslint-disable-next-line no-undef
                if(newVal) {
                    // console.log("update  submission");
                    this.formSubmission = {...newVal};
                }
            },
        },
        beforeDestroy() {
            // console.log("uploadform reset state");
            this.resetState();
        },
    }
</script>







