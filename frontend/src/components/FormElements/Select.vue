<template>
    <div>
         <span v-if="!editing">
             <h2 v-if="large" class="mr-2">
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
            <span v-else class="mr-2">
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
            <h2 v-if="large" :id="idName ? idName : (name+'-value')">{{displayVal}}</h2>
            <span v-else :id="idName ? idName : (name+'-value')">{{displayVal}}</span>
        </span>

        <span v-else :id="(idName ? idName : 'name')+'-span'">
            <ValidationProvider :rules="validationRules" v-slot="{ errors }" :name="label ? ($te(label) ? $tc(label) : label) : ($te(name) ? $tc(name) : name)">
                <v-select
                    :name="name"
                    v-model="val"
                    :items="displayItems"
                    :item-text="itemText"
                    :item-value="itemValue"
                    :id="idName ? idName : ''"
                    :multiple="multiple"
                    :error-messages="errors.length > 0 ? [errors[0]] : []"
                    @change="$emit('edited', val)"
                    outlined
                >
                    <template v-slot:prepend>
                        {{displayLabel}}&nbsp;
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
                    </template>
                </v-select>
            </ValidationProvider>
        </span>
    </div>
</template>

<script>

    import { mapState, mapActions } from 'vuex';

    import ValidationRules from "../../mixins/ValidationRules";
    let marked = require('marked');

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
                type: [Array, Boolean],
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
                type: [String, Boolean, Array],
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
            multiple: {
                type: Boolean,
                required: false,
                default: false,
            },
            sorted: {
                type: Boolean,
                required: false,
                default: true
            }

        },
        data() {
            return {
                val: null,
                showTooltip: false,
                closeOnLeave: true,
            }
        },

        methods: {
            ...mapActions({
                getOptions: 'options/getOptions', 
            }),
        },
        
        computed: {
            ...mapState({
                options: state => state.options.options,
            }),
            displayTooltip: function(){
                let t = ''
                let translateKey = 'help.'+((this.helpPrefix) ? this.helpPrefix + '.' + this.name : this.name);
                if (this.$te(translateKey)){
                    t = this.$t(translateKey);
                }
                return marked(t);
            },

            displayItems: function(){
                let items = this.options.filter((obj) => { return obj.type.toLowerCase() === this.name.toLowerCase()});
                items = items.map( (obj) => { return obj.values });
                if (items.length >= 0){
                    items = items[0]; //can only be one match
                }else{
                    items = this.items;
                }
                
                if (Array.isArray(items)){
                    let rv = JSON.parse(JSON.stringify(items));
                    if (this.sorted){
                        
                        rv.sort( (a,b) => {
                            if (!a[this.itemText] || !b[this.itemText]){
                                return 0;
                            }
                            return a[this.itemText].localeCompare(b[this.itemText]);
                        });
                        
                    }
                    return rv;
                }
                return [];
            },

            displayLabel: function () {
                if (this.validationRules.toLowerCase().indexOf("required") >= 0) {
                    return this.label + '*';
                }
                return this.label;
            },

            displayVal: function(){
                
                let displayVal = this.val;
                
                let items = this.options.filter((obj) => { return obj.type.toLowerCase() === this.name.toLowerCase()});
                items = items.map( (obj) => { return obj.values });
                if (items.length >= 0){
                    items = items[0]; //can only be one match
                }else{
                    items = this.items;
                }
                
                for (let i=0; i<items.length; i++){
                    if (items[i][this.itemValue] === this.val){
                        displayVal = items[i][this.itemText];
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

        async mounted(){
            await this.getOptions({/*type: this.filterBy,*/ refresh: false});
            this.val = this.value;
        }

    };
</script>

<style>

</style>
