<template>
    <v-container>
        <v-stepper v-model="step">
            <v-stepper-header>
                <v-stepper-step :step="steps.step1UploadForm" :complete="step > steps.step1UploadForm" >Upload Info</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step :step="steps.step2FileSelection" :complete="step > steps.step2FileSelection" >File Selection</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step :step="steps.step3FileLevelForm" :complete="step > steps.step3FileLevelForm" >File Level Info</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step :step="steps.step4UploadProgress" :complete="step > steps.step4UploadProgress" >Upload Progress</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step :step="steps.step5UploadSummary">Upload Summary</v-stepper-step>
            </v-stepper-header>

            <v-stepper-items>
                <v-stepper-content :step="steps.step1UploadForm">
                    <v-card class="mb-12">
                        <UploadForm ref="uploadForm" :upload="upload"></UploadForm>
                    </v-card>
                    <v-btn color="primary" @click="stepSaveUploadForm(false)">Save</v-btn>
                    <v-btn text @click="stepSaveUploadForm(true)">Next</v-btn>
                </v-stepper-content>

                <v-stepper-content :step="steps.step2FileSelection">
                    <v-card class="mb-12">
                        <FileForm v-if="step === steps.step2FileSelection" ref="fileForm" :upload="upload"></FileForm>
                    </v-card>
                    <v-btn color="primary" @click="stepSaveFileForm(false)">Save</v-btn>
                    <v-btn color="primary" @click="stepSaveFileForm(true)">Next</v-btn>
                    <v-btn text @click="step=steps.step1UploadForm">Back</v-btn>
                </v-stepper-content>

                <v-stepper-content :step="steps.step3FileLevelForm">
                    <v-card class="mb-12">
                        <FileInfoForm ref="fileInfoForm"></FileInfoForm>
                    </v-card>
                    <v-btn color="primary" @click="step=stepSaveFileInfoForm(true)">Start Upload</v-btn>
                    <v-btn text @click="step=steps.step2FileSelection">Back</v-btn>
                </v-stepper-content>

                <v-stepper-content :step="steps.step4UploadProgress">
                    <v-card class="mb-12">
                        <FileUploadForm @uploads-finished="stepSaveFileUploads" :active="step === steps.step4UploadProgress"></FileUploadForm>
                    </v-card>
                    <!--<v-btn color="primary" @click="step=steps.step5UploadSummary">Next</v-btn>
                    <v-btn text @click="step=steps.step3FileLevelForm">Back</v-btn>-->
                </v-stepper-content>

                <v-stepper-content :step="steps.step5UploadSummary">
                    <v-card class="mb-12">
                        <UploadSummaryForm v-if="step === steps.step5UploadSummary" ref="uploadSummaryForm"></UploadSummaryForm>
                    </v-card>
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>

    </v-container>
</template>
<script>

    import {mapActions, mapMutations, mapState} from "vuex";
    import UploadForm from "../UploadForm";
    import FileForm from "../FileForm";
    import FileInfoForm from "../FileInfoForm";
    import FileUploadForm from "../FileUploadForm";
    import UploadSummaryForm from '../UploadSummaryForm';

    export default {
        components:{
            UploadForm,
            FileForm,
            FileInfoForm,
            FileUploadForm,
            UploadSummaryForm,
        },
        created() {
            if(this.$route.params.id && this.$route.params.id != 'new') { this.uploadId = this.$route.params.id; }
            if(this.uploadId) { this.getUpload(this.uploadId); }
        },
        methods: {
            ...mapActions({
                getUpload: 'upload/getUpload',
                createInitialUpload: 'upload/createInitialUpload',
                updateUpload: 'upload/updateUpload',

            }),
            ...mapMutations({
                resetState: 'upload/resetState'
            }),
            triggerUploadFormSubmit() {
                this.$refs.uploadForm.submitForm();
            },
            async stepSaveUploadForm(transitionNextStepAfterSave) {
              if(this.$refs.uploadForm.validateForm()) {
                  if((!this.uploadId && !this.newUploadCreated) && !this.createUploadInProgress) {
                      // console.log("create new upload");
                      const submission = this.$refs.uploadForm.getSubmission();
                      await this.triggerUploadFormSubmit();
                      const initialUpload = {
                          name: submission.data.datasetName,
                          description: submission.data.datasetName,
                          uploader: this.user.email,
                          upload_submission_id: this.$refs.uploadForm.submissionId
                      }
                      await this.createInitialUpload(initialUpload);
                      
                  }
                  else {
                      // console.log("update existing upload submission");
                      await this.triggerUploadFormSubmit();
                  }
                  if(transitionNextStepAfterSave) { this.step = this.steps.step2FileSelection; }
              }
              else {
                //still trigger submit so form displays all validation errors on UI
                this.triggerUploadFormSubmit();
              }
            },

            async stepSaveFileForm(transitionNextStepAfterSave) {
                await this.updateUpload(this.upload);
                if(transitionNextStepAfterSave) { this.step = this.steps.step3FileLevelForm; }
            },

            async stepSaveFileInfoForm(transitionNextStepAfterSave) {
                await this.updateUpload(this.upload);
                if(transitionNextStepAfterSave) { this.step = this.steps.step4UploadProgress; }
            },

            async stepSaveFileUploads(){
                await this.updateUpload(this.upload);
                 this.step = this.steps.step5UploadSummary;

            },
        },
        data () {
            return {
                uploadId: null,
                step: 1,
                steps: {
                    step1UploadForm: 1,
                    step2FileSelection: 2,
                    step3FileLevelForm: 3,
                    step4UploadProgress: 4,
                    step5UploadSummary: 5
                },

            }
        },
        computed: {
            ...mapState({
                user: state => state.user.user,
                upload: state => state.upload.upload,
                createUploadInProgress: state => state.upload.createUploadInProgress,
                newUploadCreated: state => state.upload.newUploadCreated,
            }),
        },
        watch: {
            // eslint-disable-next-line no-unused-vars
            upload: function (newVal, oldVal) {
                if(newVal && !oldVal) {
                    if(this.upload.upload_submission_id) {
                        this.step = this.steps.step2FileSelection;
                        if (this.upload.files.length >= 1){
                            let allGood = true;
                            for (let i=0; i<this.upload.files.length; i++){
                                if ( (!this.upload.files[i].id) || (this.upload.files[i].id === "") || (this.upload.files[i].id.toLowerCase() === "not yet uploaded") ){
                                    allGood = false;
                                }
                            }
                            if (allGood){
                                this.step = this.steps.step5UploadSummary;
                            }
                        }
                    }
                }
            },
            // eslint-disable-next-line no-unused-vars
            newUploadCreated: function (newVal, oldVal) {
                if(newVal) {
                    if(this.$route.params.id != this.upload._id ) {
                        this.$router.push({ name: 'upload', params: { id: this.upload._id } });
                    }
                }
            },
        },
        beforeDestroy() {
            // console.log("upload reset state");
            this.resetState();
        },

    }
</script>
<style scoped>
</style>
