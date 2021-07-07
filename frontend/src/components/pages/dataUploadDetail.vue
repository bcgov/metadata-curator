<template>
            <v-container fluid>
                <v-row v-if="!dataUpload" dense>
                    Loading...
                </v-row>
                <v-row v-else dense>
                    <v-dialog 
                       v-model="datasetPopup"
                        fullscreen
                        hide-overlay
                        transition="dialog-bottom-transition">
                            <v-card>
                                <v-card-title>Select Existing Dataset</v-card-title>
                                <v-card-text>
                                    <Select
                                        label="Dataset"
                                        name="dataset_id"
                                        :editing="true"
                                        :value="''"
                                        :items="allDatasets"
                                        item-text="name"
                                        item-value="_id"
                                        @edited="(newValue) => { selectDataset(newValue) }"
                                    ></Select>
                                </v-card-text>
                                <v-card-actions>
                                    <v-btn @click="datasetPopup = false; selectedDataset = null;">Cancel</v-btn>
                                    <v-btn @click="createVersion()" color="primary">Create</v-btn>
                                </v-card-actions>
                            </v-card>
                    </v-dialog>
                    <v-col cols="12">
                        <v-card outlined>
                            <v-card-text>
                                <v-row>
                                    <h1 class="display-1 font-weight-thin ml-3 my-3">Data Upload Summary</h1>
                                </v-row>

                                <v-row class="ml-3 fixedHeight">
                                    Name: <span id="uploadDetail-name">{{dataUpload.name}}</span>
                                </v-row>
                                <v-row class="ml-3 fixedHeight">
                                    Upload Date: {{uploadDate}}
                                </v-row>
                                <v-row class="mb-3 fixedHeight">
                                    <v-btn color="orange" id="uploadDetail-showInfo" text @click="showViewDialog()">Upload &amp; File Info</v-btn>
                                </v-row>
                                <v-row class="ml-3 fixedHeight">
                                    <v-checkbox class="mt-0 pt-0" :disabled="true" label="Approver has viewed (since last update)" v-model="dataUpload.opened_by_approver"></v-checkbox>
                                </v-row>
                                <v-row v-if="enabledPhase >= 2">
                                    <v-btn v-if="!inDataset" @click="createDataset" color="primary" class="mr-2">Create Dataset</v-btn>
                                    <v-btn @click="createVersion" color="primary">Add Version to Dataset</v-btn>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <v-col cols="12">
                        <v-card class="scroll card-outter" max-height="600"  height="600">
                            <v-card-title>
                                <h1 class="display-1 font-weight-thin ml-2 mt-2 mb-2">Discussion</h1>
                            </v-card-title>
                            <v-card-text>
                                <Comments></Comments>
                                <v-row>
                                    <v-btn color="orange" text @click="showAddCommentDialog()">Add Comment</v-btn>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
                <v-btn @click="routeToHome()" class="mt-1">Back</v-btn>
                <CommentAddDialog :dialog="commentAddDialog"
                                  @close-button-clicked="onCloseButtonClicked"
                                  @save-button-clicked="onSaveButtonClicked"/>
                <ViewDialog :dialog="viewDialog"
                                  :uploadId="dataUploadId"
                                  @close-button-clicked="onViewClosedClick"/>
            </v-container>
<!--    </div>-->
</template>
<script>

import {mapActions, mapMutations, mapState} from "vuex";
// import MetadataRevisions from "../MetadataRevisions";
import Comments from "../Comments";
import CommentAddDialog from "../CommentAddDialog";
import ViewDialog from "../ViewUploadDialog";
import Select from '../Select.vue';

export default {
    components:{
        // MetadataRevisions,
        Comments,
        CommentAddDialog,
        ViewDialog,
        Select
    },
   
    data () {
        return {
            commentAddDialog: false,
            dataUploadId: null,
            viewDialog: false,
            datasetPopup: false,
            selectedDataset: null,
        }
    },
    methods: {
        ...mapActions({
            getDataUpload: 'dataUploadDetail/getDataUpload',
            updateDataUpload: 'dataUploadDetail/updateDataUpload',
            // getRevisions: 'dataUploadRevisions/getRevisions',
            getComments: 'dataUploadComments/getComments',
            addComment: 'dataUploadComments/addComment',
            getRepos: 'repos/getRepos',
            getAllRepos: 'repos/getAllRepos',
            saveDataset: 'repos/saveRepo',
            getUploadFormSubmission: 'uploadForm/getUploadFormSubmission',
            getUploadForm: 'uploadForm/getUploadForm',
        }),
        ...mapMutations({
            clearDataUpload: 'dataUploadDetail/clearDataUpload',
            // clearRevisions: 'dataUploadRevisions/clearRevisions',
            clearComments: 'dataUploadComments/clearComments',
            editDataset: 'repos/editRepo',
            clearDataset: 'repos/clearRepo',
            editBranch: 'repos/editBranch',
            clearBranch: 'repos/clearBranch',
        }),
        async loadSections() {
            // this.getRevisions(this.dataUploadId);
            this.getComments(this.dataUploadId);
            await this.getDataUpload(this.dataUploadId);
            await this.getUploadForm(this.dataUpload.form_name);
            this.getUploadFormSubmission({formName: this.dataUpload.form_name, submissionId: this.dataUpload.upload_submission_id});
            this.getRepos({filterBy: {upload_id: this.dataUpload._id}});
            this.getAllRepos();
            if(this.user.isApprover && !this.dataUpload.opened_by_approver) {
                const data = {...this.dataUpload, opened_by_approver: true};
                this.updateDataUpload(data);
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
            this.clearComments();
            this.clearDataUpload();
        },
        showAddCommentDialog() {
            this.commentAddDialog = true;
        },

        showViewDialog() {
            this.viewDialog = true;
        },

        onCloseButtonClicked() {
            this.commentAddDialog = false;
        },
        
        onViewClosedClick(){
            this.viewDialog = false;
        },

        async createDataset(){
            this.clearDataset();
            this.editDataset({name: 'name', value: this.dataUpload.name});
            let d = await this.saveDataset();
            this.createVersion(d.id);
        },

        async createVersion(id){
            if (typeof(id) === "string"){
                this.editDataset({name: '_id', value: id});
            }else if (this.selectedDataset){
                this.editDataset({name: '_id', value: this.selectedDataset});
            }else{
                this.datasetPopup = true;
                return;
            }

            this.clearBranch();
            this.editBranch({name: 'name', value: this.dataUpload.name});
            let desc = ((this.submission) && (this.submission.data) && (this.submission.data.description)) ? this.submission.data.description : this.dataUpload.name;
            this.editBranch({name: 'description', value: desc});
            this.editBranch({name: 'upload_id', value: this.dataUpload._id});
            this.editBranch({name: 'data_upload_id', value: this.dataUpload._id});
            this.$router.push({name: 'version_form', params: { id: 'create' }})
        },

        async onSaveButtonClicked(comment) {
            this.commentAddDialog = false;
            await this.addComment({dataUploadId: this.dataUploadId, comment: comment});
            this.getDataUpload(this.dataUploadId);
        },
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            dataUpload: state => state.dataUploadDetail.dataUpload,
            repos: state => state.repos.repos,
            uploadForm: state => state.uploadForm.formDef,
            submission: state => state.uploadForm.submission,
            allDatasets: state => state.repos.allRepos,
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
