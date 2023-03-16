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
                        {{$tc('Field & Value Search')}}
                    </v-tab>
                    <v-tab-item>
                        <FieldValueSearchForm
                            :title="$tc('Field & Value Search', 2)"
                            :headers="fieldValueSearchResultHeaders"
                            :filterRequired="$tc('Field Name', 2) + ' ' + $tc('or Value', 2)"
                            storeName="adminDUploads"
                            :showDelete="true"
                            :showEdit="false"
                            :showNew="false"
                        ></FieldValueSearchForm>
                    </v-tab-item>
                </v-tabs>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { mapState } from 'vuex';
import FieldValueSearchForm from '../admin/fieldValueSearchForm'

export default {
    components: {
        FieldValueSearchForm
    },

    data(){
        return {
            fieldValueSearchResultHeaders: [
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
            ],
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
