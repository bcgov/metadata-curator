<template>
    <v-container fluid :key="'composite-'+name+'-'+redrawIndex">
        <v-row>
            <v-col cols=12 v-for="(innerVal, key) in val" :key="'composite-'+name+'-'+key">
                <DateInput
                    v-if="eval(renderTypes[key]) === 'DateInput'"
                    :label="label[key]"
                    :placeholder="placeholder[key]"
                    :name="name+'.'+key"
                    :editing="editing"
                    :helpPrefix="helpPrefix"
                    :value="innerVal"
                    :large="large"
                    :validation-rules="(validationRules && validationRules[key]) ? validationRules[key] : ''"
                    @edited="(newValue) => { updateVal(key, newValue) }">
                </DateInput>
                <Select
                    v-else-if="eval(renderTypes[key]) === 'Select'"
                    :label="label[key]"
                    :placeholder="placeholder[key]"
                    :name="name+'.'+key"
                    :large="large"
                    :items="items[key]"
                    :editing="editing"
                    :value="innerVal"
                    :helpPrefix="helpPrefix"
                    :validation-rules="(validationRules && validationRules[key]) ? validationRules[key] : ''"
                    @edited="(newValue) => { updateVal(key, newValue) }"
                ></Select>
                <TextInput
                    v-else
                    :label="label[key]"
                    :placeholder="placeholder[key]"
                    :name="name+'.'+key"
                    :large="large"
                    :editing="editing"
                    :value="innerVal"
                    :helpPrefix="helpPrefix"
                    :validation-rules="(validationRules && validationRules[key]) ? validationRules[key] : ''"
                    @blur="(newValue) => { updateVal(key, newValue.target.value) }"
                ></TextInput>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import Vue from 'vue';
    
    import DateInput from './DateInput';
    import TextInput from './TextInput';
    import Select from './Select';

    export default {
        components: {
            TextInput,
            DateInput,
            Select
        },

        props: {
            name: {
                type: String,
                required: true,
                default: () => ''
            },
            label: {
                type: Object,
                required: true,
                default: () => ''
            },
            placeholder: {
                type: Object,
                required: false,
                default: () => ''
            },
            validationRules: {
                type: Object,
                required: false,
                default: () => {}
            },
            value: {
                type: Object,
                required: false,
                default: () => ''
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
            schema: {
                type: Object,
                required: true,
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
            }
            
        },
        data() {
            let emptyObj = {}
            let modifiedVal = {}
            if (this.schema){
                let keys = Object.keys(this.schema);
                for (let i=0; i<keys.length; i++){
                    emptyObj[keys[i]] = null;
                    modifiedVal[keys[i]] = (this.value && this.value[keys[i]]) ? this.value[keys[i]] : null;
                }
            }
            
            return {
                val: (this.value && Object.keys(this.value).length>0) ? modifiedVal : emptyObj,
                showTooltip: false,
                closeOnLeave: true,
                redrawIndex: 0
            }
        },
        methods: {

            updateVal: function(key, newValue){
                Vue.set(this.val, key, newValue);
                if (this.conditions){
                    this.redrawIndex++;
                }
                this.$emit('edited', this.val);
            },

            eval: function(snip){
                //eslint-disable-next-line
                var val = this.val;
                try{
                    return eval(snip);
                }catch(ex){
                    return snip;
                }
            }

        },

        computed: {
            //schema is like {name: "hi", age: 7}
            renderTypes: function(){
                let rv = {};
                let keys = Object.keys(this.schema);
                for (let i=0; i<keys.length; i++){
                    rv[keys[i]] = "TextInput";
                    // if (Array.isArray(this.schema[keys[i]])){
                        // rv[keys[i]] = "Repeating"; //unsupported
                    // }else if(typeof(this.schema[keys[i]] === 'string')){
                        // rv[keys[i]] = "TextInput";
                    // }else if(typeof(this.schema[keys[i]] === 'number')){
                        // rv[keys[i]] = "TextInput";
                    if (this.items && typeof(this.items[keys[i]]) === 'object'){
                        rv[keys[i]] = "Select"
                    }else if (this.conditions && typeof(this.conditions[keys[i]]) === 'string'){
                        rv[keys[i]] = this.conditions[keys[i]];
                    }else if (typeof(this.schema[keys[i]]) === 'object'){
                        if (this.schema[keys[i]] instanceof Date){
                            rv[keys[i]] = "DateInput"
                        }
                    }else if (typeof(this.schema[keys[i]]) === 'boolean'){
                        rv[keys[i]] = "DateInput"
                    }
                }
                return rv;
            }
        },

        watch: {
            value: function (newVal) {
                let emptyObj = {}
                let modifiedVal = {}
                if (this.schema){
                    let keys = Object.keys(this.schema);
                    for (let i=0; i<keys.length; i++){
                        emptyObj[keys[i]] = null;
                        modifiedVal[keys[i]] = (this.value && this.value[keys[i]]) ? this.value[keys[i]] : null;
                    }
                }
                this.val = (newVal && Object.keys(newVal).length>0) ? modifiedVal : emptyObj;
            },
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