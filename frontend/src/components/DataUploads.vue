<template>
    <div style="width: 85%;">

        <h1 class="display-3" style="margin-left:15px; margin-top:15px; margin-bottom:10px;">Data Uploads</h1>

        <v-list three-line>
            <template v-for="(item, index) in dataUploadDisplayItems">
<!--                <v-subheader-->
<!--                    v-if="item.header"-->
<!--                    :key="item.header"-->
<!--                    v-text="item.header"-->
<!--                ></v-subheader>-->

                <v-divider
                    v-if="item.divider"
                    :key="index"
                    :inset="item.inset"
                ></v-divider>

                <v-list-item
                    v-else
                    :key="item.title"
                    @click="routeToRevisionHistory(item.dataUploadId)"
                >
                    <v-btn icon class="mr-4" >
                        <v-icon>mdi-history</v-icon>
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

    import {mapActions, mapState} from "vuex";

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
            routeToRevisionHistory(dataUploadId) {
                console.log("routeToRevisionHistory uploadId: " + dataUploadId);
                this.$router.push({ name: 'data-upload-revisions', params: { id: dataUploadId } })
            }
        },
        computed: {
            ...mapState({
                dataUploads: state => state.dataUploads.dataUploads
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
