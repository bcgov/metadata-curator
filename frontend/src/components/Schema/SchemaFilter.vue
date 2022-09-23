<template>
    <v-container class="bordered">
        <v-row>
            <v-col cols=12>
                <h3>{{$tc('Filter by')}}</h3>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols=6>
                <Select
                    :label="$tc('Var Class')"
                    placeholder=""
                    name="var_class"
                    :items="variableClassificationValues"
                    itemText="label"
                    itemValue="code"
                    :large="false"
                    :multiple="true"
                    :editing="true"
                    helpPrefix="filter"
                    @edited="(newValue) => { $emit('filter', 'var_class', newValue) }"
                ></Select>
            </v-col>
            <v-col cols=6>
                <Select
                    :label="$tc('Highlight')"
                    placeholder=""
                    name="highlight"
                    :items="[ { value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]"
                    itemText="label"
                    itemValue="value"
                    :large="false"
                    :multiple="true"
                    :editing="true"
                    helpPrefix="filter"
                    @edited="(newValue) => { highlightFilter(newValue) }"
                ></Select>
            </v-col>
            <v-col cols=6>
                <TextInput
                    :label="$tc('Field Name')"
                    placeholder=""
                    name="fieldName"
                    :large="false"
                    :editing="true"
                    helpPrefix="filter"
                    @blur="(newValue) => { fieldNameFilter(newValue) }"
                    @keydown="(event) => { fieldNameFilterOnEnter(event) }"
                ></TextInput>
            </v-col>
            <v-col cols=6>
                <Select
                    :editing="true"
                    name="tags"
                    :label="$tc('Field Tags')"
                    :value="filterTags"
                    :multiple="true"
                    @edited=" (newVal) => { tagFilter(newVal) }">
                </Select>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>

import { mapState } from 'vuex';
import Select from '../FormElements/Select';
import TextInput from '../FormElements/TextInput';

    export default {
        components:{
            Select,
            TextInput
        },
        props: {
        },
        data() {
            return {
                filterTags: '',
            }
        },
        computed: {

            ...mapState({
                variableClassification: state => state.variableClassifications.wipItem,
            }),

            variableClassificationValues: function(){
                let rv = [];
                rv.push({code: "", label: "Not classified"})
                if (this.variableClassification && this.variableClassification.values){
                    let k = Object.keys(this.variableClassification.values);
                    for (let i=0; i<k.length; i++){
                        let c = this.variableClassification.values[k[i]].code + ". " + this.variableClassification.values[k[i]].title
                        rv.push({code: c, label: c});
                    }
                }
                return rv;
            },

        },

        methods: {
            highlightFilter(newValue){
                let v = [];
                if (Array.isArray(newValue)){
                    for (let i=0; i<newValue.length; i++){
                        v[i] = (newValue[i] === 'true');
                    }
                }else{
                    v = ( (newValue === 'true') ? true : (newValue === 'false') ? false : '' );
                }
                this.$emit('filter', 'highlight', newValue);
            },

            fieldNameFilter(newValue){
                this.$emit('filter', 'name', newValue.target.value);
            },

            fieldNameFilterOnEnter(event){
                if (event.key === 'Enter' || event.keyCode === 13) {
                    this.fieldNameFilter(event);
                }
            },

            tagFilter(val){
                this.$emit('filter', 'tag', val);
            }
        },
        
        mounted(){
            
        }

    };
</script>

<style scoped>

.bordered{
    border: 1px solid;
}

</style>
