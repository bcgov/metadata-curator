<template>
    <v-container fluid>
        <v-alert
            :type="alertType"
            dismissable
            v-model="alert">
                {{alertText}}
        </v-alert>
        <span v-if="(!branch || loading) && !creating">
            <v-row dense>
                {{$tc('Loading')}}...
            </v-row>
        </span>
        <v-row v-else dense>
            <v-col cols="12">
                <v-card outlined>
                    <v-card-text>
                        <v-row>
                            <h1 class="display-1 font-weight-thin ml-3 my-3">{{$tc('Metadata')}}</h1>
                        </v-row>
                        <v-row v-if="!loading && schema && schema !== {}">
                            <SchemaView :editing="editing" @edited="updatedObj"></SchemaView>
                        </v-row>
                        <v-row v-else>
                            <FileReader
                                :show-encrypt-button="false"
                                :show-upload-button="false"
                                :show-import-button="true"
                                :read-file="true"
                                :do-not-chop="true"
                                :index="0"
                                @import-button-clicked="importButtonClicked"
                                :ignoreDuplicates="true"
                                accept=".json,application/json,application/JSON"
                            >
                            </FileReader>
                        </v-row>
                    </v-card-text>
                        <v-card-actions v-if="editing">
                            <v-btn @click="closeOrBack()" class="mt-1">{{dialog ? $tc('Close') : $tc('Back')}}</v-btn>
                            <v-btn @click="save" class="mt-1" color="primary">{{$tc('Save')}}</v-btn>
                        </v-card-actions>
                        <v-card-actions v-else>
                            <v-btn @click="closeOrBack()" class="mt-1">{{dialog ? $tc('Close') : $tc('Back')}}</v-btn>
                            <v-btn @click="editing=!editing" class="mt-1" color="primary">{{$tc('Edit')}}</v-btn>
                        </v-card-actions>
                </v-card>
            </v-col>

        </v-row>
    </v-container>
</template>

<script>

import {mapActions, mapMutations, mapState} from "vuex";
import FileReader from './FileReader';
import SchemaView from './SchemaView';

export default {
    components:{
        FileReader,
        SchemaView,
    },
    props: {
        dialog: {
            type: Boolean,
            default: false,
        },
        branchId: {
            type: String,
            default: "",
        },

    },
    data () {
        let st = this.$tc('Standard');
        let re = this.$tc('Reserve');
        return {
            id: null,
            creating: false,
            types: [ {text: st, value: 'standard'}, {text: re, value: 'reserve'} ],
            alert: false,
            alertType: "success",
            alertText: "",
            metadataType: 'table-schema',
            loading: true,
            editing: false,
            schemaObj: null,
        }
    },
    methods: {
        ...mapActions({
            getDataset: 'repos/getRepo',
            saveBranch: 'repos/saveBranch',
            updateBranch: 'repos/updateBranch',
            getBranch: 'repos/getBranch',
            getDataUploads: 'dataUploads/getDataUploads',
            createTableSchema: 'schemaImport/createTableSchema',
            updateDataPackageSchema: 'schemaImport/updateDataPackageSchema',
            getSchema: 'schemaImport/getTableSchema',
        }),
        ...mapMutations({    
            editBranch: 'repos/editBranch',
            clearBranch: 'repos/clearBranch',
            setTableSchema: 'schemaImport/setTableSchema',
            resetSchemaImportState: 'schemaImport/resetState',
        }),

        async loadSections() {
            this.loading = true;
            await this.getBranch({id: this.id});
            await this.getSchema({id: this.id});
            this.loading = false;
        },

        closeOrBack() {
            if (this.dialog){
                this.$emit('close');
            }else{
                this.$router.push({ name: 'versions' });
            }
        },

        updatedObj: function(newVal){
            this.schemaObj = newVal;
        },

        updateValues(name, value){
            this.editBranch({name: name, value: value});
        },

        async load(){
            this.id = (this.branchId) ? this.branchId : this.$route.params.id;
            await this.getDataUploads("team");
            if (this.id === 'create'){
                this.creating = true;
            }else{
                this.loadSections();
            }
        },

        save(){
            this.setTableSchema({schema: this.schemaObj});
            if (this.creating){
                this.saveTableSchema();
                this.updateBranch().then( () => {
                    this.alertType = "success"
                    this.alertText = this.$tc('Sucessfully updated') + " " + this.$tc('version');
                    this.alert = true;
                    this.$emit("close");

                }).catch( err => {
                    this.alertType = "error"
                    this.alertText = err.message;
                    this.alert = true;
                });
                this.creating = false;
            }else{
                this.updateDataPackageSchema();
            }
        },

        async importButtonClicked(content) {
            if(this.metadataType == 'table-schema') {
                content = JSON.parse(content);
                content.version = this.id;
                content = JSON.stringify(content);
                this.setTableSchema({schema: content});
                this.saveTableSchema();
                this.loading = true;
                await this.load();
                this.loading = false;
            }
        },
        saveTableSchema() {
            this.createTableSchema();
        },
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            branch: state => state.repos.branch,
            dataUploads: state => state.dataUploads.dataUploads,
            schema: state => state.schemaImport.tableSchema,
        }),
    },
    watch: {
        branchId: function(){
            this.load();
        }
    },
    
    created() {
        this.load()
    },

    beforeDestroy(){
        this.clearBranch();
    }
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
