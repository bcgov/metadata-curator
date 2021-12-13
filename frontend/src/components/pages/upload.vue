<template>
    <v-container>
        <v-row v-if="errorAlert">
            <v-col cols=12 class="pa-0">
                <v-alert class="mb-0" v-model="errorAlert" type="error" dismissible>
                    {{errorText}}
                </v-alert>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols=12 v-if="loading">
                <span>{{$tc('Loading')}}...</span>
                <v-progress-circular indeterminate></v-progress-circular>
            </v-col>
            <v-col cols=12 v-else>
                <v-stepper v-model="step">
                    <v-stepper-header>
                        <v-stepper-step v-if="user.isApprover" :step="steps.step0PreCreate" :complete="step > steps.step0PreCreate" >{{$tc('Pre-Create Info')}}</v-stepper-step>
                        <v-divider></v-divider>

                        <v-stepper-step :step="steps.step1UploadForm" :complete="step > steps.step1UploadForm" >{{$tc('Upload Info')}}</v-stepper-step>
                        <v-divider></v-divider>

                        <v-stepper-step v-if="enabledPhase >= 2" :step="steps.step2EditionForm" :complete="step > steps.step2EditionForm" >{{$tc('Version') + ' ' +$tc('Information')}}</v-stepper-step>
                        <v-divider></v-divider>

                        <v-stepper-step :step="steps.step3FileSelection" :complete="step > steps.step3FileSelection" >{{$tc('File Selection')}}</v-stepper-step>
                        <v-divider></v-divider>

                        <v-stepper-step :step="steps.step4FileLevelForm" :complete="step > steps.step4FileLevelForm" >{{$tc('File Level Info')}}</v-stepper-step>
                        <v-divider></v-divider>

                        <v-stepper-step v-if="enabledPhase >= 2" :step="steps.step5SchemaInformation" :complete="step > steps.step5SchemaInformation" >{{$tc('Schema Information')}}</v-stepper-step>
                        <v-divider></v-divider>

                        <v-stepper-step :step="steps.step6UploadProgress" :complete="step > steps.step6UploadProgress" >{{$tc('Upload Progress')}}</v-stepper-step>
                        <v-divider></v-divider>

                        <v-stepper-step :step="steps.step7UploadSummary">{{$tc('Upload Summary')}}</v-stepper-step>
                    </v-stepper-header>

                    <v-stepper-items>

                        <v-stepper-content :step="steps.step0PreCreate">
                            <v-card class="mb-12">
                                <Select
                                    :label="$tc('Select Data Provider Group to pre-create for')"
                                    name="providerGroup"
                                    :editing="true"
                                    :value="providerGroup"
                                    :items="selectableGroups"
                                    helpPrefix="upload"
                                    @edited="(newValue) => { providerGroup = newValue; }"
                                ></Select>
                            </v-card>
                            <v-btn text @click="step = steps.step1UploadForm" id="next-0">{{$tc('Next')}}</v-btn>
                        </v-stepper-content>
                        
                        <v-stepper-content :step="steps.step1UploadForm">
                            <v-card class="mb-12">
                                <UploadForm ref="uploadForm"></UploadForm>
                            </v-card>
                            <v-btn text v-if="user.isApprover" @click="step = steps.step0PreCreate" id="back-1">{{$tc('Back')}}</v-btn>
                            <v-btn text @click="stepSaveUploadForm(true)" id="next-1">{{$tc('Next')}}</v-btn>
                        </v-stepper-content>

                        <v-stepper-content :step="steps.step2EditionForm" v-if="enabledPhase >= 2">
                            <v-card class="mb-12">
                                <v-select 
                                    v-model="selectedDataset" 
                                    
                                    :items="datasetList"  
                                    item-text="name"
                                    item-value="_id"
                                    :label="$tc('Datasets')">
                                </v-select>
                                <div v-if="admin && this.selectedVersion && this.versions && this.versions[0]">Version: {{this.selectedVersion}} - {{this.versions[0].name}}</div>
                                <v-btn v-if="allowCreate" id="newDatasetButton" @click="createDataset">{{$tc('New')}} {{$tc('Datasets')}}</v-btn>
                            </v-card>
                            <v-btn text @click="step=steps.step1UploadForm" id="back-2">{{$tc('Back')}}</v-btn>
                            <v-btn text @click="stepSaveEditionForm(true)" id="next-2">{{$tc('Next')}}</v-btn>
                        </v-stepper-content>

                        <v-stepper-content :step="steps.step3FileSelection">
                            <v-card class="mb-12">
                                <FileForm v-if="step === steps.step3FileSelection" ref="fileForm" @changed="step2Changed"></FileForm>
                            </v-card>
                            
                            <v-btn text @click="step=(enabledPhase >= 2) ? steps.step2EditionForm : steps.steps.step1UploadForm" id="back-3">{{$tc('Back')}}</v-btn>
                            <v-btn color="primary" :disabled="!validStep3" @click="stepSaveFileForm(true)" id="next-3">{{$tc('Next')}}</v-btn>
                            
                        </v-stepper-content>

                        <v-stepper-content :step="steps.step4FileLevelForm">
                            <v-card class="mb-12">
                                <FileInfoForm v-if="step === steps.step4FileLevelForm" ref="fileInfoForm"></FileInfoForm>
                            </v-card>
                            <v-btn text @click="step=steps.step3FileSelection" id="back-4">{{$tc('Back')}}</v-btn>
                            <v-btn color="primary" @click="stepSaveFileInfoForm(true)" id="next-4">{{$tc('Next')}}</v-btn>
                            
                        </v-stepper-content>

                        <v-stepper-content :step="steps.step5SchemaInformation" v-if="enabledPhase >= 2">
                            <v-card class="mb-12">
                                <v-row>
                                    <v-col cols=12 class="pa-0">
                                        <v-alert class="mb-0" v-model="showDiff" type="error" dismissible>
                                            {{$tc('The schema you have provided differs from the one we were expecting please review before uploading')}}
                                        </v-alert>
                                    </v-col>
                                </v-row>
                                <v-row v-if="!showDiff">
                                    <v-col cols=12>
                                        <JsonEditor :key="'jsonEditor-'+jsonRedraw" :val="schema" @edited="updateSchema" :state-type-parent="0" :raw="false"></JsonEditor>
                                    </v-col>
                                </v-row>
                                <v-row v-else>
                                    <v-col cols=12>
                                        <Comparison :left-side-text="JSON.stringify(inferredSchema)" :right-side-text="JSON.stringify(schema)" :diff-json="true"></Comparison>
                                    </v-col>
                                </v-row>
                            </v-card>
                            
                            <v-btn text @click="step=steps.step4FileLevelForm" id="back-5">{{$tc('Back')}}</v-btn>
                            <v-btn color="primary" @click="stepSaveSchemaForm(true)" id="next-5">{{$tc('Next')}}</v-btn>
                            
                        </v-stepper-content>

                        <v-stepper-content :step="steps.step6UploadProgress">
                            <v-card class="mb-12">
                                <FileUploadForm v-if="step === steps.step6UploadProgress" @uploads-finished="stepSaveFileUploads" :active="step === steps.step6UploadProgress"></FileUploadForm>
                            </v-card>
                            <!--<v-btn color="primary" @click="step=steps.step7UploadSummary">Next</v-btn>
                            <v-btn text @click="step=steps.step4FileLevelForm">Back</v-btn>-->
                        </v-stepper-content>

                        <v-stepper-content :step="steps.step7UploadSummary">
                            <v-card class="mb-12">
                                
                            </v-card>
                        </v-stepper-content>
                    </v-stepper-items>
                </v-stepper>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>

    import {mapActions, mapMutations, mapState} from "vuex";
    import UploadForm from "../UploadForm";
    import FileForm from "../FileForm";
    import FileInfoForm from "../FileInfoForm";
    import FileUploadForm from "../FileUploadForm";
    import Comparison from '../Comparison';
    import Select from '../Select';

    import { Backend } from '../../services/backend';
    import JsonEditor from '../JsonEditor/JsonEditor';
    const backend = new Backend();
    const { Schema } = require('tableschema')

    export default {
        components:{
            UploadForm,
            FileForm,
            FileInfoForm,
            FileUploadForm,
            JsonEditor,
            Comparison,
            Select,
        },
        async created() {
            this.loading = true;
            this.$store.commit('file/clearContent');
            await this.getAllRepos();
            if(this.$route.params.id && this.$route.params.id != 'new') { 
                this.uploadId = this.$route.params.id; 
            }else{
                //this.resetFormState();
                //this.resetState();
            }
            if (this.enabledPhase < 2){
                this.steps.step3FileSelection = 2;
                this.steps.step4FileLevelForm = 3;
                this.steps.step6UploadProgress = 4;
                this.steps.step7UploadSummary = 5;
            }else{
                if (this.user.isApprover){
                    this.step = 0;
                    let requiredRole = await this.$store.dispatch('config/getItem', {field: 'key', value: 'requiredRoleToCreateRequest', def: {key: 'requiredRoleToCreateRequest', value: false}});
                    requiredRole = requiredRole.value;
                    this.selectableGroups = JSON.parse(JSON.stringify(this.user.groups));
                    let index = this.selectableGroups.indexOf(requiredRole);
                    if (index !== -1){
                        this.selectableGroups.splice(index, 1);
                    }
                }
            }
            if(this.uploadId) { 
                await this.getUpload(this.uploadId); 
                await this.getUploadFormSubmission({formName: this.upload.form_name, submissionId: this.upload.upload_submission_id});
                if (this.enabledPhase >= 2){
                    await this.getSchema({id: this.uploadId});
                    await this.getAllRepos();
                    await this.getBranchesByUpload({uploadId: this.uploadId})

                    this.selectedDataset = '-1';
                    this.selectedVersion = '-1';

                    if (this.schemaState && this.schemaState.version){
                        this.selectedVersion = this.schemaState.version
                        // this.getBranchesByUpload({uploadId: this.uploadId})
                    }
                
                    if (this.versions && this.versions[0] && this.versions[0].repo_id){
                        this.selectedDataset = this.versions[0].repo_id;
                        this.selectedVersion = this.versions[0]._id;
                        this.allowSelect = false;
                    }
                }
            }
            this.loading = false;
        },
        methods: {
            ...mapActions({
                getUpload: 'upload/getUpload',
                createInitialUpload: 'upload/createInitialUpload',
                updateUpload: 'upload/updateUpload',
                getSchema: 'schemaImport/getDataPackageByUploadId',
                getSchemaFromVersion: 'schemaImport/getDataPackage',
                createDataPackageSchema: 'schemaImport/createDataPackageSchema',
                createDataPackageSchemaInferred: 'schemaImport/createDataPackageSchemaInferred',
                updateDataPackageSchema: 'schemaImport/updateDataPackageSchema',
                getAllRepos: 'repos/getAllRepos',
                saveDataset: 'repos/saveRepo',
                getBranches: "repos/getBranches",
                getBranchesByUpload: "repos/getBranchesByUpload",
                saveBranch: 'repos/saveBranch',
                getUploadFormSubmission: 'uploadForm/getUploadFormSubmission',
            }),
            ...mapMutations({
                resetState: 'upload/resetState',
                resetFormState: 'uploadForm/resetState',
                setDataPackageSchema: 'schemaImport/setDataPackageSchema',
                setTableSchema: 'schemaImport/setTableSchema',
                setTableSchemaId: "schemaImport/setTableSchemaId",
                editDataset: 'repos/editRepo',
                clearDataset: 'repos/clearRepo',
                editBranch: 'repos/editBranch',
                clearBranch: 'repos/clearBranch',
                setRepo: 'repos/setRepo',
                clearContent: 'file/clearContent',
            }),

            step2Changed(numFiles){
                this.validStep3 = numFiles > 0;
            },

            async infer(){
                this.inferredSchema = {resources: []}
                for (let i=0; ( (i<this.inferContent.length) && (i<this.upload.files.length) ); i++){
                    try{
                        let string = new TextDecoder().decode(this.inferContent[i]);
                        let rows = string.split("\n");
                        for (let i=0; i<rows.length; i++){
                            let delim = ",";
                            if (rows[i].indexOf("\", \"") !== -1){
                                delim = "\", \"";
                            }else if (rows[i].indexOf("\",\"") !== -1){
                                delim = "\",\"";
                            }else if (rows[i].indexOf(", ") !== -1){
                                delim = ", ";
                            }

                            rows[i] = rows[i].split(delim);
                        }
                        let headers = rows.shift();
                        rows.unshift(headers);
                        let s = await Schema.load({});
                        s.infer(rows, headers);
                        this.inferredSchema.resources.push({
                            name: this.upload.files[i].name.substring(0,this.upload.files[i].name.lastIndexOf('.')),
                            path: "./"+this.upload.files[i].name,
                            schema: s.descriptor,
                            description: this.upload.files[i].description,
                            temporal_start: this.upload.files[i].start_date,
                            temporal_end: this.upload.files[i].end_date,
                        });
                    }catch(ex){
                        console.error("Error inferring:", ex);
                    }
                }

                this.showDiff = false;
                if (Object.keys(this.schema).length >= 1){
                    this.showDiff = JSON.stringify(this.inferredSchema) !== JSON.stringify(this.schema);
                }else{
                    this.schema = JSON.parse(JSON.stringify(this.inferredSchema));
                }
                this.jsonRedraw++;
            },

            async triggerUploadFormSubmit() {
                try{
                    //await this.$refs.uploadForm.submitForm();
                    let submission = await this.$refs.uploadForm.getSubmission()
                    let data = await backend.postFormSubmission(this.formName, submission.data);
                    return data;
                }catch(ex){
                    this.errorText = "Submission Error - " + ex;
                    this.errorAlert = true
                    return {error: ex};
                }
            },
            async stepSaveUploadForm(transitionNextStepAfterSave) {
              if (this.user.isApprover && ( (this.providerGroup === null) || (this.providerGroup === '') ) ){
                  this.errorAlert = true;
                  this.errorText = "As a data approver you must select a data provider group you are creating for";
                  return false;
              }

              if(this.$refs.uploadForm.validateForm()) {
                  if((!this.uploadId ) && !this.createUploadInProgress) {
                      let data;
                      try{
                          data = await this.triggerUploadFormSubmit();
                      }catch(e){
                          this.errorAlert = true;
                          this.errorText = e;
                          transitionNextStepAfterSave = false;
                      }
                      const submission = this.$refs.uploadForm.getSubmission();
                      
                    const initialUpload = {
                        name: submission.data.datasetName,
                        description: submission.datauploadDescription,
                        uploader: this.user.email,
                        upload_submission_id: data._id,
                        form_name: this.formName,
                        provider_group: this.providerGroup,
                    }
                    try{
                        let d = await this.createInitialUpload(initialUpload);
                        this.uploadId = d._id;
                        if (typeof(this.uploadId) === "undefined"){
                            this.errorAlert = true;
                            this.errorText = "Error saving your work has not been saved, please try logging in again";
                            transitionNextStepAfterSave = false;
                        }else{
                            await this.getUploadFormSubmission({formName: this.upload.form_name, submissionId: this.upload.upload_submission_id});
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
                          let tmpUp = JSON.parse(JSON.stringify(this.upload));
                          if (this.upload.name !== submission.data.datasetName){
                              changed = true;
                              tmpUp.name = submission.data.datasetName
                          }
                          if (this.upload.description !== submission.datauploadDescription){
                              changed = true;
                              tmpUp.description = submission.datauploadDescription
                          }
                          if (changed){
                              await this.updateUpload(tmpUp);
                          }
                      }catch(e){
                          this.errorAlert = true;
                          this.errorText = e;
                          transitionNextStepAfterSave = false;
                      }
                  }
                  if(transitionNextStepAfterSave) { 
                      this.step = (this.enabledPhase >= 2) ? this.steps.step2EditionForm : this.steps.step3FileSelection; }
              }else{
                //still trigger submit so form displays all validation errors on UI
                this.triggerUploadFormSubmit();
              }
            },

            async stepSaveFileForm(transitionNextStepAfterSave) {
                await this.updateUpload(this.upload);
                if(transitionNextStepAfterSave) { 
                    this.step = this.steps.step4FileLevelForm; 
                }
            },

            async stepSaveEditionForm(transitionNextStepAfterSave){
                if (this.selectedDataset == -1){
                    this.errorText = "You must select or create a dataset first";
                    this.errorAlert = true;
                    this.transitionNextStepAfterSave = false;
                    return;
                }

                if (this.selectedVersion == -1){
                    this.clearBranch();
                    this.editBranch({name: 'name', value: this.upload.name});
                    let desc = ((this.submission) && (this.submission.data) && (this.submission.data.description)) ? this.submission.data.description : this.upload.name;
                    if ((desc === this.upload.name) && (this.submission.data.uploadDescription)){
                        desc = this.submission.data.uploadDescription;
                    }
                    this.editBranch({name: 'description', value: desc});
                    this.editBranch({name: 'upload_id', value: this.uploadId});
                    this.editBranch({name: 'type', value: 'standard'});
                    this.editBranch({name: 'data_upload_id', value: this.uploadId});
                    this.editBranch({name: "repo_id", value: this.selectedDataset});
                    let b = await this.saveBranch();
                    this.selectedVersion = b.id;
                }

                if(transitionNextStepAfterSave) { this.step = this.steps.step3FileSelection; }
            },

            async stepSaveSchemaForm(transitionNextStepAfterSave){

                if (this.selectedDataset == -1){
                    this.errorText = "You must select or create a dataset first";
                    this.errorAlert = true;
                    this.transitionNextStepAfterSave = false;
                    return;
                }

                if (this.schemaState && this.schemaState._id){
                    this.schema._id = this.schemaState._id;
                }
                if (this.schemaState && this.schemaState.profile){
                    this.schema.profile = this.schemaState.profile;
                }

                this.schema.version = this.selectedVersion;

                let oSchema = JSON.parse(JSON.stringify(this.schemaState));

                this.inferredSchema.version = this.selectedVersion;
                this.setDataPackageSchema({schema: this.inferredSchema});
                await this.createDataPackageSchemaInferred();
                
                if (oSchema === null || Object.keys(oSchema).length === 0){
                    if (this.schemaState && this.schemaState._id){
                        this.schema._id = this.schemaState._id;
                    }
                    if (this.schemaState && this.schemaState.profile){
                        this.schema.profile = this.schemaState.profile;
                    }

                    this.schema.version = this.selectedVersion;
                    this.setDataPackageSchema({schema: this.schema});
                    await this.createDataPackageSchema();
                }
                
                if(transitionNextStepAfterSave) { this.step = this.steps.step6UploadProgress; }
            },

            async stepSaveFileInfoForm(transitionNextStepAfterSave) {
                let valid = true;
                if (this.upload.files){
                    
                    for (let i=0; i<this.upload.files.length; i++){
                        if ((!this.upload.files[i].start_date) || (!this.upload.files[i].end_date)){
                            this.errorAlert = true;
                            this.errorText = "All start and end dates are required"
                            valid = false;
                        }
                    }
                }
                if (valid){
                    this.errorAlert = false;
                    this.errorText = "";
                    try{
                        await this.updateUpload(this.upload);
                        if(transitionNextStepAfterSave) { 
                            await this.infer();
                            this.step = (this.enabledPhase >= 2) ? this.steps.step5SchemaInformation : this.steps.step6UploadProgress; 
                        }
                    }catch(e){
                        this.errorAlert = true;
                        this.errorText = "Error updating upload " + e
                        valid = false;
                    }
                }
            },

            async stepSaveFileUploads(){
                await this.updateUpload(this.upload);
                //this.step = this.steps.step7UploadSummary;
                this.$router.push({ name: 'data-upload-detail', id: this.uploadId });

            },

            updateSchema(newVal){
                this.schema = newVal;
            },

            async createDataset(){
                this.clearDataset();
                this.editDataset({name: 'name', value: this.upload.name});
                let d = await this.saveDataset();
                await this.getAllRepos();
                this.setRepo({repo: {_id: d.id}});
                this.selectedDataset = d.id;
                
                this.clearBranch();
                this.editBranch({name: 'name', value: this.upload.name});
                let desc = ((this.submission) && (this.submission.data) && (this.submission.data.description)) ? this.submission.data.description : this.upload.name;
                if ((desc === this.upload.name) && (this.submission.data.uploadDescription)){
                    desc = this.submission.data.uploadDescription;
                }
                this.editBranch({name: 'description', value: desc});
                this.editBranch({name: 'upload_id', value: this.uploadId});
                this.editBranch({name: 'type', value: 'standard'});
                this.editBranch({name: 'data_upload_id', value: this.uploadId});
                this.editBranch({name: "repo_id", value: this.selectedDataset});
                let b = await this.saveBranch();
                this.allowCreate = false;
                this.allowSelect = false;
                this.selectedVersion = b.id;

            },
        },
        data () {
            let steps = {
                step0PreCreate: 0,
                step1UploadForm: 1,
                step2EditionForm: 2,
                step3FileSelection: 3,
                step4FileLevelForm: 4,
                step5SchemaInformation: 5,
                step6UploadProgress: 6,
                step7UploadSummary: 7
            };
            return {
                uploadId: null,
                errorAlert: false,
                errorText: "",
                step: 1,
                validStep3: false,
                schema: {},
                steps: steps,
                selectedDataset: "-1",
                jsonRedraw: 0,
                datasetList: [],
                allowCreate: true,
                allowSelect: true,
                selectedVersion: -1,
                inferredSchema: {},
                showDiff: false,
                loading: false,
                providerGroup: null,
                selectableGroups: [],
            }
        },
        computed: {
            ...mapState({
                user: state => state.user.user,
                upload: state => state.upload.upload,
                createUploadInProgress: state => state.upload.createUploadInProgress,
                newUploadCreated: state => state.upload.newUploadCreated,
                formName: state => state.uploadForm.formName,
                schemaState: state => state.schemaImport.dataPackageSchema,
                datasets: state => state.repos.allRepos,
                versions: state => state.repos.branches,
                submission: state => state.uploadForm.submission,
                inferContent: state => state.file.content,
                
            }),

            admin: function(){
                return this.user.isAdmin;
            },

            enabledPhase(){
                let en = this.$store.state.config.items.find(item => item['key'] === 'enabledPhase');
                return (en) ? parseInt(en.value) : 1;
            },
        },
        watch: {

            datasets: function(){
                this.datasetList = JSON.parse(JSON.stringify(this.datasets));
                this.datasetList.unshift({name: "", _id: "-1"})
            },

            schemaState: function(){
                if (typeof(this.schemaState) !== "undefined" && this.schemaState !== null && Object.keys(this.schemaState).length !== 0){
                    this.schema = JSON.parse(JSON.stringify(this.schemaState));
                    delete this.schema._id;
                    delete this.schema.profile;
                    delete this.schema.version;
                    delete this.schema.__v;

                    this.jsonRedraw++;
                    this.allowCreate = false;
                }
            },

            selectedDataset: async function(){
                if ( (this.selectedDataset != '-1') && (this.selectedDataset != '') ){
                    await this.getBranches({repoId: this.selectedDataset});
                    if (this.versions.length > 0){
                        await this.getSchemaFromVersion({id: this.versions[0]._id});
                        this.selectedVersion = this.versions[0]._id;
                    }

                }else{
                    this.selectedVersion = -1;
                    this.schema = {resources: []};
                    this.jsonRedraw++;
                }
            },

            // eslint-disable-next-line no-unused-vars
            upload: async function (newVal, oldVal) {
                if(newVal && !oldVal) {
                    if(this.upload.upload_submission_id) {
                        
                        if (this.enabledPhase >= 2){
                            await this.getSchema({id: this.uploadId});
                            await this.getAllRepos();
                            await this.getBranchesByUpload({uploadId: this.uploadId})
                            if (this.schemaState && this.schemaState.version){
                                this.selectedVersion = this.schemaState.version
                                // this.getBranchesByUpload({uploadId: this.uploadId})
                            }
                        
                            if (this.versions && this.versions[0] && this.versions[0].repo_id){
                                this.selectedDataset = this.versions[0].repo_id;
                                this.allowSelect = false;
                                this.selectedVersion = this.versions[0]._id;
                            }
                            if ( (this.selectedDataset === '-1') || (this.selectedVersion === '-1') ){
                                this.step = this.steps.step2EditionForm;
                            }else{
                                this.step = this.steps.step3FileSelection;
                            }
                        }else{
                            this.step = this.steps.step3FileSelection;
                        }
                        
                        if (this.upload && this.upload.files && this.upload.files.length >= 1){
                            let allGood = true;
                            for (let i=0; i<this.upload.files.length; i++){
                                if ( (!this.upload.files[i].id) || (this.upload.files[i].id === "") || (this.upload.files[i].id.toLowerCase() === "not yet uploaded") ){
                                    allGood = false;
                                }
                            }
                            if (allGood){
                                //this.step = this.steps.step7UploadSummary;
                                this.$router.push({ name: 'data-upload-detail', id: this.uploadId });
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
    z-index: 100;
}
</style>
