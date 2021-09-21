<template>
    <v-container fluid :key="'branch-'+reIndex">
        <v-row dense>
            <v-col cols="12">
                <v-tabs v-model="tab">
                    <v-tab key="version">{{$tc('Version')}}</v-tab>
                    <v-tab key="schema" v-if="schema">{{$tc('Schema')}}</v-tab>
                    <v-tab key="faq" v-if="branch && branch.faq">{{$tc('FAQ')}}</v-tab>
                </v-tabs>
                <v-tabs-items v-model="tab" class="fullWidth">
                    <v-tab-item key="version">
                        <v-card outlined>
                            <v-card-text>
                                <v-row>
                                    <h1 class="display-1 font-weight-thin ml-3 my-3">{{$tc("Version") + " " + id}}</h1>
                                </v-row>

                                <v-row>
                                    <v-col cols=12 v-if="branch && branch.repo_id && branch.repo_id.name">
                                        Dataset Name: {{branch.repo_id.name}}
                                    </v-col>
                                </v-row>

                                <v-row>
                                    <v-col cols=12 v-if="branch && branch.repo_id && branch.repo_id.description">
                                        Dataset Description: {{branch.repo_id.description}}
                                    </v-col>
                                </v-row>

                                <v-row>
                                    <v-col cols=12 v-if="branch && branch.name">
                                        Name: {{branch.name}}
                                    </v-col>
                                </v-row>

                                <v-row>
                                    <v-col cols=12 v-if="branch && branch.short_title">
                                        Short Title: {{branch.short_title}}
                                    </v-col>
                                </v-row>

                                <v-row>
                                    <v-col cols=12 v-if="branch && branch.type">
                                        Type: {{branch.type}}
                                    </v-col>
                                </v-row>

                                <v-row>
                                    <v-col cols=12 v-if="branch && branch.description">
                                        Description: {{branch.description}}
                                    </v-col>
                                </v-row>

                                <v-row>
                                    <v-col cols=12 v-if="branch && branch.data_upload_id">
                                        Data Upload: {{branch.data_upload_id}}
                                    </v-col>
                                </v-row>

                                <v-row>
                                    <v-col cols=12 v-if="branch && branch.availability">
                                        Availability: {{branch.availability}}
                                    </v-col>
                                </v-row>

                                <v-row>
                                    <v-col cols=12 v-if="branch && branch.variable_classification">
                                        Variable Classification: {{branch.variable_classification}}
                                    </v-col>
                                </v-row>

                                <v-row>
                                    <v-col cols=12 v-if="branch && branch.notes">
                                        Notes: {{branch.notes}}
                                    </v-col>
                                </v-row>

                                <v-row>
                                    <v-col cols=12 v-if="branch && branch.citation">
                                        Citation: {{branch.citation}}
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item key="schema" v-if="schema">
                        <SchemaView :editing="false"></SchemaView>
                    </v-tab-item>
                    <v-tab-item key="faq" v-if="branch && branch.faq">
                        <Markdown
                            name="faq"
                            :value="(branch) ? branch.faq : ''"
                            label=""
                            :editing="false"
                        ></Markdown>
                    </v-tab-item>
                </v-tabs-items>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
import {mapActions, mapState} from "vuex";
import SchemaView from '../SchemaView';
import Markdown from '../Markdown';

export default {
    
    components:{
        SchemaView,
        Markdown
    },

    data(){
        return {
            tab: 'version',
            reIndex: 0,
            loading: true,
            id: '',
        }
    },
    methods: {
        ...mapActions({
            getBranchById: 'repos/getBranchById',
            getRepos: 'repos/getAllRepos',
            getSchema: 'schemaImport/getTableSchema',
        }),

        async loadSections() {
            await this.getBranchById({id: this.id});
            await this.getSchema({id: this.id});
            this.reIndex++;
        },

        async load(){
            this.loading = true;
            this.id = this.$route.params.id;
            this.loadSections();
            this.loading = false;
        },
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            branch: state => state.repos.branch,
            dataUploads: state => state.dataUploads.dataUploads,
            dataset: state => state.repos.repo,
            schema: state => state.schemaImport.tableSchema,
        }),
    },
    
    watch: {
        branchId: async function(){
            await this.load();
        }
    },

    created() {
        this.load()
    },
}
</script>

<style scoped>
    .scroll {
        overflow-y: auto;
    }

    .card-outter {
        position: relative;
        padding-bottom: 15px;
    }
    .card-actions {
        position: absolute;
        bottom: 0;
        right: 0;
    }
    
    .fixedHeight{
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
    }

</style>

<style>
    .v-label.v-label--is-disabled.theme--light{
        color: rgba(0,0,0,.87);
    }
    .v-label.v-label--is-disabled.theme--dark{
        color: var(--v-text-base);
    }
</style>

