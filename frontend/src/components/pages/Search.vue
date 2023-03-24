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
                            :title="$tc('Find Editions By Resource Field & Value', 2)"
                            :headers="editionHeaders"
                            :filterRequired="$tc('Field Name', 2) + ' ' + $tc('or Value', 2)"
                            storeName="repos"
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
            editionHeaders: [
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
