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

        <span v-else-if="errorLoading">
            <v-row>
                <v-col cols=12>
                    <span>{{$tc('404 Not Found')}}...</span>
                </v-col>
            </v-row>
        </span>

        <v-row v-else dense>
            <v-col cols="12">
                <v-alert
                    :type="alertType"
                    dismissible
                    v-model="alert">
                        {{alertText}}
                </v-alert>
                <v-tabs v-model="tab" @change="changeTab">
                    <v-tab key="version" id="version-tab">{{$tc('Version')}}</v-tab>
                    <v-tab v-if="dataset && !creating" key="dataset" id="dataset-tab">{{$tc('Dataset')}}</v-tab>
                    <v-tab key="schema" v-if="!creating" id="schema-tab">{{$tc('Schema')}}</v-tab>
                    <v-tab key="compare" v-if="!creating && (inferredSchema || (typedSchemas && typedSchemas.length > 0))" id="compare-tab">{{$tc('Compare')}}</v-tab>
                    <v-tab key="revisions" v-if="revisionsLoading === false && revisions.length>0" id="revisions-tab">{{$tc('Revisions', 2)}}</v-tab>
                    <v-tab key="schemaRevisions" v-if="schemaRevisionsLoading === false && schemaRevisions.length>0" id="schema-revisions-tab">{{$tc('Schema Revisions', 2)}}</v-tab>
                    <v-tab key="supplemental" v-if="!creating" id="supplemental-tab">{{$tc('Supplemental Information', 1)}}</v-tab>
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
                                        <h2 class="font-weight-thin largerFont">Dataset Name: {{branch.repo_id.name}}</h2>
                                    </v-col>
                                </v-row>


                                <ValidationObserver ref="observer" v-slot="{ validate }" slim>
                                    <v-row v-if="user.isApprover || user.isAdmin" :key="'rerender-group-sel'+reRenderGroupSel">
                                        <v-col cols=12>
                                            <Select
                                                :label="creating ? $tc('Select Data Provider Group') : $tc('Data Provider Group')"
                                                name="providerGroup"
                                                :editing="creating"
                                                :value="(branch) ? branch.providerGroup : ''"
                                                :items="selectableGroups"
                                                validation-rules="required"
                                                helpPrefix="dataset"
                                                @edited="(newValue) => { updateValues('providerGroup', newValue) }"
                                            ></Select>
                                        </v-col>
                                        <v-col cols=12 v-if="creating">
                                            <span>{{$tc('NOTE: you will be unable to change this after initial creation')}}</span>
                                        </v-col>
                                    </v-row>

                                    <v-row>
                                        <v-col cols=12>
                                            <TextInput
                                                :label="$tc('Version') + ' ' + $tc('Name')"
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
                                                :label="$tc('Version') + ' ' + $tc('Type')"
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
                                            <Markdown
                                                name="description"
                                                :value="(branch) ? branch.description : ''"
                                                :label="$tc('Version Description')"
                                                :editing="editing"
                                                :placeholder="$tc('Notes')"
                                                validation-rules="required"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('description', newValue) }"
                                            ></Markdown>
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
                                            <v-row>
                                                <v-col cols=12>
                                                    {{$tc('Version') + ' ' + $tc('Lifecycle')}}
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col cols=12>
                                                    <Composite
                                                        :label="{
                                                            date: 'Date',
                                                            comment: 'Comment'
                                                        }"
                                                        :placeholder="{
                                                            date: new Date().toISOString(),
                                                            comment: 'Comment'
                                                        }"
                                                        name="lifecycle"
                                                        :editing="editing"
                                                        helpPrefix="edition"
                                                        :value="branch && branch.lifecycle ? branch.lifecycle : {}"
                                                        :schema="{
                                                            date: new Date(),
                                                            comment: 'Comment',
                                                        }"
                                                        @edited="(newValue) => { updateValues('lifecycle', newValue) }">
                                                    </Composite>
                                                </v-col>
                                            </v-row>
                                        </v-col>

                                        <v-col cols=6>
                                            <Markdown
                                                name="instructions"
                                                :value="(branch) ? branch.instructions : ''"
                                                :label="$tc('Specific Instructions for appending or linking')"
                                                :editing="editing"
                                                :placeholder="$tc('Specific Instructions for appending or linking')"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('instructions', newValue) }"
                                            ></Markdown>
                                        </v-col>

                                        <v-col cols=6>
                                            <TextInput
                                                :label="$tc('Linking Results Summary')"
                                                :placeholder="$tc('Linking Results Summary')"
                                                name="linking_summary"
                                                :editing="editing"
                                                :value="(branch) ? branch.linking_summary : ''"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('linking_summary', newValue) }"
                                            ></TextInput>
                                        </v-col>

                                        <v-col cols=6>
                                            <Markdown
                                                name="processing_summary"
                                                :value="(branch) ? branch.processing_summary : ''"
                                                :label="$tc('Processing Summary')"
                                                :editing="editing"
                                                :placeholder="$tc('Processing Summary')"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('processing_summary', newValue) }"
                                            ></Markdown>
                                        </v-col>


                                        <v-col cols=12 v-if="branch && branch.repo_id && (branch.repo_id.description || branch.repo_id.description === '')">
                                            Dataset Description: {{branch.repo_id.description}}
                                        </v-col>

                                        <v-col cols=6>
                                             <Markdown
                                                name="collectionMethod"
                                                :value="(branch) ? branch.collectionMethod : ''"
                                                :label="$tc('Collection Method')"
                                                :editing="editing"
                                                :placeholder="$tc('Collection Method')"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('collectionMethod', newValue) }"
                                            ></Markdown>
                                        </v-col>

                                        <v-col cols=6>
                                            <Markdown
                                                name="inclusions"
                                                :value="(branch) ? branch.inclusions : ''"
                                                :label="$tc('Inclusions')"
                                                :editing="editing"
                                                :placeholder="$tc('Inclusions')"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('inclusions', newValue) }"
                                            ></Markdown>
                                        </v-col>

                                        <v-col cols=6>
                                            <Markdown
                                                name="exclusions"
                                                :value="(branch) ? branch.exclusions : ''"
                                                :label="$tc('Exclusions')"
                                                :editing="editing"
                                                :placeholder="$tc('Exclusions')"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('exclusions', newValue) }"
                                            ></Markdown>
                                        </v-col>

                                        <v-col cols=6>
                                            <Markdown
                                                name="quality"
                                                :value="(branch) ? branch.quality : ''"
                                                :label="$tc('Quality / Accuracy of Information')"
                                                :editing="editing"
                                                :placeholder="$tc('Quality / Accuracy of Information')"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('quality', newValue) }"
                                            ></Markdown>
                                        </v-col>

                                        <v-col cols=6>
                                            <Markdown
                                                name="delta_over_time"
                                                :value="(branch) ? branch.delta_over_time : ''"
                                                :label="$tc('Data changes over time')"
                                                :editing="editing"
                                                :placeholder="$tc('Data changes over time')"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('delta_over_time', newValue) }"
                                            ></Markdown>
                                        </v-col>

                                        <v-col cols=6>
                                            <Markdown
                                                name="additional_info"
                                                :value="(branch) ? branch.additional_info : ''"
                                                :label="$tc('Important Additional Information')"
                                                :editing="editing"
                                                :placeholder="$tc('Important Additional Information')"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('additional_info', newValue) }"
                                            ></Markdown>
                                        </v-col>

                                        <v-col cols=6>
                                            <Repeating
                                                name="more_information"
                                                :label="$tc('Related Links')"
                                                :value="(branch) ? branch.more_information : ''"
                                                :editing="editing"
                                                helpPrefix="edition"
                                                innerType="Composite"
                                                :innerLabel="{name: 'Title of Web Asset', url: 'Hyperlink to more information'}"
                                                :inner-validation-rules="{url: 'required'}"
                                                :innerPlaceholder="{name: 'Google', url: 'https://google.ca'}"
                                                :defaults="{
                                                    name: 'Google',
                                                    url: 'https://google.ca',
                                                }"
                                                @edited="(newValue) => { updateValues('more_information', newValue) }"
                                            ></Repeating>
                                        </v-col>

                                        <v-col cols=6>
                                            <Markdown
                                                name="references"
                                                :value="(branch) ? branch.references : ''"
                                                :label="$tc('References / Research that uses data')"
                                                :editing="editing"
                                                :placeholder="$tc('References / Research that uses data')"
                                                helpPrefix="edition"
                                                @edited="(newValue) => { updateValues('references', newValue) }"
                                            ></Markdown>
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
                                            <!-- <v-btn :disabled="disableSunset" v-if="user && (user.isAdmin || user.isApprover) && user.bcdcSet" color="error" @click="goSunsetBCDC">
                                                {{$tc('Sunset Record')}}
                                                <v-progress-circular
                                                    indeterminate
                                                    v-if="disableSunset"
                                                ></v-progress-circular>
                                            </v-btn> -->
                                        </v-col>
                                    </v-row>
                                </ValidationObserver>


                            </v-card-text>
                             <v-card-actions v-if="editing">
                                <v-btn @click="closeOrBack()"  id="cancelSaveVersion" :disabled="disableSave" class="mt-1">{{$tc('Cancel')}}</v-btn>
                                <v-btn @click="save" class="mt-1" id="saveVersion" :disabled="disableSave" color="primary">
                                    {{!disableSave ? $tc('Save') : $tc("Please Wait")}}
                                    <v-progress-circular
                                        indeterminate
                                        v-if="disableSave"
                                    ></v-progress-circular>
                                </v-btn>
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

                    <v-tab-item key="compare" v-if="!creating && (inferredSchema || (typedSchemas && typedSchemas.length > 0))">
                      <v-select :items="versionDrop" v-model="leftSchema"></v-select>
                      <v-select :items="versionDrop" v-model="rightSchema"></v-select>
                        <BasicComparison 
                          :left-side-text="JSON.stringify(leftSideCompare)" 
                          :right-side-text="JSON.stringify(rightSideCompare)" 
                          :leftHeader="leftHeader"
                          :rightHeader="rightHeader"
                          :diff-json="true"></BasicComparison>
                        <v-btn @click="closeOrBack()" class="mt-1">{{dialog ? $tc('Close') : $tc('Back')}}</v-btn>
                    </v-tab-item>

                    <v-tab-item key="revisions" v-if="revisionsLoading === false && revisions.length>0">
                        <Revisions :revisions="revisions"></Revisions>
                    </v-tab-item>

                    <v-tab-item key="schemaRevisions" v-if="schemaRevisionsLoading === false && schemaRevisions.length>0">
                        <v-select :items="schemaRevisionsDrop" v-model="leftRevision"></v-select>
                        <v-select :items="schemaRevisionsDrop" v-model="rightRevision"></v-select>
                        <Comparison
                            :left-side-text="schemaRevisionChanges[leftRevision] ? JSON.stringify(schemaRevisionChanges[leftRevision]) : ''"
                            :right-side-text="schemaRevisionChanges[rightRevision] ? JSON.stringify(schemaRevisionChanges[rightRevision]) : ''"
                            :diff-json="true"
                            :left-header="schemaRevisionsDrop[leftRevision] ? schemaRevisionsDrop[leftRevision].text : ''"
                            :right-header="schemaRevisionsDrop[rightRevision] ? schemaRevisionsDrop[rightRevision].text : ''">
                        </Comparison>
                        <v-btn @click="closeOrBack()" class="mt-1">{{dialog ? $tc('Close') : $tc('Back')}}</v-btn>
                    </v-tab-item>

                    <v-tab-item key="supplemental" v-if="!creating">
                        <SupplementalInformation :branch="branch"></SupplementalInformation>
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
        <scroll-to-top-bottom/>
    </v-container>
</template>

<script>

import {mapActions, mapMutations, mapState} from "vuex";
import TextInput from '../FormElements/TextInput';
import Select from '../FormElements/Select';
import Markdown from '../FormElements/Markdown';
import Composite from '../FormElements/Composite';
import Repeating from '../FormElements/Repeating';
import MetadataForm from './MetadataForm';
import SupplementalInformation from './SupplementalInformation';
import Comments from '../Comments';
import BasicComparison from '../Schema/BasicComparison';
import Revisions from '../Revisions';
import { ValidationObserver } from "vee-validate";

import Vue from 'vue';
import SimpleCheckbox from '../FormElements/SimpleCheckbox';
import DataUploadSelect from '../FormElements/DataUploadSelect';
import ScrollToTopBottom from "@/components/ScrollToTopBottom";

import { Backend } from '../../services/backend';
import UpdateUpload from '../../mixins/UpdateUpload';

export default {
    name: "BranchForm",
    mixins: [UpdateUpload],

    components:{
        TextInput,
        Select,
        MetadataForm,
        SimpleCheckbox,
        Composite,
        Repeating,
        Markdown,
        Comments,
        BasicComparison,
        DataUploadSelect,
        DatasetForm: () => import('../Datasets/DatasetForm'),
        Revisions,
        ValidationObserver,
        SupplementalInformation,
        ScrollToTopBottom
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
            errorLoading: false,
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
            leftRevision: null,
            rightRevision: null,
            disableSave: false,
            reRenderGroupSel: 0,
            leftSchema: "",
            rightSchema: "",
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
            download(new Blob([JSON.stringify(json, null, 4)]), "export.json", "application/json");

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
            this.loading = true;
            //await this.getBranch({id: this.id});
            try{
                await this.getBranchById({id: this.id});
                await this.getInferredSchema({id: this.id});
                await this.getSchema({id: this.id});
                await this.clearVariableClassifications();
                await this.getVariableClassifications({});
                if (!this.branch){
                    this.errorLoading = true;
                }else{
                    this.errorLoading = false;
                    if (this.branch.variable_classification){
                        await this.getVariableClassification({field: '_id', value: this.branch.variable_classification});
                    }
                }
            }catch(e){
                this.errorLoading = true;
            }

            this.reIndex++;
            this.loading = false;
        },

        async closeOrBack() {
            this.editing = false;
            this.creating = false;
            this.alert = false;
            this.disableSave = false;
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

            //this.branchId = (this.branchId) ? this.branchId : this.$route.params.id;
            this.id = (this.branchId) ? this.branchId : this.$route.params.id;

            if (!this.loggedIn || !(this.user.isAdmin || this.user.isApprover)){
              await this.$router.push({name: "published_version", params: {id: this.id}});
            }

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

                    let ignoreGroups = await this.$store.dispatch('config/getItem', {field: 'key', value: 'ignoreGroups', def: {key: 'ignoreGroups', value: []}});
                    ignoreGroups = ignoreGroups.value;
                    for (var i=0; i<ignoreGroups.length; i++){

                        if ( (ignoreGroups[i].indexOf("/") == 0) && (ignoreGroups[i].lastIndexOf("/") === (ignoreGroups[i].length -1)) ){
                            let s = ignoreGroups[i].substring(1, ignoreGroups[i].length-1);
                            let r = new RegExp(s);
                            this.selectableGroups = this.selectableGroups.filter( (el) => {
                                //console.log("REGEX match", el, s, r, el.match(r));
                                return el.match(r) === null })
                        }else{
                            var ignoreIndex = -1;
                            ignoreIndex = this.selectableGroups.indexOf(ignoreGroups[i]);
                            if (ignoreIndex !== -1){
                                this.selectableGroups.splice(ignoreIndex, 1);
                            }
                        }

                    }
                }
                for (let i=0; i<this.selectableGroups.length; i++){
                    this.selectableGroups[i] = {value: this.selectableGroups[i], text: this.selectableGroups[i]}
                }
                this.reRenderGroupSel++
                await this.getVariableClassifications({});
            }else{
                await this.loadSections();
            }

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
            this.disableSave = true;

            if (this.creating){

                this.saveBranch().then( async(data) => {
                    if (this.branch.data_upload_id){
                      await this.updateUploadOnEdit();
                    }
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
                    this.disableSave = false;
                });
            }else{
                this.updateBranch().then( async() => {
                    this.alertType = "success"
                    this.alertText = "Successfully updated edition";
                    this.alert = true;
                    //this.closeOrBack();
                    this.editing = false;
                    this.disableSave = false;
                    if (this.branch.data_upload_id){
                      await this.updateUploadOnEdit();
                    }

                }).catch( err => {
                    this.alertType = "error"
                    if (err.response && err.response.data && err.response.data.error){
                        this.alertText = "Error: " + err.response.data.error;
                    }else{
                        this.alertText = err.message;
                    }
                    this.alert = true;
                    this.disableSave = false;
                });
            }
            //this.load();


        }
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            loggedIn: state => state.user.loggedIn,
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
            typedSchemas: state => state.schemaImport.typedSchemas,
        }),
        enabledPhase(){
            let en = this.$store.state.config.items.find(item => item['key'] === 'enabledPhase');
            return (en) ? parseInt(en.value) : 1;
        },

        versionDrop(){
          let v = [];
          if (this.schema){
            v.push("Provided");
          }
          if (this.inferredSchema){
            v.push("Inferred");
          }
          for (let i=0; i<this.typedSchemas.length; i++){
            v.push(this.typedSchemas[i].typeName);
          }
          // eslint-disable-next-line
          this.leftSchema = this.leftSchema ? this.leftSchema : v[0];
          if ((this.rightSchema === "") && (v.length>1)){
            // eslint-disable-next-line
            this.rightSchema = v[1];
          }
          return v;
        },

        leftSideCompare(){
          if (this.leftSchema === "Provided"){
            return this.schema;
          }
          if (this.leftSchema === "Inferred"){
            return this.inferredSchema;
          }
          let typed = this.typedSchemas.find(f =>{
            return f.typeName === this.leftSchema;
          });
          if (typed){
            return typed;
          }
          return {}
        },

        rightSideCompare(){
          if (this.rightSchema === "Provided"){
            return this.schema;
          }
          if (this.rightSchema === "Inferred"){
            return this.inferredSchema;
          }
          let typed = this.typedSchemas.find(f =>{
            return f.typeName === this.rightSchema;
          });
          if (typed){
            return typed;
          }
          return {}
        },

        leftHeader(){
          if (this.leftSchema === "Provided"){
            return "Edition Metadata";
          }
          if (this.leftSchema === "Inferred"){
            return "Inferred Metadata";
          }
          return this.leftSchema;
        },

        rightHeader(){
          if (this.rightSchema === "Provided"){
            return "Edition Metadata";
          }
          if (this.rightSchema === "Inferred"){
            return "Inferred Metadata";
          }
          return this.rightSchema;
        },

        schemaRevisionsDrop: function(){
            let rv = [];
            for (let i=0; i<this.schemaRevisions.length; i++){



                let label = "Revision " + this.schemaRevisions[i].revision_number;
                let d = new Date(this.schemaRevisions[i].create_date);
                label +=  " - " + d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate();
                label += " (" + this.schemaRevisions[i].updater + ")";
                rv.push({text: label, value: i})
            }
            return rv;
        },

        schemaRevisionChanges: function(){
            let rv = [];
            for (let i=0; i<this.schemaRevisions.length; i++){
                let item = {}
                try{
                    item = JSON.parse(JSON.stringify(this.schemaRevisions[i].changes));
                    item.resources = JSON.parse(item.resources);
                    for (let j=0; j<item.resources.length; j++){
                        item.resources[j].schema = JSON.parse(JSON.stringify(item.resources[j].tableSchema));
                        delete item.resources[j].tableSchema;
                    }
                //eslint-disable-next-line
                }catch(e){}
                rv.push(item);
            }
            return rv;
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
            if (!this.loggedIn || !(this.user.isAdmin || this.user.isApprover)){
              await this.$router.push({name: "published_version", params: {id: this.branchId}});
              window.location.reload();
            }
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

    async created() {
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

    .largerFont{
        font-size: 1.75rem;
    }
    .fullWidth{
        width: 100%;
        overflow: visible;
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
