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
                        <v-card>
                            <v-card-title>Permissions</v-card-title>
                            <v-card-text>
                                <v-data-table
                                    dense
                                    :headers="permissionHeaders"
                                    :items="permissions"
                                >
                                    <template v-slot:top>
                                        <v-toolbar flat>
                                            <v-toolbar-title></v-toolbar-title>
                                            <v-divider
                                            class="mx-4"
                                            inset
                                            vertical
                                            ></v-divider>
                                            <v-spacer></v-spacer>
                                            <v-dialog v-model="dialog" max-width="500px">
                                            <template v-slot:activator="{ on }">
                                                <v-btn color="primary" dark class="mb-2" v-on="on">New Entry</v-btn>
                                            </template>
                                            <v-card>
                                                <v-card-title>
                                                    <span class="headline">{{ permissionFormTitle }}</span>
                                                </v-card-title>

                                                <v-card-text>
                                                    <v-container>
                                                        <v-row>
                                                            <v-col cols="12">
                                                                <v-text-field v-model="editedItem.priority" label="Priority"></v-text-field>
                                                            </v-col>
                                                            <v-col cols="12">
                                                                <v-checkbox v-model="editedItem.allow" label="Allow Based Rule"></v-checkbox>
                                                            </v-col>
                                                            <v-col cols="12">
                                                                <v-text-field v-model="editedItem.group_ids" label="Group ids"></v-text-field>
                                                            </v-col>
                                                            <v-col cols="12">
                                                                <v-text-field v-model="editedItem.topic_id" label="Topic Id"></v-text-field>
                                                            </v-col>
                                                            <v-col cols="12" sm="6" md="4">
                                                                <v-text-field v-model="editedItem.user_ids" label="User Ids"></v-text-field>
                                                            </v-col>
                                                        </v-row>
                                                    </v-container>
                                                </v-card-text>

                                                <v-card-actions>
                                                    <v-spacer></v-spacer>
                                                    <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                                                    <v-btn color="blue darken-1" text @click="savePermission">Save</v-btn>
                                                </v-card-actions>
                                            </v-card>
                                            </v-dialog>
                                        </v-toolbar>
                                    </template>
                                    <template v-slot:item.actions="{ item }">
                                        <v-icon
                                            small
                                            class="mr-2"
                                            @click="editPermission(item)"
                                        >
                                            mdi-pencil
                                        </v-icon>
                                        <v-icon
                                            small
                                            @click="deletePermission(item)"
                                        >
                                            mdi-delete
                                        </v-icon>
                                    </template>
                                </v-data-table>
                            </v-card-text>
                            <v-card-actions>
                            </v-card-actions>
                        </v-card>
                    </v-tab-item>

                    <v-tab>
                        Formio
                    </v-tab>
                    <v-tab-item>
                        <v-card>
                            <v-card-title>Formio</v-card-title>
                            <v-card-text>
                                <link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css'>
                                <link rel='stylesheet' href='https://unpkg.com/formiojs@latest/dist/formio.full.min.css'>
                                <FormBuilder v-bind:form="{display: 'form'}" v-bind:options="{}"></FormBuilder>
                            </v-card-text>
                            <v-card-actions>
                            </v-card-actions>
                        </v-card>
                    </v-tab-item>
                </v-tabs>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>

import { FormBuilder } from 'vue-formio';
import { mapState } from 'vuex';

import { Backend } from '../../services/backend';
const backend = new Backend();



export default {
    components: {
        FormBuilder: FormBuilder
    },
    
    data(){
        return {
            permissions: [],
            editedItem: {},
            editedIndex: -1,
            dialog: false,
            forms: {},
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
        permissionFormTitle () {
            return this.editedIndex === -1 ? 'New Permission Rule' : 'Edit Permission Rule'
        },
    },

    watch: {
        dialog(val){
            val || this.close();
        }
    },

    methods: {
        close(){
            this.dialog = false
            this.$nextTick(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
            })
        },

        editPermission(item) {
            this.editedIndex = this.permissions.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },

        deletePermission(item) {
            const index = this.permissions.indexOf(item)
            confirm('Are you sure you want to delete this item?') && this.permissions.splice(index, 1)
        },

        savePermission() {
            if (this.editedIndex > -1) {
                Object.assign(this.permissions[this.editedIndex], this.editedItem)
                backend.putPermission(this.editedItem._id, this.editedItem)
            } else {
                backend.newPermission(this.editedItem);
                this.permissions.push(this.editedItem)
            }
            this.close()
        },
        
    },

    mounted(){
        backend.getPermissions().then( (res) => {
            this.permissions = res;
        });

        backend.getForms().then( (res) => {
            this.permissions = res;
        });
    }

}
</script>

<style scoped>

</style>