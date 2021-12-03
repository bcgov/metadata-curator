<template>
    <v-container v-if="loading">
        {{$tc('Loading')}}...
    </v-container>
    <v-container v-else-if="!rawSchema">
        {{$tc('No Schema found')}}
    </v-container>
    <v-container v-else fluid :key="'schemaview-'+redrawIndex">
        <v-row>
            <JsonEditor 
                :key="'jsonEditor-'+redrawIndex" 
                :val="rawSchema" 
                @edited="jsonEdited" 
                :editing="editing" 
                @state="updateJsonState" 
                :state-type-parent="jsonState"
                :focus-prop="jsonFocus"
                @focus="setJsonFocus"></JsonEditor>
        </v-row>
        
    </v-container>
</template>

<script>
import { mapState } from 'vuex';
import JsonEditor from './JsonEditor/JsonEditor';

    export default {
        components: {
            JsonEditor
        },

        props: {
            editing: {
                type: Boolean,
                required: true,
            },

            editable: {
                type: Boolean,
                default: true,
            },

            schema: {
                type: Object,
                required: true,
            }
        },
        data() {
            return {
                schemaObj: {},
                redrawIndex: 0,
                rawSchema: null,
                loading: false,
                jsonState: 0,
                jsonFocus: "",
            }
        },
        methods: {
            updateJsonState: function(state){
                this.jsonState = state;
            },

            setJsonFocus: function(f){
                this.jsonFocus = f;
            },

            computeSchema: async function(){
                this.loading = true;
                const Schema = require('tableschema').Schema;
                const DSchema = require('datapackage').Package
                if (this.schema && this.schema.resources && this.schema.resources[0] && this.schema.resources[0].schema){
                    this.rawSchema = JSON.parse(JSON.stringify(this.schema, this.replacerFunc()));
                    delete this.rawSchema._id;
                    delete this.rawSchema.profile;
                    delete this.rawSchema.__v;
                    delete this.rawSchema.version;
                    
                    this.schemaObj = await DSchema.load(this.rawSchema);
                }else if (this.schema){
                    let s = this.schema;
                    if (typeof(s) === "string"){
                        s = JSON.parse(s);
                    }
                    this.rawSchema = JSON.parse(JSON.stringify(s, this.replacerFunc()));
                    this.schemaObj = await Schema.load(s);
                }
                this.loading = false;
                this.redrawIndex++;
            },

            replacerFunc: function(){
                const visited = new WeakSet();
                return (key, value) => {
                    if (typeof value === "object" && value !== null) {
                        if (visited.has(value)) {
                            return;
                        }
                        visited.add(value);
                    }
                    return value;
                };
            },

            jsonEdited: function(newVal){
                this.rawSchema = newVal;
                // this.redrawIndex++;
                this.$emit("edited", newVal);
            }

        },
        watch: {
            schema: async function(){
                this.computeSchema();
            },

            // editing: function(){
            //     this.redrawIndex++;
            // }


        },
        computed:{
            ...mapState({
                user: state => state.user.user,
                branch: state => state.repos.branch,
                dataUploads: state => state.dataUploads.dataUploads,
            })
        },
        
        async mounted(){
            this.computeSchema();
        }

    };
</script>

<style scoped>

</style>
