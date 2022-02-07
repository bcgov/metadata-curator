<template>
    <v-container>
        <v-row>
            <v-col cols=12>
                {{$tc('Filter by')}}
            </v-col>
        </v-row>
        <v-row>
            <v-col cols=4>
                {{$tc('Var Class')}}:
            </v-col>
            <v-col cols=8>
                <Select
                    label=""
                    placeholder=""
                    name="var_class"
                    :items="variableClassificationValues"
                    itemText="code"
                    itemValue="code"
                    :large="false"

                    :editing="true"
                    helpPrefix="filter"
                    @edited="(newValue) => { $emit('filter', 'var_class', newValue) }"
                ></Select>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>

import { mapState } from 'vuex';
import Select from './Select';

    export default {
        components:{
            Select,
        },
        props: {
        },
        data() {
            return {
                
            }
        },
        computed: {

            ...mapState({
                variableClassification: state => state.variableClassifications.wipItem,
            }),

            variableClassificationValues: function(){
                let rv = [];
                if (this.variableClassification && this.variableClassification.values){
                    let k = Object.keys(this.variableClassification.values);
                    rv.push({code: ""})
                    for (let i=0; i<k.length; i++){
                        rv.push({code: this.variableClassification.values[k[i]].code + ". " + this.variableClassification.values[k[i]].title})
                    }
                }
                return rv;
            },

        },
        
        mounted(){
            
        }

    };
</script>

<style scoped>

</style>
