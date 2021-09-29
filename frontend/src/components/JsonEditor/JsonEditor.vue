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
            <v-row v-if="stateType == 0" :key="'basicState-editing-'+reindexKey">
                <span v-if="workingVal && workingVal.resources">
                    <v-col v-for="(resource, key) in workingVal.resources" :key="'basic-resource-'+key+'-'+reindexKey" cols=12 class="field">
                        <v-row>
                            <v-text-field
                                :value="resource.path"
                                :ref="'basicField-' + key + '-path'"
                                :id="'basicField-' + key + '-path'"
                                @focus="onFocusBasic"
                                :label="$tc('Path')"
                                @input="updateResourcePath(key, $event)"
                            ></v-text-field>
                        </v-row>
                        <v-row v-for="(field, fKey) in ((resource.tableSchema && resource.tableSchema.fields) ? resource.tableSchema.fields : resource.schema.fields)" :key="'field-'+key+'-'+fKey+'-'+reindexKey" class="field">
                            <v-col cols=12>
                                <v-text-field
                                    :ref="'basicField-' + key + '-' + fKey + '-name'"
                                    :id="'basicField-' + key + '-' + fKey + '-name'"
                                    :value="field.name"
                                    @focus="onFocusBasic"
                                    :label="$tc('Name')"
                                    @input="updateResource(key, fKey, 'name', $event)"
                                >
                                </v-text-field>
                            </v-col>

                            <v-col cols=12>
                                <v-text-field
                                    :ref="'basicField-' + key + '-' + fKey + '-shortName'"
                                    :id="'basicField-' + key + '-' + fKey + '-shortName'"
                                    :value="field.shortName"
                                    @focus="onFocusBasic"
                                    :label="$tc('Short Name')"
                                    @input="updateResource(key, fKey, 'shortName', $event)"
                                >
                                </v-text-field>
                            </v-col>

                            <v-col cols=12>
                                <v-text-field
                                    :ref="'basicField-' + key + '-' + fKey + '-type'"
                                    :id="'basicField-' + key + '-' + fKey + '-type'"
                                    :value="field.type"
                                    @focus="onFocusBasic"
                                    :label="$tc('Type')"
                                    @input="updateResource(key, fKey, 'type', $event)"
                                >
                                </v-text-field>
                            </v-col>

                            <v-col cols=12>
                                <v-text-field
                                    :ref="'basicField-' + key + '-' + fKey + '-description'"
                                    :id="'basicField-' + key + '-' + fKey + '-description'"
                                    :value="field.description"
                                    @focus="onFocusBasic"
                                    :label="$tc('Description')"
                                    @input="updateResource(key, fKey, 'description', $event)"
                                >
                                </v-text-field>
                            </v-col>

                            <v-col cols=12>
                                <v-text-field
                                    :ref="'basicField-' + key + '-' + fKey + '-format'"
                                    :id="'basicField-' + key + '-' + fKey + '-format'"
                                    :value="field.format"
                                    @focus="onFocusBasic"
                                    :label="$tc('Format')"
                                    @input="updateResource(key, fKey, 'format', $event)"
                                >
                                </v-text-field>
                            </v-col>

                            <v-col cols=12>
                                <v-text-field
                                    :ref="'basicField-' + key + '-' + fKey + '-var_class'"
                                    :id="'basicField-' + key + '-' + fKey + '-var_class'"
                                    :value="field.var_class"
                                    @focus="onFocusBasic"
                                    :label="$tc('Var Class')"
                                    @input="updateResource(key, fKey, 'var_class', $event)"
                                >
                                </v-text-field>
                            </v-col>

                            <v-col cols=12>
                                <v-text-field
                                    :ref="'basicField-' + key + '-' + fKey + '-rdfType'"
                                    :id="'basicField-' + key + '-' + fKey + '-rdfType'"
                                    :value="field.rdfType"
                                    @focus="onFocusBasic"
                                    :label="$tc('RDF Type')"
                                    @input="updateResource(key, fKey, 'rdfType', $event)"
                                >
                                </v-text-field>
                            </v-col>

                            <v-col cols=12>
                                <v-text-field
                                    :ref="'basicField-' + key + '-' + fKey + '-tags'"
                                    :id="'basicField-' + key + '-' + fKey + '-tags'"
                                    :value="field.tags"
                                    @focus="onFocusBasic"
                                    :label="$tc('Tags', 2)"
                                    @input="updateResource(key, fKey, 'tags', $event)"
                                >
                                </v-text-field>
                            </v-col>

                            <v-col cols=12>
                                <v-text-field
                                    :ref="'basicField-' + key + '-' + fKey + '-comments'"
                                    :id="'basicField-' + key + '-' + fKey + '-comments'"
                                    :value="field.comments"
                                    @focus="onFocusBasic"
                                    :label="$tc('Comments', 2)"
                                    @input="updateResource(key, fKey, 'comments', $event)"
                                >
                                </v-text-field>
                            </v-col>

                            <v-col cols=12>
                                <v-select
                                    :value="field.highlight"
                                    :label="$tc('Highlight')"
                                    :items="[ {text: 'Yes', value: true}, {text: 'No', value: false}]"
                                    @input="updateResource(key, fKey, 'highlight', $event)"
                                >
                                </v-select>
                            </v-col>

                            <v-col cols=11>
                            </v-col>

                            <v-col cols=1>
                                <v-btn class="error" @click="removeField(key, fKey)"><v-icon>mdi-minus</v-icon></v-btn>
                            </v-col>

                        </v-row>
                        <v-row>
                            <v-col cols=10>
                            </v-col>

                            <v-col cols=2>
                                <v-btn class="primary" @click="addField(key)">{{$tc('Add Field')}}<v-icon>mdi-plus</v-icon></v-btn>
                            </v-col>
                        </v-row>
                    </v-col>
                </span>
                <v-btn class="primary" @click="addResource">{{$tc('Add File/Resource')}}</v-btn>
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
                                {{$tc('Type')}}:
                            </v-col>
                            <v-col cols=9>
                                {{field.type ? field.type : field._descriptor.type}}
                            </v-col>
                        </v-row>

                        <v-row v-if="field && (field.description || (field._descriptor && field._descriptor.description))">
                            <v-col cols=3>
                                {{$tc('Description')}}:
                            </v-col>
                            <v-col cols=9>
                                {{field.description ? field.description : field._descriptor.description}}
                            </v-col>
                        </v-row>

                        <v-row v-if="field && (field.example || (field._descriptor && field._descriptor.example))">
                            <v-col cols=3>
                                {{$tc('Example')}}:
                            </v-col>
                            <v-col cols=9>
                                {{field.example ? field.example : field._descriptor.example}}
                            </v-col>
                        </v-row>

                        <v-row v-if="field && (field.constraints || (field._descriptor && field._descriptor.constraints))">
                            <v-col cols=3>
                                {{$tc('Constraint', 2)}}:
                            </v-col>
                            <v-col cols=9>
                                {{field.constraints ? field.constraints : field._descriptor.constraints}}
                            </v-col>
                        </v-row>

                        <v-row v-if="field && (field.format || (field._descriptor && field._descriptor.format))">
                            <v-col cols=3>
                                {{$tc('Format')}}:
                            </v-col>
                            <v-col cols=9>
                                {{field.format ? field.format : field._descriptor.format}}
                            </v-col>
                        </v-row>

                        <v-row v-if="field && (field.missingValues || (field._descriptor && field._descriptor._missingValues))">
                            <v-col cols=3>
                                {{$tc('Missing Value', 2)}}:
                            </v-col>
                            <v-col cols=9>
                                {{field.missingValues ? field.missingValues : field._descriptor._missingValues}}
                            </v-col>
                        </v-row>
                    </div>
                </v-col>

                <v-col cols=12 v-else-if="resources && resources[0]">
                    <v-row v-for="(resource, key) in resources" :key="'resources'+key">
                        <v-col cols=12>
                            <h1>{{$tc('Resource')}} {{resource.name}}</h1>
                        </v-col>
                        <v-col cols=12 v-if="(resource.schema && resource.schema.fields) || (resource.tableSchema && resource.tableSchema.fields)">
                            <div v-for="(field, key) in ((resource.tableSchema && resource.tableSchema.fields) ? resource.tableSchema.fields : resource.schema.fields)" :key="'field-'+key+'-'+field.name" :class="`field${field.highlight ? ' fieldHighlight' : ''}`">
                                <v-row v-if="field && field.name" class="my-0">
                                    <!-- <v-col cols=3>
                                        Name:
                                    </v-col> -->
                                    <v-col cols=9>
                                        <h3>{{field.name}}</h3>
                                    </v-col>
                                </v-row>

                                <v-row v-if="field && (field.shortName || (field._descriptor && field._descriptor.shortName))" class="my-0">
                                    <v-col cols=3>
                                        {{$tc('Short Name')}}:
                                    </v-col>
                                    <v-col cols=9>
                                        {{field.shortName ? field.shortName : field._descriptor.shortName}}
                                    </v-col>
                                </v-row>

                                <v-row v-if="field && (field.type || (field._descriptor && field._descriptor.type))" class="my-0">
                                    <v-col cols=3>
                                        {{$tc('Type')}}:
                                    </v-col>
                                    <v-col cols=9>
                                        {{field.type ? field.type : field._descriptor.type}}
                                    </v-col>
                                </v-row>

                                <v-row v-if="field && (field.description || (field._descriptor && field._descriptor.description))" class="my-0">
                                    <v-col cols=3>
                                        {{$tc('Description')}}:
                                    </v-col>
                                    <v-col cols=9>
                                        {{field.description ? field.description : field._descriptor.description}}
                                    </v-col>
                                </v-row>

                                <v-row v-if="field && (field.example || (field._descriptor && field._descriptor.example))" class="my-0">
                                    <v-col cols=3>
                                        {{$tc('Example')}}:
                                    </v-col>
                                    <v-col cols=9>
                                        {{field.example ? field.example : field._descriptor.example}}
                                    </v-col>
                                </v-row>

                                <v-row v-if="field && (field.constraints || (field._descriptor && field._descriptor.constraints))" class="my-0">
                                    <v-col cols=3>
                                        {{$tc('Constraint', 2)}}:
                                    </v-col>
                                    <v-col cols=9>
                                        {{field.constraints ? field.constraints : field._descriptor.constraints}}
                                    </v-col>
                                </v-row>

                                <v-row 
                                    v-if="field 
                                        && (field.format || (field._descriptor && field._descriptor.format))
                                        && ( (field.format && field.format !== 'default') || ((field._descriptor && field._descriptor.format && field._descriptor.format !== 'default')) )" class="my-0">
                                    <v-col cols=3>
                                        {{$tc('Format')}}:
                                    </v-col>
                                    <v-col cols=9>
                                        {{field.format ? field.format : field._descriptor.format}}
                                    </v-col>
                                </v-row>

                                <v-row v-if="field && (field.rdfType || (field._descriptor && field._descriptor.rdfType))" class="my-0">
                                    <v-col cols=3>
                                        {{$tc('RDF Type')}}:
                                    </v-col>
                                    <v-col cols=9>
                                        {{field.rdfType ? field.rdfType : field._descriptor.rdfType}}
                                    </v-col>
                                </v-row>

                                <v-row v-if="field && (field.tags || (field._descriptor && field._descriptor.tags))" class="my-0">
                                    <v-col cols=3>
                                        {{$tc('Tags', 2)}}:
                                    </v-col>
                                    <v-col cols=9>
                                        {{field.tags ? field.tags : field._descriptor.tags}}
                                    </v-col>
                                </v-row>

                                <v-row v-if="field && (field.missingValues || (field._descriptor && field._descriptor._missingValues))" class="my-0">
                                    <v-col cols=3>
                                        {{$tc('Missing Value', 2)}}:
                                    </v-col>
                                    <v-col cols=9>
                                        {{field.missingValues ? field.missingValues : field._descriptor._missingValues}}
                                    </v-col>
                                </v-row>

                                <v-row v-if="field && (field.comments || (field._descriptor && field._descriptor.comments))" class="my-0">
                                    <v-col cols=3>
                                        {{$tc('Comments', 2)}}:
                                    </v-col>
                                    <v-col cols=9>
                                        {{field.comments ? field.comments : field._descriptor.comments}}
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
import Vue from 'vue';
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
        },
        stateTypeParent: {
            type: Number,
            required: false,
            default: 1,
        },
        focusProp: {
            type: String,
            required: false,
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
                    this.$tc('Basic'),
                    this.$tc('Advanced'),
                    this.$tc('Raw'),
                ];
            }else{
                return [
                    this.$tc('Basic'),
                    // this.$tc('Advanced'),
                    this.$tc('Raw'),
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
            if (!this.workingVal){
                this.workingVal = {};
            }
            
            if (!this.workingVal.resources){
                this.workingVal.resources = [];
            }

            if (this.workingVal.resources.length == 0){
                this.workingVal.resources.push({
                    tableSchema: {}
                }); 
            }

            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);   
        },

        removeField: function(key, fKey){
            if (this.workingVal.resources[key].tableSchema.fields){
                Vue.delete(this.workingVal.resources[key].tableSchema.fields, fKey);
            }else{
                Vue.delete(this.workingVal.resources[key].schema.fields, fKey);
            }
            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.reindexKey++;
            this.$forceUpdate();
            this.$emit('edited', this.workingVal);
            
        },



        addField: function(key){
            if (this.workingVal.resources[key].tableSchema && this.workingVal.resources[key].tableSchema.fields){
                this.workingVal.resources[key].tableSchema.fields.push({
                    name: "",
                    type: "",
                    rdfType: "",
                    var_class: "",
                    format: "",
                });
            }else{
                this.workingVal.resources[key].schema.fields.push({
                    name: "",
                    type: "",
                    rdfType: "",
                    var_class: "",
                    format: "",
                });
            }
            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);
        },

        updateResourcePath: function(key, newValue){
            this.workingVal.resources[key] = newValue;
            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);
        },

        updateResource: function(key, fieldKey, path, value){
            if (this.workingVal.resources[key].schema && this.workingVal.resources[key].schema.fields){
                this.workingVal.resources[key].schema.fields[fieldKey][path] = value;
            }else{
                this.workingVal.resources[key].tableSchema.fields[fieldKey][path] = value;
            }
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
                this.errorText = this.$tc("Invalid") + " " +  this.$tc("JSON")
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
        },

        onFocusBasic: function(event){
            this.focus = event.target.id
            this.$emit("focus", this.focus);
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
            stateType: this.stateTypeParent
        };
    },

    mounted(){
        this.workingVal = this.val;
        this.stateType = this.stateTypeParent;
        this.workingStr = JSON.stringify(this.val, this.replacerFunc(), 4);
        if (this.focusProp){
            this.focus = this.focusProp
            if (this.$refs[this.focus] && this.$refs[this.focus][0]){
                this.$refs[this.focus][0].focus();
            }
        }

        this.$nextTick(function () {
            if (this.$refs[this.focus] && this.$refs[this.focus][0]){
                this.$refs[this.focus][0].focus();
            }
        });
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
        padding-bottom: 10px;
    }

    .fieldHighlight{
        background: var(--v-textHighlight-base);
    }
    
    .row.my-0{
        height: 26px;
    }

</style>>
