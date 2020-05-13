<template>
    <v-card>
        <v-card-title>{{title}}</v-card-title>
        <v-card-text>
            <AlertError v-if="errorText !== ''" :message="errorText"></AlertError>
            <v-data-table
                dense
                :headers="headers"
                :items="items"
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
                        <v-dialog v-model="dialog" :max-width="dialogSize">
                        <template v-slot:activator="{ on }">
                            <v-btn color="primary" dark class="mb-2" v-on="on">New Entry</v-btn>
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
                                <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                                <v-btn color="blue darken-1" text @click="save">Save</v-btn>
                            </v-card-actions>
                        </v-card>
                        </v-dialog>
                    </v-toolbar>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-icon
                        small
                        class="mr-2"
                        @click="edit(item)"
                    >
                        mdi-pencil
                    </v-icon>
                    <v-icon v-if="showDelete"
                        small
                        color="error"
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
            }

        },

        data() {
            return {
                editedItem: {},
                editedIndex: -1,
                dialog: false,
                defaultItem: {}
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

            errorText(){
                return this.$store.state[this.storeName].error;
            }
        },

        watch: {
            dialog(val){
                val || this.close();
            }
        },

        methods: {
            close(){
                this.dialog = false
                this.$nextTick(() => {
                    this.editedItem = Object.assign({}, this.defaultItem)
                    this.editedIndex = -1
                })
            },

            edit(item) {
                this.editedIndex = this.items.indexOf(item)
                this.editedItem = Object.assign({}, item)
                this.dialog = true
            },

            deleteItem(item) {
                this.$store.dispatch(this.storeName+"/deleteItem", {id: item._id});
            },

            save() {
                if (this.editedIndex > -1) {
                    this.$store.dispatch(this.storeName + '/updateItem', {id: this.editedItem._id, item: this.editedItem})
                } else {
                    this.$store.dispatch(this.storeName + '/newItem', {item: this.editedItem})
                }
                this.close()
            },
        },

        mounted(){
            this.$store.dispatch(this.storeName + '/getItems');
        }
    };
</script>

<style scoped>
</style>
