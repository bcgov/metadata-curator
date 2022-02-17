<template>
    <v-container>
        <v-row>
            <v-col cols=12>
                <h1 class="display-1 font-weight-thin ml-3 my-3">{{$tc('Datasets', 2)}}</h1>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols=10>
            </v-col>
            <v-col cols=2>
                <v-btn color="primary" to="/datasets/create">{{$tc('New')}} {{$tc('Datasets')}}</v-btn>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols=4>Filter By:</v-col>
            <v-col cols=8>
                <Select
                    :editing="true"
                    name="ministry_organization"
                    :label="$tc('Ministry / Organization')"
                    :items="filterOrgItems"
                    :value="filterOrg"
                    @edited=" (newVal) => { filterOrg = newVal; }">
                </Select>
            </v-col>
        </v-row>

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
    </v-container>
</template>

<script>

import {mapActions, mapState, mapMutations} from "vuex";
import Select from './Select';

export default {
    components:{
        Select,
    },

    async created() {
        this.filterBy = this.selectedFilterBy;

    },
    data() {
        return {
            message: '',
            filterBy: null,
            filterOrg: false,
            isUpdating: false,
        }
    },
    async mounted(){
        this.loadRepos();
    },
    methods: {
        ...mapActions({
            getRepos: 'repos/getRepos',
            
        }),
        ...mapMutations({
            setSelectedFilterBy: 'repos/setSelectedFilterBy',
        }),
        async loadRepos() {
            this.message = this.$tc('Loading') + ' ' + this.$tc('Datasets', 2) + '...';
            
            await this.getRepos({filterBy: false});
            this.message = '';
        },        
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            dataUploads: state => state.dataUploads.dataUploads,
            repos: state => state.repos.repos,
            selectedFilterBy: state => state.repos.selectedFilterBy,
        }),

        filterOrgItems: function(){
            let rv = [{value: false, text: ""}];
            let rvValues = [];
            this.repos.forEach( (repo) => {
                if (rvValues.indexOf(repo.ministry_organization) === -1){
                    if (repo.ministry_organization && repo.ministry_organization !== ''){
                        rvValues.push(repo.ministry_organization);
                        rv.push({value: repo.ministry_organization, text: repo.ministry_organization});
                    }
                }
            });
            return rv;
        },
        
        datasetDisplayItems: function(){
            let items = [];
            this.repos.forEach( (repo, index) => {
                if (!this.filterOrg || repo.ministry_organization===this.filterOrg){
                    const item = {
                        title: `${repo.name} ${repo.ministry_organization ? ' - ' + repo.ministry_organization : ''}`,
                        subtitle: repo.create_date,
                        id: repo._id,
                        branches: repo.branches,
                    };
                    items.push(item);
                    if(index <= this.repos.length - 1) {
                        items.push({ divider: true, inset: true });
                    }
                }
            });
            return items;
        },
    },
    watch: {
        // eslint-disable-next-line no-unused-vars
        filterBy: async function (newVal, oldVal) {
            await this.setSelectedFilterBy(newVal);
            if(this.user.isDataProvider){
                this.loadRepos(); 
            }
        },
    },
};
</script>

<style scoped>

</style>
