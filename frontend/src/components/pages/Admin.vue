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
                Forbidden you do not have access to this page
            </v-col>
            <v-col v-else>
                <v-tabs vertical>
                    <v-tab>
                        Permissions
                    </v-tab>
                    <v-tab-item>
                        <DataTable
                            title="Permissions"
                            :headers="permissionHeaders"
                            storeName="permissions"
                            :showDelete="true"
                            :formComponent="permissionSubComponent"
                        ></DataTable>
                    </v-tab-item>

                    <v-tab>
                        Topics
                    </v-tab>
                    <v-tab-item>
                        <DataTable
                            title="Topics"
                            :headers="topicsHeaders"
                            storeName="topics"
                            :showDelete="true"
                            :formComponent="topicsSubComponent"
                        ></DataTable>
                    </v-tab-item>

                    <v-tab>
                        Comments
                    </v-tab>
                    <v-tab-item>
                        <DataTable
                            title="Comments"
                            :headers="commentsHeaders"
                            filterRequired="Topic ID"
                            storeName="comments"
                            :showDelete="true"
                            :showEdit="false"
                            :showNew="false"
                            :formComponent="topicsSubComponent"
                        ></DataTable>
                    </v-tab-item>

                    <v-tab>
                        Data Uploads
                    </v-tab>
                    <v-tab-item>
                        <DataTable
                            title="Data Uploads"
                            :headers="dataUploadHeaders"
                            storeName="adminDUploads"
                            :showDelete="false"
                            :formComponent="permissionSubComponent"
                        ></DataTable>
                    </v-tab-item>

                    <v-tab>
                        Formio
                    </v-tab>
                    <v-tab-item>
                        <DataTable
                            title="Forms"
                            :headers="formioHeaders"
                            storeName="forms"
                            :showDelete="true"
                            :formComponent="formsSubComponent"
                            dialogSize="100%"
                        ></DataTable>
                    </v-tab-item>

                    <v-tab>
                        Formio Submissions
                    </v-tab>
                    <v-tab-item>
                        <DataTable
                            title="Formio Submissions"
                            filterRequired="Form Name"
                            :headers="submissionHeaders"
                            storeName="submissions"
                            :showDelete="true"
                            :showNew="false"
                            :showEdit="false"
                            :formComponent="permissionSubComponent"
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
import FormsSubForm from '../admin/formsForm'
import TopicsSubForm from '../admin/topicsForm'

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
                        text: 'Priority',
                        sortable: true,
                        value: 'priority',
                    },
                    {
                        text: 'Allow Based Rule',
                        sortable: false,
                        value: 'allow',
                    },
                    { 
                        text: 'Group Ids', 
                        value: 'group_ids' 
                    },
                    { 
                        text: 'Topic Id', 
                        value: 'topic_id' 
                    },
                    { 
                        text: 'User Ids', 
                        value: 'user_ids' 
                    },
                    { 
                        text: 'Actions', 
                        value: 'actions', 
                        sortable: false 
                    }
                ],

            topicsHeaders: [
                    {
                        text: 'ID',
                        sortable: true,
                        value: '_id',
                    },
                    {
                        text: 'Parent',
                        sortable: false,
                        value: 'parent_id',
                    },
                    { 
                        text: 'Name', 
                        value: 'name' 
                    },
                    { 
                        text: 'Contributors', 
                        value: 'contributors' 
                    },
                    { 
                        text: 'Subscribers', 
                        value: 'subscribers' 
                    },
                    { 
                        text: 'Author Groups', 
                        value: 'author_groups' 
                    },
                    { 
                        text: 'Actions', 
                        value: 'actions', 
                        sortable: false 
                    }
                ],

                commentsHeaders: [
                    {
                        text: 'ID',
                        sortable: true,
                        value: '_id',
                    },
                    {
                        text: 'Topic_Id',
                        sortable: false,
                        value: 'topic_id',
                    },
                    { 
                        text: 'Created', 
                        value: 'created_ts' 
                    },
                    { 
                        text: 'Author', 
                        value: 'author_user' 
                    },
                    { 
                        text: 'Comment', 
                        value: 'comment' 
                    },
                    { 
                        text: 'Actions', 
                        value: 'actions', 
                        sortable: false 
                    }
                ],

            dataUploadHeaders: [
                    {
                        text: 'ID',
                        sortable: true,
                        value: '_id',
                    },
                    {
                        text: 'Name',
                        sortable: true,
                        value: 'name'
                    },
                    { 
                        text: 'Created', 
                        value: 'create_date' 
                    },
                    { 
                        text: 'Description', 
                        value: 'description' 
                    },
                    { 
                        text: 'Approver Opened', 
                        value: 'opened_by_approver' 
                    },
                    {
                        text: 'Approver Commented',
                        sortable: false,
                        value: 'approver_has_commented',
                    },
                    { 
                        text: 'Status', 
                        value: 'status' 
                    },
                    { 
                        text: 'Topic ID', 
                        value: 'topic_id' 
                    },
                    { 
                        text: 'Submission ID', 
                        value: 'upload_submission_id' 
                    },
                    { 
                        text: 'Uploader', 
                        value: 'uploader' 
                    },
                    // { 
                    //     text: 'Files', 
                    //     value: 'files' 
                    // },
                ],

            submissionHeaders: [
                    {
                        text: 'Data',
                        value: 'data',
                    },
                    { 
                        text: 'Actions', 
                        value: 'actions', 
                        sortable: false 
                    }
                ],

            formsSubComponent: FormsSubForm,

            formioHeaders: [
                {
                    text: 'Name',
                    sortable: true,
                    value: 'name',
                },
                {
                    text: 'Path',
                    sortable: false,
                    value: 'path',
                },
                { 
                    text: 'Title', 
                    value: 'title' 
                },
                { 
                    text: 'Type', 
                    value: 'type' 
                },
                { 
                    text: 'Machine Name', 
                    value: 'machine_name' 
                },
                { 
                    text: 'Created', 
                    value: 'created' 
                },
                { 
                    text: 'Modified', 
                    value: 'modified' 
                },
                { 
                    text: 'Actions', 
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