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
                        <v-row>
                            <h1 class="display-1 font-weight-thin ml-3 my-3">{{creating ? $tc("New") + " " + $tc("Datasets") : $tc("Datasets") + " " + dataset.name}}</h1>
                        </v-row>

                        <v-row v-if="!creating">
                            <label>ID:</label>
                            <span>{{id}}</span>
                        </v-row>

                        <v-row>
                            <TextInput
                                :label="$tc('Name')"
                                :placeholder="$tc('My') + ' ' + $tc('Dataset')"
                                name="name"
                                :large="true"
                                :editing="editing"
                                :value="(dataset) ? dataset.name : ''"
                                helpPrefix="dataset"
                                @edited="(newValue) => { updateValues('name', newValue) }"
                            ></TextInput>
                        </v-row>

                        <v-row>
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
                        </v-row>

                        <v-row>
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

                        <v-row wrap v-if="!creating">
                            <v-col cols=3>
                                <h2>{{$tc('Versions', 2)}}</h2>
                            </v-col>
                            <v-col cols=9>
                                <v-btn color="primary" @click="addVersion">{{$tc('Add')}} {{$tc('Version')}}</v-btn>
                            </v-col>

                            <v-col cols=12 v-for="(branch, i) in branches" :key="'branch-'+i">
                                <span @click="editVersion(branch._id)" class="pointer">
                                    {{branch.name}} 
                                    - {{branch.type.charAt(0).toUpperCase() + branch.type.slice(1)}} 
                                    - {{$tc('Created')}} {{branch.create_date | formatDate}} 
                                </span>
                                <v-btn color="success" @click="copyVersion(branch)">{{$tc('Create')}} {{$tc('Version')}} {{$tc('from this')}}</v-btn>
                            </v-col>
                        </v-row>

                    </v-card-text>
                </v-card>
                <v-card-actions v-if="editing">
                    <v-btn @click="routeToHome()" class="mt-1">{{$tc('Cancel')}}</v-btn>
                    <v-btn @click="save" class="mt-1" color="primary">{{$tc('Save')}}</v-btn>
                </v-card-actions>
                <v-card-actions v-else>
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
    components:{
        TextInput,
        BranchForm,
        SimpleCheckbox,
        Select
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

        addVersion(){
            this.branch = "create";
            this.branchDia = true;
        },

        async copyVersion(branch){
            if (!branch._id){
                this.alertType = "error";
                this.alertText = "This "+this.$tc('Version', 1)+" has no id"
                this.alert = true;
                window.scrollTo(0,0);
                return;
            }
            
            let schemaExists = await this.getDataPackage({id: branch._id});
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
                    this.editBranch({name: keys[i], value: branch[keys[i]] + " " + d.toLocaleDateString("en-US")});
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

        editVersion(id){
            this.branch = id;
            this.branchDia = true;
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
    created() {
        // console.log("dataUpload id: " + this.$route.params.id);
        this.id = this.$route.params.id;
        if (this.id === 'create'){
            this.editing = true;
            this.creating = true;
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