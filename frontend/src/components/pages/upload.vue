<template>
    <v-container>
        <v-alert :class="'fixed' + ((errorAlert) ? ' mb-3' : '')" v-model="errorAlert" type="error" dismissible>
            {{errorText}}
        </v-alert>
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
                        <UploadForm ref="uploadForm"></UploadForm>
                    </v-card>
                    <v-btn text @click="stepSaveUploadForm(true)" id="next-1">Next</v-btn>
                </v-stepper-content>

                <v-stepper-content :step="steps.step2FileSelection">
                    <v-card class="mb-12">
                        <FileForm v-if="step === steps.step2FileSelection" ref="fileForm" @changed="step2Changed"></FileForm>
                    </v-card>
                    
                    <v-btn text @click="step=steps.step1UploadForm" id="back-2">Back</v-btn>
                    <v-btn color="primary" :disabled="!validStep3" @click="stepSaveFileForm(true)" id="next-2">Next</v-btn>
                    
                </v-stepper-content>

                <v-stepper-content :step="steps.step3FileLevelForm">
                    <v-card class="mb-12">
                        <FileInfoForm v-if="step === steps.step3FileLevelForm" ref="fileInfoForm"></FileInfoForm>
                    </v-card>
                    <v-btn text @click="step=steps.step2FileSelection" id="back-3">Back</v-btn>
                    <v-btn color="primary" @click="step=stepSaveFileInfoForm(true)" id="next-3">Next</v-btn>
                    
                </v-stepper-content>

                <v-stepper-content :step="steps.step4UploadProgress">
                    <v-card class="mb-12">
                        <FileUploadForm v-if="step === steps.step4UploadProgress" @uploads-finished="stepSaveFileUploads" :active="step === steps.step4UploadProgress"></FileUploadForm>
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
            if(this.$route.params.id && this.$route.params.id != 'new') { 
                this.uploadId = this.$route.params.id; 
            }else{
                this.resetFormState();
                this.resetState();
            }
            if(this.uploadId) { 
                this.getUpload(this.uploadId); 
            }
        },
        methods: {
            ...mapActions({
                getUpload: 'upload/getUpload',
                createInitialUpload: 'upload/createInitialUpload',
                updateUpload: 'upload/updateUpload',

            }),
            ...mapMutations({
                resetState: 'upload/resetState',
                resetFormState: 'uploadForm/resetState'
            }),

            step2Changed(numFiles){
                this.validStep3 = numFiles > 0;
            },

            async triggerUploadFormSubmit() {
                try{
                    this.$refs.uploadForm.submitForm();
                }catch(ex){
                    this.errorText = "Submission Error - " + ex;
                    this.errorAlert = true
                }
            },
            async stepSaveUploadForm(transitionNextStepAfterSave) {
              if(this.$refs.uploadForm.validateForm()) {
                  if((!this.uploadId ) && !this.createUploadInProgress) {
                      // console.log("create new upload");
                      const submission = this.$refs.uploadForm.getSubmission();
                      try{
                          await this.triggerUploadFormSubmit();
                      }catch(e){
                          this.errorAlert = true;
                          this.errorText = e;
                          transitionNextStepAfterSave = false;
                      }
                      
                    const initialUpload = {
                        name: submission.data.datasetName,
                        description: submission.datauploadDescription,
                        uploader: this.user.email,
                        upload_submission_id: this.$refs.uploadForm.submissionId,
                        form_name: this.formName
                    }
                    try{
                        let d = await this.createInitialUpload(initialUpload);
                        this.uploadId = d._id;
                        if (typeof(this.uploadId) === "undefined"){
                            this.errorAlert = true;
                            this.errorText = "Error saving your work has not been saved, please try logging in again";
                            transitionNextStepAfterSave = false;
                        }else{
                            this.$router.push('/upload/'+d._id);
                        }
                    }catch(e){
                        this.errorAlert = true;
                        this.errorText = e;
                        transitionNextStepAfterSave = false;
                    }
                      
                  }else{
                      // console.log("update existing upload submission");
                      try{
                          await this.triggerUploadFormSubmit();
                          const submission = this.$refs.uploadForm.getSubmission();
                          
                          let changed = false;
                          if (this.upload.name !== submission.data.datasetName){
                              changed = true;
                              this.upload.name = submission.data.datasetName
                          }
                          if (this.upload.description !== submission.datauploadDescription){
                              changed = true;
                              this.upload.description = submission.datauploadDescription
                          }
                          if (changed){
                              await this.updateUpload(this.upload);
                          }
                      }catch(e){
                          this.errorAlert = true;
                          this.errorText = e;
                          transitionNextStepAfterSave = false;
                      }
                  }
                  if(transitionNextStepAfterSave) { this.step = this.steps.step2FileSelection; }
              }else{
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
                errorAlert: false,
                errorText: "",
                step: 1,
                validStep3: false,
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
                formName: state => state.uploadForm.formName,
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
        },
        beforeDestroy() {
            this.resetFormState();
        },

    }
</script>
<style scoped>
.fixed{
    position: fixed;
}
</style>
