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
            <span v-if="!val || val === ''"><v-btn v-if="user.isApprover || user.isAdmin" color="success" @click="createUpload">Create Upload from this</v-btn></span>
            <span v-else>
                <h2 v-if="large"><router-link :to="{ name: 'upload_view', params: {id: val} }">{{displayVal}}</router-link></h2>
                <span v-else><router-link :to="{ name: 'upload_view', params: {id: val} }">{{displayVal}}</router-link></span>
            </span>
            
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

    import ValidationRules from "../../mixins/ValidationRules";
    import { mapActions, mapState, mapMutations } from 'vuex';

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
                user: state => state.user.user,
                uploadError: 'upload/error',
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
                editBranch: 'repos/editBranch',
            }),
            ...mapActions({
                createInitialUpload: 'upload/createInitialUpload',
                updateBranch: 'repos/updateBranch',
            }),

            rowClicked: function(item){
                this.$emit('edited', item[this.itemValue]);
                this.val = item[this.itemValue];
                this.dialog = false;
            },

            createUpload: async function(){
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

                let ministry_organization = (this.repo.ministry_organization) ? this.repo.ministry_organization : "";
                ministry_organization = (this.branch.repo_id && this.branch.repo_id.ministry_organization) ? this.branch.repo_id.ministry_organization : ministry_organization;

                if (!ministry_organization){
                    this.$emit('error', "Ministry/Organization is required");
                    return;
                }

                // if (!this.branch.keywords){
                //     this.$emit('error', "Keywords are required");
                //     return;
                // }

                // if (!dateStart){
                //     this.$emit('error', "Start date cannot be deduced please set at least one resource temporal start");
                //     return;
                // }

                // if (!dateEnd){
                //     this.$emit('error', "Start date cannot be deduced please set at least one resource temporal start");
                //     return;
                // }

                let datasetName = (this.repo.name) ? this.repo.name : "";
                datasetName = (this.branch.repo_id && this.branch.repo_id.name) ? this.branch.repo_id.name : datasetName;
                
                let data = {
                    "ministry_organization": ministry_organization,
                    "name": datasetName,
                    "description": (this.branch.description) ? this.branch.description : '',
                    "date_range_start": dateStart,
                    "date_range_end": dateEnd,
                    "information": (this.branch.additional_info) ? this.branch.additional_info : '',
                    "data_create_date": new Date(),
                    // "keywordsDescribingData": (this.branch.keywords) ? this.branch.keywords : '',
                    "num_files": numFiles
                }
                
                try{
                    
                    data.uploader = this.user.email;
                    data.provider_group = this.branch.author_groups[0];
                    
                    
                    let d = await this.createInitialUpload(data);

                    if (!d || !d._id){
                        this.$emit('error', "Error creating upload, "+d);
                        return;
                    }

                    this.editBranch({name: 'data_upload_id', value: d._id});
                    await this.updateBranch();
                    if (this.uploadError){
                        this.$emit('error', this.uploadError);
                        return;
                    }else{
                        this.$router.push({name: "upload_view", params: {id: d._id}});
                    }
                }catch(e){
                    this.$emit('error', e);
                }


            }
        }


    };
</script>

<style>

.dataUploadSelectTable tr:hover{
    cursor: pointer;
}

</style>
