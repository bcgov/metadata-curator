<template>
    <v-container>
        <v-dialog 
            v-model="showReport"
            fullscreen
            hide-overlay
            transition="dialog-bottom-transition">
                <v-card>
                    <v-card-text>
                        <TableReport @close="showReport = false" :reportTitle="reportTitle" :headers="reportHeaders" :items="reportItems" :dialog="true"></TableReport>
                    </v-card-text>
                </v-card>
        </v-dialog>
        <v-row>
            <v-col cols=12>
                <h1 class="display-1 font-weight-thin ml-3 my-3">{{$tc('Datasets', 2)}}</h1>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols=10>
            </v-col>
            <v-col cols=2>
                <v-btn color="primary" to="/datasets/create" id="newDataset">{{$tc('New')}} {{$tc('Datasets')}}</v-btn>
            </v-col>
        </v-row>

        <v-row class="bordered">
            <v-col cols=4>Filter By:</v-col>
            <v-col cols=8></v-col>
            <v-col cols=6>
                <Select
                    :editing="true"
                    name="ministry_organization"
                    :label="$tc('Ministry / Organization')"
                    :multiple="true"
                    :items="filterOrgItems"
                    :value="filterOrg"
                    @edited=" (newVal) => { filterOrg = newVal; }">
                </Select>
            </v-col>
            <v-col cols=6>
                <TextInput
                    :editing="true"
                    name="name"
                    :label="$tc('Name')"
                    :value="filterName"
                    @blur=" (newVal) => { filterName = newVal.target.value; }">
                </TextInput>
            </v-col>
            <v-col cols=6>
                <Select
                    :editing="true"
                    name="tags"
                    :label="$tc('Field Tags')"
                    :value="filterTags"
                    :multiple="true"
                    @edited=" (newVal) => { filterTags = newVal; }">
                </Select>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols=4>
                <Select
                    :editing="true"
                    name="sortBy"
                    :label="$tc('Sort By')"
                    :items="SORT_BY_OPTS"
                    :value="sortBy"
                    @edited=" (newVal) => { sortBy = newVal; }">
                </Select>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols=12>
                <v-list three-line>
                    <template v-for="(item, index) in datasetDisplayItems">
                        <v-divider
                            v-if="item.divider"
                            :key="index"
                            :inset="item.inset"
                        ></v-divider>

                        <v-list-item
                            v-else
                            :key="item.id"
                            :id="'dataset-'+item.title.toLowerCase().replace(/[ :.]/g, '-')"
                            :to="{ name: 'datasets_form', params: { id: item.id } }"
                        >
                            <v-list-item-content>
                                <v-list-item-title v-html="item.title"></v-list-item-title>
                                <v-list-item-subtitle>
                                    {{$tc('Created on')}} {{item.subtitle | formatDate}}
                                </v-list-item-subtitle>

                            </v-list-item-content>


                        </v-list-item>
                    </template>
                </v-list>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols=10>
            </v-col>
            <v-col cols=2>
                <v-menu offset-y top>
                    <template v-slot:activator="{ on }">
                        <v-btn v-on="on" color="success">Report{{(filtersApplied) ? ' (on filtered)' : ''}}</v-btn>
                    </template>
                    <v-list>
                        <v-list-item-group>
                            <v-list-item v-for="(item, index) in reports" :key="index" @click="goReport(item)">
                                <v-list-item-content>
                                    <v-list-item-title>{{item}}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list-item-group>
                    </v-list>
                </v-menu>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import Vue from 'vue';
import {mapActions, mapState, mapMutations} from "vuex";
import Select from '../FormElements/Select';
import TextInput from '../FormElements/TextInput';
import TableReport from '../Reports/TableReport';

const taggedFieldsRep = 'Tagged fields';

export default {
    components:{
        Select,
        TextInput,
        TableReport
    },

    data() {
        return {
            SORT_BY_OPTS: [{text: 'Create Date Descending', value : 'create_date desc'}, {text: 'Create Date Ascending', value : 'create_date asc'}, {text: 'Name Descending', value : 'name desc'}, {text: 'Name Ascending', value : 'name asc'}, {text: 'Ministry/Org Descending', value : 'ministry_organization desc'}, {text: 'Ministry/Org Ascending', value : 'ministry_organization asc'}],
            message: '',
            filterOrg: [],
            filterName: '',
            isUpdating: false,
            reports: [taggedFieldsRep],
            reportHeaders: [],
            reportItems: [],
            showReport: false,
            reportTitle: '',
            filterTags: '',
            filteredRepos: [],
            datasetTags: {},
            sortBy: "create_date desc",
            sortField: "create_date",
            sortDir: 'desc'
        }
    },
    async mounted(){
        this.loadRepos();
    },
    methods: {
        ...mapActions({
            getRepos: 'repos/getRepos',
            getReposFull: 'repos/getReposFull',
            
        }),
        ...mapMutations({
            setSelectedFilterBy: 'repos/setSelectedFilterBy',
        }),
        async loadRepos() {
            this.message = this.$tc('Loading') + ' ' + this.$tc('Datasets', 2) + '...';
            
            await this.getRepos({filterBy: false});
            this.filteredRepos = this.repos;

            this.getReposFull({});
            this.message = '';
        },  

        refilter: function(){
            if (this.reposFull && Object.keys(this.datasetTags).length === 0){
                let tagItems = {}
                this.reposFull.forEach( (repo) => {
                    
                    for (let i=0; i<repo.resources.length; i++){
                        if (repo.resources[i].tableSchema && repo.resources[i].tableSchema.fields){
                            for (let j=0; j<repo.resources[i].tableSchema.fields.length; j++){
                                let tagArr = repo.resources[i].tableSchema.fields[j].tags;
                                if (tagArr){
                                    if (tagItems[repo.version.repo_id._id]){
                                        tagItems[repo.version.repo_id._id] = [...new Set([...tagItems[repo.version.repo_id._id], ...tagArr])];
                                    }else{
                                        tagItems[repo.version.repo_id._id] = [...new Set(tagArr)];
                                    }
                                }
                            }
                        }
                    }
                    
                });
                this.datasetTags = tagItems;
            }
            let newFiltered = [];
            this.repos.forEach( (repo) => {
                let add = (this.filterOrg.length === 0 || this.filterOrg.indexOf(repo.ministry_organization) !== -1);
                add = ( (add) && (!this.filterName || repo.name.indexOf(this.filterName) !== -1) );
                add = ( (add) && ((!this.filterTags) || ( (!this.datasetTags) || (this.datasetTags[repo._id] && this.filterTags.every(element => { return this.datasetTags[repo._id].includes(element); }))) ));
                if (add){
                    newFiltered.push(repo)
                }
            });
            Vue.set(this, 'filteredRepos', newFiltered);
        },

        goReport(report){
            let items = [];
            if (report === taggedFieldsRep){
                this.reportHeaders = [
                    {
                        text: 'Ministry/Organization',
                        sortable: false,
                        value: 'version.repo_id.ministry_organization',
                    },
                    {
                        text: 'Dataset Name',
                        sortable: false,
                        value: 'version.repo_id.name',
                    },
                    {
                        text: this.$tc('Version', 1) + ' Name',
                        sortable: false,
                        value: 'version.name',
                    },
                    {
                        text: this.$tc('Resource', 1) + ' Name',
                        sortable: false,
                        value: 'resource.name',
                    },
                    {
                        text: this.$tc('Field', 1) + ' Name',
                        sortable: false,
                        value: 'field.name',
                    },
                    {
                        text: this.$tc('Field', 1) + ' Description',
                        sortable: false,
                        value: 'field.description',
                    },
                    {
                        text: this.$tc('Tags', 2),
                        sortable: false,
                        value: 'field.tags',
                    },
                ];

                if (this.reposFull){
                    this.reposFull.forEach( (repo) => {
                        let add = (this.filterOrg.length === 0 || this.filterOrg.indexOf(repo.version.repo_id.ministry_organization) !== -1);
                        add = ( (add) && (!this.filterName || repo.version.repo_id.name.indexOf(this.filterName) !== -1) );
                        
                        if (add){
                            for (let i=0; i<repo.resources.length; i++){
                                if (repo.resources[i].tableSchema && repo.resources[i].tableSchema.fields){

                                    for (let j=0; j<repo.resources[i].tableSchema.fields.length; j++){
                                        let item = JSON.parse(JSON.stringify(repo));
                                        item.field = JSON.parse(JSON.stringify(repo.resources[i].tableSchema.fields[j]));
                                        item.resource = JSON.parse(JSON.stringify(repo.resources[i]));
                                        let tagStr = item.field.tags;
                                        let tags = [];
                                        if (tagStr){
                                            if (tagStr.indexOf(", ") !== -1){
                                                tags = tagStr.split(", ");
                                            }else{
                                                tags = tagStr.split(",")
                                            }
                                        }
                                        if (!this.filterTags || (tags && tags.indexOf(this.filterTags) !== -1)){
                                            items.push(item);
                                        }
                                    }
                                }
                            }
                            
                        }
                    });
                }
            }
            this.reportItems = items;
            this.reportTitle = report;
            this.showReport = true;

        },
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            dataUploads: state => state.dataUploads.dataUploads,
            repos: state => state.repos.repos,
            reposFull: state => state.repos.reposFull,
            selectedFilterBy: state => state.repos.selectedFilterBy,
        }),

        filtersApplied: function(){
            return ((this.filterOrg.length !== 0) || (this.filterName !== '') || this.filterTags !== '' );
        },

        filterOrgItems: function(){
            let rv = [];
            let rvValues = [];
            if (this.repos){
                this.repos.forEach( (repo) => {
                    if (rvValues.indexOf(repo.ministry_organization) === -1){
                        if (repo.ministry_organization && repo.ministry_organization !== ''){
                            rvValues.push(repo.ministry_organization);
                            rv.push({value: repo.ministry_organization, text: repo.ministry_organization});
                        }
                    }
                });
            }
            return rv;
        },
        
        datasetDisplayItems: function(){
            let items = [];
            if (this.filteredRepos){
                let filtered = JSON.parse(JSON.stringify(this.filteredRepos));
                filtered.sort( (a,b) => {
                    
                    if (this.sortDir === 'desc'){
                        if (typeof(a[this.sortField]) === 'string'){
                            return b[this.sortField].localeCompare(a[this.sortField]);
                        }
                        return (a[this.sortField] >= b[this.sortField]) ? -1 : 1;
                    }

                    if (typeof(a[this.sortField]) === 'string'){
                        return a[this.sortField].localeCompare(b[this.sortField]);
                    }else{
                        console.log(a[this.sortField], b[this.sortField], (b[this.sortField] >= a[this.sortField]));
                        return (b[this.sortField] >= a[this.sortField]) ? 1 : -1;
                    }
                });
                filtered.forEach( (repo, index) => {
                    const item = {
                        title: `${repo.name} ${repo.ministry_organization ? ' - ' + repo.ministry_organization : ''}`,
                        subtitle: repo.create_date,
                        id: repo._id,
                        branches: repo.branches,
                    };
                    items.push(item);
                    if(index <= filtered.length - 1) {
                        items.push({ divider: true, inset: true });
                    }
                });
            }
            
            return items;
        },
    },
    watch: {

        filterOrg: function(){
            this.refilter();
        },
        filterName: function(){
            this.refilter();
        },
        filterTags: function(){
            this.refilter();
        },
        sortBy: function(){
            let sortArr = this.sortBy.split(' ');
            this.sortField = sortArr[0];
            this.sortDir = sortArr[1];
        }
        
    },
};
</script>

<style scoped>

.bordered{
    border: 1px solid;
}

</style>
