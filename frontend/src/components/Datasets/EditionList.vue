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
                        <v-row wrap>
                            <v-col cols=3>
                                <h2>{{$tc('Versions', 2)}}</h2>
                            </v-col>
                            <v-col cols=9>
                                <v-btn id="addVersion" color="primary" @click="addVersion">{{$tc('Add')}} {{$tc('Version')}}</v-btn>
                            </v-col>

                            <v-col cols=4>
                                <Select
                                    :editing="true"
                                    name="sortBy"
                                    :label="$tc('Sort By')"
                                    :items="SORT_BY_OPTS"
                                    :value="sortBy"
                                    @edited=" (newVal) => { sortBy = newVal; }">
                                </Select>
                            </v-col>
                            <v-col cols=8>
                            </v-col>

                            <v-col cols=12 v-for="(branch, i) in displayBranches" :key="'branch-'+i">
                                <span @click="editVersion(branch._id)" :id="'branch-link-'+i" class="pointer">
                                    {{branch.name}} 
                                    - {{branch.type.charAt(0).toUpperCase() + branch.type.slice(1)}} 
                                    - {{$tc('Created')}} {{branch.create_date | formatDate}} 
                                </span>
                                <v-btn color="success" @click="copyVersion(branch)">{{$tc('Create')}} {{$tc('Version')}} {{$tc('from this')}}</v-btn>
                            </v-col>
                        </v-row>

                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import BranchForm from '../Versions/BranchForm';
import Select from '../FormElements/Select';

import { Backend } from '../../services/backend';
const backend = new Backend();

export default {
    name: "EditionList",

    components:{
        BranchForm,
        Select,
    },

    props: {
        id: {
            required: true,
        }
    },

    data () {
        return {
            branchDia: false,
            branch: "create",
            alert: false,
            alertText: "",
            alertType: "success",
            loading: false,
            notFound: false,
            sortBy: "create_date desc",
            SORT_BY_OPTS: [{text: 'Create Date Descending', value : 'create_date desc'}, {text: 'Create Date Ascending', value : 'create_date asc'}, {text: 'Name Descending', value : 'name desc'}, {text: 'Name Ascending', value : 'name asc'}],
            sortField: "create_date",
            sortDir: "desc",
        }
    },
    methods: {
        ...mapActions({
            getDataset: 'repos/getRepo',
            getBranches: 'repos/getBranches',
            saveBranch: 'repos/saveBranch',
            getDataPackage: 'schemaImport/getDataPackage',
        }),
        ...mapMutations({    
            editBranch: 'repos/editBranch',
            clearBranch: 'repos/clearBranch',
            clearTableSchema: 'schemaImport/clearTableSchema',
            clearDataPackageSchema: 'schemaImport/clearDataPackageSchema',
        }),

        async loadSections() {
            this.loading = true;
            
            if (!this.dataset){
                this.notFound = true;
            }else{
                await this.getBranches({repoId: this.id});
            }
            this.loading = false;
        },

        closeBranchDia(){
            this.branchDia = false;
            this.loadSections();
        },

        routeToHome() {
            // console.log("routeToHome uploadId");
            this.$router.push({ name: 'datasets' });
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
                schemaExists = (this.dataPackageSchema && (typeof(this.dataPackageSchema) === 'object') && (Object.keys(this.dataPackageSchema).length > 0));
            }catch(ex){
                schemaExists = false;
            }
            
            if (!schemaExists){
                this.alertType = "error";
                this.alertText = "Only "+this.$tc('Version', 2)+" with "+this.$tc("Schema", 2)+" specified may be copied";
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
                }else if ( (keys[i] === 'approved') || (keys[i] === 'published') ){
                    this.editBranch({name: keys[i], value: false});
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
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            dataset: state => state.repos.repo,
            branches: state => state.repos.branches,
            dataPackageSchema: state => state.schemaImport.dataPackageSchema,
        }),
        displayBranches: function(){
            let rv = JSON.parse(JSON.stringify(this.branches));
            rv.sort( (a,b) => {
                if (this.sortDir === 'desc'){
                    if (typeof(a[this.sortField]) === 'string'){
                        return b[this.sortField].localeCompare(a[this.sortField]);
                    }
                    return (a[this.sortField] >= b[this.sortField]) ? -1 : 1;
                }

                if (typeof(a[this.sortField]) === 'string'){
                    return a[this.sortField].localeCompare(b[this.sortField]);
                }else{
                    console.log(a[this.sortField], b[this.sortField], (b[this.sortField] >= a[this.sortField]));
                    return (b[this.sortField] >= a[this.sortField]) ? 1 : -1;
                }
            });
            return rv;
        },
    },
    watch: {
        sortBy: function(){
            let sortArr = this.sortBy.split(' ');
            this.sortField = sortArr[0];
            this.sortDir = sortArr[1];
        }
    },
    async created() {
        this.loadSections();
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