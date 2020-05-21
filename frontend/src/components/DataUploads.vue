<template>
    <div style="width: 85%;">

        <h1 class="display-1 font-weight-thin" style="margin-left:15px; margin-top:15px; margin-bottom:10px;">Data Uploads</h1>

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
                    <v-btn icon class="mr-4" >
                        <v-icon>mdi-file-upload</v-icon>
                    </v-btn>

                    <v-list-item-content>
                        <v-list-item-title v-html="item.title"></v-list-item-title>
                        <v-list-item-subtitle><span class='text--primary'>Uploaded</span>: {{item.subtitle | formatDate}}</v-list-item-subtitle>

                    </v-list-item-content>

                </v-list-item>
            </template>
        </v-list>
    </div>
</template>

<script>

    import {mapActions, mapState, mapGetters} from "vuex";

    export default {
        async created() {
            await this.loadDataUploads();
        },
        data: () => ({
            message: '',
        }),
        methods: {
            ...mapActions({
                getDataUploads: 'dataUploads/getDataUploads',
            }),
            async loadDataUploads() {
                this.message = 'Retrieving Data Uploads...';
                await this.getDataUploads();
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
            }
        },
        computed: {
            ...mapState({
                dataUploads: state => state.dataUploads.dataUploads
            }),
            ...mapGetters({
                getDataUploadById: 'dataUploads/getDataUploadById',
            }),
            dataUploadDisplayItems: function(){
                let items = [];
                // items.push({ header: 'Data Uploads' });
                this.dataUploads.forEach( (upload, index) => {
                   const item = {
                       title: upload.name,
                       subtitle: upload.create_date,
                       dataUploadId: upload._id
                   };
                   items.push(item);
                    if(index <= this.dataUploads.length - 1) {
                        items.push({ divider: true, inset: true });
                    }
                });
                // console.log("computed items: ", items);
                return items;
            }
        },
    };
</script>

<style scoped>

</style>
