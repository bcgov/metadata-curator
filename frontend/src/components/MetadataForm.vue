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
                        <v-row v-if="!loading && schema && schema !== {}" key="">
                            <v-select :items="['Provided', 'Inferred']" v-model="viewSchemaType"></v-select>
                            <SchemaView :editing="editing" @edited="updatedObj" :schema=" (viewSchemaType === 'Provided') ? schema : inferredSchema"></SchemaView>
                        </v-row>
                        <v-row v-else>
                            <v-col cols=12>
                                <v-btn color="primary" @click="createBasic">{{$tc('Create Without Import')}}</v-btn>
                            </v-col>
                            <v-col cols=12>
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
                            </v-col>
                            <v-col cols=12>
                                <v-radio-group v-model="metadataType">
                                    <v-radio
                                        label="Data Package"
                                        value="package"
                                    ></v-radio>

                                    <v-radio
                                        label="Table Schema"
                                        value="table"
                                    ></v-radio>

                                </v-radio-group>
                            </v-col>
                        </v-row>
                    </v-card-text>
                        <v-card-actions v-if="loading || !schema">
                        </v-card-actions>
                        <v-card-actions v-else-if="editing">
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
            metadataType: 'package',
            loading: true,
            editing: false,
            schemaObj: null,
            viewSchemaType: "Provided",
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
            createDataPackageSchema: 'schemaImport/createDataPackageSchema',
            getSchema: 'schemaImport/getTableSchema',
            getInferredSchema: 'schemaImport/getInferredSchema',
        }),
        ...mapMutations({    
            editBranch: 'repos/editBranch',
            clearBranch: 'repos/clearBranch',
            setTableSchema: 'schemaImport/setTableSchema',
            resetSchemaImportState: 'schemaImport/resetState',
            setDataPackageSchema: "schemaImport/setDataPackageSchema",
        }),

        async loadSections() {
            this.loading = true;
            //await this.getBranch({id: this.id});
            await this.getInferredSchema({id: this.id});
            await this.getSchema({id: this.id});
            this.loading = false;
        },

        async createBasic(){
            this.setDataPackageSchema({schema: {version: this.id, resources: []}});
            await this.createDataPackageSchema();
            await this.loadSections();
            this.editing = true;
        },

        closeOrBack() {
            if (this.dialog){
                this.$emit('close');
            }else if (this.creating){
                this.$router.push({ name: 'versions' });
            }
            this.editing = false;
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

        async save(){
            this.setTableSchema({schema: this.schemaObj});
            if (this.creating){
                this.saveTableSchema();
                this.updateBranch().then( () => {
                    this.alertType = "success"
                    this.alertText = this.$tc('Sucessfully updated') + " " + this.$tc('version');
                    this.alert = true;
                    this.closeOrBack();

                }).catch( err => {
                    this.alertType = "error"
                    this.alertText = err.message;
                    this.alert = true;
                    window.scrollTo(0,0);
                });
                
            }else{
                this.updateDataPackageSchema().then( () => {
                // this.updateBranch().then( () => {
                    this.alertType = "success"
                    this.alertText = this.$tc('Sucessfully updated') + " " + this.$tc('version');
                    this.alert = true;
                    this.closeOrBack();

                }).catch( err => {
                    this.alertType = "error"
                    this.alertText = err.message;
                    this.alert = true;
                    window.scrollTo(0,0);
                });
            }
        },

        async importButtonClicked(content) {
            content = JSON.parse(content);
            content.version = this.id;
            content = JSON.stringify(content);

            if(this.metadataType == 'table') {    
                this.setTableSchema({schema: content});
                this.saveTableSchema();
                this.loading = true;
                await this.load();
                this.loading = false;
            }else{
                this.setDataPackageSchema({schema: content});
                await this.createDataPackageSchema();
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
            inferredSchema: state => state.schemaImport.inferredSchema
        }),
    },
    watch: {
        rawSchema: function(){
            this.$forceUpdate();
        },

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
