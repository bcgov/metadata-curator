<template>
    <div>
         <span v-if="!editing">
             <h2 v-if="large" class="mr-2">
                {{displayLabel}}:
                <v-tooltip right v-if="$te('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))">
                    <template v-slot:activator="{ on }">
                        <v-icon color="label_colour" v-on="on">mdi-help-circle-outline</v-icon>
                    </template>
                    <span>&nbsp;{{$t('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))}}</span>
                </v-tooltip>
            </h2>
            <span v-else class="mr-2">
                {{displayLabel}}:
                <v-tooltip right v-if="$te('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))">
                    <template v-slot:activator="{ on }">
                        <v-icon color="label_colour" v-on="on">mdi-help-circle-outline</v-icon>
                    </template>
                    <span>&nbsp;{{$t('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))}}</span>
                </v-tooltip>
            </span>
            <h2 v-if="large"><router-link :to="{ name: 'upload_view', params: {id: this.val} }">{{displayVal}}</router-link></h2>
            <span v-else><router-link :to="{ name: 'upload_view', params: {id: this.val} }">{{displayVal}}</router-link></span>
            <span v-if="!this.val || this.val === ''"><v-btn color="success" @click="createUpload">Create Upload from this</v-btn></span>
        </span>

        <span v-else>
            <ValidationProvider :rules="validationRules" v-slot="{ errors }" :name="label ? $tc(label) : $tc(name)">
                <v-dialog persistent v-model="dialog">
                    <template v-slot:activator="{ on }">
                        <component :is="(large) ? 'h2' : 'span'">{{displayLabel}}</component>
                        <v-btn v-on="on">{{displayVal}}<v-icon>mdi-dock-window</v-icon></v-btn>
                    </template>
                    <v-card>
                        <v-card-title>
                            <span class="headline">Select an {{ $tc('Uploads', 1) }}</span>
                            <v-spacer></v-spacer>
                            <v-btn small @click="dialog = false">X</v-btn>
                        </v-card-title>

                        <v-card-text>
                            <v-data-table
                                dense
                                class="dataUploadSelectTable"
                                :search="searchString"
                                :headers="headers"
                                :items="items"
                                @click:row="rowClicked"
                            >
                                <template v-slot:top>
                                    <v-text-field
                                        v-model="searchString"
                                        label="Search"
                                    ></v-text-field>
                                </template>
                            </v-data-table>
                        </v-card-text>

                        <v-card-actions>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                
            </ValidationProvider>
        </span>
    </div>
</template>

<script>

    import ValidationRules from "../mixins/ValidationRules";
    import { mapState, mapMutations } from 'vuex';

    export default {
        mixins: [ValidationRules],
        props: {
            name: {
                type: String,
                required: true,
                default: () => ''
            },
            label: {
                type: String,
                required: true,
                default: () => ''
            },
            placeholder: {
                type: String,
                required: false,
                default: () => ''
            },
            validationRules: {
                type: String,
                required: false,
                default: () => ''
            },
            items: {
                type: Array,
                required: false,
                default: () => []
            },
            itemText: {
                type: String,
                required: false,
                default: () => 'text'
            },
            itemValue: {
                type: String,
                required: false,
                default: () => 'value'
            },
            value: {
                type: [String, Array],
            },
            editing: {
                type: Boolean,
                required: false,
                default: () => false
            },
            helpPrefix: {
                type: String,
                required: false,
                default: ''
            },
            large: {
                type: Boolean,
                required: false,
                default: () => false
            },
            idName: {
                type: String,
                required: false,
                default: "",
            },

        },
        data() {
            return {
                val: null,
                dialog: false,
                searchString: '',
                headers: [
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
                        text: this.$tc('Status'), 
                        value: 'status' 
                    },
                ]
            }
        },
        computed: {
            ...mapState({
                repo: state => state.repos.repo,
                branch: state => state.repos.branch,
                schema: state => state.schemaImport.tableSchema,
            }),
            displayLabel: function () {
                if (this.validationRules.toLowerCase().indexOf("required") >= 0) {
                    return this.label + ' *';
                }
                return this.label;
            },

            displayVal: function(){
                let displayVal = this.val;
                for (let i=0; i<this.items.length; i++){
                    if (this.items[i][this.itemValue] === this.val){
                        displayVal = this.items[i][this.itemText];
                    }
                }
                return displayVal
            }

        },
        watch: {
            value: function (newVal) {
                this.val = newVal
            },
        },
        mounted(){
            this.val = this.value;
        },
        methods: {
            ...mapMutations({    
                setFormSubmission: 'uploadForm/setFormSubmission',
            }),
            rowClicked: function(item){
                this.$emit('edited', item[this.itemValue]);
                this.val = item[this.itemValue];
                this.dialog = false;
            },
            createUpload: function(){

                let dateStart = null;
                let dateEnd = null;

                let numFiles = 1;

                if (this.schema && this.schema.resources){
                    numFiles = this.schema.resources.length;
                    for (let i=0; i<this.schema.resources.length; i++){
                        if (this.schema.resources[i].temporal_start){
                            dateStart = ( (!dateStart) || (this.schema.resources[i].temporal_start < dateStart)) ? this.schema.resources[i].temporal_start : dateStart;
                        }

                        if (this.schema.resources[i].temporal_end){
                            dateEnd = ( (!dateEnd) || (this.schema.resources[i].temporal_end < dateEnd)) ? this.schema.resources[i].temporal_end : dateEnd;
                        }

                    }
                }
                
                let data = {
                    "ministryOrganization": (this.repo.ministry_organization) ? this.repo.ministry_organization : "",
                    "datasetName": (this.repo.name) ? this.repo.name : '',
                    "uploadDescription": (this.branch.description) ? this.branch.description : '',
                    "daterangestart": dateStart,
                    "dateRangeEnd": dateEnd,
                    // "sourceSystem":"source",
                    // "specificInstructionsAppendLink":"instruction",
                    // "sensitiveFields":"sensitive",
                    // "inclusions":"inclusions",
                    // "exclusions":"exclusions",
                    // "qualityAccurancyInfo":"qualit",
                    // "dataChangesOverTime":"data",
                    // "importantAdditionalInfo":"import",
                    "references": (this.branch.citation) ? this.branch.citation : '',
                    "createdUpdatedDate": new Date(),
                    // "keywordsDescribingData":"keywords",
                    // "moreInfoUrl":"link",
                    "numOfUploadFiles": numFiles
                }


                let form = {data: data};
                this.setFormSubmission(form);
                this.$router.push({name: "upload"});

            }
        }


    };
</script>

<style>

.dataUploadSelectTable tr:hover{
    cursor: pointer;
}

</style>
