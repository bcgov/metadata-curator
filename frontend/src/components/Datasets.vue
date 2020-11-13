<template>
    <v-container>
        <v-row>
            <v-col cols=12>
                <h1 class="display-1 font-weight-thin ml-3 my-3">Datasets</h1>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols=10>
            </v-col>
            <v-col cols=2>
                <v-btn color="primary">New Dataset</v-btn>
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
                    @click="routeToRepo(item.id)"
                >
                    <v-list-item-content>
                        <v-list-item-title v-html="item.title"></v-list-item-title>
                        <v-list-item-subtitle>
                            Created on {{item.subtitle | formatDate}}
                            # Branches: {{item.branches.length}}
                        </v-list-item-subtitle>

                    </v-list-item-content>


                </v-list-item>
            </template>
        </v-list>
    </v-container>
</template>

<script>

import {mapActions, mapState, mapMutations} from "vuex";

export default {
    async created() {
        this.filterBy = this.selectedFilterBy;

    },
    data() {
        return {
            message: '',
            filterBy: null,
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
            this.message = 'Retrieving Datasets...';
            
            await this.getRepos({filterBy: false});
            this.message = '';
        },

        routeToRepo(id) {
            this.$router.push({ name: 'dataset_form', params: { id: id } })
        },
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            dataUploads: state => state.dataUploads.dataUploads,
            repos: state => state.repos.repos,
            selectedFilterBy: state => state.repos.selectedFilterBy,
        }),
        
        datasetDisplayItems: function(){
            let items = [];
            this.repos.forEach( (repo, index) => {
                const item = {
                    title: `${repo.name}`,
                    subtitle: repo.create_date,
                    id: repo._id,
                    branches: repo.branches,
                };
                items.push(item);
                if(index <= this.repos.length - 1) {
                    items.push({ divider: true, inset: true });
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
