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
                            <TextInput
                                :label="$tc('Name')"
                                placeholder=""
                                name="name"
                                :refName="'basicField-' + key + '-name'"
                                :idName="'basicField-' + key + '-name'"
                                :large="true"
                                :editing="true"
                                :value="resource.name"
                                helpPrefix="schema"
                                :focusField="focusProp"
                                @focus="onFocusBasic"
                                @edited="(newValue) => { updateResourceName(key, newValue) }"
                            ></TextInput>
                           
                        </v-row>
                        <v-row>
                            <TextInput
                                :label="$tc('Path')"
                                placeholder=""
                                name="path"
                                :refName="'basicField-' + key + '-path'"
                                :idName="'basicField-' + key + '-path'"
                                :large="true"
                                :editing="true"
                                :value="resource.path"
                                helpPrefix="schema"
                                :focusField="focusProp"
                                @focus="onFocusBasic"
                                @edited="(newValue) => { updateResourcePath(key, newValue) }"
                            ></TextInput>
                           
                        </v-row>
                        <span v-if="resource.schema && resource.schema.fields">
                            <v-row v-for="(field, fKey) in resource.schema.fields" :key="'field-'+key+'-'+fKey+'-'+reindexKey" class="field">
                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Name')"
                                        placeholder=""
                                        name="name"
                                        :refName="'basicField-' + key + '-' + fKey + '-name'"
                                        :idName="'basicField-' + key + '-' + fKey + '-name'"
                                        :large="true"
                                        :editing="true"
                                        :value="field.name"
                                        helpPrefix="schema"
                                        :focusField="focusProp"
                                        @edited="(newValue) => { updateResource(key, fKey, 'name', newValue) }"
                                        
                                        @focus="onFocusBasic"
                                        
                                    ></TextInput>
                                </v-col>

                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Title')"
                                        placeholder=""
                                        name="title"
                                        :refName="'basicField-' + key + '-' + fKey + '-title'"
                                        :idName="'basicField-' + key + '-' + fKey + '-title'"
                                        :large="true"
                                        :editing="true"
                                        :value="field.title"
                                        helpPrefix="schema"
                                        :focusField="focusProp"
                                        @focus="onFocusBasic"
                                        @edited="(newValue) => { updateResource(key, fKey, 'title', newValue) }"
                                    ></TextInput>
                                </v-col>

                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Short Name')"
                                        placeholder=""
                                        name="shortName"
                                        :refName="'basicField-' + key + '-' + fKey + '-shortName'"
                                        :idName="'basicField-' + key + '-' + fKey + '-shortName'"
                                        :large="true"
                                        :editing="true"
                                        :value="field.shortName"
                                        helpPrefix="schema"
                                        :focusField="focusProp"
                                        @focus="onFocusBasic"
                                        @edited="(newValue) => { updateResource(key, fKey, 'shortName', newValue) }"
                                    ></TextInput>
                                </v-col>

                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Type')"
                                        placeholder=""
                                        name="type"
                                        :refName="'basicField-' + key + '-' + fKey + '-type'"
                                        :idName="'basicField-' + key + '-' + fKey + '-type'"
                                        :large="true"
                                        :editing="true"
                                        :value="field.type"
                                        helpPrefix="schema"
                                        :focusField="focusProp"
                                        @focus="onFocusBasic"
                                        @edited="(newValue) => { updateResource(key, fKey, 'type', newValue) }"
                                    ></TextInput>
                                </v-col>

                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Description')"
                                        placeholder=""
                                        name="description"
                                        :refName="'basicField-' + key + '-' + fKey + '-description'"
                                        :idName="'basicField-' + key + '-' + fKey + '-description'"
                                        :large="true"
                                        :editing="true"
                                        :value="field.description"
                                        helpPrefix="schema"
                                        :focusField="focusProp"
                                        @focus="onFocusBasic"
                                        @edited="(newValue) => { updateResource(key, fKey, 'description', newValue) }"
                                    ></TextInput>
                                </v-col>

                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Format')"
                                        placeholder=""
                                        name="format"
                                        :refName="'basicField-' + key + '-' + fKey + '-format'"
                                        :idName="'basicField-' + key + '-' + fKey + '-format'"
                                        :large="true"
                                        :editing="true"
                                        :value="field.format"
                                        helpPrefix="schema"
                                        :focusField="focusProp"
                                        @focus="onFocusBasic"
                                        @edited="(newValue) => { updateResource(key, fKey, 'format', newValue) }"
                                    ></TextInput>
                                </v-col>

                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Var Class')"
                                        placeholder=""
                                        name="var_class"
                                        :refName="'basicField-' + key + '-' + fKey + '-var_class'"
                                        :idName="'basicField-' + key + '-' + fKey + '-var_class'"
                                        :large="true"
                                        :editing="true"
                                        :value="field.var_class"
                                        helpPrefix="schema"
                                        :focusField="focusProp"
                                        @focus="onFocusBasic"
                                        @edited="(newValue) => { updateResource(key, fKey, 'var_class', newValue) }"
                                    ></TextInput>
                                </v-col>

                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('RDF Type')"
                                        placeholder=""
                                        name="rdfType"
                                        :refName="'basicField-' + key + '-' + fKey + '-rdfType'"
                                        :idName="'basicField-' + key + '-' + fKey + '-rdfType'"
                                        :large="true"
                                        :editing="true"
                                        :value="field.rdfType"
                                        helpPrefix="schema"
                                        :focusField="focusProp"
                                        @focus="onFocusBasic"
                                        @edited="(newValue) => { updateResource(key, fKey, 'rdfType', newValue) }"
                                    ></TextInput>
                                </v-col>

                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Tags', 2)"
                                        placeholder=""
                                        name="tags"
                                        :refName="'basicField-' + key + '-' + fKey + '-tags'"
                                        :idName="'basicField-' + key + '-' + fKey + '-tags'"
                                        :large="true"
                                        :editing="true"
                                        :value="field.tags"
                                        helpPrefix="schema"
                                        :focusField="focusProp"
                                        @focus="onFocusBasic"
                                        @edited="(newValue) => { updateResource(key, fKey, 'tags', newValue) }"
                                    ></TextInput>
                                </v-col>

                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Comments', 2)"
                                        placeholder=""
                                        name="comments"
                                        :refName="'basicField-' + key + '-' + fKey + '-comments'"
                                        :idName="'basicField-' + key + '-' + fKey + '-comments'"
                                        :large="true"
                                        :editing="true"
                                        :value="field.comments"
                                        helpPrefix="schema"
                                        :focusField="focusProp"
                                        @focus="onFocusBasic"
                                        @edited="(newValue) => { updateResource(key, fKey, 'comments', newValue) }"
                                    ></TextInput>
                                </v-col>

                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Enum', 1)"
                                        placeholder=""
                                        name="enum"
                                        :refName="'basicField-' + key + '-' + fKey + '-enum'"
                                        :idName="'basicField-' + key + '-' + fKey + '-enum'"
                                        :large="true"
                                        :editing="true"
                                        :value="(field.constraints && field.constraints.enum) ? field.constraints.enum : ''"
                                        helpPrefix="schema"
                                        :focusField="focusProp"
                                        @focus="onFocusBasic"
                                        @edited="(newValue) => { updateResourceEnum(key, fKey, 'constraints', 'enum', newValue) }"
                                    ></TextInput>
                                </v-col>

                                <v-col cols=12>
                                    <Select
                                        :label="$tc('Highlight')"
                                        name="highlight"
                                        :editing="true"
                                        :value="field.highlight"
                                        :items="[ {text: 'Yes', value: true}, {text: 'No', value: false}]"
                                        helpPrefix="schema"
                                        @edited="(newValue) => { updateResource(key, fKey, 'highlight', newValue) }"
                                    ></Select>
                                </v-col>

                                <v-col cols=11>
                                </v-col>

                                <v-col cols=1>
                                    <v-btn class="error" @click="removeField(key, fKey)"><v-icon>mdi-minus</v-icon></v-btn>
                                </v-col>

                            </v-row>
                        </span>
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

                        <!-- <v-row v-if="field && (field.constraints || (field._descriptor && field._descriptor.constraints))">
                            <v-col cols=3>
                                {{$tc('Constraint', 2)}}:
                            </v-col>
                            <v-col cols=9>
                                {{field.constraints ? field.constraints : field._descriptor.constraints}}
                            </v-col>
                        </v-row> -->

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
                        <v-col cols=12 v-if="(resource.schema && resource.schema.fields)">
                            <div v-for="(field, key) in resource.schema.fields" :key="'field-'+key+'-'+field.name" :class="`field${field.highlight ? ' fieldHighlight' : ''}`">
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

                                <v-row v-if="field && (field.title || (field._descriptor && field._descriptor.title))" class="my-0">
                                    <v-col cols=3>
                                        {{$tc('Title')}}:
                                    </v-col>
                                    <v-col cols=9>
                                        {{field.title ? field.title : field._descriptor.title}}
                                    </v-col>
                                </v-row>

                                <v-row v-if="field && (field.var_class || (field._descriptor && field._descriptor.var_class))" class="my-0">
                                    <v-col cols=3>
                                        {{$tc('Var Class')}}:
                                    </v-col>
                                    <v-col cols=9>
                                        {{field.var_class ? field.var_class : field._descriptor.var_class}}
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

                                <!-- <v-row v-if="field && (field.constraints || (field._descriptor && field._descriptor.constraints))" class="my-0">
                                    <v-col cols=3>
                                        {{$tc('Constraint', 2)}}:
                                    </v-col>
                                    <v-col cols=9>
                                        {{field.constraints ? field.constraints : field._descriptor.constraints}}
                                    </v-col>
                                </v-row> -->

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

                                <v-row v-if="field && ((field.constraints && field.constraints.enum) || (field._descriptor && field._descriptor.contsraints && field._descriptor.containts.enum))" class="my-0">
                                    <v-col cols=3>
                                        {{$tc('Enum', 1)}}:
                                    </v-col>
                                    <v-col cols=9>
                                        {{(field.constraints && field.constraints.enum) ? field.constraints.enum : field._descriptor.constraints.enum}}
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

import JsonProcessor from '../../mixins/JsonProcessor';

import TextInput from '../TextInput';
// import SimpleCheckbox from '../SimpleCheckbox';
import Select from '../Select';


export default{
    mixins:[JsonProcessor],
    components: {
        RepeatingObject,
        TextInput,
        Select,
        // SimpleCheckbox
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
            return this.getTitle(this.workingVal);
        },

        description: function(){
            return this.getDescription(this.workingVal);
        },

        fields: function(){
            return this.getFields(this.workingVal);
        },

        resources: function(){
            return this.getResources(this.workingVal);
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
                    schema: {}
                }); 
            }

            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);   
        },

        removeField: function(key, fKey){
            
            Vue.delete(this.workingVal.resources[key].schema.fields, fKey);
            
            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.reindexKey++;
            this.$forceUpdate();
            this.$emit('edited', this.workingVal);
            
        },

        addField: function(key){

            if (!this.workingVal.resources[key].schema){
                this.workingVal.resources[key].schema = {};
            }
            
            if (!this.workingVal.resources[key].schema.fields){
                this.workingVal.resources[key].schema.fields = [];
            }
            this.workingVal.resources[key].schema.fields.push({
                name: "",
                type: "",
                rdfType: "",
                    var_class: "",
                    format: "",
            });
            
            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);
        },

        updateResourcePath: function(key, newValue){
            if (!this.workingVal.resources[key]){
                this.workingVal.resources[key] = {}
            }
            this.workingVal.resources[key].path = newValue;
            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);
        },

        updateResourceName: function(key, newValue){
            if (!this.workingVal.resources[key]){
                this.workingVal.resources[key] = {}
            }
            this.workingVal.resources[key].name = newValue;
            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);
        },

        updateResource: function(key, fieldKey, path, value){
            
            this.workingVal.resources[key].schema.fields[fieldKey][path] = value;
            
            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);
        },

        updateResourceEnum: function(key, fieldKey, nested, path, value){
            let arrVal = value.split(", ");
            arrVal = arrVal.length === 1 ? arrVal[0].split(",") : arrVal;

            if (!this.workingVal.resources[key].schema.fields[fieldKey][nested]){
                this.workingVal.resources[key].schema.fields[fieldKey][nested] = {};
            }
            
            this.workingVal.resources[key].schema.fields[fieldKey][nested][path] = arrVal;
            
            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);
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

        if (this.workingVal && this.workingVal.resources && this.workingVal){
            for (let i=0; i<this.workingVal.resources.length; i++){
                if (this.workingVal.resources[i] && this.workingVal.resources[i].schema ** this.workingVal.resources[i].fields){
                    for (let j=0; j<this.workingVal.resources[i].schema.fields.length; j++){
                        if (typeof(this.workingVal.resources[i].schema.fields[j].constraints) === 'undefined'){
                            this.workingVal.resources[i].schema.fields[j].constraints = {};
                        }
                    }
                }
            }
        }

        this.stateType = this.stateTypeParent;
        this.workingStr = JSON.stringify(this.val, this.replacerFunc(), 4);
        if (this.stateType !== 0){
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
        /* height: 26px; */
        line-height: 26px;
    }

    .row.my-0 .col{
        padding-top: 0px;
        padding-bottom: 0px;
    }

</style>>
