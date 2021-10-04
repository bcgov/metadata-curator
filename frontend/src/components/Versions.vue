<template>
    <v-container>
        <h1 class="display-1 font-weight-thin ml-3 my-3">{{$tc('Versions', 2)}}</h1>

        <v-container fluid class="ml-1 pb-0 mb-1">
            <v-row>
                <v-col cols=10>
                    <p>{{$tc('Uploads')}}:</p>
                    <v-select v-model="filterBy" :items="dataUploadsWithAll" item-text="name" item-value="_id" class="ml-2"></v-select>
                </v-col>
            </v-row>
        </v-container>

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
            filterBy: -1,
            isUpdating: false,
        }
    },
    async mounted(){
        await this.getDataUploads("team");
        this.loadBranches();
    },
    methods: {
        ...mapActions({
            getBranchesByUpload: 'repos/getBranchesByUpload',
            getDataUploads: 'dataUploads/getDataUploads',
            
        }),
        ...mapMutations({
            setSelectedFilterBy: 'repos/setSelectedFilterBy',
        }),
        async loadBranches() {
            this.message = 'Retrieving Versions...';
            
            await this.getBranchesByUpload({uploadId: this.filterBy});
            this.message = '';
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
                items.push(item);
                if(index <= this.branches.length - 1) {
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
            this.loadBranches(); 
        },
    },
};
</script>

<style scoped>

</style>
