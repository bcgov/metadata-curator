<template>
<!--    <div style="width: 75%; alignment: center !important;">-->
            <v-container fluid style="max-width:1500px; width:98%;">
                <v-row v-if="!dataUpload" dense>
                    Loading...
                </v-row>
                <v-row v-else dense>
                    <v-col cols="12">
                        <v-card outlined max-height="150">
                            <h1 class="display-1 font-weight-thin" style="margin-left:15px; margin-top:15px; margin-bottom:15px;">Data Upload Summary</h1>
                            <p class="display-5" style="margin-left:15px;">
                                Name: {{dataUpload.name}}
                            </p>
                            <p class="display-5" style="margin-left:15px;">
                                Approver has opened: {{dataUpload.opened_by_approver}}
                            </p>
                        </v-card>
                    </v-col>
<!--                    <v-col cols="6">-->
<!--                        <v-card class="scroll card-outter" max-height="600" height="600">-->
<!--                            <h1 class="display-1 font-weight-thin" style="margin-left:15px; margin-top:15px; margin-bottom:10px;">Metadata Revisions</h1>-->
<!--                            <MetadataRevisions></MetadataRevisions>-->
<!--                            <v-card-actions class="card-actions">-->
<!--                                <v-spacer></v-spacer>-->
<!--                                <v-btn color="orange" text>View</v-btn>-->
<!--                            </v-card-actions>-->
<!--                        </v-card>-->
<!--                    </v-col>-->
                    <v-col cols="12">
                        <v-card class="scroll card-outter" max-height="600"  height="600">
                            <h1 class="display-1 font-weight-thin" style="margin-left:15px; margin-top:15px; margin-bottom:10px;">Comments</h1>
                            <Comments></Comments>
                            <v-card-actions class="card-actions">
                                <v-spacer></v-spacer>
                                <v-btn color="orange" text @click="showAddCommentDialog()">Add Comment</v-btn>
                                <v-btn color="orange" text @click="showViewDialog()">View</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                </v-row>
                <v-btn @click="routeToHome()" style="margin-top:5px">Back</v-btn>
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
            this.$router.push({ name: 'home' });
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

</style>
