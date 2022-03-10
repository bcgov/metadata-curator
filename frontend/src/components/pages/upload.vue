<template>
    <v-container>
        <v-row v-if="errorAlert">
            <v-col cols=12 class="pa-0">
                <v-alert class="mb-0" v-model="errorAlert" type="error" dismissible>
                    {{errorText}}
                </v-alert>
            </v-col>
        </v-row>
        <v-row v-if="warningAlert">
            <v-col cols=12 class="pa-0">
                <v-alert class="mb-0" v-model="warningAlert" type="warning" dismissible>
                    {{warningText}}
                </v-alert>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols=12 v-if="loading">
                <span>{{$tc('Loading')}}...</span>
                <v-progress-circular indeterminate></v-progress-circular>
            </v-col>
            <v-col cols=12 v-else-if="notFound">
                <span>{{$tc('404 Not Found')}}...</span>
            </v-col>

            <v-col cols=12 v-else>
                <v-stepper v-model="step">
                    <v-stepper-header>
                        <v-stepper-step v-if="user.isApprover || user.isAdmin" :step="steps.step0PreCreate" :complete="step > steps.step0PreCreate" >{{$tc('Pre-Create Info')}}</v-stepper-step>
                        <v-divider></v-divider>

                        <v-stepper-step :step="steps.step1UploadForm" :complete="step > steps.step1UploadForm" >{{$tc('Upload Info')}}</v-stepper-step>
                        <v-divider></v-divider>

                        <v-stepper-step v-if="enabledPhase >= 2 && (user.isApprover || user.isAdmin || (user._json.preferred_username === TEST_ACCOUNT) )" :step="steps.step2EditionForm" :complete="step > steps.step2EditionForm" >{{$tc('Version') + ' ' +$tc('Information')}}</v-stepper-step>
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
                                <span>{{$tc('NOTE: you will be unable to change this after the next form')}}</span>
                            </v-card>
                            
                            <v-btn text @click="stepSavePreCreate" id="next-0">{{$tc('Next')}}</v-btn>
                        </v-stepper-content>
                        
                        <v-stepper-content :step="steps.step1UploadForm">
                            <v-card class="mb-12">
                                <UploadForm ref="uploadForm"></UploadForm>
                            </v-card>
                            <v-btn text v-if="(user.isApprover || user.isAdmin) && !uploadId" @click="step = steps.step0PreCreate" id="back-1">{{$tc('Back')}}</v-btn>
                            <v-btn text color="primary" @click="stepSaveUploadForm(true)" id="next-1">{{$tc('Save & Next')}}</v-btn>
                        </v-stepper-content>

                        <v-stepper-content :step="steps.step2EditionForm" v-if="enabledPhase >= 2 && (user.isApprover || user.isAdmin || (user._json.preferred_username === TEST_ACCOUNT))">
                            <v-card class="mb-12">
                                <v-row>
                                    <v-col cols=9>
                                        <v-select 
                                            v-model="selectedDataset" 
                                            :items="datasetList"  
                                            item-text="name"
                                            item-value="_id"
                                            :label="$tc('Datasets')">
                                        </v-select>
                                    </v-col>
                                    <v-col cols=3>
                                        <v-btn v-if="allowCreate" color="success" id="newDatasetButton" @click="createDataset">{{$tc('New')}} {{$tc('Datasets')}}</v-btn>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols=9>
                                        <v-select 
                                            v-model="selectedVersion"
                                            :disabled="versionListLoading" 
                                            :items="versionList"  
                                            item-text="name"
                                            item-value="_id"
                                            :label="$tc('Versions')">
                                        </v-select>
                                    </v-col>
                                    <v-col cols=3 v-if="!versionListLoading">
                                        <v-btn v-if="allowCreateVersion" color="success" :disabled="!selectedDataset || selectedDataset === '-1'" id="newVersionButton" @click="createVersion">{{$tc('New')}} {{$tc('Versions')}}</v-btn>
                                    </v-col>
                                    <v-col cols=3 v-else>
                                        <v-progress-circular
                                            indeterminate
                                            color="primary"
                                        ></v-progress-circular>
                                    </v-col>
                                </v-row>
                            </v-card>
                            <v-btn text @click="step=steps.step1UploadForm" id="back-2">{{$tc('Back')}}</v-btn>
                            <v-btn text color="primary" @click="stepSaveEditionForm(true)" id="next-2">{{$tc('Save & Next')}}</v-btn>
                        </v-stepper-content>

                        <v-stepper-content :step="steps.step3FileSelection">
                            <v-card class="mb-12">
                                <FileForm v-if="step === steps.step3FileSelection" ref="fileForm" @changed="step2Changed"></FileForm>
                            </v-card>
                            
                            <v-btn text @click="step=((enabledPhase >= 2 && (user.isAdmin || user.isApprover)) ? steps.step2EditionForm : steps.step1UploadForm)" id="back-3">{{$tc('Back')}}</v-btn>
                            <v-btn :disabled="!validStep3" @click="stepSaveFileForm(true)" id="next-3">{{$tc('Next')}}</v-btn>
                            
                        </v-stepper-content>

                        <v-stepper-content :step="steps.step4FileLevelForm">
                            <v-card class="mb-12">
                                <FileInfoForm 
                                    v-if="step === steps.step4FileLevelForm" 
                                    ref="fileInfoForm" 
                                    @update="(s, e, t, ty, d, n) => { fileInfo = {start: s, end: e, title: t, type: ty, description: d, num_records: n} }"
                                    :modifyStoreNow="fileInfoModify"></FileInfoForm>
                            </v-card>
                            <v-btn text @click="step=steps.step3FileSelection" id="back-4">{{$tc('Back')}}</v-btn>
                            <v-btn @click="stepSaveFileInfoForm(true)" id="next-4">{{$tc('Next')}}</v-btn>
                            
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
                                        <v-btn text @click="step=steps.step4FileLevelForm" id="back-5-2">{{$tc('Back')}}</v-btn>
                                        <v-btn @click="stepSaveSchemaForm(true)" id="next-5-2">{{$tc('Next')}}</v-btn>
                                    </v-col>
                                    <v-col cols=12>
                                        <Comparison :key="'comparisonObj-'+jsonRedraw" :left-side-text="JSON.stringify(inferredSchema)" :right-side-text="JSON.stringify(schema)" :diff-json="true"></Comparison>
                                    </v-col>
                                </v-row>
                            </v-card>
                            
                            <v-btn text @click="step=steps.step4FileLevelForm" id="back-5">{{$tc('Back')}}</v-btn>
                            <v-btn @click="stepSaveSchemaForm(true)" id="next-5">{{$tc('Next')}}</v-btn>
                            
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

    import JsonEditor from '../JsonEditor/JsonEditor';
    const { Schema } = require('tableschema')
    const TEST_ACCOUNT = "provider_1"

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
            this.modifyStoreUpload({});
            await this.getAllRepos();
            if(this.$route.params.id && this.$route.params.id != 'new') { 
                this.uploadId = this.$route.params.id; 
            }else{
                //this.resetState();
            }
            if (this.enabledPhase < 2){
                this.steps.step3FileSelection = 2;
                this.steps.step4FileLevelForm = 3;
                this.steps.step6UploadProgress = 4;
                this.steps.step7UploadSummary = 5;
            }else{
                if ( (this.user.isApprover || this.user.isAdmin) && !this.uploadId){
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
                if (this.upload === null){
                    this.loading = false;
                    this.notFound = true;
                    this.errorAlert = true;
                    this.errorText = "Upload not found";
                    return;
                }

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
                        if (this.versions[0].variable_classification){
                            await this.getVariableClassification({field: '_id', value: this.versions[0].variable_classification});
                        }
                    }else{
                        await this.getVariableClassifications({});
                        await this.getVariableClassification({field: '_id', value: this.variableClassifications[0]._id});
                    }
                }
            }

            if (this.user._json.preferred_username === TEST_ACCOUNT){
                this.allowCreate = true;
                this.allowCreateVersion = true;
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
                getBranchById: 'repos/getBranchById',
                getBranches: "repos/getBranches",
                getBranchesByUpload: "repos/getBranchesByUpload",
                saveBranch: 'repos/saveBranch',
                updateBranch: 'repos/updateBranch',
                getVariableClassifications: 'variableClassifications/getItems',
                getVariableClassification: 'variableClassifications/getItem',
                modifyStoreUpload: 'upload/modifyStoreUpload',
            }),
            ...mapMutations({
                resetState: 'upload/resetState',
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
                let requiredFileNum = (this.upload && this.upload.num_files) ? this.upload.num_files : 0;
                this.validStep3 = numFiles == requiredFileNum;
            },

            stepSavePreCreate(){
                if (this.providerGroup){
                    this.step = this.steps.step1UploadForm
                }else{
                    this.errorAlert = true;
                    this.errorText = "You must select a group"
                }
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

            async stepSaveUploadForm(transitionNextStepAfterSave) {
                if ( (this.user.isApprover || this.user.isAdmin) && ( (this.providerGroup === null) || (this.providerGroup === '') ) && (!this.uploadId) ){
                  this.errorAlert = true;
                  this.errorText = "As a data approver you must select a data provider group you are creating for";
                  return false;
                }

                let modifiedUpload = JSON.parse(JSON.stringify(this.upload));
                if (!modifiedUpload){
                    modifiedUpload = {};
                }
                modifiedUpload.provider_group = this.providerGroup;
                await this.modifyStoreUpload(modifiedUpload);
                
                if (!this.upload || !this.upload._id){
                    let u = await this.createInitialUpload(this.upload);
                    await this.$router.push({name: 'upload_view', params: {id: u._id}});
                }else{
                    await this.updateUpload(this.upload);
                }
                
                if ( (this.uploadError) && (this.uploadError !== null) ){
                    transitionNextStepAfterSave = false;
                    this.errorAlert = true;
                    this.errorText = this.uploadError;
                    return false;
                }

                this.errorAlert = false;

                if(transitionNextStepAfterSave) { 
                    if (this.user.isApprover || this.user.isAdmin){
                        this.step = (this.enabledPhase >= 2) ? this.steps.step2EditionForm : this.steps.step3FileSelection;
                    }else{
                        if ( (this.enabledPhase >= 2) && (this.selectedVersion == "-1") && (this.user._json.preferred_username !== TEST_ACCOUNT) ){
                            this.errorAlert = true;
                            this.errorText = "You are not allowed to proceed until this upload has been assigned an "+this.$tc('version',1);
                            return false;
                        }
                        if (this.user._json.preferred_username === TEST_ACCOUNT){
                            this.step = (this.enabledPhase >= 2) ? this.steps.step2EditionForm : this.steps.step3FileSelection;
                        }else{
                            this.step = this.steps.step3FileSelection; 
                        }
                    }
                }
            },

            async stepSaveFileForm(transitionNextStepAfterSave) {
                if (!this.validStep3){
                    transitionNextStepAfterSave = false;
                }
                await this.updateUpload(this.upload);
                if(transitionNextStepAfterSave) { 
                    this.step = this.steps.step4FileLevelForm; 
                }
            },

            async stepSaveEditionForm(transitionNextStepAfterSave){
                if (this.selectedDataset == "-1"){
                    this.errorText = "You must select or create a dataset first";
                    this.errorAlert = true;
                    this.transitionNextStepAfterSave = false;
                    return;
                }

                if (this.selectedVersion === "-1"){
                    this.errorText = "You must select or create an edition first";
                    this.errorAlert = true;
                    this.transitionNextStepAfterSave = false;
                    return;
                }else{
                    await this.getBranchById({id: this.selectedVersion});
                }

                try{
                    this.editBranch({name: 'data_upload_id', value: this.uploadId});
                    await this.updateBranch();
                }catch(e){
                    transitionNextStepAfterSave = false;
                    this.errorAlert = true;
                    this.errorText = e.message;
                }


                this.warningAlert = false;
                this.warningText = '';
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
                let f = JSON.parse(JSON.stringify(this.upload));
                for (let i=0; i<f.files.length; i++){
                    f.files[i].start_date = (this.fileInfo && this.fileInfo.start && this.fileInfo.start[i]) ? this.fileInfo.start[i] : '';
                    f.files[i].end_date = (this.fileInfo && this.fileInfo.end && this.fileInfo.end[i]) ? this.fileInfo.end[i] : '';
                    f.files[i].title = (this.fileInfo && this.fileInfo.title && this.fileInfo.title[i]) ? this.fileInfo.title[i] : '';
                    f.files[i].type = (this.fileInfo && this.fileInfo.type && this.fileInfo.type[i]) ? this.fileInfo.type[i] : '';
                    f.files[i].description = (this.fileInfo && this.fileInfo.description && this.fileInfo.description[i]) ? this.fileInfo.description[i] : '';
                    f.files[i].num_records = (this.fileInfo && this.fileInfo.num_records && this.fileInfo.num_records[i]) ? this.fileInfo.num_records[i] : '';
                }
                await this.modifyStoreUpload(f);

                let valid = true;
                if (this.upload.files){
                    
                    for (let i=0; i<this.upload.files.length; i++){
                        if ((!this.upload.files[i].start_date) || (!this.upload.files[i].end_date)){
                            this.errorAlert = true;
                            this.errorText = "All start and end dates are required"
                            valid = false;
                        }
                        if ( (this.upload.files[i].type === "Data") && (!this.upload.files[i].num_records) && (this.upload.files[i].num_records !== 0) ){
                            this.errorAlert = true;
                            this.errorText = "Number of Records is required for data file types"
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

            async createVersion(){
                if (this.user._json.preferred_username !== TEST_ACCOUNT){
                    return false;
                }
                
                if (!this.selectedDataset){
                    this.errorAlert = true;
                    this.errorText = "Must select a " + this.$tc("Datasets") + " first"
                    return;
                }

                this.clearBranch();
                this.editBranch({name: 'name', value: this.upload.name});
                let desc = ( (this.upload) && (this.upload.description)) ? this.upload.description : this.upload.name;
                
                this.editBranch({name: 'description', value: desc});
                this.editBranch({name: 'type', value: 'standard'});
                this.editBranch({name: 'data_upload_id', value: this.uploadId});
                this.editBranch({name: "repo_id", value: this.selectedDataset});
                let b = await this.saveBranch();
                this.selectedVersion = b.id;
                this.editBranch({name: "_id", value: this.selectedVersion});
                this.allowCreateVersion = false;
                this.allowSelectVersion = false;
                await this.getBranches({repoId: this.selectedDataset});
                this.versions
            },

            async createDataset(){
                if (this.user._json.preferred_username !== TEST_ACCOUNT){
                    return false;
                }
                this.clearDataset();
                this.editDataset({name: 'name', value: this.upload.name});
                let d = await this.saveDataset();
                await this.getAllRepos();
                this.setRepo({repo: {_id: d.id}});
                this.selectedDataset = d.id;
                
                this.allowCreate = false;
                this.allowSelect = false;

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
                allowCreate: false,
                allowSelect: true,
                selectedVersion: "-1",
                inferredSchema: {},
                showDiff: false,
                loading: false,
                providerGroup: null,
                selectableGroups: [],
                notFound: false,
                allowCreateVersion: false,
                allowSelectVersion: true,
                warningAlert: false,
                warningText: '',
                fileInfoModify: false,
                TEST_ACCOUNT: TEST_ACCOUNT,
                fileInfo: {},
                versionListLoading: false,
            }
        },
        computed: {
            ...mapState({
                user: state => state.user.user,
                upload: state => state.upload.upload,
                uploadError: state => state.upload.error,
                createUploadInProgress: state => state.upload.createUploadInProgress,
                newUploadCreated: state => state.upload.newUploadCreated,
                schemaState: state => state.schemaImport.dataPackageSchema,
                datasets: state => state.repos.allRepos,
                versions: state => state.repos.branches,
                inferContent: state => state.file.content,
                variableClassifications: state => state.variableClassifications.items,
                variableClassification: state => state.variableClassifications.wipItem,
                
            }),

            admin: function(){
                return this.user.isAdmin;
            },

            enabledPhase(){
                let en = this.$store.state.config.items.find(item => item['key'] === 'enabledPhase');
                return (en) ? parseInt(en.value) : 1;
            },

            versionList: function(){
                let v = JSON.parse(JSON.stringify(this.versions));
                v = v.filter(obj => {
                    return obj.approved === false;
                });
                v.unshift({name: "", _id: "-1"});
                return v;
            }
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
                    this.versionListLoading = true;
                    await this.getBranches({repoId: this.selectedDataset});
                    this.versionListLoading = false;
                    let valid = false;
                    for (let i=0; i<this.versions.length; i++){
                        if (this.versions[i]._id === this.selectedVersion){
                            valid = true;
                            break;
                        }
                    }

                    if (!valid){
                        if (this.versions.length>0){
                            await this.getSchemaFromVersion({id: this.versions[0]._id});
                            if (this.versions[0].variable_classification){
                                this.getVariableClassification({field: '_id', value: this.versions[0].variable_classification});
                            }
                            this.selectedVersion = this.versions[0]._id;
                        }else{
                            this.selectedVersion = "-1";
                        }
                    }

                }else{
                    this.selectedVersion = "-1";
                    this.schema = {resources: []};
                    this.jsonRedraw++;
                }
            },

            selectedVersion: async function(){
                if (this.selectedVersion != "-1"){
                    await this.getSchemaFromVersion({id: this.selectedVersion});
                    let selectedV = this.versions.filter(obj => {
                        return obj._id === this.selectedVersion;
                    })[0];
                    if (selectedV.variable_classification){
                        this.getVariableClassification({field: '_id', value: selectedV.variable_classification});
                    }
                    if ( (selectedV.data_upload_id) && (this.step == this.steps.step2EditionForm)){
                        this.warningAlert = true;
                        this.warningText = "This " + this.$tc('version', 1) + " is already associated with an upload, pressing next will overwrite that information";
                    }
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
                        //     if ( (this.selectedDataset === '-1') || (this.selectedVersion === '-1') ){
                        //         this.step = this.steps.step2EditionForm;
                        //     }else{
                        //         this.step = this.steps.step3FileSelection;
                        //     }
                        // }else{
                        //     this.step = this.steps.step3FileSelection;
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

    }
</script>
<style scoped>
.fixed{
    position: fixed;
    z-index: 100;
}
</style>
