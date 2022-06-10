<template>
    <v-container fluid>
        <v-row dense>
            <v-tabs v-model="tab">
                <v-tab key="dataset">{{$tc('Datasets', 1)}}</v-tab>
                <v-tab key="editions" id="dataset-editions-tab" v-if="!creating">{{$tc('Version', 2)}}</v-tab>
                <v-tab key="schema" v-if="!creating">{{$tc('Schema', 1)}}</v-tab>
                <v-tab key="compareS" v-if="!creating">{{$tc('Compare', 1)}} {{$tc('Schema', 1)}}</v-tab>
                <v-tab key="uploads" v-if="!creating && (uploads.length>0)">{{$tc('Uploads', 2)}}</v-tab>
                <v-tab key="revisions" v-if="revisionsLoading === false && revisions.length>0">{{$tc('Revisions', 2)}}</v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab" class="fullWidth">
                <v-tab-item key="dataset">
                    <DatasetForm></DatasetForm>
                </v-tab-item>
                <v-tab-item key="editions" v-if="!creating">
                    <EditionList :id="this.id"></EditionList>
                </v-tab-item>
                <v-tab-item key="schema" v-if="!creating">
                    <v-select :items="versionDrop" v-model="viewVersion"></v-select>
                    <SchemaView :key="'schema-view-'+viewVersion+'-'+redrawIndex" :editing="false" :branchId="viewVersion" :editable="false" :schema="schema"></SchemaView>
                </v-tab-item>
                <v-tab-item key="compareS" v-if="!creating">
                    <v-select :items="versionDrop" v-model="leftSchema"></v-select>
                    <v-select :items="versionDrop" v-model="rightSchema"></v-select>
                    <Comparison :key="'compareTool-'+reDrawCompareIndex" :left-side-text="leftSchemaString" :right-side-text="rightSchemaString" :diff-json="true" :left-header="leftHeader" :right-header="rightHeader"></Comparison>
                </v-tab-item>
                <v-tab-item key="uploads" v-if="uploads.length>0 && !creating">
                    <span>
                        <v-row class="mt-3" v-for="dataUpload in uploads" :key="'uploadRow-'+dataUpload._id">
                            <v-col cols=4>{{$tc('Version')}}: {{versionDrop[dataUpload.versionIndex].text}}</v-col>
                            <v-col cols=4>{{$tc('Uploads')}}: <a :href="(dataUpload.status === 'submitted' ? '/dataUpload/' : '/uploads/') + dataUpload._id">{{dataUpload.name}}</a></v-col>
                        </v-row>
                    </span>
                </v-tab-item>
                <v-tab-item key="revisions" v-if="revisionsLoading === false && revisions.length>0 && !creating">
                    <Revisions :revisions="revisions"></Revisions>
                </v-tab-item>
            </v-tabs-items>

        </v-row>
        
        <v-row v-if="!creating">
            <v-col cols=12>
                <h3>Discussion</h3>
            </v-col>
        </v-row>

        <v-row v-if="!creating">
            <v-col cols=12>
                <Comments :id="id" :type="'repo'"></Comments>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>

import DatasetForm from '../Datasets/DatasetForm';
import EditionList from '../Datasets/EditionList';
import SchemaView from '../Schema/SchemaView';
import Comments from '../Comments';
import Comparison from '../Schema/Comparison';
import Revisions from '../Revisions';
import { mapActions, mapState } from 'vuex';
import { Backend } from '../../services/backend';
const backend = new Backend();

export default {
    components:{
        DatasetForm,
        SchemaView,
        Comments,
        Comparison,
        Revisions,
        EditionList,
    },
    
    data () {
        return {
            tab: "dataset",
            versionDrop: [],
            viewVersion: "",
            id: null,
            redrawIndex: 0,
            uploads: [],
            leftSchema: "",
            rightSchema: "",
            leftSchemaString: "",
            rightSchemaString: "",
            leftHeader: "",
            rightHeader: "",
            reDrawCompareIndex: 0,
            creating: false,

        }
    },

    watch: {
        viewVersion: async function(){
            if (this.viewVersion !== ""){
                await this.getSchema({id: this.viewVersion});
                this.redrawIndex++;
            }
        },

        leftSchema: async function(){
            let s = await backend.getTableSchema(this.leftSchema);
            this.leftSchemaString = JSON.stringify(s);
            this.leftHeader = this.versionDrop.filter(obj => {
                return obj.value === this.leftSchema
            })[0].text;
            this.reDrawCompareIndex++;
            
        },

        rightSchema: async function(){
            let s = await backend.getTableSchema(this.rightSchema);
            this.rightSchemaString = JSON.stringify(s);
            this.rightHeader = this.versionDrop.filter(obj => {
                return obj.value === this.rightSchema
            })[0].text
            this.reDrawCompareIndex++;
        },
    },

    methods: {
        ...mapActions({
            getDataset: 'repos/getRepo',
            getSchema: 'schemaImport/getTableSchema',
            getBranches: 'repos/getBranches',
            getDataUploads: 'dataUploads/getDataUploads',
        }),

        loadSchemas: async function(){
            await this.getDataset({id: this.id});
            await this.getBranches({repoId: this.id});
            await this.getDataUploads({filterBy: false});
            let uploadIds = [];
            this.versionDrop = this.branches.map( (val) => {
                let d = new Date(val.create_date);
                let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                let month = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                let day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
                uploadIds.push(val.data_upload_id);
                return {value: val._id, text: (val.name + "(created: " + month + " " + day + ", " + year +")"), date: val.create_date, upload: val.data_upload_id}
            });

            this.versionDrop.sort((a,b) => (a.date > b.date) ? -1 : ((b.date > a.date) ? 1 : 0))
            if (this.versionDrop.length > 0){
                this.viewVersion = this.versionDrop[0].value;
            }else{ 
                this.viewVersion = "";
            }

            this.uploads = [];
            for (let i=0; i<this.dataUploads.length; i++){
                let uploadIndex = uploadIds.indexOf(this.dataUploads[i]._id);
                if (uploadIndex !== -1){
                    this.uploads.push(this.dataUploads[i]);
                    let uploadIndex = this.uploads.length - 1;
                    let uploadVer = uploadIds[uploadIndex];
                    this.uploads[uploadIndex].version = uploadVer;
                    this.uploads[uploadIndex].versionIndex = uploadIndex;
                }
            }

        }
      
    },
    computed: {
        ...mapState({
            dataset: state => state.repos.repo,
            branches: state => state.repos.branches,
            dataUploads: state => state.dataUploads.dataUploads,
            schema: state => state.schemaImport.tableSchema,
            revisions: state => state.repos.revisions,
            revisionsLoading: state => state.repos.revisionsLoading,
        }),
    },
    created() {
        // console.log("dataUpload id: " + this.$route.params.id);
        this.id = this.$route.params.id;
        if (this.id === 'create'){
            this.editing = true;
            this.creating = true;
        }else{
            this.loadSchemas();
        }
    },
}
</script>

<style scoped>
    .fullWidth{
        width: 100%;
    }

</style>