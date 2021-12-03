<template>
    <v-container>
        <h1 class="display-1 font-weight-thin ml-3 my-3">{{$tc('Data Upload', 2)}}</h1>

        <v-container v-if="user.isDataProvider" fluid class="ml-1 pb-0 mb-1">
            <v-row>
                <v-col cols=10>
                    <p>{{$tc('Filter by')}}:</p>
                    <v-radio-group v-model="filterBy" row class="ml-2">
                        <v-radio :label="$tc('My') + ' ' + $tc('Uploads', 2)" id="filter-me" value="me"></v-radio>
                        <v-radio :label="$tc('Team')  + ' ' + $tc('Uploads', 2)" id="filter-team" value="team"></v-radio>
                    </v-radio-group>
                </v-col>
            </v-row>
            
        </v-container>

        <v-container v-if="user.isApprover" fluid class="ml-1 pb-0 mb-1">
            <v-autocomplete
                v-model="selectedProviders"
                :disabled="isUpdating"
                :items="dataProviders"
                filled
                chips
                color="blue-grey lighten-2"
                :label="$tc('Select')"
                item-text="name"
                item-value="value"
                @change="loadDataUploads()"
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
                    <template v-if="(typeof(data.item) !== 'object')">
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

        <v-container>
            <v-row>
                <v-col cols="2">
                    <v-btn color="primary" to="/upload" id="newUpload" v-if="canUpload">{{$tc('New')}} {{$tc('Uploads')}}</v-btn>
                </v-col>
            </v-row>
        </v-container>

        <div v-if="dataUploadDisplayItems.length == 0">
            {{$tc('Looks like there is nothing here why not click New Upload to get started')}}
        </div>
        <v-list three-line v-else>
            <template v-for="(item, index) in dataUploadDisplayItems">
                <v-divider
                    v-if="item.divider"
                    :key="index"
                    :inset="item.inset"
                ></v-divider>

                <v-list-item
                    v-else
                    :key="item.dataUploadId"
                    :id="'upload-'+item.dataUploadId"
                    @click="routeToUploadInfo(item.dataUploadId)"
                >
                    <v-list-item-content>
                        <v-list-item-title v-html="item.title"></v-list-item-title>
                        <v-list-item-subtitle>
                            {{$tc('Created on')}} {{item.subtitle | formatDate}}
                            {{$tc('by')}} {{item.uploader}}
                        </v-list-item-subtitle>

                    </v-list-item-content>
                    <v-btn icon class="mr-4">
                        <v-icon :color="item.iconColour">{{item.icon}}</v-icon>
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
            if(!this.filterBy || this.filterBy === 'provider') { this.filterBy = 'team'; }
            await this.loadDataUploads();
        }else{
            this.filterBy = 'team';
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
    mounted(){
        this.loadDataUploads();
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
                this.$router.push({ name: 'upload_view', params: { id: dataUploadId } })
            }
            else {
                this.$router.push({ name: 'data-upload-detail', params: { id: dataUploadId } })
            }
        },
        getDisplayStatus(status) {
            if(status === 'not_submitted') { return this.$tc('Draft'); }
            if(status === 'upload_in_progress') { return this.$tc('Upload in progress'); }
            if(status === 'upload_error') { return this.$tc('Upload failed'); }
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
            canUpload: state => state.user.canUpload,
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
                    icon: this.getDisplayIcon(upload.status),
                    iconColour: (upload.status === 'submitted') ? 'success' : 'text'
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
