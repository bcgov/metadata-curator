<template>
    <v-container fluid>
        <v-row>
            <v-col cols=12>
                <v-alert
                    :type="alertType"
                    dismissible
                    v-model="alert">
                        {{alertText}}
                </v-alert>
            </v-col>
        </v-row>

        <v-row>
            <v-dialog 
                v-model="branchDia"
                fullscreen
                hide-overlay
                transition="dialog-bottom-transition">
                    <v-card>
                        <v-card-text>
                            <BranchForm :dialog="true" @close="closeBranchDia()" :branchId="branch"></BranchForm>
                        </v-card-text>
                    </v-card>
            </v-dialog>
            <v-col cols="12">
                <v-card outlined>
                    <v-card-text>
                        <v-row v-if="creating">
                            <h1 class="display-1 font-weight-thin ml-3 my-3">{{$tc("New") + " " + $tc("Datasets")}}</h1>
                        </v-row>
                        <v-row v-else>
                             <h1><a :href="'/datasets/'+id">{{$tc("Datasets") + " " + dataset.name}}</a></h1>
                        </v-row>

                        <v-row v-if="!creating">
                            <label>ID:</label>
                            <span>{{id}}</span>
                        </v-row>

                        <v-row v-else-if="user.isApprover || user.isAdmin">
                            <v-col cols=12>
                                <Select
                                    :label="$tc('Select Data Provider Group')"
                                    name="providerGroup"
                                    :editing="true"
                                    :value="(dataset) ? dataset.providerGroup : ''"
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
                                    :placeholder="$tc('My') + ' ' + $tc('Dataset')"
                                    name="name"
                                    :large="true"
                                    :editing="editing"
                                    :value="(dataset) ? dataset.name : ''"
                                    validation-rules="required"
                                    helpPrefix="dataset"
                                    @edited="(newValue) => { updateValues('name', newValue) }"
                                ></TextInput>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols=12>
                                <TextInput
                                    :label="$tc('Ministry / Organization')"
                                    placeholder=""
                                    name="ministry_organization"
                                    :large="true"
                                    :editing="editing"
                                    :value="(dataset) ? dataset.ministry_organization : ''"
                                    helpPrefix="dataset"
                                    @edited="(newValue) => { updateValues('ministry_organization', newValue) }"
                                ></TextInput>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols=12>
                                <TextInput
                                    :label="$tc('Description')"
                                    :placeholder="$tc('Description')"
                                    name="description"
                                    :large="true"
                                    :editing="editing"
                                    :value="(dataset) ? dataset.description : ''"
                                    helpPrefix="dataset"
                                    @edited="(newValue) => { updateValues('description', newValue) }"
                                ></TextInput>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols=12>
                                <Select
                                    :label="$tc('Data Collection Type')"
                                    name="data_collection_type"
                                    :editing="editing"
                                    :large="true"
                                    :value="(dataset) ? dataset.data_collection_type : ''"
                                    :items="types"
                                    helpPrefix="dataset"
                                    @edited="(newValue) => { updateValues('data_collection_type', newValue) }"
                                ></Select>
                            </v-col>
                        </v-row>

                        <v-row class="outline">
                            <v-col cols=12>
                                <span class="checkboxGroupHeader">{{$tc('Allow Publish')}}</span>
                            </v-col>
                            <v-col cols=6>
                                <SimpleCheckbox
                                    :label="$tc('Gov DAR')"
                                    :placeholder="$tc('Gov DAR')"
                                    name="gov_allow_publish"
                                    :large="true"
                                    :editing="editing"
                                    :disabled="!editing"
                                    :checked="(dataset) ? dataset.gov_allow_publish : ''"
                                    helpPrefix="dataset"
                                    @edited="(newValue) => { updateValues('gov_allow_publish', newValue) }">
                                </SimpleCheckbox>
                            </v-col>

                            <v-col cols=6>
                                <SimpleCheckbox
                                    :label="$tc('Academic DAR')"
                                    :placeholder="$tc('Academic DAR')"
                                    name="aca_allow_publish"
                                    :large="true"
                                    :editing="editing"
                                    :disabled="!editing"
                                    :checked="(dataset) ? dataset.aca_allow_publish : ''"
                                    helpPrefix="dataset"
                                    @edited="(newValue) => { updateValues('aca_allow_publish', newValue) }">
                                </SimpleCheckbox>
                            </v-col>
                        </v-row>

                        <v-row class="outline">
                            <v-col cols=12>
                                <span class="checkboxGroupHeader">{{$tc('Approval Needed')}}</span>
                            </v-col>
                            <v-col cols=6>
                                <SimpleCheckbox
                                    :label="$tc('Gov data provider')"
                                    :placeholder="$tc('Gov data provider')"
                                    name="gov_approval_needed"
                                    :large="true"
                                    :editing="editing"
                                    :disabled="!editing"
                                    :checked="(dataset) ? dataset.gov_approval_needed : ''"
                                    helpPrefix="dataset"
                                    @edited="(newValue) => { updateValues('gov_approval_needed', newValue) }">
                                </SimpleCheckbox>
                            </v-col>

                            <v-col cols=6>
                                <SimpleCheckbox
                                    :label="$tc('Academic data provider')"
                                    :placeholder="$tc('Academic data provider')"
                                    name="aca_approval_needed"
                                    :large="true"
                                    :editing="editing"
                                    :disabled="!editing"
                                    :checked="(dataset) ? dataset.aca_approval_needed : ''"
                                    helpPrefix="dataset"
                                    @edited="(newValue) => { updateValues('aca_approval_needed', newValue) }">
                                </SimpleCheckbox>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols=12>
                                <SimpleCheckbox
                                    :label="$tc('Metadata listed in B.C. Data Catalogue')"
                                    :placeholder="$tc('Metadata listed in B.C. Data Catalogue')"
                                    name="in_bc_catalogue"
                                    :large="true"
                                    :editing="editing"
                                    :disabled="!editing"
                                    :checked="(dataset) ? dataset.in_bc_catalogue : ''"
                                    helpPrefix="dataset"
                                    @edited="(newValue) => { updateValues('in_bc_catalogue', newValue) }">
                                </SimpleCheckbox>
                            </v-col>
                        </v-row>

                        <v-row wrap v-if="!creating && !hideEditions">
                            <v-col cols=3>
                                <h2>{{$tc('Versions', 2)}}</h2>
                            </v-col>
                            <v-col cols=9>
                                <v-btn v-if="allowAddEdition" color="primary" @click="addVersion">{{$tc('Add')}} {{$tc('Version')}}</v-btn>
                            </v-col>

                            <v-col cols=12 v-for="(branch, i) in branches" :key="'branch-'+i">
                                <span @click="editVersion(branch._id)" class="pointer">
                                    {{branch.name}} 
                                    - {{branch.type.charAt(0).toUpperCase() + branch.type.slice(1)}} 
                                    - {{$tc('Created')}} {{branch.create_date | formatDate}} 
                                </span>
                                <v-btn color="success" v-if="allowAddEdition" @click="copyVersion(branch)">{{$tc('Create')}} {{$tc('Version')}} {{$tc('from this')}}</v-btn>
                            </v-col>
                        </v-row>

                    </v-card-text>
                </v-card>
                <v-card-actions v-if="editing && !hideEditions && allowAddEdition">
                    <v-btn @click="routeToHome()" class="mt-1">{{$tc('Cancel')}}</v-btn>
                    <v-btn @click="save" class="mt-1" color="primary">{{$tc('Save')}}</v-btn>
                </v-card-actions>
                <v-card-actions v-else-if="!editing && !hideEditions && allowAddEdition">
                    <v-btn @click="routeToHome()" class="mt-1">{{$tc('Back')}}</v-btn>
                    <v-btn @click="editing=!editing" class="mt-1" color="primary">{{$tc('Edit')}}</v-btn>
                </v-card-actions>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import TextInput from './TextInput';
import BranchForm from './BranchForm';
import SimpleCheckbox from './SimpleCheckbox';
import Select from './Select';
import { Backend } from '../services/backend';
const backend = new Backend();

export default {
    name: "DatasetForm",

    components:{
        TextInput,
        BranchForm,
        SimpleCheckbox,
        Select
    },

    props: {
        idOverride: {
            required: false,
            default: false,
        },
        hideEditions: {
            required: false,
            default: false,
        },
        allowAddEdition: {
            required: false,
            default: true,
        }
    },

    data () {
        return {
            id: null,
            editing: false,
            creating: false,
            branchDia: false,
            branch: "create",
            alert: false,
            alertText: "",
            alertType: "success",
            types: [ {text: 'Main', value: 'main'}, {text: 'Reserve', value: 'reserve'}, {text: 'Restricted', value: 'restricted'} ],
            providerGroup: null,
            selectableGroups: [],
        }
    },
    methods: {
        ...mapActions({
            getDataset: 'repos/getRepo',
            saveDataset: 'repos/saveRepo',
            updateDataset: 'repos/updateRepo',
            getBranches: 'repos/getBranches',
            saveBranch: 'repos/saveBranch',
            getDataPackage: 'schemaImport/getDataPackage',
        }),
        ...mapMutations({    
            editDataset: 'repos/editRepo',
            clearDataset: 'repos/clearRepo',
            editBranch: 'repos/editBranch',
            clearBranch: 'repos/clearBranch',
            clearTableSchema: 'schemaImport/clearTableSchema',
            clearDataPackageSchema: 'schemaImport/clearDataPackageSchema',
        }),

        async loadSections() {
            await this.getDataset({id: this.id});
            await this.getBranches({repoId: this.id});
        },

        closeBranchDia(){
            this.branchDia = false;
            this.loadSections();
        },

        routeToHome() {
            // console.log("routeToHome uploadId");
            this.$router.push({ name: 'datasets' });
        },

        updateValues(name, value){
            this.editDataset({name: name, value: value});
        },

        async addVersion(){
            await this.clearBranch();
            await this.clearTableSchema();
            await this.clearDataPackageSchema();
            this.branch = "";
            this.$nextTick(() => {
                this.branch = "create";
                this.branchDia = true;
            });
            //this.$router.push({name: 'version_form', params: { id: "create" }});
        },

        async copyVersion(branch){
            if (!branch._id){
                this.alertType = "error";
                this.alertText = "This "+this.$tc('Version', 1)+" has no id"
                this.alert = true;
                window.scrollTo(0,0);
                return;
            }
            
            let schemaExists;
            try{
                await this.getDataPackage({id: branch._id});
                schemaExists = true;
            }catch(ex){
                schemaExists = false;
            }
            
            if (!schemaExists){
                this.alertType = "error";
                this.alertText = "This "+this.$tc('Version', 1)+" has no schema, cannot copy without schema";
                this.alert = true;
                window.scrollTo(0,0);
                return;
            }

            let keys = Object.keys(branch);
            for (let i=0; i<keys.length; i++){
                if (keys[i] === "name"){
                    let d = new Date();
                    this.editBranch({name: keys[i], value: branch[keys[i]] + " " + d.toISOString().split('T')[0]});
                }else if (keys[i] === "author_groups"){
                    this.editBranch({name: "providerGroup", value: branch[keys[i]][0]});
                }else if (keys[i] !== "_id"){
                    this.editBranch({name: keys[i], value: branch[keys[i]]});
                }else{
                    this.editBranch({name: keys[i], value: ""});
                }
            }
            
            this.saveBranch().then( async (branchRes) => {
                await backend.copyRepoBranchSchema(branch._id, branchRes.id);
                await this.getBranches({repoId: this.id});

                this.branch = branchRes.id;
                this.branchDia = true;


            }).catch( err => {
                this.alertType = "error"
                if (err.response && err.response.data && err.response.data.error){
                    this.alertText = "Error: " + err.response.data.error;
                }else{
                    this.alertText = err.message;
                }
                this.alert = true;
                window.scrollTo(0,0);
            });

        },

        async editVersion(id){
            // this.branch = id;
            // this.branchDia = true;
            let reload = (this.$route.name === 'version_form');
            await this.$router.push({name: "version_form", params: {id: id}})
            if (reload){
                window.location.reload();
            }
        },

        save(){
            if (this.creating){
                this.saveDataset().then( () => {
                        this.alertType = "success"
                        this.alertText = this.$tc("Sucessfully created dataset");
                        this.alert = true;
                        window.scrollTo(0,0);
                        this.routeToHome();

                    }).catch( err => {
                        this.alertType = "error"
                        this.alertText = err.message;
                        this.alert = true;
                        window.scrollTo(0,0);
                    });
            }else{
                this.updateDataset().then( () => {
                        this.alertType = "success"
                        this.alertText = this.$tc("Sucessfully created dataset");
                        this.alert = true;
                        window.scrollTo(0,0);
                        this.routeToHome();

                    }).catch( err => {
                        this.alertType = "error"
                        this.alertText = err.message;
                        this.alert = true;
                        window.scrollTo(0,0);
                    });
            }
                
        }
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            dataset: state => state.repos.repo,
            branches: state => state.repos.branches,
        }),
    },
    async created() {
        // console.log("dataUpload id: " + this.$route.params.id);
        
        this.id = this.$route.params.id;
        if (this.idOverride){
            this.id = this.idOverride;
        }
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
        }else{
            this.loadSections();
        }
    },
    beforeDestroy(){
        this.clearDataset();
    }
}
</script>

<style scoped>

.pointer{
    color: var(--v-primary-base);
    text-decoration: underline;
    cursor: pointer;
}

.outline{
    border: 1px solid;
    border-color: var(--v-text-base);
}

.checkboxGroupHeader{
    font-size: 22px;
    font-weight: bold;
}

</style>