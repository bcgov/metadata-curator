<template>
    <v-container fluid>
        <span v-if="(!branch || loading) && !creating">
            <v-row dense>
                {{$tc('Loading')}}...
            </v-row>
        </span>
        <v-row v-else dense>
            <v-col cols="12">
                <v-alert
                    :type="alertType"
                    dismissible
                    v-model="alert">
                        {{alertText}}
                </v-alert>
                <div v-if="loading || !schema">
                </div>
                <div class="fixed" v-else-if="editing">
                    <v-btn @click="closeOrBack()" id="cancelSaveMetadata" class="mt-1">{{$tc('Cancel')}}</v-btn>
                    <v-btn @click="save" id="saveMetadata" class="mt-1" color="primary">{{$tc('Save')}}</v-btn>
                </div>
                <div class="fixed" v-else>
                    <v-btn @click="closeOrBack()" class="mt-1">{{dialog ? $tc('Close') : $tc('Back')}}</v-btn>
                    <v-btn v-if="canEdit && viewSchemaType != 'Inferred'" @click="editing=!editing" class="mt-1" color="primary">{{$tc('Edit')}}</v-btn>
                </div>
                <v-card outlined>
                    <v-card-text>
                        <v-row v-if="editing">
                            <v-btn @click="closeOrBack()" class="mt-1">{{$tc('Cancel')}}</v-btn>
                            <v-btn @click="save" class="mt-1" color="primary">{{$tc('Save')}}</v-btn>
                        </v-row>
                        <v-row v-else>
                            <v-btn @click="closeOrBack()" class="mt-1">{{dialog ? $tc('Close') : $tc('Back')}}</v-btn>
                            <v-btn v-if="canEdit && viewSchemaType != 'Inferred'" @click="editing=!editing" class="mt-1" color="primary">{{$tc('Edit')}}</v-btn>
                        </v-row>
                        <v-row>
                            <h1 class="display-1 font-weight-thin ml-3 my-3">{{$tc('Metadata')}}</h1>
                        </v-row>
                        <v-row>
                          <v-col cols="12">
                            <v-select v-if="!editing" :items="viewSchemaItems" v-model="viewSchemaType"></v-select>
                          </v-col>
                          <v-col cols="12" v-if="viewSchemaType != 'Inferred' && viewSchemaType != 'Provided' ">
                            <TextInput
                                :label="$tc('Schema Type Name')"
                                placeholder="Validation Report"
                                name="typeName"
                                refName="schemaTypeName"
                                idName="schemaTypeName"
                                :large="true"
                                :editing="editing"
                                :value="typeName"
                                helpPrefix="schema"
                                @blur="(event) => { typeName = event.target.value }"
                            ></TextInput>
                          </v-col>
                        </v-row>
                        <v-row v-if="!loading && schema && schema !== {}" :key="`schema-${viewSchemaType}`">
                            <SchemaView
                                @commentRefs="(e) => $emit('commentRefs', e)"
                                @setComment="(e) => { $emit('setComment', e) }"
                                :branchId="branchId"
                                :editing="editing"
                                @edited="updatedObj"
                                @filter="(k, v) => { filter(k,v) }"
                                @editedHighlight="editedHighlight"
                                :schema="activeSchema">
                            </SchemaView>
                        </v-row>
                        <v-row v-else-if="loading" key="">
                            <v-progress-circular
                                indeterminate
                            ></v-progress-circular>
                        </v-row>
                        <v-row v-else>
                            <v-col cols=12>
                                <v-btn color="primary" id="create-without-import" @click="createBasic">{{$tc('Create Without Import')}}</v-btn>
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
                </v-card>
            </v-col>

        </v-row>
    </v-container>
</template>

<script>
import Vue from "vue";
import {mapActions, mapMutations, mapState} from "vuex";
import FileReader from '../FormElements/FileReader';
import SchemaView from '../Schema/SchemaView';
import UpdateUpload from '../../mixins/UpdateUpload';
import TextInput from '../FormElements/TextInput';
export default {
    components:{
        FileReader,
        SchemaView,
        TextInput
    },

    mixins: [UpdateUpload],

    props: {
        dialog: {
            type: Boolean,
            default: false,
        },
        branchId: {
            type: String,
            default: "",
        },
        branchApproved: {
            type: Boolean,
            default: false,
        }

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
            skipClose: false,
            filters: {},
            typeName: "",
            addedSchema: {},
            updatedCount: 0,
            typeSchemaId: -1,
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
            saveTypeSchema: 'schemaImport/createTypeSchema',
            updateDataPackageSchema: 'schemaImport/updateDataPackageSchema',
            createDataPackageSchema: 'schemaImport/createDataPackageSchema',
            getSchema: 'schemaImport/getTableSchema',
            getInferredSchema: 'schemaImport/getInferredSchema',
            setTableSchema: 'schemaImport/setTableSchema',
            setTypeSchema: 'schemaImport/setTypeSchema',
            updateDataPackageTypeSchema: 'schemaImport/updateDataPackageTypeSchema'
        }),
        ...mapMutations({
            editBranch: 'repos/editBranch',
            clearBranch: 'repos/clearBranch',
            resetSchemaImportState: 'schemaImport/resetState',
            setDataPackageSchema: "schemaImport/setDataPackageSchema",
        }),

        filter: function(key, val){
            if (Array.isArray(val)){
                if (val.length === 0){
                    delete this.filters[key];
                }else{
                    this.filters[key] = val;
                }
            }
            if (val === ""){
                delete this.filters[key];
            }else{
                this.filters[key] = val;
            }
            this.$emit('filter', key, val);
        },

        async loadSections() {
            this.loading = true;
            try{
                //await this.getBranch({id: this.id});
                await this.getInferredSchema({id: this.id});
                await this.getSchema({id: this.id});
            }catch(e){
                console.err(e);
                //this.loading = true;
                return;
            }
            this.loading = false;
        },

        async createBasic(){
            this.setDataPackageSchema({schema: {version: this.id, resources: []}});
            await this.createDataPackageSchema();
            await this.loadSections();
            this.editing = true;
        },

        async closeOrBack() {
            if (this.dialog){
                if (!this.editing){
                    if (!this.skipClose){
                        this.$emit('close');
                    }
                    this.skipClose = false;
                }else{
                    await this.loadSections();
                }
            }else if ( (this.creating) || (!this.editing) ){
                if (!this.skipClose){
                    this.$router.push({ name: 'versions' });
                }else{
                    await this.loadSections();
                }

                this.skipClose = false;
            }
            this.editing = false;
        },

        updatedObj: function(newVal, highlight){
            if (typeof(highlight) === 'undefined'){
                highlight = false;
            }

            if (highlight){
                this.skipClose = true;
            }
            this.schemaObj = newVal;
            this.updatedCount++
            this.$forceUpdate();
        },

        editedHighlight: async function(){
            if (!this.editing){
                this.skipClose = true;
                await this.save();
            }
            this.updatedCount++
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
            if (this.schemaObj){
              if ( (this.viewSchemaType !== 'Inferred') && (this.viewSchemaType !== 'Provided') ){
                this.schemaObj.typeName = this.typeName;
                this.schemaObj.inferred = false;
                this.schemaObj.version = this.id;
                this.schemaObj._id = this.typeSchemaId;
                await this.setTypeSchema({schema: this.schemaObj});
              }else{
                await this.setTableSchema({schema: this.schemaObj});
              }
                if (this.schemaError){
                    this.alertType = "error"
                    this.alertText = this.schemaError;
                    this.alert = true;
                    window.scrollTo(0,0);
                    return;
                }

                if ( this.creating ){
                  if ( (this.viewSchemaType !== 'Inferred') && (this.viewSchemaType !== 'Provided') ){
                    console.log("new type schema");
                    await this.saveTypeSchema();
                  }else{
                    this.saveTableSchema();
                  }
                    this.updateBranch().then( async() => {
                        if (this.schemaError){
                            this.alertType = "error"
                            this.alertText = (this.schemaError && typeof(this.schemaError) === 'string') ? this.schemaError : JSON.stringify(this.schemaError);
                            this.alert = true;
                            window.scrollTo(0,0);
                        }else {
                          if (this.branch.data_upload_id){
                            await this.updateUploadOnEdit();
                          }
                            this.alertType = "success"
                            this.alertText = this.$tc('Sucessfully updated') + " " + this.$tc('version');
                            this.alert = true;
                            this.closeOrBack();
                        }
                    }).catch( err => {
                        this.alertType = "error"
                        this.alertText = err.message;
                        this.alert = true;
                        window.scrollTo(0,0);
                    });

                }else{
                    try{
                      if ( (this.viewSchemaType !== 'Inferred') && (this.viewSchemaType !== 'Provided') ){
                        await this.updateDataPackageTypeSchema();
                      }else{
                        await this.updateDataPackageSchema();
                      }
                        // this.updateBranch().then( () => {
                        if (this.schemaError){
                            this.alertType = "error"
                            this.alertText = (this.schemaError && typeof(this.schemaError) === 'string') ? this.schemaError : JSON.stringify(this.schemaError.message);
                            this.alert = true;
                            window.scrollTo(0,0);
                        }else{
                          if (this.branch.data_upload_id){
                            await this.updateUploadOnEdit();
                          }
                            this.alertType = "success"
                            this.alertText = this.$tc('Sucessfully updated') + " " + this.$tc('version');
                            this.alert = true;
                            //this.closeOrBack();
                        }

                    }catch(err){
                        this.alertType = "error"
                        this.alertText = err.message;
                        this.alert = true;
                        window.scrollTo(0,0);
                    }
                }
            }
        },

        async importButtonClicked(content) {
            try{
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
            }catch(ex){
                this.alertType = "error";
                this.alert = true;
                this.alertText = "Error " + ex.message;
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
            inferredSchema: state => state.schemaImport.inferredSchema,
            typedSchemas: state => state.schemaImport.typedSchemas,
            schemaError: state => state.schemaImport.error,
        }),
        canEdit: function(){
            return this.branchApproved ? this.user.isAdmin : true;
        },
        viewSchemaItems: function(){
          let vsi = ["Provided"];
          if (this.inferredSchema){
            vsi.push("Inferred");
          }
          if (this.typedSchemas){
            for (let i=0; i<this.typedSchemas.length; i++){
              vsi.push(this.typedSchemas[i].typeName);
            }
          }
          if (this.canEdit){
            vsi.push("Add");
          }
          return vsi;

        },
        activeSchema: function(){
          if (this.viewSchemaType === "Provided"){
            return this.schema;
          }else if (this.viewSchemaType === "Inferred"){
            return this.inferredSchema;
          }else if (this.viewSchemaType === "Add"){
            //eslint-disable-next-line
            Vue.set(this, 'addedSchema', {});
            //eslint-disable-next-line
            Vue.set(this, 'schemaObj', {});
            return this.addedSchema;
          }else{
            let s = this.typedSchemas.find(f => {
              return f.typeName === this.viewSchemaType;
            });
            if (s){
              Vue.set(this, 'schemaObj', s);
              Vue.set(this, 'typeSchemaId', s._id);
              return s;
            }
          }
          return this.schema;
        },
    },
    watch: {
        // rawSchema: function(){
        //     this.$forceUpdate();
        // },

        branchId: function(){
            this.load();
        },

        viewSchemaType: function(){
          if (this.viewSchemaType === "Add"){
            if (this.canEdit){
              this.editing = true;
            }else{
              this.viewSchemaType = "Provided";
            }
          }
          if ( (this.viewSchemaType !== 'Provided') && (this.viewSchemaType != "Inferred") && (this.viewSchemaType != 'Add') ){
            this.typeName = this.viewSchemaType;
          }
        },
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

    .fixed {
        position: fixed;
        bottom: 100px;
        right: 0px;
        z-index: 100;
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
