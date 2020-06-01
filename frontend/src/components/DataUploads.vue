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

        <v-container v-if="user.isApprover" fluid style="margin-left:5px; padding-bottom:0px; margin-bottom:7px;">
            <v-autocomplete
                v-model="selectedProviders"
                :disabled="isUpdating"
                :items="dataProviders"
                filled
                chips
                color="blue-grey lighten-2"
                label="Select"
                item-text="name"
                item-value="value"
                multiple
            >
                <template v-slot:selection="data">
                    <v-chip
                        v-bind="data.attrs"
                        :input-value="data.selected"
                        close
                        @click="data.select"
                        @click:close="remove(data.item)"
                    >
                        <v-avatar left>
                            <v-icon>mdi-account-circle</v-icon>
                        </v-avatar>
                        {{ data.item.name }}
                    </v-chip>
                </template>
                <template v-slot:item="data">
                    <template v-if="typeof data.item !== 'object'">
                        <v-list-item-content v-text="data.item"></v-list-item-content>
                    </template>
                    <template v-else>
                        <v-list-item-avatar>
                            <v-icon>mdi-account-circle</v-icon>
                        </v-list-item-avatar>
                        <v-list-item-content>
                            <v-list-item-title v-html="data.item.name"></v-list-item-title>
                        </v-list-item-content>
                    </template>
                </template>
            </v-autocomplete>
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

import {mapActions, mapState, mapGetters, mapMutations} from "vuex";

export default {
    async created() {
        this.filterBy = this.selectedFilterBy;
        if(this.user.isApprover) {
            this.filterBy = 'provider';
            this.selectedProviders = this.selectedDataProviders;
            await this.getDataProviders();
        } else if(this.user.isDataProvider) {
            if(!this.filterBy || this.filterBy === 'provider') { this.filterBy = 'me'; }
            await this.loadDataUploads();
        }
    },
    data() {
        return {
            message: '',
            filterBy: null,
            isUpdating: false,
            selectedProviders: [],
        }
    },
    methods: {
        ...mapActions({
            getDataUploads: 'dataUploads/getDataUploads',
            getDataProviders: 'dataUploads/getDataProviders',
        }),
        ...mapMutations({
            resetState: 'uploadForm/resetState',
            setSelectedDataProviders: 'dataUploads/setSelectedDataProviders',
            setSelectedFilterBy: 'dataUploads/setSelectedFilterBy',
        }),
        async loadDataUploads() {
            this.message = 'Retrieving Data Uploads...';
            if(this.user.isApprover) { await this.getDataUploads({filterBy: this.filterBy, providerGroups: this.selectedProviders}); }
            else { await this.getDataUploads({filterBy: this.filterBy}); }
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
        },
        remove (item) {
            const index = this.selectedProviders.indexOf(item.value)
            if (index >= 0) this.selectedProviders.splice(index, 1);
            this.loadDataUploads();
        },
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            dataUploads: state => state.dataUploads.dataUploads,
            dataProviders: state => state.dataUploads.dataProviders,
            selectedDataProviders: state => state.dataUploads.selectedDataProviders,
            selectedFilterBy: state => state.dataUploads.selectedFilterBy,
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
        filterBy: async function (newVal, oldVal) {
            await this.setSelectedFilterBy(newVal);
            if(this.user.isDataProvider) { this.loadDataUploads(); }
        },
        // eslint-disable-next-line no-unused-vars
        selectedProviders: function (newVal, oldVal) {
            this.loadDataUploads();
            this.setSelectedDataProviders(newVal);
        },
    },
};
</script>

<style scoped>

</style>
