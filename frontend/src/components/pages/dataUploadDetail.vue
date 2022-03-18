<template>
            <v-container fluid>
                <v-row v-if="!dataUpload" dense>
                    {{$tc('Loading')}}...
                </v-row>
                <v-row v-else dense>
                    <v-col cols="12">
                        <v-card outlined>
                            <v-card-text>
                                <v-row>
                                    <h1 class="display-1 font-weight-thin ml-3 my-3">{{$tc('Data Upload Summary')}}</h1>
                                </v-row>

                                <v-row class="ml-3 fixedHeight">
                                    {{$tc('Name')}}: <span id="uploadDetail-name">{{dataUpload.name}}</span>
                                </v-row>
                                <v-row class="ml-3 fixedHeight">
                                    {{$tc('Uploads', 1)}} {{$tc('Date')}}: {{uploadDate}}
                                </v-row>
                                <v-row class="mb-3 ml-3 fixedHeight" v-if="selectedVersion !== '-1'">
                                    {{$tc('Version')}}: <router-link :to="{name: 'version_form', params: {id: selectedVersion}}">{{versions && versions[0] ? versions[0].name : selectedVersion}}</router-link>
                                </v-row>
                                <v-row class="ml-3 fixedHeight">
                                    <v-checkbox class="mt-0 pt-0" :disabled="true" :label="$tc('Approver has viewed (since last update)')" v-model="dataUpload.opened_by_approver"></v-checkbox>
                                </v-row>
                                <v-row class="mb-3 ml-3">
                                    <ViewUploadForm :uploadId="dataUploadId"/>
                                </v-row>
                                <!-- <v-row v-if="enabledPhase >= 2">
                                    <v-btn v-if="!inDataset" @click="createDataset" color="primary" class="mr-2">{{$tc('Create')}} {{$tc('Datasets')}}</v-btn>
                                    <v-btn @click="createVersion" color="primary">Add Version to Dataset</v-btn>
                                </v-row> -->
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <v-col cols="12">
                        <v-card class="scroll card-outter" max-height="600"  height="600">
                            <v-card-title>
                                <h1 class="display-1 font-weight-thin ml-2 mt-2 mb-2">{{$tc('Discussion')}}</h1>
                            </v-card-title>
                            <v-card-text>
                                <Comments :id='dataUploadId' :type="'upload'"></Comments>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
                <v-btn @click="routeToHome()" class="mt-1">{{$tc('Back')}}</v-btn>
            </v-container>
<!--    </div>-->
</template>
<script>

import {mapActions, mapMutations, mapState} from "vuex";
// import MetadataRevisions from "../MetadataRevisions";
import Comments from "../Comments";
import ViewUploadForm from "../ViewUploadForm";

export default {
    components:{
        // MetadataRevisions,
        Comments,
        ViewUploadForm
    },
   
    data () {
        return {
            dataUploadId: null,
            selectedDataset: "-1",
            selectedVersion: "-1",
        }
    },
    methods: {
        ...mapActions({
            getDataUpload: 'dataUploadDetail/getDataUpload',
            updateDataUpload: 'dataUploadDetail/updateDataUpload',
            // getRevisions: 'dataUploadRevisions/getRevisions',
            getSchema: 'schemaImport/getDataPackageByUploadId',
            
            getRepos: 'repos/getRepos',
            getRepo: 'repos/getRepo',
            saveDataset: 'repos/saveRepo',
            getBranchesByUpload: "repos/getBranchesByUpload",
            getBranch: 'repos/getBranch',
        }),
        ...mapMutations({
            clearDataUpload: 'dataUploadDetail/clearDataUpload',
            // clearRevisions: 'dataUploadRevisions/clearRevisions',
            
            editDataset: 'repos/editRepo',
            clearDataset: 'repos/clearRepo',
            editBranch: 'repos/editBranch',
            clearBranch: 'repos/clearBranch',
        }),
        async loadSections() {
            // this.getRevisions(this.dataUploadId);
            
            await this.getDataUpload(this.dataUploadId);
            
            if(this.user.isApprover && !this.dataUpload.opened_by_approver) {
                const data = {...this.dataUpload, opened_by_approver: true};
                this.updateDataUpload(data);
            }
            if (this.enabledPhase >= 2){
                await this.getSchema({id: this.dataUploadId});
                await this.getRepos({filterBy: {upload_id: this.dataUploadId}});
                await this.getBranchesByUpload({uploadId: this.dataUploadId})

                this.selectedDataset = '-1';
                this.selectedVersion = '-1';

                if (this.schemaState && this.schemaState.version){
                    this.selectedVersion = this.schemaState.version
                    //await this.getBranch({id: this.selectedVersion});
                    // this.getBranchesByUpload({uploadId: this.uploadId})
                }
            
                if (this.versions && this.versions[0] && this.versions[0].repo_id){
                    this.selectedDataset = this.versions[0].repo_id;
                    this.selectedVersion = this.versions[0]._id;
                    //await this.getRepo({id: this.selectedDataset});
                    //await this.getBranch({id: this.selectedVersion});
                    this.allowSelect = false;
                }
            }
        },

        selectDataset(val){
            this.selectedDataset = val;
        },

        routeToHome() {
            // console.log("routeToHome uploadId");
            this.$router.push({ name: 'uploads' });
        },
        clearState() {
            // this.clearRevisions();
            
            this.clearDataUpload();
        },

        async createDataset(){
            this.clearDataset();
            this.editDataset({name: 'name', value: this.dataUpload.name});
            let d = await this.saveDataset();
            this.createVersion(d.id);
        },
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            dataUpload: state => state.dataUploadDetail.dataUpload,
            repos: state => state.repos.repos,
            schemaState: state => state.schemaImport.dataPackageSchema,
            allDatasets: state => state.repos.allRepos,
            branch: state => state.repos.branch,
            versions: state => state.repos.branches,
        }),
        inDataset: function(){
            return this.repos.length > 0
        },
        enabledPhase(){
            let en = this.$store.state.config.items.find(item => item['key'] === 'enabledPhase');
            return (en) ? parseInt(en.value) : 1;
        },
        uploadDate: function(){
            if (this.dataUpload && this.dataUpload.upload_date){
                return new Date(this.dataUpload.upload_date).toString();
                //return this.dataUpload.upload_date.substring(0, this.dataUpload.upload_date.indexOf(".")).replace("T", " ");
            }
            return "";
        }
    },
    created() {
        // console.log("dataUpload id: " + this.$route.params.id);
        this.dataUploadId = this.$route.params.id;
        this.loadSections();
    },
    mounted(){
        this.dataUploadId = this.$route.params.id;
        this.loadSections();
    },
    beforeDestroy() {
        // console.log("detail view before destroy");
        this.clearState();
    },
}
</script>
<style scoped>
    .scroll {
        overflow-y: auto;
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
