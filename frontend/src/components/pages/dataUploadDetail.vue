<template>
<!--    <div style="width: 75%; alignment: center !important;">-->
            <v-container fluid style="max-width:1500px; width:98%;">
                <v-row dense>
                    <v-col cols="12">
                        <v-card outlined max-height="250">
                            <h1 class="display-1 font-weight-thin" style="margin-left:15px; margin-top:15px; margin-bottom:10px;">Data Upload Summary</h1>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="orange" text>View</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                    <v-col cols="6">
                        <v-card class="scroll card-outter" max-height="600" height="600">
                            <h1 class="display-1 font-weight-thin" style="margin-left:15px; margin-top:15px; margin-bottom:10px;">Metadata Revisions</h1>
                            <MetadataRevisions></MetadataRevisions>
                            <v-card-actions class="card-actions">
                                <v-spacer></v-spacer>
                                <v-btn color="orange" text>View</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                    <v-col cols="6">
                        <v-card class="scroll card-outter" max-height="600"  height="600">
                            <h1 class="display-1 font-weight-thin" style="margin-left:15px; margin-top:15px; margin-bottom:10px;">Comments</h1>
                            <Comments></Comments>
                            <v-card-actions class="card-actions">
                                <v-spacer></v-spacer>
                                <v-btn color="orange" text>Add Comment</v-btn>
                                <v-btn color="orange" text>View</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                </v-row>
                <v-btn @click="routeToHome()" style="margin-top:5px">Back</v-btn>
            </v-container>
<!--    </div>-->
</template>
<script>

import {mapActions, mapMutations} from "vuex";
import MetadataRevisions from "../MetadataRevisions";
import Comments from "../Comments";

export default {
    components:{
        MetadataRevisions,
        Comments
    },
    created() {
        // console.log("dataUpload id: " + this.$route.params.id);
        this.loadRevisions();
    },
    beforeDestroy() {
        console.log("detail view before destroy");
        this.clearState();
    },
    methods: {
        ...mapActions({
            getRevisions: 'dataUploadRevisions/getRevisions',
            getComments: 'dataUploadComments/getComments',
        }),
        ...mapMutations({
            clearRevisions: 'dataUploadRevisions/clearRevisions',
            clearComments: 'dataUploadComments/clearComments',
        }),
        async loadRevisions() {
            await this.getRevisions(this.$route.params.id);
            await this.getComments(this.$route.params.id);
        },
        routeToHome() {
            // console.log("routeToHome uploadId");
            this.$router.push({ name: 'home' });
        },
        clearState() {
            this.clearRevisions();
            this.clearComments();
        },
    },
    data () {
        return {
        }
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
