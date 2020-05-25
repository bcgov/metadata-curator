<template>
    <v-container>
        <h1 class="display-1 font-weight-thin" style="margin-left:15px; margin-top:15px; margin-bottom:10px;">Data Uploads</h1>

        <v-container v-if="user.isDataProvider" fluid style="margin-left:5px; padding-bottom:0px; margin-bottom:7px;">
            <p>Filter by:</p>
            <v-radio-group v-model="filterBy" row style="margin-left:10px;">
                <v-radio label="My Uploads" value="me"></v-radio>
                <v-radio label="Team Uploads" value="team"></v-radio>
            </v-radio-group>
        </v-container>

        <v-list three-line>
            <template v-for="(item, index) in dataUploadDisplayItems">
                <v-divider
                    v-if="item.divider"
                    :key="index"
                    :inset="item.inset"
                ></v-divider>

                <v-list-item
                    v-else
                    :key="item.dataUploadId"
                    @click="routeToUploadInfo(item.dataUploadId)"
                >
                    <v-list-item-content>
                        <v-list-item-title v-html="item.title"></v-list-item-title>
                        <v-list-item-subtitle>
                            Created on {{item.subtitle | formatDate}}
                            by {{item.uploader}}
                        </v-list-item-subtitle>

                    </v-list-item-content>
                    <v-btn icon class="mr-4" >
                        <v-icon>{{item.icon}}</v-icon>
                    </v-btn>


                </v-list-item>
            </template>
        </v-list>
    </v-container>
</template>

<script>

    import {mapActions, mapState, mapGetters} from "vuex";

    export default {
        async created() {
            if(this.user.isApprover) {
                this.filterBy = '';
            } else if(this.user.isDataProvider) {
                this.filterBy = 'me';
            }
            await this.loadDataUploads();
        },
        data: () => ({
            message: '',
            filterBy: null
        }),
        methods: {
            ...mapActions({
                getDataUploads: 'dataUploads/getDataUploads',
            }),
            async loadDataUploads() {
                this.message = 'Retrieving Data Uploads...';
                await this.getDataUploads({filterBy: this.filterBy});
                this.message = '';
            },
            routeToUploadInfo(dataUploadId) {
                const selectedDataUpload = this.getDataUploadById(dataUploadId);
                if(selectedDataUpload.status == 'not_submitted') {
                    this.$router.push({ name: 'upload', params: { id: dataUploadId } })
                }
                else {
                    this.$router.push({ name: 'data-upload-detail', params: { id: dataUploadId } })
                }
            },
            getDisplayStatus(status) {
                if(status === 'not_submitted') { return 'Draft'; }
                if(status === 'upload_in_progress') { return 'Upload in progress'; }
                if(status === 'upload_error') { return 'Upload failed'; }
                return '';
            },
            getDisplayIcon(status) {
                if(status === 'submitted') { return 'mdi-checkbox-marked-circle'; }
                if(status === 'not_submitted') { return 'mdi-file-edit'; }
                if(status === 'upload_in_progress') { return 'mdi-sync'; }
                if(status === 'upload_error') { return 'mdi-alert-circle'; }
            },
            getDisplayUploader(uploader) {
                if(uploader === this.user.email) { return 'me'; }
                return uploader;
            }
        },
        computed: {
            ...mapState({
                user: state => state.user.user,
                dataUploads: state => state.dataUploads.dataUploads
            }),
            ...mapGetters({
                getDataUploadById: 'dataUploads/getDataUploadById',
            }),
            dataUploadDisplayItems: function(){
                let items = [];
                this.dataUploads.forEach( (upload, index) => {
                   const item = {
                       title: upload.status === 'submitted' ? `${upload.name}` : `${upload.name} - ${this.getDisplayStatus(upload.status)}`,
                       subtitle: upload.create_date,
                       dataUploadId: upload._id,
                       uploader: this.getDisplayUploader(upload.uploader),
                       status: upload.status,
                       icon: this.getDisplayIcon(upload.status)
                   };
                   items.push(item);
                    if(index <= this.dataUploads.length - 1) {
                        items.push({ divider: true, inset: true });
                    }
                });
                return items;
            },
        },
        watch: {
            // eslint-disable-next-line no-unused-vars
            filterBy: function (newVal, oldVal) {
                // console.log(`newVal: ${newVal}, oldVal: ${oldVal}`);
                this.loadDataUploads();
            },
        },
    };
</script>

<style scoped>

</style>
