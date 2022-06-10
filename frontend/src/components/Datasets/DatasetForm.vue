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

        <v-row v-if="loading">
            <v-col cols=12>
                    <span>{{$tc('Loading')}}...</span>
                    <v-progress-circular indeterminate></v-progress-circular>
            </v-col>
        </v-row>

        <v-row v-else-if="notFound">
            <v-col cols=12>
                <span>{{$tc('404 Not Found')}}...</span>
            </v-col>
        </v-row>

        <v-row v-else>
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
                                    :label="$tc('Dataset') + ' ' + $tc('Name')"
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
                                    validation-rules="required"
                                    helpPrefix="dataset"
                                    @edited="(newValue) => { updateValues('ministry_organization', newValue) }"
                                ></TextInput>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols=12>
                                <TextInput
                                    :label="$tc('Dataset') + ' ' + $tc('Description')"
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
                                <TextInput
                                    :label="$tc('Sector')"
                                    :placeholder="$tc('Sector')"
                                    name="sector"
                                    :large="true"
                                    :editing="editing"
                                    :value="(dataset) ? dataset.sector : ''"
                                    helpPrefix="dataset"
                                    @edited="(newValue) => { updateValues('sector', newValue) }"
                                ></TextInput>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols=12>
                                <TextInput
                                    :label="$tc('Data Type')"
                                    :placeholder="$tc('Data Type')"
                                    name="data_type"
                                    :large="true"
                                    :editing="editing"
                                    :value="(dataset) ? dataset.data_type : ''"
                                    helpPrefix="dataset"
                                    @edited="(newValue) => { updateValues('data_type', newValue) }"
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

                        <v-row>
                            <v-col cols=12>
                                <TextInput
                                    :label="$tc('Restrictions Comments')"
                                    :placeholder="$tc('Restrictions Comments')"
                                    name="restrictions_comments"
                                    :large="true"
                                    :editing="editing"
                                    :value="(dataset) ? dataset.restrictions_comments : ''"
                                    helpPrefix="dataset"
                                    @edited="(newValue) => { updateValues('restrictions_comments', newValue) }"
                                ></TextInput>
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
                                <Repeating
                                    name="contact"
                                    :label="$tc('Send Approval Requests To')"
                                    :value="(dataset) ? dataset.contact : []"
                                    :editing="editing"
                                    :large="true"
                                    helpPrefix="dataset"
                                    innerType="Composite"
                                    :innerLabel="{name: 'Name', email: 'Email', phone: 'Phone'}"
                                    :inner-validation-rules="{name: 'required'}"
                                    :innerPlaceholder="{name: 'John Doe', email: 'jdoe@gmail.com', phone: '1-555-123-4567'}"
                                    :defaults="{
                                        name: 'John Doe',
                                        email: 'jdoe@gmail.com',
                                        phone: '1-555-123-4567',
                                    }"
                                    @edited="(newValue) => { updateValues('contact', newValue) }"
                                ></Repeating>
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

                        <v-row>
                            <v-col cols=12>
                                <TextInput
                                    :label="$tc('Dataset') + ' ' + $tc('Refresh Schedule')"
                                    :placeholder="$tc('Refresh Schedule')"
                                    name="refresh_schedule"
                                    :large="true"
                                    :editing="editing"
                                    :value="(dataset) ? dataset.refresh_schedule : ''"
                                    helpPrefix="dataset"
                                    @edited="(newValue) => { updateValues('refresh_schedule', newValue) }"
                                ></TextInput>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols=12>
                                <Select
                                    :label="$tc('Dataset') + ' ' + $tc('Lifecycle Status')"
                                    :placeholder="$tc('Lifecycle Status')"
                                    name="lifecycle_status"
                                    :large="true"
                                    validation-rules="required"
                                    :editing="editing"
                                    :items="[{text: 'Active', value: 'active'}, {text: 'Semi-active', value: 'semiactive'}, {text: 'Destroyed', value: 'destroyed'}]"
                                    :value="(dataset) ? dataset.lifecycle_status : ''"
                                    helpPrefix="dataset"
                                    @edited="(newValue) => { updateValues('lifecycle_status', newValue) }"
                                ></Select>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols=12>
                                <Repeating
                                    name="lifecycle_dates"
                                    :label="$tc('Dataset') + ' ' + $tc('Lifecycle Dates')"
                                    :value="(dataset) ? dataset.lifecycle_dates : []"
                                    :editing="editing"
                                    :large="true"
                                    helpPrefix="dataset"
                                    innerType="Composite"
                                    :innerLabel="{type: 'Date Type', date_comments: 'Date/Comment'}"
                                    :innerPlaceholder="{type: 'created', date_comments: new Date().toString()}"
                                    :defaults="{
                                        type: 'created',
                                        date_comments: new Date()
                                    }"
                                    :items="{
                                        type: [
                                            {text: 'Created', value: 'created'},
                                            {text: 'Published', value: 'published'},
                                            {text: 'Modified', value: 'modified'},
                                            {text: 'Archived', value: 'archived'},
                                            {text: 'Destroyed', value: 'destroyed'},
                                            {text: 'Comment', value: 'comment'}
                                        ]
                                    }"
                                    :conditions="{
                                        date_comments: 'val.type===\'comment\' ? \'TextInput\' : \'DateInput\''
                                    }"
                                    :inner-validation-rules="{type: 'required', date_comments: 'required'}"
                                    @edited="(newValue) => { updateValues('lifecycle_dates', newValue) }"
                                ></Repeating>
                            </v-col>
                        </v-row>

                    </v-card-text>
                </v-card>
                <v-card-actions v-if="editing">
                    <v-btn @click="routeToHome()" class="mt-1">{{$tc('Cancel')}}</v-btn>
                    <v-btn @click="save" id="saveDataset" class="mt-1" color="primary">{{$tc('Save')}}</v-btn>
                </v-card-actions>
                <v-card-actions v-else-if="!editing">
                    <v-btn @click="routeToHome()" class="mt-1">{{$tc('Back')}}</v-btn>
                    <v-btn @click="editing=!editing" id="editDatasetBtn" class="mt-1" color="primary">{{$tc('Edit')}}</v-btn>
                </v-card-actions>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import TextInput from '../FormElements/TextInput';
import SimpleCheckbox from '../FormElements/SimpleCheckbox';
import Select from '../FormElements/Select';
import Repeating from '../FormElements/Repeating';

export default {
    name: "DatasetForm",

    components:{
        TextInput,
        SimpleCheckbox,
        Select,
        Repeating
    },

    props: {
        idOverride: {
            required: false,
            default: false,
        },
    },

    data () {
        return {
            id: null,
            editing: false,
            creating: false,
            alert: false,
            alertText: "",
            alertType: "success",
            types: [ {text: 'Main', value: 'main'}, {text: 'Reserve', value: 'reserve'}, {text: 'Restricted', value: 'restricted'} ],
            providerGroup: null,
            selectableGroups: [],
            loading: false,
            notFound: false,
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
            this.loading = true;
            await this.getDataset({id: this.id});
            if (!this.dataset){
                this.notFound = true;
            }else{
                await this.getBranches({repoId: this.id});
            }
            this.loading = false;
        },

        routeToHome() {
            // console.log("routeToHome uploadId");
            this.$router.push({ name: 'datasets' });
        },

        updateValues(name, value){
            this.editDataset({name: name, value: value});
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
                        this.alertText = this.$tc("Sucessfully updated dataset");
                        this.alert = true;
                        window.scrollTo(0,0);
                        this.editing = false;
                        //this.routeToHome();

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
            dataPackageSchema: state => state.schemaImport.dataPackageSchema,
        }),
    },
    async created() {
        this.clearDataset();
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