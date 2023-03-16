<template>
    <v-card>
        <v-card-title>{{title}}</v-card-title>
        <v-card-text>
            <AlertError v-if="errorText !== ''" :message="errorText"></AlertError>
            <div v-if="filterRequired !== ''">
                <span>{{filterRequired}}</span>
                <v-text-field v-model="searchParam"></v-text-field>
                <v-btn color="success" @click="searchClick">{{$tc('Search')}}</v-btn>
            </div>
            <p>{{datas}}</p>
            <v-data-table
                dense
                :headers="headers"
                :items="dataUploads.dataUploads"
            >
                <template v-slot:top>
                    <v-toolbar flat>
                        <v-toolbar-title></v-toolbar-title>
                        <v-divider
                        class="mx-4"
                        inset
                        vertical
                        ></v-divider>
                        <v-spacer></v-spacer>
                    <!--    <v-dialog v-model="dialog" :max-width="dialogSize">
                        <template v-slot:activator="{ on }">
                            <v-btn v-if="showNew" color="primary" dark class="mb-2" v-on="on">{{$tc('New')}} {{$tc('Entry', 1)}}</v-btn>
                        </template>
                        <v-card>
                            <v-card-title>
                                <span class="headline">{{ formTitle }}</span>
                            </v-card-title>

                            <v-card-text>
                                <component :is="formComponent" :item="editedItem" :open="dialog"></component>
                            </v-card-text>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue darken-1" text @click="close">{{$tc('Cancel')}}</v-btn>
                                <v-btn color="blue darken-1" text @click="save">{{$tc('Save')}}</v-btn>
                            </v-card-actions>
                        </v-card>
                        </v-dialog> -->
                    </v-toolbar>
                </template>
                <template v-slot:item.data="{ item }">
                    {{JSON.stringify(item.data)}}
                </template>
                <template v-slot:item.old_submission="{ item }">
                    {{item && item.old_submission && item.old_submission.data ? JSON.stringify(item.old_submission.data) : ''}}
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-icon
                        v-if="showEdit"
                        small
                        class="mr-2"
                        @click="edit(item)"
                    >
                        mdi-pencil
                    </v-icon>
                    <v-icon v-if="showDelete"
                        small
                        color="error"
                        class="mr-2"
                        @click="deleteItem(item)"
                    >
                        mdi-delete
                    </v-icon>
                </template>
            </v-data-table>
        </v-card-text>
        <v-card-actions>
        </v-card-actions>
    </v-card>
</template>

<script>
import AlertError from '../AlertError';
import {mapActions, mapState} from "vuex";
//import dataUploads from "@/store/modules/dataUploads";

    export default {
        components: {
            AlertError: AlertError
        },

        props: {
            title: {
                type: String,
                required: true
            },

            headers: {
                type: Array,
                required: true
            },

            storeName: {
                type: String,
                required: false
            },

            showDelete: {
                type: Boolean,
                required: false,
                default: false
            },

            formComponent: {
                type: Object,
                required: true
            },

            dialogSize: {
                type: String,
                required: false,
                default: "500px"
            },

            showNew: {
                type: Boolean,
                required: false,
                default: true
            },

            showEdit: {
                type: Boolean,
                required: false,
                default: true
            },

            filterRequired: {
                type: String,
                required: false,
                default: ""
            },

            deleteParam: {
                type: String,
                required: false,
                default: "_id"
            }

        },

        data() {
            return {
                editedItem: {},
                editedIndex: -1,
                dialog: false,
                defaultItem: {},
                searchParam: ""
            }
        },

        computed: {
            formTitle () {
                let nonPlural = this.title;
                nonPlural = (nonPlural[nonPlural.length-1].toLowerCase() === "s") ? nonPlural.substring(0, nonPlural.length-1) : nonPlural;
                return this.editedIndex === -1 ? 'New ' + nonPlural : 'Edit ' + nonPlural
            },

            items() {
                return this.$store.state[this.storeName].items;
            },

            datas() {
              return this.$store.state[this.storeName].getSearchResults;
            },

            errorText(){
                return this.$store.state[this.storeName].error;
            },

            ...mapState(['dataUploads'])
        },

        watch: {
            dialog(val){
                val || this.close();
            }
        },

        methods: {
            ...mapActions({
                getDataUploadsFromResourceFields: 'dataUploads/getDataUploadsFromResourceFields',
            }),

            async searchClick() {
                if (this.filterRequired === '') {
                    await this.$store.dispatch(this.storeName + '/getDataUploadsFromResourceFields', {param: false});
                } else {
                    //this.$store.dispatch(this.storeName + '/getDataUploadsFromResourceFields', {param: this.searchParam});
                    var result = await this.getDataUploadsFromResourceFields(this.searchParam);
                    //this.items[0] = result;
                    //await this.$store.dispatch(this.storeName + '/setItems', result);
                    //await this.$store.dispatch(this.storeName + '/setDataUploads', result);
                    //await this.$store.dispatch('items/setItems', result);
                    console.log(result);
                    console.log('items:==');
                    console.log(this.dataUploads.dataUploads);
                }
            },
        },

        mounted(){
            if (this.filterRequired === ''){
                //this.$store.dispatch(this.storeName + '/getItems', {param: false});
            }else{
                //this.$store.dispatch(this.storeName + '/getItems', {param: this.searchParam});
            }
        }
    };
</script>

<style scoped>
</style>
