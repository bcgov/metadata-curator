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
                    v-if="!autocomplete"
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
                <v-autocomplete
                    v-else
                    :name="name"
                    v-model="val"
                    :items="displayItems"
                    :item-text="itemText"
                    :item-value="itemValue"
                    :id="idName ? idName : ''"
                    :multiple="multiple"
                    auto-select-first
                    :error-messages="errors.length > 0 ? [errors[0]] : []"
                    @change="$emit('edited', val)"
                    outlined>
                </v-autocomplete>
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
            },
            autocomplete: {
                type: Boolean,
                required: false,
                default: false,
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
                let optionFilter = this.name;
                //if items is false ALWAYS use name, otherwise use help prefix followed by name
                if ( (this.helpPrefix) && (this.items !== false) ){
                    optionFilter = this.helpPrefix + "." + this.name
                }
                let items = this.options.filter((obj) => { return obj.type.toLowerCase() === optionFilter});
                items = items.map( (obj) => { return obj.values });
                if (items.length > 0){
                    items = JSON.parse(JSON.stringify(items[0])); //can only be one match
                }else{
                    items = JSON.parse(JSON.stringify(this.items));
                }
                
                
                if (Array.isArray(items)){
                    
                    //is multiselect
                    if (Array.isArray(this.val)){
                        for (let i=0; i<this.val.length; i++){
                            let found = false;
                        
                            for (let j=0; j<items.length; j++){
                                if (items[j][this.itemValue] === this.val[i]){
                                    found = true;
                                    break;
                                }
                            }
                        
                            if (!found){
                                let item = {};
                                item[this.itemText] = this.val[i];
                                item[this.itemValue] = this.val[i];
                                items.push(item);
                            }
                        }
                    }else{
                        if (this.val){
                            let found = false;
                            for (let j=0; j<items.length; j++){
                                if (items[j][this.itemValue] === this.val){
                                    found = true;
                                    break;
                                }
                            }
                        
                            if (!found){
                                let item = {};
                                item[this.itemText] = this.val;
                                item[this.itemValue] = this.val;
                                items.push(item);
                            }
                        }
                    }

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
                }else if (this.val){
                    let item = {};
                    item[this.itemText] = this.val;
                    item[this.itemValue] = this.val;
                    return [item];
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
                
                if (this.val === null){
                    return '';
                }else if ( (Array.isArray(this.val)) && ((this.val.length === 0) || (this.val[0] === null)) ){
                    return '';
                }
                
                let displayVal = this.val;
                
                let optionFilter = this.name;
                //if items is false ALWAYS use name, otherwise use help prefix followed by name
                if ( (this.helpPrefix) && (this.items !== false) ){
                    optionFilter = this.helpPrefix + "." + this.name
                }
                let items = this.options.filter((obj) => { return obj.type.toLowerCase() === optionFilter});

                items = items.map( (obj) => { return obj.values });
                if (items.length > 0){
                    items = items[0]; //can only be one match
                }else{
                    items = this.items;
                }

                if (Array.isArray(this.val)){
                    for (let i=0; i<this.val.length; i++){
                        let found = false;
                        displayVal = (i == 0) ? "" : (displayVal + ", ");
                        for (let j=0; j<items.length; j++){
                            if (items[j][this.itemValue] === this.val[i]){
                                displayVal = items[j][this.itemText];
                                found = true;
                            }
                        }
                        if (!found){
                            displayVal += this.val[i];
                        }
                    }
                }else{
                    for (let i=0; i<items.length; i++){
                        if (items[i][this.itemValue] === this.val)
                        displayVal = items[i][this.itemText];
                    }
                }
                return displayVal;
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
