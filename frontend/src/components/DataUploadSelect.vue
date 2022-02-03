<template>
    <div>
         <span v-if="!editing">
             <h2 v-if="large" class="mr-2">
                {{displayLabel}}
                <v-tooltip right v-if="$te('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))">
                    <template v-slot:activator="{ on }">
                        <v-icon color="label_colour" v-on="on">mdi-help-circle-outline</v-icon>
                    </template>
                    <span>&nbsp;{{$t('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))}}</span>
                </v-tooltip>
            </h2>
            <span v-else class="mr-2">
                {{displayLabel}}
                <v-tooltip right v-if="$te('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))">
                    <template v-slot:activator="{ on }">
                        <v-icon color="label_colour" v-on="on">mdi-help-circle-outline</v-icon>
                    </template>
                    <span>&nbsp;{{$t('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))}}</span>
                </v-tooltip>
            </span>
            <h2 v-if="large"><router-link :to="{ name: 'upload_view', params: {id: this.val} }">{{displayVal}}</router-link></h2>
            <span v-else><router-link :to="{ name: 'upload_view', params: {id: this.val} }">{{displayVal}}</router-link></span>
        </span>

        <span v-else>
            <ValidationProvider :rules="validationRules" v-slot="{ errors }" :name="label ? $tc(label) : $tc(name)">
                <v-dialog persistent v-model="dialog">
                    <template v-slot:activator="{ on }">
                        <component :is="(large) ? 'h2' : 'span'">{{displayLabel}}</component>
                        <v-btn v-on="on">{{displayVal}}<v-icon>mdi-dock-window</v-icon></v-btn>
                    </template>
                    <v-card>
                        <v-card-title>
                            <span class="headline">Select an {{ $tc('Uploads', 1) }}</span>
                            <v-spacer></v-spacer>
                            <v-btn small @click="dialog = false">X</v-btn>
                        </v-card-title>

                        <v-card-text>
                            <v-data-table
                                dense
                                class="dataUploadSelectTable"
                                :search="searchString"
                                :headers="headers"
                                :items="items"
                                @click:row="rowClicked"
                            >
                                <template v-slot:top>
                                    <v-text-field
                                        v-model="searchString"
                                        label="Search"
                                    ></v-text-field>
                                </template>
                            </v-data-table>
                        </v-card-text>

                        <v-card-actions>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                
            </ValidationProvider>
        </span>
    </div>
</template>

<script>

    import ValidationRules from "../mixins/ValidationRules";

    export default {
        mixins: [ValidationRules],
        props: {
            name: {
                type: String,
                required: true,
                default: () => ''
            },
            label: {
                type: String,
                required: true,
                default: () => ''
            },
            placeholder: {
                type: String,
                required: false,
                default: () => ''
            },
            validationRules: {
                type: String,
                required: false,
                default: () => ''
            },
            items: {
                type: Array,
                required: false,
                default: () => []
            },
            itemText: {
                type: String,
                required: false,
                default: () => 'text'
            },
            itemValue: {
                type: String,
                required: false,
                default: () => 'value'
            },
            value: {
                type: [String, Array],
            },
            editing: {
                type: Boolean,
                required: false,
                default: () => false
            },
            helpPrefix: {
                type: String,
                required: false,
                default: ''
            },
            large: {
                type: Boolean,
                required: false,
                default: () => false
            },
            idName: {
                type: String,
                required: false,
                default: "",
            },

        },
        data() {
            return {
                val: null,
                dialog: false,
                searchString: '',
                headers: [
                    {
                        text: this.$tc('Name'),
                        sortable: true,
                        value: 'name'
                    },
                    { 
                        text: this.$tc('Created'), 
                        value: 'create_date' 
                    },
                    { 
                        text: this.$tc('Description'), 
                        value: 'description' 
                    },
                    { 
                        text: this.$tc('Status'), 
                        value: 'status' 
                    },
                ]
            }
        },
        computed: {
            displayLabel: function () {
                if (this.validationRules.toLowerCase().indexOf("required") >= 0) {
                    return this.label + ' *';
                }
                return this.label;
            },

            displayVal: function(){
                let displayVal = this.val;
                for (let i=0; i<this.items.length; i++){
                    if (this.items[i][this.itemValue] === this.val){
                        displayVal = this.items[i][this.itemText];
                    }
                }
                return displayVal
            }

        },
        watch: {
            value: function (newVal) {
                this.val = newVal
            },
        },
        mounted(){
            this.val = this.value;
        },
        methods: {
            rowClicked: function(item){
                this.$emit('edited', item[this.itemValue]);
                this.val = item[this.itemValue];
                this.dialog = false;
            }
        }


    };
</script>

<style>

.dataUploadSelectTable tr:hover{
    cursor: pointer;
}

</style>
