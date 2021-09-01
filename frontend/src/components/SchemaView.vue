<template>
    <v-container v-if="loading">
        Loading...
    </v-container>
    <v-container v-else-if="!rawSchema">
        No Schema found
    </v-container>
    <v-container v-else fluid :key="'schemaview-'+redrawIndex">
        <v-row>
            <v-switch
                v-model="json_view"
                :label="`View Raw`"
                v-if="!editing"
            ></v-switch>`
        </v-row>
        
        <v-row v-if="editing && editable">
            <JsonEditor :val="rawSchema" @edited="jsonEdited" :show-states="editing"></JsonEditor>
        </v-row>
        
        <v-row v-else-if="json_view">
            <v-col cols=12 class="preserveWhite">
                {{JSON.stringify(schemaObj, replacerFunc(), 4)}}
            </v-col>
        </v-row>
        
        <v-row v-else>
            <v-col cols=12 v-if="title">
                <h1>{{title}}</h1>
            </v-col>
            <v-col cols=12 v-if="description">
                <h3>{{description}}</h3>
            </v-col>
            
            <v-col cols=12 v-if="fields && fields.length > 0">
                <div v-for="(field, key) in fields" :key="'field-'+key+'-'+field.name" class="field">
                    <v-row v-if="field && field.name">
                        <!-- <v-col cols=3>
                            Name:
                        </v-col> -->
                        <v-col cols=9>
                            <h2>{{field.name}}</h2>
                        </v-col>
                    </v-row>

                    <v-row v-if="field && (field.type || (field._descriptor && field._descriptor.type))">
                        <v-col cols=3>
                            Type:
                        </v-col>
                        <v-col cols=9>
                            {{field.type ? field.type : field._descriptor.type}}
                        </v-col>
                    </v-row>

                    <v-row v-if="field && (field.description || (field._descriptor && field._descriptor.description))">
                        <v-col cols=3>
                            Description:
                        </v-col>
                        <v-col cols=9>
                            {{field.description ? field.description : field._descriptor.description}}
                        </v-col>
                    </v-row>

                    <v-row v-if="field && (field.example || (field._descriptor && field._descriptor.example))">
                        <v-col cols=3>
                            Example:
                        </v-col>
                        <v-col cols=9>
                            {{field.example ? field.example : field._descriptor.example}}
                        </v-col>
                    </v-row>

                    <v-row v-if="field && (field.constraints || (field._descriptor && field._descriptor.constraints))">
                        <v-col cols=3>
                            Constraints:
                        </v-col>
                        <v-col cols=9>
                            {{field.constraints ? field.constraints : field._descriptor.constraints}}
                        </v-col>
                    </v-row>

                    <v-row v-if="field && (field.format || (field._descriptor && field._descriptor.format))">
                        <v-col cols=3>
                            Format:
                        </v-col>
                        <v-col cols=9>
                            {{field.format ? field.format : field._descriptor.format}}
                        </v-col>
                    </v-row>

                    <v-row v-if="field && (field.missingValues || (field._descriptor && field._descriptor._missingValues))">
                        <v-col cols=3>
                            Missing Values:
                        </v-col>
                        <v-col cols=9>
                            {{field.missingValues ? field.missingValues : field._descriptor._missingValues}}
                        </v-col>
                    </v-row>
                </div>
            </v-col>

            <v-col cols=12 v-else-if="resources && resources[0] && resources[0].schema && resources[0].schema.fields">
                <v-row v-for="(resource, key) in resources" :key="'resources'+key">
                    <v-col cols=12>
                        <h4>Resource {{resource.name}}</h4>
                    </v-col>
                    <v-col cols=12 v-if="resource.schema.fields">
                        <div v-for="(field, key) in resource.schema.fields" :key="'field-'+key+'-'+field.name" class="field">
                            <v-row v-if="field && field.name">
                                <!-- <v-col cols=3>
                                    Name:
                                </v-col> -->
                                <v-col cols=9>
                                    <h2>{{field.name}}</h2>
                                </v-col>
                            </v-row>

                            <v-row v-if="field && (field.type || (field._descriptor && field._descriptor.type))">
                                <v-col cols=3>
                                    Type:
                                </v-col>
                                <v-col cols=9>
                                    {{field.type ? field.type : field._descriptor.type}}
                                </v-col>
                            </v-row>

                            <v-row v-if="field && (field.description || (field._descriptor && field._descriptor.description))">
                                <v-col cols=3>
                                    Description:
                                </v-col>
                                <v-col cols=9>
                                    {{field.description ? field.description : field._descriptor.description}}
                                </v-col>
                            </v-row>

                            <v-row v-if="field && (field.example || (field._descriptor && field._descriptor.example))">
                                <v-col cols=3>
                                    Example:
                                </v-col>
                                <v-col cols=9>
                                    {{field.example ? field.example : field._descriptor.example}}
                                </v-col>
                            </v-row>

                            <v-row v-if="field && (field.constraints || (field._descriptor && field._descriptor.constraints))">
                                <v-col cols=3>
                                    Constraints:
                                </v-col>
                                <v-col cols=9>
                                    {{field.constraints ? field.constraints : field._descriptor.constraints}}
                                </v-col>
                            </v-row>

                            <v-row v-if="field && (field.format || (field._descriptor && field._descriptor.format))">
                                <v-col cols=3>
                                    Format:
                                </v-col>
                                <v-col cols=9>
                                    {{field.format ? field.format : field._descriptor.format}}
                                </v-col>
                            </v-row>

                            <v-row v-if="field && (field.missingValues || (field._descriptor && field._descriptor._missingValues))">
                                <v-col cols=3>
                                    Missing Values:
                                </v-col>
                                <v-col cols=9>
                                    {{field.missingValues ? field.missingValues : field._descriptor._missingValues}}
                                </v-col>
                            </v-row>
                        </div>
                    </v-col>
                </v-row>
            </v-col>
                
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
            }
        },
        data() {
            return {
                json_view: false,
                schemaObj: {},
                redrawIndex: 0,
                rawSchema: null,
                loading: false,
            }
        },
        methods: {
            computeSchema: async function(){
                this.loading = true;
                const Schema = require('tableschema').Schema;
                const DSchema = require('datapackage').Package
                if (this.schema && this.schema.resources && this.schema.resources[0] && this.schema.resources[0].tableSchema){
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
            },

            replacerFunc: function(){
                const visited = new WeakSet();
                return (key, value) => {
                    if (typeof value === "object" && value !== null) {
                        if (visited.has(value)) {
                            console.log("Replacing key", key);
                            return;
                        }
                        visited.add(value);
                    }
                    return value;
                };
            },

            jsonEdited: function(newVal){
                this.rawSchema = newVal;
                
                this.$emit("edited", newVal);
            }

        },
        watch: {
            schema: async function(){
                this.computeSchema();
            },

            editing: function(){
                this.redrawIndex++;
            }


        },
        computed:{
            ...mapState({
                user: state => state.user.user,
                branch: state => state.repos.branch,
                dataUploads: state => state.dataUploads.dataUploads,
                schema: state => state.schemaImport.tableSchema,
            }),

            title: function(){
                if (this.schemaObj && this.schemaObj._currentDescriptor && this.schemaObj._currentDescriptor.title){
                    return this.schemaObj._currentDescriptor.title;
                }
                if (this.schemaObj && this.schemaObj._currentDescriptor && this.schemaObj._currentDescriptor.resources){
                    if (this.schemaObj._currentDescriptor.resources[0] && this.schemaObj._currentDescriptor.resources[0].tableSchema && this.schemaObj._currentDescriptor.resources[0].tableSchema.title){
                        return this.schemaObj._currentDescriptor.resources[0].tableSchema.title;
                    }
                }
                return "";
            },

            description: function(){
                if (this.schemaObj && this.schemaObj._currentDescriptor && this.schemaObj._currentDescriptor.description){
                    return this.schemaObj._currentDescriptor.description;
                }

                if (this.schemaObj && this.schemaObj._currentDescriptor && this.schemaObj._currentDescriptor.resources){
                    if (this.schemaObj._currentDescriptor.resources[0] && this.schemaObj._currentDescriptor.resources[0].tableSchema && this.schemaObj._currentDescriptor.resources[0].tableSchema.description){
                        return this.schemaObj._currentDescriptor.resources[0].tableSchema.description;
                    }
                }
                
                return "";
            },

            fields: function(){
                if (this.schemaObj && this.schemaObj._currentDescriptor && this.schemaObj.fields){
                    return this.schemaObj.fields;
                }

                if (this.schemaObj && this.schemaObj._currentDescriptor && this.schemaObj._currentDescriptor.resources){
                    if (this.schemaObj._currentDescriptor.resources[0] && this.schemaObj._currentDescriptor.resources[0].tableSchema && this.schemaObj._currentDescriptor.resources[0].tableSchema.fields){
                        return this.schemaObj._currentDescriptor.resources[0].tableSchema.fields
                    }
                }

                return [];
            },

            resources: function(){
                if (this.schemaObj && this.schemaObj._currentDescriptor && this.schemaObj._currentDescriptor.resources){
                    if (this.schemaObj._currentDescriptor.resources[0] && this.schemaObj._currentDescriptor.resources[0].tableSchema && this.schemaObj._currentDescriptor.resources[0].tableSchema.resources){
                        return this.schemaObj._currentDescriptor.resources[0].tableSchema.resources;
                    }
                    return this.schemaObj._currentDescriptor.resources
                }
                return [];
            },
        },
        
        async mounted(){
            this.computeSchema();
        }

    };
</script>

<style scoped>
    .preserveWhite{
        white-space: pre;
    }

    .field{
        border: 1px solid;
        margin-bottom: 5px;
    }
</style>
