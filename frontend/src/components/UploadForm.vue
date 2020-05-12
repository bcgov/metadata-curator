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
        created() {
            this.resetState();
            if(this.$route.params.id && this.$route.params.id != 'new') { this.uploadId = this.$route.params.id; }
            this.formSubmission = {...this.submission};
            if(this.uploadId) { this.getUpload(this.uploadId); }
            this.getUploadForm();
        },
        methods: {
            ...mapActions({
                getUploadForm: 'upload/getUploadForm',
                createInitialUpload: 'upload/createInitialUpload',
                getUpload: 'upload/getUpload',
                createUploadFormSubmission: 'upload/createUploadFormSubmission',
                updateUploadFormSubmission: 'upload/updateUploadFormSubmission',
            }),
            ...mapMutations({
                resetState: 'upload/resetState',
            }),
            async onSubmit(submission) {
                // console.log(submission);
                if((!this.uploadId && !this.newUploadCreated) && !this.createUploadInProgress) {
                    console.log("create new upload and submission");
                    const initialUpload = {
                        name: submission.data.datasetName,
                        description: submission.data.datasetName,
                        uploader: this.user.displayName
                    }
                    this.createInitialUpload(initialUpload);
                    await this.createUploadFormSubmission(submission.data);
                }
                else {
                    console.log("update existing upload submission");
                    await this.updateUploadFormSubmission(this.formSubmission);
                }

                this.$refs.formioObj.formio.emit('submitDone', submission);
            },
            submitForm() {
                console.log("this.$refs.formioObj.formio: ", this.$refs.formioObj.formio);
                this.$refs.formioObj.formio.submit();
            },
            validateForm() {
                return this.$refs.formioObj.formio.checkValidity();
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
                user: state => state.user.user,
                uploadForm: state => state.upload.uploadForm,
                upload: state => state.upload.upload,
                createUploadInProgress: state => state.upload.createUploadInProgress,
                submission: state => state.upload.submission,
                newUploadCreated: state => state.upload.newUploadCreated,
            }),
        },
        watch: {
            // eslint-disable-next-line no-unused-vars
            uploadForm: function (newVal, oldVal) {
                // console.log('uploadForm prop changed: ', newVal, ' | was: ', oldVal);
                this.formDef = JSON.parse(JSON.stringify(newVal));
            },
            // eslint-disable-next-line no-unused-vars
            upload: function (newVal, oldVal) {
                // console.log('uploadForm prop changed: ', newVal, ' | was: ', oldVal);
                if(newVal) {
                    // console.log("set upload exists to true");
                }
            },
            // eslint-disable-next-line no-unused-vars
            submission: function (newVal, oldVal) {
                // eslint-disable-next-line no-undef
                if(newVal) {
                    console.log("update  submission");
                    this.formSubmission = {...newVal};
                }
            },
            // eslint-disable-next-line no-unused-vars
            newUploadCreated: function (newVal, oldVal) {
                // console.log('newUploadCreated prop changed: ', newVal, ' | was: ', oldVal);
                if(newVal) {
                    // console.log("new upload created");
                    // console.log("upload id: " + this.upload._id);
                    console.log(`this.$route.params.id: ${this.$route.params.id}`);
                    if(this.$route.params.id != this.upload._id ) {
                        // console.log("re-route");
                        this.$router.push({ name: 'upload', params: { id: this.upload._id } });
                    }
                }
            },
        },
        beforeDestroy() {
            this.resetState();
        },
    }
</script>







