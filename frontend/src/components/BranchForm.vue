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
            <v-col cols="12">
                <v-tabs v-model="tab">
                    <v-tab key="version">{{$tc('Version')}}</v-tab>
                    <v-tab key="schema" v-if="!creating">{{$tc('Schema')}}</v-tab>
                    <v-tab key="compare" v-if="!creating && inferredSchema">{{$tc('Compare')}}</v-tab>
                </v-tabs>
                <v-tabs-items v-model="tab" class="fullWidth">
                    <v-tab-item key="version">
                        <v-card outlined>
                            <v-card-text>
                                <v-alert
                                    :type="alertType"
                                    dismissible
                                    v-model="alert">
                                        {{alertText}}
                                </v-alert>
                                <v-row>
                                    <h1 class="display-1 font-weight-thin ml-3 my-3">{{creating ? $tc("New") + " " + $tc("Version") : $tc("Version") + " " + id}}</h1>
                                </v-row>

                                <v-row>
                                    <v-col cols=12 v-if="branch && branch.repo_id && branch.repo_id.name">
                                        Dataset Name: {{branch.repo_id.name}}
                                    </v-col>
                                </v-row>

                                <v-row>
                                    <v-col cols=12 v-if="branch && branch.repo_id && branch.repo_id.description">
                                        Dataset Description: {{branch.repo_id.description}}
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
                                    <v-col cols=12>
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
                                </v-row>

                                <v-row>
                                    <v-col cols=12>
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
                                </v-row>

                                <v-row>
                                    <v-col cols=12>
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
                                </v-row>

                                <v-row>
                                    <v-col cols=12>
                                        <DataUploadSelect
                                            :label="$tc('Data Upload')"
                                            name="upload_id"
                                            :editing="editing"
                                            :value="(branch) ? branch.data_upload_id : ''"
                                            :items="dataUploads"
                                            item-text="name"
                                            item-value="_id"
                                            helpPrefix="edition"
                                            @edited="(newValue) => { updateValues('upload_id', newValue) }"
                                        ></DataUploadSelect>
                                    </v-col>
                                </v-row>

                                <v-row>
                                    <v-col cols=12>
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
                                </v-row>

                                <v-row>
                                    <v-col cols=12>
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
                                </v-row>

                                <v-row>
                                    <v-col cols=12>
                                        <Select
                                            :items="variableClassifications"
                                            :label="$tc('Variable Classification')"
                                            :placeholder="$tc('Variable Classification')"
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
                                </v-row>

                                <v-row>
                                    <v-col cols=12>
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
                                </v-row>

                                <v-row>
                                    <v-col cols=12>
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
                                </v-row>

                                <v-row>
                                    <v-col cols=12>
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
                                </v-row>

                                <v-row>
                                    <v-col cols=12>
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
                                </v-row>

                                <v-row>
                                    <v-col cols=12>
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


                            </v-card-text>
                             <v-card-actions v-if="editing">
                                <v-btn @click="closeOrBack()" class="mt-1">{{$tc('Cancel')}}</v-btn>
                                <v-btn @click="save" class="mt-1" color="primary">{{$tc('Save')}}</v-btn>
                            </v-card-actions>
                            <v-card-actions v-else>
                                <v-btn @click="closeOrBack()" class="mt-1">{{dialog ? $tc('Close') : $tc('Back')}}</v-btn>
                                <v-btn v-if="canEdit" @click="toggleEditing" class="mt-1" color="primary">{{$tc('Edit')}}</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-tab-item>

                    <v-tab-item key="schema" v-if="!creating">
                        <MetadataForm @setComment="(e) => { setComment(e) }" :branch-approved="(branch && branch.approved) ? branch.approved : false" @commentRefs="(e) => updateCommentRefs(e)" :branchId="id" @close="closeOrBack" :dialog="dialog"></MetadataForm>
                    </v-tab-item>

                    <v-tab-item key="compare" v-if="!creating && inferredSchema">
                        <Comparison :left-side-text="JSON.stringify(inferredSchema)" :right-side-text="JSON.stringify(schema)" :diff-json="true"></Comparison>
                    </v-tab-item>
                </v-tabs-items>
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

import Vue from 'vue';
import SimpleCheckbox from './SimpleCheckbox';
import DataUploadSelect from './DataUploadSelect';

export default {
    components:{
        TextInput,
        Select,
        TextArea,
        MetadataForm,
        SimpleCheckbox,
        Markdown,
        Comments,
        Comparison,
        DataUploadSelect
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
            tab: 'version',
            reIndex: 0,
            loading: true,
            location: window.location,
            commentRefs: [],
            forceCommentVal: ""
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
        }),

        setComment(e){
            this.forceCommentVal = e; 
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
            
            //await this.getRepos({filterBy: ''});
            //await this.getDataset({id: this.branch.repo_id});
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
            }else if (this.creating){
                this.$router.push({ name: 'versions' });
            }else{
                this.editing = false;
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
            // console.log("dataUpload id: " + this.$route.params.id);
            
            //this.branchId = (this.branchId) ? this.branchId : this.$route.params.id;
            this.id = (this.branchId) ? this.branchId : this.$route.params.id;
            
            await this.getDataUploads("team");
            if (this.id === 'create'){
                this.editing = true;
                this.creating = true;
            }else{
                this.loadSections();
            }
            this.loading = false;
        },

        save(){
            if (this.creating){
                this.saveBranch().then( () => {
                    this.alertType = "success"
                    this.alertText = this.$tc("Sucessfully created ") + this.$tc("version", 1);
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
            }else{
                this.updateBranch().then( () => {
                    this.alertType = "success"
                    this.alertText = "Sucessfully updated version";
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
        }),
        canEdit: function(){
            if (this.branch.approved){
                return this.user.isAdmin; //|| this.user.isApprover;
            }
            return true;
        }
    },
    watch: {
        branchId: async function(){
            await this.load();
        }
    },
    
    created() {
        this.load()
    },

    beforeDestroy(){
        this.clearBranch();
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
