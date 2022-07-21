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
            <v-col cols=12>
                <h1 class="display-1 font-weight-thin ml-3 my-3">{{$tc('Options', 2)}}</h1>
            </v-col>

        
            <v-col cols=10>
            </v-col>
            <v-col cols=2>
                <v-btn color="primary" to="/option/create" id="newOption">{{$tc('New')}} {{$tc('Options')}}</v-btn>
            </v-col>
        

            <v-col cols=12 v-if="optionDisplayItems.length <= 0">
                {{$tc("No")}} {{$tc("Options", 2)}} {{$tc("found")}}
            </v-col>
            <v-col cols=12 v-else>
                <v-list three-line>
                    <template v-for="(item, index) in optionDisplayItems">
                        <v-divider
                            v-if="item.divider"
                            :key="index"
                            :inset="item.inset"
                        ></v-divider>

                        <v-list-item
                            v-else
                            :key="item.id"
                            @click="routeToOption(item.id)"
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

import {mapActions, mapState} from "vuex";

export default {
    components:{
    },
    async created() {

    },
    data() {
        return {
            filterBy: -1,
            isUpdating: false,
        }
    },
    async mounted(){
        this.loadOptions();
    },
    methods: {
        ...mapActions({
            getOptions: 'options/getOptions', 
        }),
        
        async loadOptions() {
            this.isUpdating = true;
            await this.getOptions({/*type: this.filterBy*/});
            this.isUpdating = false;
        },

        routeToOption(id) {
            this.$router.push({ name: 'optionForm', params: { id: id } })
        },
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            options: state => state.options.options,
        }),
        
        optionDisplayItems: function(){
            let items = [];
            this.options.forEach( (option, index) => {
                const item = {
                    title: `${option.type}`,
                    subtitle: "# of values "+option.values.length,
                    id: option._id,
                };
                
                items.push(item);
                if(index <= this.options.length - 1) {
                    items.push({ divider: true, inset: true });
                }
            });
            return items;
        },
    },
    watch: {
        // filterBy: async function (newVal) {
        //     await this.loadOptions(); 
        // },
    },
};
</script>

<style scoped>

</style>
