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

export default {
    components: {
        DataTable: DataTable,
    },
    
    data(){
        return {
            permissionSubComponent: PermissionForm,
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