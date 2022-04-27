<template>
    <v-container fluid :key="'branch-'+reIndex">
        <span v-if="(loading || !branch) && !creating">
            <v-row dense>
                {{$tc('Loading')}}...
            </v-row>
            <v-row>
                <v-btn @click="closeOrBack()" class="mt-1">{{dialog ? $tc('Close') : $tc('Back')}}</v-btn>
            </v-row>
        </span>

        <v-row v-else dense>
            <v-col cols=12>
                <v-alert
                    :type="alertType"
                    dismissible
                    v-model="alert">
                        {{alertText}}
                </v-alert>
            </v-col>
            <v-col cols="12">
                <v-tabs v-model="tab" @change="changeTab">
                    <v-tab key="version" id="version-tab">{{$tc('Version')}}</v-tab>
                    <v-tab v-if="dataset && !creating" key="dataset" id="dataset-tab">{{$tc('Dataset')}}</v-tab>
                    <v-tab key="schema" v-if="!creating" id="schema-tab">{{$tc('Schema')}}</v-tab>
                    <v-tab key="compare" v-if="!creating && inferredSchema" id="compare-tab">{{$tc('Compare')}}</v-tab>
                    <v-tab key="revisions" v-if="revisionsLoading === false && revisions.length>0" id="revisions-tab">{{$tc('Revisions', 2)}}</v-tab>
                    <v-tab key="schemaRevisions" v-if="schemaRevisionsLoading === false && schemaRevisions.length>0" id="schema-revisions-tab">{{$tc('Schema Revisions', 2)}}</v-tab>
                </v-tabs>
                <v-tabs-items v-model="tabItem" class="fullWidth">
                    <v-tab-item key="version">
                        <v-card outlined>
                            <v-card-text>
                                <v-row>
                                    <h1 class="display-1 font-weight-thin ml-3 my-3">{{creating ? $tc("New") + " " + $tc("Version") : $tc("Version") + " " +  ((branch && branch.name) ? branch.name : id)}}</h1>
                                </v-row>

                                <v-row>
                                    <v-col cols=12 v-if="branch && branch.repo_id && branch.repo_id.name">
                                        Dataset Name: {{branch.repo_id.name}}
                                    </v-col>
                                </v-row>

                                <v-row>
                                    <v-col cols=12 v-if="branch && branch.repo_id && (branch.repo_id.description || branch.repo_id.description === '')">
                                        Dataset Description: {{branch.repo_id.description}}
                                    </v-col>
                                </v-row>


                                <ValidationObserver ref="observer" v-slot="{ validate }" slim>
                                    <v-row v-if="creating && (user.isApprover || user.isAdmin)">
                                        <v-col cols=12>
                                            <Select
                                                :label="$tc('Select Data Provider Group')"
                                                name="providerGroup"
                                                :editing="true"
                                                :value="(branch) ? branch.providerGroup : ''"
                                                :items="selectableGroups"
                                                validation-rules="required"
                                                helpPrefix="dataset"
                                                @edited="(newValue) => { updateValues('providerGroup', newValue) }"
                                            ></Select>
                                        </v-col>
                                        <v-col cols=12>
                                            <span>{{$tc('NOTE: you will be unable to change this after initial creation')}}</span>
                                        </v-col>
                                    </v-row>

                                    <v-row>
                                        <v-col cols=12>
                                            <TextInput
                                                :label="$tc('Name')"
                                                :placeholder="$tc('Default')"
                                                name="name"
                                                :editing="editing"
                                                validation-rules="required"
                                                helpPrefix="edition"
                                                :value="(branch) ? branch.name : ''"
                                                @edited="(newValue) => { updateValues('name', newValue) }"
                                            ></TextInput>
                                        </v-col>
                                    </v-row>

                                    <v-row>
                                        <v-col cols=6>
                                            <TextInput
                                                :label="$tc('Short Title')"
                                                :placeholder="$tc('Short Title')"
                                                name="short_title"
                                                :editing="editing"
                                                helpPrefix="edition"
                                                :value="(branch) ? branch.short_title : ''"
                                                @edited="(newValue) => { updateValues('short_title', newValue) }"
                                            ></TextInput>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <Select
                                                :label="$tc('Type')"
                                                name="type"
                                                :editing="editing"
                                                validation-rules="required"
                                                :value="(branch) ? branch.type : ''"
                                                :items="types"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('type', newValue) }"
                                            ></Select>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <TextArea
                                                :label="$tc('Description')"
                                                :placeholder="$tc('Description')"
                                                name="description"
                                                validation-rules="required"
                                                :editing="editing"
                                                :value="(branch) ? branch.description : ''"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('description', newValue) }"
                                            ></TextArea>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <TextInput
                                                :label="$tc('Keywords')"
                                                :placeholder="$tc('Keywords')"
                                                name="keywords"
                                                validation-rules="required"
                                                :editing="editing"
                                                :value="(branch) ? branch.keywords : ''"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('keywords', newValue) }"
                                            ></TextInput>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <DataUploadSelect
                                                :label="$tc('Data Upload')"
                                                name="upload_id"
                                                :editing="editing"
                                                :value="(branch) ? branch.data_upload_id : ''"
                                                :items="dataUploads"
                                                item-text="name"
                                                item-value="_id"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('upload_id', newValue) &&  updateValues('data_upload_id', newValue)}"
                                                @error="(message) => { (alert = true) && (alertType = 'error') && (alertText = message) }"
                                            ></DataUploadSelect>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <TextInput
                                                :label="$tc('Collection Method')"
                                                :placeholder="$tc('Collection Method')"
                                                name="collectionMethod"
                                                :editing="editing"
                                                :value="(branch) ? branch.collectionMethod : ''"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('collectionMethod', newValue) }"
                                            ></TextInput>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <TextInput
                                                :label="$tc('Availability')"
                                                :placeholder="$tc('Availability')"
                                                name="availability"
                                                :editing="editing"
                                                :value="(branch) ? branch.availability : ''"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('availability', newValue) }"
                                            ></TextInput>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <Select
                                                :items="variableClassifications"
                                                :label="$tc('Variable Classification Index')"
                                                :placeholder="$tc('Variable Classification Index')"
                                                itemText="name"
                                                itemValue="_id"
                                                name="variable_classification"
                                                :editing="editing"
                                                :value="(branch) ? branch.variable_classification : ''"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('variable_classification', newValue) }"
                                            >
                                            </Select>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <TextArea
                                                :label="$tc('Notes')"
                                                :placeholder="$tc('Notes')"
                                                name="notes"
                                                :editing="editing"
                                                :value="(branch) ? branch.notes : ''"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('notes', newValue) }"
                                            ></TextArea>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <TextInput
                                                :label="$tc('Citation')"
                                                :placeholder="$tc('Citation')"
                                                name="citation"
                                                :editing="editing"
                                                :value="(branch) ? branch.citation : ''"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('citation', newValue) }"
                                            ></TextInput>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <TextInput
                                                :label="$tc('Specific Instructions for appending or linking')"
                                                :placeholder="$tc('Specific Instructions for appending or linking')"
                                                name="instructions"
                                                :editing="editing"
                                                :value="(branch) ? branch.instructions : ''"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('instructions', newValue) }"
                                            ></TextInput>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <TextInput
                                                :label="$tc('Inclusions')"
                                                :placeholder="$tc('Inclusions')"
                                                name="inclusions"
                                                :editing="editing"
                                                :value="(branch) ? branch.inclusions : ''"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('inclusions', newValue) }"
                                            ></TextInput>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <TextInput
                                                :label="$tc('Exclusions')"
                                                :placeholder="$tc('Exclusions')"
                                                name="exclusions"
                                                :editing="editing"
                                                :value="(branch) ? branch.exclusions : ''"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('exclusions', newValue) }"
                                            ></TextInput>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <TextInput
                                                :label="$tc('Quality / Accuracy of Information')"
                                                :placeholder="$tc('Quality / Accuracy of Information')"
                                                name="quality"
                                                :editing="editing"
                                                :value="(branch) ? branch.quality : ''"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('quality', newValue) }"
                                            ></TextInput>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <TextInput
                                                :label="$tc('Data changes over time')"
                                                :placeholder="$tc('Data changes over time')"
                                                name="delta_over_time"
                                                :editing="editing"
                                                :value="(branch) ? branch.delta_over_time : ''"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('delta_over_time', newValue) }"
                                            ></TextInput>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <TextArea
                                                :label="$tc('Important Additional Information')"
                                                :placeholder="$tc('Important Additional Information')"
                                                name="additional_info"
                                                :editing="editing"
                                                :value="(branch) ? branch.additional_info : ''"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('additional_info', newValue) }"
                                            ></TextArea>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <TextInput
                                                :label="$tc('References / Research that uses data')"
                                                :placeholder="$tc('References / Research that uses data')"
                                                name="references"
                                                :editing="editing"
                                                :value="(branch) ? branch.references : ''"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('references', newValue) }"
                                            ></TextInput>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <TextInput
                                                :label="$tc('Hyperlink to more information')"
                                                :placeholder="$tc('Hyperlink to more information')"
                                                name="more_information"
                                                :editing="editing"
                                                :value="(branch) ? branch.more_information : ''"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('more_information', newValue) }"
                                            ></TextInput>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <Markdown
                                                name="faq"
                                                :value="(branch) ? branch.faq : ''"
                                                :label="$tc('FAQ')"
                                                :editing="editing"
                                                :placeholder="$tc('FAQ')"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('faq', newValue) }"
                                            ></Markdown>
                                        </v-col>

                                        <v-col cols=6>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <SimpleCheckbox
                                                :label="$tc('Published')"
                                                :placeholder="$tc('Published')"
                                                name="published"
                                                :editing="editing"
                                                :disabled="!editing || (!user.isApprover && !user.isAdmin) || (branch && branch.approved)"
                                                :checked="(branch) ? branch.published : false"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('published', newValue) }"
                                            ></SimpleCheckbox>
                                            <router-link v-if="branch.published && location" :to="{ name: 'published_version', params: { id: id }}">{{location.protocol + "//" + location.host + $router.resolve({name: 'published_version', params: { id: id } }).href }}</router-link>
                                        </v-col>
                                    
                                        <v-col cols=6>
                                            <SimpleCheckbox
                                                :label="$tc('Approved')"
                                                :placeholder="$tc('Approved')"
                                                name="approved"
                                                :editing="editing"
                                                :disabled="!editing || (!user.isApprover && !user.isAdmin)"
                                                :checked="(branch) ? branch.approved : ''"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('approved', newValue) }"
                                            ></SimpleCheckbox>
                                        </v-col>
                                    </v-row>

                                    <v-row v-if="enabledPhase >= 3 && branch && branch.bcdc_record">
                                        <v-col cols=12>
                                            Catalogue: <a :href="branch.bcdc_record">{{branch.bcdc_record}}</a>
                                            <v-btn :disabled="disableSunset" v-if="user && (user.isAdmin || user.isApprover) && user.bcdcSet" color="error" @click="goSunsetBCDC">
                                                {{$tc('Sunset Record')}}
                                                <v-progress-circular
                                                    indeterminate
                                                    v-if="disableSunset"
                                                ></v-progress-circular>
                                            </v-btn>
                                        </v-col>
                                    </v-row>
                                </ValidationObserver>


                            </v-card-text>
                             <v-card-actions v-if="editing">
                                <v-btn @click="closeOrBack()" class="mt-1">{{$tc('Cancel')}}</v-btn>
                                <v-btn @click="save" class="mt-1" id="saveVersion" color="primary">{{$tc('Save')}}</v-btn>
                            </v-card-actions>
                            <v-card-actions v-else>
                                <v-btn @click="closeOrBack()" class="mt-1">{{dialog ? $tc('Close') : $tc('Back')}}</v-btn>
                                <v-btn v-if="canEdit" id="edit-btn-version-info" @click="toggleEditing" class="mt-1" color="primary">{{$tc('Edit')}}</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-tab-item>

                    <v-tab-item key="dataset">
                        <span v-if="branch && branch.repo_id && branch.repo_id._id">
                            <DatasetForm v-if="!dialog" :hideEditions="dialog" :allowAddEdition="false" :idOverride="branch.repo_id._id"></DatasetForm>
                            <v-btn @click="closeOrBack()" class="mt-1">{{dialog ? $tc('Close') : $tc('Back')}}</v-btn>
                        </span>
                    </v-tab-item>

                    <v-tab-item key="schema" v-if="!creating">
                        <MetadataForm 
                            @setComment="(e) => { setComment(e) }" 
                            :branch-approved="(branch && branch.approved) ? branch.approved : false" 
                            @commentRefs="(e) => updateCommentRefs(e)" :branchId="id" 
                            @close="closeOrBack" 
                            @filter="filter" 
                            :dialog="dialog"></MetadataForm>
                    </v-tab-item>

                    <v-tab-item key="compare" v-if="!creating && inferredSchema">
                        <Comparison :left-side-text="JSON.stringify(inferredSchema)" :right-side-text="JSON.stringify(schema)" :diff-json="true"></Comparison>
                        <v-btn @click="closeOrBack()" class="mt-1">{{dialog ? $tc('Close') : $tc('Back')}}</v-btn>
                    </v-tab-item>

                    <v-tab-item key="revisions" v-if="revisionsLoading === false && revisions.length>0">
                        <Revisions :revisions="revisions"></Revisions>
                    </v-tab-item>

                    <v-tab-item key="schemaRevisions" v-if="schemaRevisionsLoading === false && schemaRevisions.length>0">
                        <Revisions :revisions="schemaRevisions"></Revisions>
                    </v-tab-item>
                </v-tabs-items>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols=12 v-if="!creating">
                <v-dialog
                    v-model="exportDia">
                    <template v-slot:activator="{ on, attrs }">
                        <v-row v-if="!loading && branch">
                            <v-col cols=3>
                                <v-btn
                                    color="primary"
                                    v-bind="attrs"
                                    v-on="on">
                                        Export
                                </v-btn>
                            </v-col>

                            <v-col cols=1>
                            </v-col>

                            <v-col cols=3 v-if="enabledPhase >= 3 && user && (user.isAdmin || user.isApprover) && user.bcdcSet">
                                    
                                <v-btn
                                    color="success"
                                    :disabled="disablePublish"
                                    @click="goPublishBCDC">
                                        {{!disablePublish ? $tc('Push Draft to BCDC') : $tc('Please wait...') }}
                                        <v-progress-circular
                                            indeterminate
                                            v-if="disablePublish"
                                        ></v-progress-circular>
                                </v-btn>
                            </v-col>

                            <v-col cols=5 v-if="enabledPhase >= 3  && user && (user.isAdmin || user.isApprover) && user.bcdcSet">
                                <TextInput
                                    :label="$tc('Access Key',1)"
                                    placeholder=""
                                    name="accessKey"
                                    :editing="true"
                                    :value="accessKey"
                                    helpPrefix="user"
                                    :password="true"
                                    @blur="(event) => { accessKey = event.target.value }"
                                ></TextInput>
                            </v-col>
                        </v-row>
                    </template>

                    <v-card>
                        <v-card-title class="text-h5">
                            Export Fields
                        </v-card-title>

                        <v-card-text>
                            <v-container>
                                <v-row v-if="false">
                                    <v-col cols=12>
                                        <Select
                                            :editing="true"
                                            @edited=" (newValue) => { exportType = newValue }"
                                            helpPrefix="export"
                                            name="exportType"
                                            :items="exportTypes">
                                        </Select>
                                    </v-col>
                                </v-row>

                                <v-row>
                                    <v-col cols=4>
                                        <v-btn @click="exportCheckAll">Check All</v-btn>
                                    </v-col>
                                    <v-col cols=4>
                                        <v-btn @click="exportUncheckAll">Uncheck All</v-btn>
                                    </v-col>
                                    <v-col cols=4>
                                    </v-col>
                                </v-row>
                                
                                <v-row>
                                    <v-col cols=6 v-for="(checked, key) in exportFields" :key="'export-field-'+key">
                                        <SimpleCheckbox
                                            :label="key"
                                            :placeholder="key"
                                            :name="key"
                                            :editing="true"
                                            :checked="checked"
                                            helpPrefix="export"
                                            :disabled="key!=='all' && exportFields['all'] === true"
                                            @edited="(newValue) => { exportFields[key] = newValue }"
                                        ></SimpleCheckbox>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>

                        <v-divider></v-divider>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                                color="success"
                                text
                                @click="goExport">
                                Export
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                    </v-dialog>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols=12 v-if="!creating" id="commentArea">
                <Comments :commentValue="forceCommentVal" :id="id" :type="'branch'" :refable="commentRefs"></Comments>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>

import {mapActions, mapMutations, mapState} from "vuex";
import TextInput from './TextInput';
import TextArea from './TextArea';
import Select from './Select';
import Markdown from './Markdown';
import MetadataForm from './MetadataForm';
import Comments from './Comments';
import Comparison from './Comparison';
import Revisions from './Revisions';
import { ValidationObserver } from "vee-validate";

import Vue from 'vue';
import SimpleCheckbox from './SimpleCheckbox';
import DataUploadSelect from './DataUploadSelect';

import { Backend } from '../services/backend';

export default {
    name: "BranchForm",

    components:{
        TextInput,
        Select,
        TextArea,
        MetadataForm,
        SimpleCheckbox,
        Markdown,
        Comments,
        Comparison,
        DataUploadSelect,
        DatasetForm: () => import('./DatasetForm'),
        Revisions,
        ValidationObserver,
    },
    props: {
        dialog: {
            type: Boolean,
            default: false,
        },
        branchId: {
            type: String,
            default: "",
        },

    },
    data () {
        return {
            id: null,
            editing: false,
            creating: false,
            types: [ {text: 'Standard', value: 'standard'}, {text: 'Unmasked', value: 'unmasked'} ],
            alert: false,
            alertType: "success",
            alertText: "",
            tab: 0,
            tabItem: 0,
            reIndex: 0,
            loading: true,
            location: window.location,
            commentRefs: [],
            forceCommentVal: "",
            providerGroup: null,
            selectableGroups: [],
            exportDia: false,
            exportType: 'JSON',
            exportTypes: ['JSON'],
            exportFields: {},
            DATASET_PREFIX: 'dataset',
            RESOURCE_PREFIX: 'schema.resources',
            FIELD_PREFIX: 'schema.resources.fields',
            filters: {},
            accessKey: '',
            disablePublish: false,
            disableSunset: false,
        }
    },
    methods: {
        ...mapActions({
            getDataset: 'repos/getRepo',
            saveBranch: 'repos/saveBranch',
            updateBranch: 'repos/updateBranch',
            getBranchById: 'repos/getBranchById',
            getRepos: 'repos/getAllRepos',
            getDataUploads: 'dataUploads/getDataUploads',
            getSchema: 'schemaImport/getTableSchema',
            getInferredSchema: 'schemaImport/getInferredSchema',
            getVariableClassification: 'variableClassifications/getItem',
            getVariableClassifications: 'variableClassifications/getItems',
            clearVariableClassifications: 'variableClassifications/clearItems',
        }),
        ...mapMutations({    
            editBranch: 'repos/editBranch',
            clearBranch: 'repos/clearBranch',
            clearTableSchema: 'schemaImport/clearTableSchema',
            clearDataPackageSchema: 'schemaImport/clearDataPackageSchema',
        }),

        exportFieldsSetAll(value){
            let keys = Object.keys(this.exportFields);
            for (let i=0; i<keys.length; i++){
                this.exportFields[keys[i]] = value;
            }
        },

        async goPublishBCDC(){
            this.disablePublish = true;
            const backend = new Backend();
            try{
                let catR = await backend.pushToBCDC(this.id, this.accessKey);
                console.log(catR);
                this.alertType = "success";
                let alertText = "Record: " + catR.url;
                if (catR.resourceErrors){
                    for (let i=0; i<catR.resourceErrors.length; i++){
                        alertText += "\n" + catR.resourceErrors[i];
                    }
                }
                this.alertText = alertText;
            }catch(ex){
                this.alertType = "error";
                this.alertText = "Error: " + ( (ex.response && ex.response.data && ex.response.data.error) ? ex.response.data.error : ex.message) +"\n";
                this.alertText += (ex.response && ex.response.data && ex.response.data.ex) ? ex.response.data.ex : '';
            }
            this.alert = true;
            this.disablePublish = false;
            window.scrollTo(0,0);
        },

        async goSunsetBCDC(){
            this.disablePublish = true;
            this.disableSunset = true;
            const backend = new Backend();
            try{
                let catR = await backend.sunsetBCDC(this.id, this.accessKey);
                console.log(catR);
                this.alertType = "success";
                let alertText = "Record: " + catR.url;
                this.alertText = alertText;
            }catch(ex){
                this.alertType = "error";
                this.alertText = "Error: " + ( (ex.response && ex.response.data && ex.response.data.error) ? ex.response.data.error : ex.message) +"\n";
                this.alertText += (ex.response && ex.response.data && ex.response.data.ex) ? ex.response.data.ex : '';
            }
            this.alert = true;
            this.disablePublish = false;
            this.disableSunset = false;
            window.scrollTo(0,0);
        },

        filter: function(key, val){
            if (Array.isArray(val)){
                if (val.length === 0){
                    delete this.filters[key];
                }else{
                    this.filters[key] = val;
                }
            }
            if (val === ""){
                delete this.filters[key];
            }else{
                this.filters[key] = val;
            }
        },

        exportCheckAll(){
            this.exportFieldsSetAll(true);
        },

        exportUncheckAll(){
            this.exportFieldsSetAll(false);
        },

        changeTab(){
            if (this.tab === 1 && this.dialog){
                this.$nextTick(() => {
                    this.tab = this.tabItem;
                })
                this.closeOrBack();
            }else{
                this.tabItem = this.tab;
            }
            return false;
        },

        setExportFields(){
            let keys = Object.keys(this.branch);
            this.exportFields = {all: true};
            for (let i=0; i<keys.length; i++){
                if (keys[i] === "repo_id"){
                    let datasetKeys = Object.keys(this.branch.repo_id);
                    for (let j=0; j<datasetKeys.length; j++){
                        this.exportFields[this.DATASET_PREFIX+'.'+datasetKeys[j]] = true;
                    }
                }else if (keys[i] === 'variable_classification'){
                    keys[i] = "variable_classification_index";
                    this.exportFields[keys[i]] = true;
                }else{
                    this.exportFields[keys[i]] = true;
                }
            }

            if (this.schema && this.schema.resources && this.schema.resources[0]){
                //this.exportFields[this.RESOURCE_PREFIX] = true
                let sKeys = Object.keys(this.schema.resources[0]);
                for (let i=0; i<sKeys.length; i++){
                    this.exportFields[this.RESOURCE_PREFIX+'.'+sKeys[i]] = true;   
                }

                if (this.schema.resources[0].schema && this.schema.resources[0].schema.fields && this.schema.resources[0].schema.fields[0]){
                    
                    let fKeys = Object.keys(this.schema.resources[0].schema.fields[0]);
                    for (let i=0; i<fKeys.length; i++){
                        this.exportFields[this.FIELD_PREFIX+'.'+fKeys[i]] = true;
                    }
                }
            }
        },

        goExport(){
            let exportFieldKeys = Object.keys(this.exportFields);
            let filterKeys = Object.keys(this.filters);
            let json = {};
            if (this.exportFields['all']){
                if ( (typeof(this.schema) !== 'undefined') && (this.schema) ){                    
                    json = JSON.parse(JSON.stringify(this.schema));
                }else{
                    json = {};
                }
            }

            for (let i=0; i<exportFieldKeys.length; i++){
                let k = exportFieldKeys[i];
                if (k !== 'all'){
                    if (k.indexOf('.') === -1){
                        if (this.exportFields['all'] || this.exportFields[k]){
                            if (k === "variable_classification_index"){
                                json[k+"_id"] = this.branch.variable_classification;
                                json[k+"_name"] = this.variableClassification.name;
                            }else{
                                json[k] = this.branch[k];
                            }
                        }
                    }else if(k.indexOf(this.DATASET_PREFIX) === 0){
                        if (this.exportFields['all'] || this.exportFields[k]){
                            let datasetK=k.substring(this.DATASET_PREFIX.length+1);
                            json[k] = this.branch.repo_id[datasetK];
                        }
                    }else if ( (k.indexOf(this.FIELD_PREFIX) === 0) || (k.indexOf(this.RESOURCE_PREFIX) === 0) ){
                        //only need to do this if not doing all as it's caught above for all
                        if (!this.exportFields['all'] && this.exportFields[k]){
                            let isField = (k.indexOf(this.FIELD_PREFIX) === 0) ;
                            let fieldK=k.substring(this.FIELD_PREFIX.length+1);
                            let resourceK=k.substring(this.RESOURCE_PREFIX.length+1);
                            for (let j=0; j<this.schema.resources.length; j++){
                                if (!json.resources){
                                    json.resources = [];
                                }
                                if (!json.resources[j]){
                                    json.resources[j] = {};
                                }
                                if (!json.resources[j].schema){
                                    json.resources[j].schema = {}
                                }
                                if (!isField){
                                    json.resources[j][resourceK] = this.schema.resources[j][resourceK];
                                }else{
                                    if (!json.resources[j].schema.fields){
                                        json.resources[j].schema.fields = []
                                    }

                                    for (let k=0; k<this.schema.resources[j].schema.fields.length; k++){
                                        if (!json.resources[j].schema.fields[k]){
                                            json.resources[j].schema.fields[k] = {};
                                        }
                                        json.resources[j].schema.fields[k][fieldK] = this.schema.resources[j].schema.fields[k][fieldK];
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if ( (filterKeys.length > 0) && (json.resources) ){
                for (let j=0; j<json.resources.length; j++){
                    if ( (json.resources[j].schema) && (json.resources[j].schema.fields) ){
                        json.resources[j].schema.fields = json.resources[j].schema.fields.filter( (field) => {
                            for (let i=0; i<filterKeys.length; i++){
                                let filterFieldName = filterKeys[i];
                                if (Array.isArray(this.filters[filterFieldName])){
                                    if (!filterFieldName || !field[filterFieldName] || (this.filters[filterFieldName].indexOf(field[filterFieldName]) === -1)){
                                        return false;
                                    }
                                }else{
                                    if (!filterFieldName || !field[filterFieldName] || (field[filterFieldName] !== this.filters[filterFieldName]) ){
                                        return false;
                                    }
                                }
                            }
                            return true;
                        });
                    }
                }
            }
            
            let download = require('downloadjs');
            download(JSON.stringify(json, null, 4), "export.json", "application/json");

        },

        setComment(e){
            this.forceCommentVal = "";
            this.$nextTick(() => {
                this.forceCommentVal = e;
            }) 
            if (this.dialog){
                document
                    .getElementById("commentArea")
                    .scrollIntoView({ behavior: "smooth" });
            }
        },

        async loadSections() {
            //await this.getBranch({id: this.id});
            await this.getBranchById({id: this.id});
            await this.getInferredSchema({id: this.id});
            await this.getSchema({id: this.id});
            await this.clearVariableClassifications();
            await this.getVariableClassifications({});
            if (this.branch.variable_classification){
                await this.getVariableClassification({field: '_id', value: this.branch.variable_classification});
            }
            this.reIndex++;
            
        },

        async closeOrBack() {
            this.editing = false;
            this.creating = false;
            this.alert = false;
            if (this.dialog){
                if (!this.editing){
                    this.$emit('close');
                }else{
                    this.editing = false;
                    await this.load();
                }
            }else if ((this.creating) || (!this.editing)){
                this.$router.push({ name: 'versions' });
            }else if (this.editing){
                this.editing = false;
            }else{
                this.$router.push({ name: 'versions' });
            }
        },

        updateCommentRefs: function(e){
            this.commentRefs = e;
        },

        toggleEditing: function(){
            Vue.set(this, 'editing', !this.editing);
        },

        async updateValues(name, value){
            if (name === 'variable_classification'){
                await this.getVariableClassification({field: '_id', value: value});
            }
            this.editBranch({name: name, value: value});
        },

        async load(){
            this.loading = true;
            
            //this.branchId = (this.branchId) ? this.branchId : this.$route.params.id;
            this.id = (this.branchId) ? this.branchId : this.$route.params.id;
            
            await this.getDataUploads("team");
            if (this.id === 'create'){
                this.editing = true;
                this.creating = true;
                if ( (this.user.isApprover) || (this.user.isAdmin) ){
                    let requiredRole = await this.$store.dispatch('config/getItem', {field: 'key', value: 'requiredRoleToCreateRequest', def: {key: 'requiredRoleToCreateRequest', value: false}});
                    requiredRole = requiredRole.value;
                    this.selectableGroups = JSON.parse(JSON.stringify(this.user.groups));
                    let index = this.selectableGroups.indexOf(requiredRole);
                    if (index !== -1){
                        this.selectableGroups.splice(index, 1);
                    }
                }
                await this.getVariableClassifications({});
            }else{
                this.loadSections();
            }
            this.loading = false;

            this.$nextTick(function () {     
                let anchorRegex = /#([^.]+\.\S+)/g;
                if ((this.$route.hash) && (this.$route.hash.match(anchorRegex))){
                    this.tab = 2;
                    this.tabItem = 2;
                }
            });
        },

        async save(){
            const isValid = await this.$refs.observer.validate();
            if (!isValid){
                this.alertType = "error";
                this.alertText = "Validation failed, please fix errors before continuing";
                this.alert = true;
                return;
            }

            if (this.creating){
                
                this.saveBranch().then( (data) => {
                    this.alertType = "success"
                    this.alertText = this.$tc("Sucessfully created ") + this.$tc("version", 1);
                    this.alert = true;
                    this.editing = false;
                    window.scrollTo(0,0);
                    this.creating = false;
                    this.id=data.id;
                    this.closeOrBack();
                    

                }).catch( err => {
                    this.alertType = "error"
                    if (err.response && err.response.data && err.response.data.error){
                        this.alertText = "Error: " + err.response.data.error;
                    }else{
                        this.alertText = err.message;
                    }
                    this.alert = true;
                });
            }else{
                this.updateBranch().then( () => {
                    this.alertType = "success"
                    this.alertText = "Successfully updated edition";
                    this.alert = true;
                    //this.closeOrBack();
                    this.editing = false;

                }).catch( err => {
                    this.alertType = "error"
                    if (err.response && err.response.data && err.response.data.error){
                        this.alertText = "Error: " + err.response.data.error;
                    }else{
                        this.alertText = err.message;
                    }
                    this.alert = true;
                });
            }
            this.load();
            
            
        }
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            branch: state => state.repos.branch,
            dataUploads: state => state.dataUploads.dataUploads,
            dataset: state => state.repos.repo,
            schema: state => state.schemaImport.tableSchema,
            inferredSchema: state => state.schemaImport.inferredSchema,
            variableClassifications: state => state.variableClassifications.items,
            variableClassification: state => state.variableClassifications.wipItem,
            revisions: state => state.repos.branchRevisions,
            revisionsLoading: state => state.repos.branchRevisionsLoading,
            schemaRevisions: state => state.schemaImport.revisions,
            schemaRevisionsLoading: state => state.schemaImport.revisionsLoading,
        }),
        enabledPhase(){
            let en = this.$store.state.config.items.find(item => item['key'] === 'enabledPhase');
            return (en) ? parseInt(en.value) : 1;
        },

        canEdit: function(){
            if (this.branch.approved){
                return this.user.isAdmin || this.user.isApprover;
            }
            return true;
        }

    },
    watch: {
        branchId: async function(){
            if (this.branchId){
                await this.load();
            }else{
                if (this.branchId === 'create'){
                    this.creating = true;
                    this.editing = true;
                }
                await this.clearBranch();
                await this.clearTableSchema();
                await this.clearDataPackageSchema();
            }
        },
        branch: function(){
            this.setExportFields()
        },
        schema: function(){
            this.setExportFields()
        }
        
    },
    
    created() {
        this.clearBranch();
        this.clearTableSchema();
        this.clearDataPackageSchema();

        this.load()
    },

    beforeDestroy(){
        this.clearBranch();
        this.clearTableSchema();
        this.clearDataPackageSchema();
    }
}
</script>
<style scoped>
    .scroll {
        overflow-y: auto;
    }

    .card-outter {
        position: relative;
        padding-bottom: 15px;
    }
    .card-actions {
        position: absolute;
        bottom: 0;
        right: 0;
    }
    
    .fixedHeight{
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
    }
    

</style>

<style>
    .v-label.v-label--is-disabled.theme--light{
        color: rgba(0,0,0,.87);
    }
    .v-label.v-label--is-disabled.theme--dark{
        color: var(--v-text-base);
    }
</style>
