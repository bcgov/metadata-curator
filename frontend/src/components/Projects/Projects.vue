<template>
    <v-container>
        <v-row>
            <v-col cols=12>
                <h1 class="display-1 font-weight-thin ml-3 my-3">{{$tc('Project', 2)}}</h1>
            </v-col>
        </v-row>

        <v-row v-if="loggedIn && (user.isAdmin || user.isApprover)">
            <v-col cols=8>
            </v-col>
            <v-col cols=4>
                <v-btn color="primary" to="/project/create">{{$tc('New')}} {{$tc('Project', 1)}}</v-btn>
            </v-col>
        </v-row>

        <v-list three-line>
            <template v-for="(item, index) in projectDisplayItems">
                <v-divider
                    v-if="item.divider"
                    :key="index"
                    :inset="item.inset"
                ></v-divider>

                <v-list-item
                    v-else
                    :key="item.id"
                    :to="{ name: 'projectForm', params: { id: item.id } }"
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

export default {
    async created() {
        await this.loadVariableClassifications();
    },
    data() {
        return {
            message: '',
            isUpdating: false,
        }
    },
    async mounted(){
        await this.loadVariableClassifications();
    },

    methods: {
        ...mapActions({
            getProjects: 'projects/getItems',
            clearProjects: 'projects/clearItems',
            
        }),
        ...mapMutations({
            
        }),
        async loadVariableClassifications() {
            this.message = this.$tc('Loading') + ' ' + this.$tc('Project', 2) + '...';
            await this.clearProjects();
            await this.getProjects({});
            this.message = '';
        },        
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            loggedIn: state => state.user.loggedIn,
            projects: state => state.projects.items,
        }),
        
        projectDisplayItems: function(){
            let items = [];
            this.projects.forEach( (vc) => {
                if (vc._id){
                    if (items.length > 0){
                        items.push({ divider: true, inset: true });
                    }
                    const item = {
                        title: `${vc.name}`,
                        subtitle: vc.create_date,
                        id: vc._id,
                    };
                    items.push(item);
                    
                }
            });
            return items;
        },
    },
    watch: {
    },
};
</script>

<style scoped>

</style>
