<template>
    <v-container fluid>

        <v-row v-if="error">
            <v-col cols=12>
                <v-alert class="mb-0" v-model="error" type="error" dismissible>
                    {{errorText}}
                </v-alert>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols=3>
                <v-slider
                    v-if="showStates"
                    v-model="stateType"
                    :tick-labels="stateLabels"
                    :max="2"
                    :min="stateMin"
                    step="1"
                    ticks="always"
                    tick-size="1"
                ></v-slider>
            </v-col>
        </v-row>
        <v-container v-if="editing">
            <v-row v-if="stateType == 0">
                <v-col v-for="(resource, key) in workingVal.resources[0].tableSchema.resources" :key="'basic-resource-'+key" cols=12 class="field">
                    <v-row>
                        <v-text-field
                            :value="resource.path"
                            label="Path"
                            @input="updateResourcePath(key, $event)"
                        ></v-text-field>
                    </v-row>
                    <v-row v-for="(field, fKey) in resource.schema.fields" :key="'field-'+key+'-'+fKey" class="field">
                        <v-col cols=12>
                            <v-text-field
                                :value="field.name"
                                label="Name"
                                @input="updateResource(key, fKey, 'name', $event)"
                            >
                            </v-text-field>
                        </v-col>

                        <v-col cols=12>
                            <v-text-field
                                :value="field.type"
                                label="Type"
                                @input="updateResource(key, fKey, 'type', $event)"
                            >
                            </v-text-field>
                        </v-col>

                        <v-col cols=12>
                            <v-text-field
                                :value="field.format"
                                label="Format"
                                @input="updateResource(key, fKey, 'format', $event)"
                            >
                            </v-text-field>
                        </v-col>

                        <v-col cols=12>
                            <v-text-field
                                :value="field.var_class"
                                label="Var Class"
                                @input="updateResource(key, fKey, 'var_class', $event)"
                            >
                            </v-text-field>
                        </v-col>

                        <v-col cols=12>
                            <v-text-field
                                :value="field.rdfType"
                                label="RDF Type"
                                @input="updateResource(key, fKey, 'rdfType', $event)"
                            >
                            </v-text-field>
                        </v-col>

                    </v-row>
                </v-col>
                <v-btn @click="addResource">Add File/Resource</v-btn>
            </v-row>

            <v-row v-else-if="stateType == 2">
                <v-col cols=12>
                    <v-textarea v-model="workingStr" @change="updatedStr"></v-textarea>
                </v-col>
            </v-row>

            <v-row v-else>
                <RepeatingObject 
                    :key="'rootRepeating-'+reindexKey" 
                    :val="workingVal" 
                    @update="updatedObj" 
                    :expanded="expanded" 
                    @expand="onExpand" 
                    :focus-prop="focus" 
                    :show-type-prop="showType"
                    @show-type="updateShowType"
                    self-key="_"
                    @focus="onFocus">
                </RepeatingObject>
            </v-row>

        </v-container>
        <v-container v-else>
            <v-row v-if="stateType == 2">
                <div class="preserveWhite">{{JSON.stringify(workingVal, replacerFunc(), 4)}}</div>
            </v-row>
            <v-row>
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
    </v-container>
</template>

<script>

import RepeatingObject from './RepeatingObject';

export default{
    components: {
        RepeatingObject,
    },

    props: {
        val: {
            type: Object,
            required: true,
        },
        showStates: {
            type: Boolean,
            required: false,
            default: true,
        },
        editing: {
            type: Boolean,
            required: false,
            default: true,
        }
    },

    watch: {

        stateType: function(){
            this.$emit('state', this.stateType);
        },

        editing: function(){
            if (this.editing && (this.stateType == 1)){
                this.stateType = 0;
            }else if (!this.editing && (this.stateType == 0)){
                this.stateType = 1;
            }
        }

    },

    computed: {
        stateLabels: function(){
            if (this.editing){
                return [
                    'Basic',
                    'Advanced',
                    'Raw',
                ];
            }else{
                return [
                    'Basic',
                    //'Advanced',
                    'Raw',
                ];
            }
        },

        stateMin: function(){
            return (this.editing) ? 0 : 1;
        },

        title: function(){
                if (this.workingVal && this.workingVal._currentDescriptor && this.workingVal._currentDescriptor.title){
                    return this.workingVal._currentDescriptor.title;
                }
                if (this.workingVal && this.workingVal._currentDescriptor && this.workingVal._currentDescriptor.resources){
                    if (this.workingVal._currentDescriptor.resources[0] && this.workingVal._currentDescriptor.resources[0].tableSchema && this.workingVal._currentDescriptor.resources[0].tableSchema.title){
                        return this.workingVal._currentDescriptor.resources[0].tableSchema.title;
                    }
                }
                return "";
            },

            description: function(){
                if (this.workingVal && this.workingVal._currentDescriptor && this.workingVal._currentDescriptor.description){
                    return this.workingVal._currentDescriptor.description;
                }

                if (this.workingVal && this.workingVal._currentDescriptor && this.workingVal._currentDescriptor.resources){
                    if (this.workingVal._currentDescriptor.resources[0] && this.workingVal._currentDescriptor.resources[0].tableSchema && this.workingVal._currentDescriptor.resources[0].tableSchema.description){
                        return this.workingVal._currentDescriptor.resources[0].tableSchema.description;
                    }
                }
                
                return "";
            },

            fields: function(){
                if (this.workingVal && this.workingVal._currentDescriptor && this.scworkingValhemaObj.fields){
                    return this.workingVal.fields;
                }

                if (this.workingVal && this.workingVal._currentDescriptor && this.workingVal._currentDescriptor.resources){
                    if (this.workingVal._currentDescriptor.resources[0] && this.workingVal._currentDescriptor.resources[0].tableSchema && this.workingVal._currentDescriptor.resources[0].tableSchema.fields){
                        return this.workingVal._currentDescriptor.resources[0].tableSchema.fields
                    }
                }

                return [];
            },

            resources: function(){
                if (this.workingVal && this.workingVal._currentDescriptor && this.workingVal._currentDescriptor.resources){
                    if (this.workingVal._currentDescriptor.resources[0] && this.workingVal._currentDescriptor.resources[0].tableSchema && this.workingVal._currentDescriptor.resources[0].tableSchema.resources){
                        return this.workingVal._currentDescriptor.resources[0].tableSchema.resources;
                    }
                    return this.workingVal._currentDescriptor.resources
                }else if (this.workingVal && this.workingVal.resources && this.workingVal.resources[0]){
                    if (this.workingVal.resources[0].tableSchema && this.workingVal.resources[0].tableSchema.resources){
                        return this.workingVal.resources[0].tableSchema.resources
                    }
                    return this.workingVal.resources;
                }

                return [];
            },
    },

    methods: {
        addResource: function(){
            if (!this.workingVal.resources){
                this.workingVal.resources = [];
            }

            if (this.workingVal.resources.length == 0){
                this.workingVal.resources.push({}); 
            }

            if (!this.workingVal.resources[0].tableSchema){
                this.workingVal.resources[0].tableSchema = {}
            }

            if (!this.workingVal.resources[0].tableSchema.resources){
                this.workingVal.resources[0].tableSchema.resources = []
            }

            this.workingVal.resources[0].tableSchema.resources.push({});

            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);   
        },

        updateResourcePath: function(key, newValue){
            this.workingVal.resources[0].tableSchema.resources[key] = newValue;
            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);
        },

        updateResource: function(key, fieldKey, path, value){
            this.workingVal.resources[0].tableSchema.resources[key].schema.fields[fieldKey][path] = value;
            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);
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

        updateShowType: function(newShowType){
            if (JSON.stringify(this.showType) !== JSON.stringify(newShowType)){
                this.showType = newShowType;
                this.reindexKey++;
                this.$forceUpdate();
            }
        },

        onExpand: function(expanded){
            this.expanded = expanded;
        },

        updatedStr: function(){
            try{
                let obj = JSON.parse(this.workingStr);
                this.workingVal = obj;
                this.$emit('edited', obj);
            }catch(ex){
                this.error = true;
                this.errorText = "Invalid JSON"
            }
        },

        updatedObj: function(info){
            if (typeof(info.newKey) === 'undefined'){
                
                //let k = Object.keys(this.workingVal);
                //let newKey = k.indexOf(info.key) === -1;
                this.workingVal[info.key] = info.val;
                let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
                this.workingStr = str;
                this.$emit('edited', this.workingVal);
                //if (newKey){
                    this.reindexKey++;
                    this.$forceUpdate();
                //}
            }else{
                //key updated;
                let k = Object.keys(this.workingVal);
                let ind = k.indexOf(info.key);
                
                this.workingVal[info.newKey] = this.workingVal[info.key];
                delete this.workingVal[info.key];
                
                let k2 = Object.keys(this.workingVal);
                let ind2 = k2.indexOf(info.newKey);

                let expandedK2 = this.expanded[ind2];
                this.expanded[ind2] = this.expanded[ind];
                this.expanded[ind] = expandedK2;

                let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
                this.workingStr = str;
                this.$emit("edited", this.workingVal);
                this.reindexKey++;
                this.$forceUpdate();
            }
        },

        onFocus: function(f){
            this.focus = f;
        }
    },

    data() {
        return {
            workingVal: {},
            workingStr: "",
            error: false,
            errorText: "",
            reindexKey: 0,
            expanded: {},
            focus: "",
            showType: {},
            stateType: 1
        };
    },

    mounted(){
        this.workingVal = this.val;
        this.workingStr = JSON.stringify(this.val, this.replacerFunc(), 4);
    }
}
</script>

<style scoped>

    .preserveWhite{
        white-space: pre;
    }

    .field{
        border: 1px solid;
        margin-bottom: 5px;
    }

</style>>
