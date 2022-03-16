<template>
    <v-container>
        <v-row>
            <v-col v-if="loading">
                <v-progress-circular
                    indeterminate
                    color="primary"
                    size=100
                ></v-progress-circular>
            </v-col>
            <v-col v-else-if="!admin">
                {{$tc('403')}}
            </v-col>
            <v-col v-else>
                <v-tabs vertical>
                    <v-tab>
                        {{$tc('Permission', 2)}}
                    </v-tab>
                    <v-tab-item>
                        <DataTable
                            :title="$tc('Permission', 2)"
                            :headers="permissionHeaders"
                            storeName="permissions"
                            :showDelete="true"
                            :formComponent="permissionSubComponent"
                        ></DataTable>
                    </v-tab-item>

                    <v-tab>
                        {{$tc('Topics', 2)}}
                    </v-tab>
                    <v-tab-item>
                        <DataTable
                            :title="$tc('Topics', 2)"
                            :headers="topicsHeaders"
                            storeName="topics"
                            :showDelete="true"
                            :formComponent="topicsSubComponent"
                        ></DataTable>
                    </v-tab-item>

                    <v-tab>
                        {{$tc('Comments', 2)}}
                    </v-tab>
                    <v-tab-item>
                        <DataTable
                            :title="$tc('Comments', 2)"
                            :headers="commentsHeaders"
                            :filterRequired="$tc('Topics', 1) + ' ' + $tc('id', 1)"
                            storeName="comments"
                            :showDelete="true"
                            :showEdit="false"
                            :showNew="false"
                            :formComponent="topicsSubComponent"
                        ></DataTable>
                    </v-tab-item>

                    <v-tab>
                        {{$tc('Data Upload', 2)}}
                    </v-tab>
                    <v-tab-item>
                        <DataTable
                            :title="$tc('Data Upload', 2)"
                            :headers="dataUploadHeaders"
                            storeName="adminDUploads"
                            :showDelete="true"
                            :formComponent="permissionSubComponent"
                        ></DataTable>
                    </v-tab-item>

                    <v-tab>
                        {{$tc('Datasets', 2)}}
                    </v-tab>
                    <v-tab-item>
                        <DataTable
                            :title="$tc('Datasets', 2)"
                            :headers="datasetHeaders"
                            storeName="adminDatasets"
                            :showDelete="false"
                            :formComponent="permissionSubComponent"
                        ></DataTable>
                    </v-tab-item>

                    <v-tab>
                        {{$tc('Versions', 2)}}
                    </v-tab>
                    <v-tab-item>
                        <DataTable
                            :title="$tc('Versions', 2)"
                            :headers="versionHeaders"
                            storeName="adminVersions"
                            :showDelete="true"
                            :formComponent="permissionSubComponent"
                        ></DataTable>
                    </v-tab-item>

                    <v-tab>
                        {{$tc('Config')}}
                    </v-tab>
                    <v-tab-item>
                        <DataTable
                            :title="$tc('Config')"
                            :headers="configHeaders"
                            storeName="config"
                            :showDelete="true"
                            deleteParam="key"
                            :showNew="true"
                            :showEdit="true"
                            :formComponent="configSubComponent"
                        ></DataTable>
                    </v-tab-item>
                </v-tabs>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { mapState } from 'vuex';

import DataTable from '../admin/datatable'
import PermissionForm from '../admin/permissionForm'
import TopicsSubForm from '../admin/topicsForm'
import ConfigSubForm from '../admin/configForm'

export default {
    components: {
        DataTable: DataTable,
    },
    
    data(){
        return {
            permissionSubComponent: PermissionForm,
            topicsSubComponent: TopicsSubForm,
            permissionHeaders: [
                    {
                        text: this.$tc('Priority'),
                        sortable: true,
                        value: 'priority',
                    },
                    {
                        text: this.$tc('Allow Based Rule'),
                        sortable: false,
                        value: 'allow',
                    },
                    { 
                        text: this.$tc('Group', 1) + ' ' + this.$tc('id', 2), 
                        value: 'group_ids' 
                    },
                    { 
                        text: this.$tc('Topics', 1) + ' ' + this.$tc('id'), 
                        value: 'topic_id' 
                    },
                    { 
                        text: this.$tc('User') + ' ' +  this.$tc('id', 2), 
                        value: 'user_ids' 
                    },
                    { 
                        text: this.$tc('Action', 2), 
                        value: 'actions', 
                        sortable: false 
                    }
                ],

            topicsHeaders: [
                    {
                        text: this.$tc('id', 1),
                        sortable: true,
                        value: '_id',
                    },
                    {
                        text: this.$tc('Parent'),
                        sortable: false,
                        value: 'parent_id',
                    },
                    { 
                        text: this.$tc('Name'), 
                        value: 'name' 
                    },
                    { 
                        text: this.$tc('Contributor', 2), 
                        value: 'contributors' 
                    },
                    { 
                        text: this.$tc('Subscriber', 2), 
                        value: 'subscribers' 
                    },
                    { 
                        text: this.$tc('Author') + ' ' + this.$tc('Group', 2), 
                        value: 'author_groups' 
                    },
                    { 
                        text: this.$tc('Action', 2), 
                        value: 'actions', 
                        sortable: false 
                    }
                ],

                commentsHeaders: [
                    {
                        text: this.$tc('id', 1),
                        sortable: true,
                        value: '_id',
                    },
                    {
                        text: this.$tc('Topics', 1) + ' ' + this.$tc('id', 1),
                        sortable: false,
                        value: 'topic_id',
                    },
                    { 
                        text: this.$tc('Created'), 
                        value: 'created_ts' 
                    },
                    { 
                        text: this.$tc('Author'), 
                        value: 'author_user' 
                    },
                    { 
                        text: this.$tc('Comments'), 
                        value: 'comment' 
                    },
                    { 
                        text: this.$tc('Action', 2), 
                        value: 'actions', 
                        sortable: false 
                    }
                ],

            dataUploadHeaders: [
                    {
                        text: this.$tc('id', 1),
                        sortable: true,
                        value: '_id',
                    },
                    {
                        text: this.$tc('Name'),
                        sortable: true,
                        value: 'name'
                    },
                    { 
                        text: this.$tc('Created'), 
                        value: 'create_date' 
                    },
                    { 
                        text: this.$tc('Description'), 
                        value: 'description' 
                    },
                    { 
                        text: this.$tc('Approver Opened'), 
                        value: 'opened_by_approver' 
                    },
                    {
                        text: this.$tc('Approver Commented'),
                        sortable: false,
                        value: 'approver_has_commented',
                    },
                    { 
                        text: this.$tc('Status'), 
                        value: 'status' 
                    },
                    { 
                        text: this.$tc('Topics', 1) + ' ' + this.$tc('id', 1), 
                        value: 'topic_id' 
                    },
                    { 
                        text: this.$tc('Submissions', 1) + ' ' +  this.$tc('id', 1), 
                        value: 'upload_submission_id' 
                    },
                    { 
                        text: this.$tc('Old Submission'),
                        value: 'old_submission' 
                    },
                    { 
                        text: this.$tc('Uploader'), 
                        value: 'uploader' 
                    },
                    { 
                        text: this.$tc('Action', 2), 
                        value: 'actions', 
                        sortable: false 
                    }
                    // { 
                    //     text: 'Files', 
                    //     value: 'files' 
                    // },
                ],

            datasetHeaders: [
                    {
                        text: this.$tc('id', 1),
                        sortable: true,
                        value: '_id',
                    },
                    {
                        text: this.$tc('Name'),
                        sortable: true,
                        value: 'name'
                    },
                    { 
                        text: this.$tc('Created'), 
                        value: 'create_date' 
                    },
                    { 
                        text: this.$tc('Created By'), 
                        value: 'created_by' 
                    },
                    { 
                        text: this.$tc('Topics', 1) + ' ' + this.$tc('id', 1),
                        value: 'topic_id' 
                    },
                    {
                        text: this.$tc('Description'),
                        sortable: false,
                        value: 'description',
                    },
                ],

            versionHeaders: [
                    {
                        text: this.$tc('id', 1),
                        sortable: true,
                        value: '_id',
                    },
                    {
                        text: this.$tc('Repo Id'),
                        sortable: true,
                        value: 'repo_id'
                    },
                    { 
                        text: this.$tc('Topics', 1) + ' ' + this.$tc('id', 1),
                        value: 'topic_id' 
                    },
                    { 
                        text: this.$tc('Type'), 
                        value: 'type' 
                    },
                    { 
                        text: this.$tc('Name'), 
                        value: 'name' 
                    },
                    { 
                        text: this.$tc('Created'), 
                        value: 'create_date' 
                    },
                    {
                        text: this.$tc('Description'),
                        sortable: false,
                        value: 'description',
                    },
                    {
                        text: this.$tc('Upload Id'),
                        sortable: false,
                        value: 'data_upload_id',
                    },
                    { 
                        text: this.$tc('Availability'), 
                        value: 'availability' 
                    },
                    { 
                        text: this.$tc('Variable Classification'), 
                        value: 'variable_classification' 
                    },
                    { 
                        text: this.$tc('Notes'), 
                        value: 'notes' 
                    },
                    { 
                        text: this.$tc('Citation'), 
                        value: 'citation' 
                    },
                    { 
                        text: this.$tc('Short Title'), 
                        value: 'short_title' 
                    },
                    { 
                        text: this.$tc('Published'), 
                        value: 'published' 
                    },
                    { 
                        text: this.$tc('Approved'), 
                        value: 'approved' 
                    },
                    { 
                        text: this.$tc('FAQ'), 
                        value: 'faq' 
                    },
                    { 
                        text: this.$tc('Action', 2), 
                        value: 'actions', 
                        sortable: false 
                    }
                ],

            submissionHeaders: [
                    {
                        text: this.$tc('Data'),
                        value: 'data',
                    },
                    { 
                        text: this.$tc('Action', 2), 
                        value: 'actions', 
                        sortable: false 
                    }
                ],

            configSubComponent: ConfigSubForm,
            configHeaders: [
                {
                        text: this.$tc('id', 1),
                        sortable: true,
                        value: '_id',
                    },
                    {
                        text: this.$tc('Key'),
                        sortable: true,
                        value: 'key'
                    },
                    { 
                        text: this.$tc('Value'), 
                        value: 'value' 
                    },
                    { 
                        text: this.$tc('Action', 2), 
                        value: 'actions', 
                        sortable: false 
                    }
                    ]
        }
    },

    computed: {
        ...mapState({
            user: state => state.user.user,
            loggedIn: state => state.user.loggedIn,
            userPermissions: state => state.user.userPermissions,
            loading: state => state.user.loading,
        }),
        admin: function(){
            return this.user.isAdmin;
        },
        
    },

    methods: {
        
    },

    mounted(){
    }

}
</script>

<style scoped>

</style>