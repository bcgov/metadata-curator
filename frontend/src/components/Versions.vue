<template>
    <v-container>
        <v-row v-if="isUpdating">
            {{$tc('Loading')}}...
            <v-progress-circular
                indeterminate
                color="primary"
            ></v-progress-circular>
        </v-row>
        <v-row v-else>
            <h1 class="display-1 font-weight-thin ml-3 my-3">{{$tc('Versions', 2)}}</h1>

            <v-container fluid class="ml-1 pb-0 mb-1">
                <v-row>
                    <v-col cols=12>
                        <h3>
                            {{$tc('Filter by')}}
                        </h3>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols=12>
                        <Select
                            :label="$tc('Uploads', 2)"
                            placeholder=""
                            name="uploadFilter"
                            :items="dataUploadsWithAll"
                            itemText="name"
                            itemValue="_id"

                            :editing="true"
                            :value="filterBy"
                            helpPrefix="versionList"
                            @edited="(newValue) => { filterBy = newValue }"
                        ></Select>
                    </v-col>
                
                    <v-col cols=12>
                        <Select
                            :label="$tc('Dataset', 2)"
                            placeholder=""
                            name="datasetFilter"
                            :items="reposWithAll"
                            itemText="name"
                            itemValue="_id"

                            :editing="true"
                            :value="datasetFilter"
                            helpPrefix="versionList"
                            @edited="(newValue) => { datasetFilter = newValue }"
                        ></Select>
                    </v-col>
                </v-row>
            </v-container>

            <v-col cols=12 v-if="branchDisplayItems.length <= 0">
                {{$tc("No")}} {{$tc("Version", 2)}} {{$tc("found")}}
            </v-col>
            <v-col cols=12 v-else>
                <v-list three-line>
                    <template v-for="(item, index) in branchDisplayItems">
                        <v-divider
                            v-if="item.divider"
                            :key="index"
                            :inset="item.inset"
                        ></v-divider>

                        <v-list-item
                            v-else
                            :key="item.id"
                            @click="routeToBranch(item.id)"
                        >
                            <v-list-item-content>
                                <v-list-item-title v-html="item.title"></v-list-item-title>
                                <v-list-item-subtitle>
                                    {{item.subtitle}}
                                </v-list-item-subtitle>

                            </v-list-item-content>


                        </v-list-item>
                    </template>
                </v-list>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>

import {mapActions, mapState, mapMutations} from "vuex";
import Select from './Select';

export default {
    components:{
        Select
    },
    async created() {
        this.filterBy = this.selectedFilterBy;

    },
    data() {
        return {
            filterBy: -1,
            isUpdating: false,
            datasetFilter: "-1",
        }
    },
    async mounted(){
        await this.getDataUploads("team");
        this.loadBranches();
        await this.getRepos({filterBy: false});
    },
    methods: {
        ...mapActions({
            getBranchesByUpload: 'repos/getBranchesByUpload',
            getDataUploads: 'dataUploads/getDataUploads',
            getRepos: 'repos/getRepos',
            
        }),
        ...mapMutations({
            setSelectedFilterBy: 'repos/setSelectedFilterBy',
        }),
        async loadBranches() {
            this.isUpdating = true;
            await this.getBranchesByUpload({uploadId: this.filterBy});
            this.isUpdating = false;
        },

        routeToBranch(id) {
            this.$router.push({ name: 'version_form', params: { id: id } })
        },
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            dataUploads: state => state.dataUploads.dataUploads,
            repos: state => state.repos.repos,
            branches: state => state.repos.branches,
            selectedFilterBy: state => state.repos.selectedFilterBy,
        }),

        dataUploadsWithAll: function(){
            var u = this.dataUploads.slice();
            u.unshift({name: "All", _id: -1});
            u.unshift({name: "None", _id: ''});
            return u;
        },

        reposWithAll: function(){
            var u = this.repos.slice();
            u.unshift({name: "All", _id: -1});
            return u;
        },
        
        branchDisplayItems: function(){
            let items = [];
            this.branches.forEach( (branch, index) => {
                const item = {
                    title: `${branch.name}`,
                    subtitle: branch.description,
                    id: branch._id,
                };
                if ( (this.datasetFilter === "-1") || (branch.repo_id == this.datasetFilter) ){
                    items.push(item);
                    if(index <= this.branches.length - 1) {
                        items.push({ divider: true, inset: true });
                    }
                }
            });
            return items;
        },
    },
    watch: {
        filterBy: async function (newVal) {
            await this.setSelectedFilterBy(newVal);
            await this.loadBranches(); 
        },
    },
};
</script>

<style scoped>

</style>
