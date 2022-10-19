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
                                    <h1 class="display-1 font-weight-thin ml-3 my-3">{{$tc("Version") + " " + ((branch && branch.name) ? branch.name : id)}}</h1>
                                </v-row>

                                <v-row>
                                    <v-col cols=12 v-if="branch && branch.repo_id && branch.repo_id.name">
                                        <h2 class="font-weight-thin largerFont">Dataset Name: {{branch.repo_id.name}}</h2>
                                    </v-col>
                                </v-row>

                                <v-row>
                                    <v-col cols=12 v-if="branch && branch.repo_id && branch.repo_id.description">
                                        Dataset Description: {{branch.repo_id.description}}
                                    </v-col>
                                </v-row>

                                <v-row>
                                    <v-col cols=12 v-if="branch && branch.short_title">
                                        Short Title: {{branch.short_title}}
                                    </v-col>
                                
                                    <v-col cols=6 v-if="branch && branch.type">
                                        Type: {{branch.type}}
                                    </v-col>
                                
                                    <v-col cols=6 v-if="branch && branch.description">
                                        <Markdown
                                            name="description"
                                            :value="(branch) ? branch.description : ''"
                                            :label="$tc('Version Description')"
                                            :editing="false"
                                            :placeholder="$tc('Notes')"
                                        ></Markdown>
                                    </v-col>
                                
                                    <v-col cols=6 v-if="branch && branch.variable_classification && variableClassification && variableClassification.name">
                                        {{$tc('Variable Classification Index')}}: {{variableClassification.name}}
                                    </v-col>

                                    <v-col cols=6 v-if="branch && branch.keywords">
                                        Keywords: {{branch.keywords}}
                                    </v-col>

                                    <v-col cols=6 v-if="branch && branch.citation">
                                        Citation: {{branch.citation}}
                                    </v-col>

                                    <v-col cols=6 v-if="branch && branch.lifecycle">
                                        <v-row>
                                            <v-col cols=12>
                                                {{$tc('Version') + ' ' + $tc('Lifecycle')}}
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols=12>
                                                <Composite
                                                    :label="{
                                                        date: 'Date',
                                                        comment: 'Comment'
                                                    }"
                                                    :placeholder="{
                                                        date: new Date().toISOString(),
                                                        comment: 'Comment'
                                                    }"
                                                    name="lifecycle"
                                                    :editing="false"
                                                    helpPrefix=""
                                                    :value="branch && branch.lifecycle ? branch.lifecycle : {}"
                                                    :schema="{
                                                        date: new Date(),
                                                        comment: 'Comment',
                                                    }">
                                                </Composite>
                                            </v-col>
                                        </v-row>
                                    </v-col>

                                    <v-col cols=12 v-if="branch && branch.repo_id && (branch.repo_id.description || branch.repo_id.description === '')">
                                        Dataset Description: {{branch.repo_id.description}}
                                    </v-col>

                                    <v-col cols=6 v-if="branch && branch.additional_info">
                                        <Markdown
                                            name="additional_info"
                                            :value="(branch) ? branch.additional_info : ''"
                                            :label="$tc('Important Additional Information')"
                                            :editing="false"
                                            :placeholder="$tc('Important Additional Information')"
                                            helpPrefix=""
                                        ></Markdown>
                                    </v-col>

                                    <v-col cols=6 v-if="branch && branch.more_information">
                                        <Repeating
                                            name="more_information"
                                            :label="$tc('Related Links')"
                                            :value="(branch) ? branch.more_information : ''"
                                            :editing="false"
                                            helpPrefix=""
                                            innerType="Composite"
                                            :innerLabel="{name: 'Title of Web Asset', url: 'Hyperlink to more information'}"
                                            :inner-validation-rules="{url: 'required'}"
                                            :innerPlaceholder="{name: 'Google', url: 'https://google.ca'}"
                                            :defaults="{
                                                name: 'Google',
                                                url: 'https://google.ca',
                                            }"
                                        ></Repeating>
                                    </v-col>

                                    <v-col cols=6 v-if="branch && branch.references">
                                        <Markdown
                                            name="references"
                                            :value="(branch) ? branch.references : ''"
                                            :label="$tc('References / Research that uses data')"
                                            :editing="false"
                                            :placeholder="$tc('References / Research that uses data')"
                                            helpPrefix=""
                                        ></Markdown>
                                    </v-col>

                                    <v-col cols=12>
                                        <SimpleCheckbox
                                            :label="$tc('Published')"
                                            :placeholder="$tc('Published')"
                                            name="published"
                                            :disabled="true"
                                            :editing="false"
                                            :checked="(branch) ? branch.published : false"
                                        ></SimpleCheckbox>
                                    </v-col>

                                    <v-col cols=12 v-if="branch && branch.bcdc_record">
                                        Catalogue: <a :href="branch.bcdc_record">{{branch.bcdc_record}}</a>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item key="schema" v-if="schema">
                        <SchemaView :editing="false" :schema="schema"></SchemaView>
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
import SchemaView from '../Schema/SchemaView';
import Markdown from '../FormElements/Markdown';
import SimpleCheckbox from '../FormElements/SimpleCheckbox';
import Composite from '../FormElements/Composite';
import Repeating from '../FormElements/Repeating';


export default {
    
    components:{
        SchemaView,
        Markdown,
        SimpleCheckbox,
        Composite,
        Repeating,
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
            getVariableClassification: 'variableClassifications/getItem',
        }),

        async loadSections() {
            await this.getBranchById({id: this.id});
            await this.getSchema({id: this.id});
            if (this.branch.variable_classification){
                await this.getVariableClassification({field: '_id', value: this.branch.variable_classification});
            }
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
            variableClassification: state => state.variableClassifications.wipItem,
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

    .largerFont{
        font-size: 1.75rem;
    }
    
    .fullWidth{
        width: 100%;
        overflow: visible;
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

