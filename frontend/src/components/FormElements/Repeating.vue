<template>
    <v-container fluid>
        <v-row>
            <v-col cols=12>
                <h2 v-if="large" class="inline">
                    {{displayLabel}}:
                    <v-tooltip right v-model="showTooltip" v-if="$te('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))">
                        <template v-slot:activator="{}">
                            <v-icon color="label_colour" 
                                @mouseenter="showTooltip = true"
                                @mouseleave="closeOnLeave ? (showTooltip = false) : false">
                                mdi-help-circle-outline
                            </v-icon>
                        </template>
                        <span v-html="displayTooltip"></span>
                    </v-tooltip>
                </h2>
                <span v-else>
                    {{displayLabel}}:
                    <v-tooltip right v-model="showTooltip" v-if="$te('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))">
                        <template v-slot:activator="{}">
                            <v-icon color="label_colour" 
                                @mouseenter="showTooltip = true"
                                @mouseleave="closeOnLeave ? (showTooltip = false) : false">
                                mdi-help-circle-outline
                            </v-icon>
                        </template>
                        <span v-html="displayTooltip"></span>
                    </v-tooltip>
                </span>
            </v-col>
        </v-row>

        <v-row v-for="(item, key) in val" :key="'repeating-row-'+key">
            <v-col cols=12>
                <DateInput
                    v-if="innerType=='DateInput'"
                    :label="innerLabel"
                    :placeholder="innerPlaceholder"
                    :name="name+'['+key+']'"
                    :editing="editing"
                    :helpPrefix="helpPrefix"
                    :value="item"
                    :large="large"
                    :validation-rules="innerValidationRules"
                    @edited="(newValue) => { updateVal(key, newValue) }">
                </DateInput>

                <Composite
                    v-else
                    :label="innerLabel"
                    :placeholder="innerPlaceholder"
                    :name="name+'['+key+']'"
                    :editing="editing"
                    :helpPrefix="helpPrefix"
                    :value="item"
                    :large="large"
                    :schema="defaults"
                    :items="items"
                    :multiple="multiple"
                    :conditions="conditions"
                    :validation-rules="innerValidationRules"
                    @edited="(newValue) => { updateVal(key, newValue) }">
                </Composite>
            </v-col>
            <v-col cols=11 v-if="editing">
            </v-col>
            <v-col cols=1 v-if="editing">
                <v-btn color="error" @click="removeValue(key)"><v-icon>mdi-delete</v-icon></v-btn>
            </v-col>
            
        </v-row>

        <v-row v-if="editing">
            <v-col cols=1>
                <v-btn color="success" @click="addValue"><v-icon>mdi-plus</v-icon></v-btn>
            </v-col>
            <v-col cols=11>
            </v-col>
        </v-row>

    </v-container>
</template>

<script>

import Vue from 'vue';
let marked = require('marked');

import DateInput from './DateInput';
import Composite from './Composite';

    export default {
        components: {
            DateInput,
            Composite
        },
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
            validationRules: {
                type: String,
                required: false,
                default: ''
            },
            innerValidationRules: {
                type: [String, Object],
                required: false,
                default: ''
            },
            value: {
                type: Array,
                required: false,
                default: () => []
            },
            editing: {
                type: Boolean,
                required: false,
                default: () => false
            },
            large: {
                type: Boolean,
                required: false,
                default: () => false
            },
            helpPrefix: {
                type: String,
                required: false,
                default: "",
            },
            innerType: {
                type: String,
                required: false,
                default: "Composite"
            },
            innerLabel: {
                type: [String, Object],
                required: false,
                default:() => {}
            },
            innerPlaceholder: {
                type: [String, Object],
                required: false,
                default: () => {}
            },
            multiple: {
                type: [Object],
                required: false,
                default: () => {}
            },
            //doubles as a schema for composite
            defaults: {
                type: [Array, Object],
                required: false,
                default: () => {}
            },
            items: {
                type: Object,
                required: false,
                default: () => {}
            },
            conditions: {
                type: Object,
                required: false,
                default: () => {}
            },
            
        },
        data() {
            return {
                val: JSON.parse(JSON.stringify(this.value)),
                showTooltip: false,
                closeOnLeave: true,
            }
        },

        methods: {
            updateVal: function(key, newValue){
                Vue.set(this.val, key, newValue);
                this.$emit('edited', this.val);
            },

            addValue: function(){
                let x = JSON.parse(JSON.stringify(this.val));
                if (!Array.isArray(this.defaults)){
                    let emptyObj = {};
                    let keys = Object.keys(this.defaults);
                    for (let i=0; i<keys.length; i++){
                        emptyObj[keys[i]] = "";
                    }
                    x.push(emptyObj);
                }else{
                    x.push(this.defaults[0]);
                }
                Vue.set(this, 'val', x);
            },

            removeValue: function(key){
                let x = JSON.parse(JSON.stringify(this.val));
                x.splice(key,1);
                Vue.set(this, 'val', x);
                this.$emit('edited', this.val);
            }
        },

        computed: {
            displayTooltip: function(){
                let t = ''
                let translateKey = 'help.'+((this.helpPrefix) ? this.helpPrefix + '.' + this.name : this.name);
                if (this.$te(translateKey)){
                    t = this.$t(translateKey);
                }
                return marked(t);
            },

            displayLabel: function(){
                if (this.validationRules.toLowerCase().indexOf("required") >= 0) {
                    return this.$te(this.label) ? this.$tc(this.label) + '*' : this.label + '*';
                }
                return this.$te(this.label) ? this.$tc(this.label) : this.label;
            }
        },
        watch: {
            value: function (newVal) {
                this.val = JSON.parse(JSON.stringify(newVal));
            }
        },
        mounted(){
        },
    };
</script>

<style scoped>
    .inline{
        display: inline-block;
    }

</style>

<style>
    .v-input .v-label{
        height: 25px;
        font-size: 20px;
    }
</style>