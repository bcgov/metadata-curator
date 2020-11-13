<template>
            <v-container fluid>
                <v-row v-if="!dataUpload" dense>
                    Loading...
                </v-row>
                <v-row v-else dense>
                    <v-col cols="12">
                        <v-card outlined>
                            <v-card-text>
                                <v-row>
                                    <h1 class="display-1 font-weight-thin ml-3 my-3">Dataset</h1>
                                </v-row>

                                <v-row class="ml-3 fixedHeight">
                                    Name: {{dataUpload.name}}
                                </v-row>
                                <v-row class="ml-3 fixedHeight">
                                    Upload Date: {{uploadDate}}
                                </v-row>
                                <v-row class="mb-3 fixedHeight">
                                    <v-btn color="orange" text @click="showViewDialog()">Upload &amp; File Info</v-btn>
                                </v-row>
                                <v-row class="ml-3 fixedHeight">
                                    <v-checkbox class="mt-0 pt-0" :disabled="true" label="Approver has viewed (since last update)" v-model="dataUpload.opened_by_approver"></v-checkbox>
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

export default {
    components:{
        // MetadataRevisions,
        Comments,
        CommentAddDialog,
        ViewDialog
    },
    data () {
        return {
            commentAddDialog: false,
            dataUploadId: null,
            viewDialog: false,
        }
    },
    methods: {
        ...mapActions({
            getDataUpload: 'dataUploadDetail/getDataUpload',
            updateDataUpload: 'dataUploadDetail/updateDataUpload',
            // getRevisions: 'dataUploadRevisions/getRevisions',
            getComments: 'dataUploadComments/getComments',
            addComment: 'dataUploadComments/addComment',
        }),
        ...mapMutations({
            clearDataUpload: 'dataUploadDetail/clearDataUpload',
            // clearRevisions: 'dataUploadRevisions/clearRevisions',
            clearComments: 'dataUploadComments/clearComments',
        }),
        async loadSections() {
            // this.getRevisions(this.dataUploadId);
            this.getComments(this.dataUploadId);
            await this.getDataUpload(this.dataUploadId);
            if(this.user.isApprover && !this.dataUpload.opened_by_approver) {
                const data = {...this.dataUpload, opened_by_approver: true};
                this.updateDataUpload(data);
            }
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
        }),
        uploadDate: function(){
            if (this.dataUpload && this.dataUpload.upload_date){
                return this.dataUpload.upload_date.substring(0, this.dataUpload.upload_date.indexOf(".")).replace("T", " ");
            }
            return "";
        }
    },
    created() {
        // console.log("dataUpload id: " + this.$route.params.id);
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
