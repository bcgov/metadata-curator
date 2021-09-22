<template>
    <v-container fluid>
        <v-row dense>
            <v-tabs v-model="tab">
                <v-tab key="dataset">{{$tc('Datasets', 1)}}</v-tab>
                <v-tab key="schema">{{$tc('Schema', 1)}}</v-tab>
                <v-tab key="uploads">{{$tc('Uploads', 2)}}</v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab" class="fullWidth">
                <v-tab-item key="dataset">
                    <DatasetForm></DatasetForm>
                </v-tab-item>
                <v-tab-item key="schema">
                    <v-select :items="versionDrop" v-model="viewVersion"></v-select>
                    <SchemaView :key="'schema-view-'+viewVersion+'-'+redrawIndex" :editing="false" :editable="false"></SchemaView>
                </v-tab-item>
                <v-tab-item key="uploads">
                    <span v-if="versionDrop && dataUploads">
                        <v-row class="mt-3" v-for="dataUpload in dataUploads" :key="'uploadRow-'+dataUpload._id">
                            <v-col cols=4 v-if="versionDrop && dataUpload && dataUpload.versionIndex">{{$tc('Version')}}: {{versionDrop[dataUpload.versionIndex].text}}</v-col>
                            <v-col cols=4 v-if="versionDrop && dataUpload && dataUpload.versionIndex">{{$tc('Uploads')}}: <a :href="(dataUpload.status === 'submitted' ? '/dataUploads/' : '/uploads/') + dataUpload._id">{{dataUpload.name}}</a></v-col>
                        </v-row>
                    </span>
                </v-tab-item>
            </v-tabs-items>

        </v-row>
        
        <v-row>
            <v-col cols=12>
                <h3>Discussion</h3>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols=12>
                <RepoComments :repo-id="id"></RepoComments>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>

import DatasetForm from '../DatasetForm';
import SchemaView from '../SchemaView';
import RepoComments from '../RepoComments';
import { mapActions, mapState } from 'vuex';

export default {
    components:{
        DatasetForm,
        SchemaView,
        RepoComments
    },
    
    data () {
        return {
            tab: "dataset",
            versionDrop: [],
            viewVersion: "",
            id: null,
            redrawIndex: 0,
            uploads: [],
        }
    },

    watch: {
        viewVersion: async function(){
            if (this.viewVersion !== ""){
                await this.getSchema({id: this.viewVersion});
                this.redrawIndex++;
            }
        }
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
            let uploadIds = [];
            this.versionDrop = this.branches.map( (val) => {
                let d = new Date(val.create_date);
                let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
                let month = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
                let day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
                uploadIds.push(val.data_upload_id);
                return {value: val._id, text: (val.name + "(created: " + month + " " + day + ", " + year +")"), date: val.create_date}
            });

            this.versionDrop.sort((a,b) => (a.date > b.date) ? -1 : ((b.date > a.date) ? 1 : 0))
            if (this.versionDrop.length > 0){
                this.viewVersion = this.versionDrop[0].value;
            }else{ 
                this.viewVersion = "";
            }

            await this.getDataUploads({filterBy: false});
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