<template>
    <v-container fluid>

        <v-row v-if="error">
            <v-col cols=12>
                <v-alert class="mb-0" v-model="error" type="error" dismissible>
                    {{errorText}}
                </v-alert>
            </v-col>
        </v-row>
        <v-row :key="'JsonEditor'+redrawIndex">
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
        <v-container>
            <v-row v-if="(stateType == 1 && !editing)">
                <SchemaFilter
                    @filter="(field, newValue) => { filter(field, newValue) }"
                ></SchemaFilter>
            </v-row>
            <v-row v-if="(stateType == 0 && editing) || (stateType == 1 && !editing)" :key="'basicState-editing-'+reindexKey">
                <span v-if="workingVal && workingVal.resources" style="width: 100%">
                    <v-col cols=12 v-if="title && !editing">
                        <h1>{{title}}</h1>
                    </v-col>
                    <v-col cols=12 v-if="description  && !editing">
                        <h3>{{description}}</h3>
                    </v-col>
                    <v-col v-for="(resource, key) in workingVal.resources" :key="'basic-resource-'+key+'-'+reindexKey" cols=12 :class="editing ? 'field' : ''">
                        <v-row v-if="(resource && resource.name) || editing" class="pb-2">
                            <v-col cols=3>
                                <v-btn x-small class="expandResource" @click="toggleExpandedBasicResource(key)"><v-icon>{{expandedBasicResource[key] ? 'mdi-minus' : 'mdi-plus'}}</v-icon></v-btn>
                            </v-col>
                            <v-col cols=3>
                               Number of fields: {{(resource.schema && resource.schema.fields) ? resource.schema.fields.length : 0 }}
                           </v-col>
                            <v-col cols=6>
                            </v-col>
                            
                            <v-col cols=12>
                                <TextInput
                                    :label="$tc('Resource', 1) + ' ' + $tc('Name')"
                                    placeholder=""
                                    name="resName"
                                    :refName="'basicField-' + key + '-name'"
                                    :idName="'basicField-' + key + '-name'"
                                    :large="true"
                                    :editing="editing"
                                    :value="resource.name"
                                    validation-rules="required"
                                    helpPrefix="schema.res"
                                    :focusField="focusProp"
                                    
                                    @blur="(event) => { updateResourceName(key, event) }"
                                ></TextInput>
                            </v-col>

                        </v-row>
                        <span v-if="expandedBasicResource[key]">
                            <v-row v-if="(resource && resource.path) || editing" class="pb-2">
                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Path')"
                                        placeholder=""
                                        name="path"
                                        :refName="'basicField-' + key + '-path'"
                                        :idName="'basicField-' + key + '-path'"
                                        :large="true"
                                        :editing="editing"
                                        :value="resource.path"
                                        validation-rules="required"
                                        helpPrefix="schema"
                                        :focusField="focusProp"
                                        @focus="onFocusBasic"
                                        @blur="(event) => { updateResourcePath(key, event) }"
                                    ></TextInput>
                                </v-col>
                            
                            </v-row>
                            <v-row v-if="(resource && resource.description) || editing" class="pb-2">
                                <v-col cols=12>
                                    <TextArea
                                        :label="$tc('Description (resource)')"
                                        placeholder=""
                                        name="resDescription"
                                        :refName="'basicField-' + key + '-description'"
                                        :idName="'basicField-' + key + '-description'"
                                        :large="true"
                                        :editing="editing"
                                        :value="resource.description"
                                        helpPrefix="schema"
                                        :focusField="focusProp"
                                        @focus="onFocusBasic"
                                        @blur="(event) => { updateResourceBase(key, 'description', event) }"
                                    ></TextArea>
                                </v-col>
                            </v-row>

                            <v-row v-if="(resource && resource.notes) || editing" class="pb-2">
                                <v-col cols=12>
                                    <TextArea
                                        :label="$tc('Resource Notes')"
                                        placeholder=""
                                        name="resNotes"
                                        :refName="'basicField-' + key + '-resNotes'"
                                        :idName="'basicField-' + key + '-resNotes'"
                                        :large="true"
                                        :editing="editing"
                                        :value="resource.notes"
                                        helpPrefix="schema"
                                        :focusField="focusProp"
                                        @focus="onFocusBasic"
                                        @blur="(event) => { updateResourceBase(key, 'notes', event) }"
                                    ></TextArea>
                                </v-col>
                            </v-row>

                            <v-row v-if="(resource && resource.temporal_start) || editing" class="pb-2">
                                <v-col cols=12>
                                    <DateInput
                                        :label="$tc('Date Range Start')"
                                        :placeholder="(new Date()).toISOString().split('T')[0]"
                                        name="temporal_start"
                                        :editing="editing"
                                        helpPrefix="schema"
                                        :value="resource.temporal_start"
                                        :large="true"
                                        :refName="'basicField-' + key + '-temporal_start'"
                                        :idName="'basicField-' + key + '-temporal_start'"
                                        :focusField="focusProp"
                                        @focus="onFocusBasic"
                                        @edited="(newValue) => { updateResourceBase(key, 'temporal_start', newValue) }">
                                    </DateInput>
                                </v-col>
                            </v-row>

                            <v-row v-if="(resource && resource.temporal_end) || editing" class="pb-2">
                                <v-col cols=12>
                                    <DateInput
                                        :label="$tc('Date Range End')"
                                        :placeholder="(new Date()).toISOString().split('T')[0]"
                                        name="temporal_end"
                                        :editing="editing"
                                        helpPrefix="schema"
                                        :value="resource.temporal_end"
                                        :large="true"
                                        :refName="'basicField-' + key + '-temporal_end'"
                                        :idName="'basicField-' + key + '-temporal_end'"
                                        :focusField="focusProp"
                                        @focus="onFocusBasic"
                                        @edited="(newValue) => { updateResourceBase(key, 'temporal_end', newValue) }">
                                    </DateInput>
                                </v-col>
                            </v-row>

                            <v-row v-if="(resource && resource.source_system) || editing" class="pb-2">
                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Source System')"
                                        placeholder=""
                                        name="source_system"
                                        :refName="'basicField-' + key + '-source_system'"
                                        :idName="'basicField-' + key + '-source_system'"
                                        :large="true"
                                        :editing="editing"
                                        :value="resource.source_system"
                                        helpPrefix="schema"
                                        :focusField="focusProp"
                                        @focus="onFocusBasic"
                                        @blur="(event) => { updateResourceBase(key, 'source_system', event) }"
                                    ></TextInput>
                                </v-col>
                            </v-row>


                            <span v-if="resource.schema && resource.schema.fields" style="width: 100%">
                                <draggable v-bind:disabled="!editing" @end="dragEnd(key, $event)">
                                    <v-row 
                                        :id="'fieldHeader-'+key+'-'+fKey"
                                        no-gutters
                                        v-for="(field, fKey) in resource.schema.fields" 
                                        :key="'field-'+key+'-'+fKey+'-'+reindexKey" 
                                        :class="'pa-0 relativePos' + ( (field && field.highlight && !editing) ? ' fieldHighlight': '') + (!filtered(field) ? ' field' : '') + (duplicated(key, field.name) ? ' duplicate' : '')">
                                        <v-container fluid v-if="!filtered(field)"> 
                                            <v-row>
                                                <v-col :cols="loggedIn ? 7 : 12">
                                                    <v-row no-gutters>
                                                        <v-col cols=3>
                                                            <v-btn x-small class="expandField" @click="toggleExpandedBasic(key, fKey)"><v-icon>{{expandedBasic[key][fKey] ? 'mdi-minus' : 'mdi-plus'}}</v-icon></v-btn>
                                                        </v-col>
                                                        <v-col cols=6></v-col>
                                                        <v-col cols=3 v-if="editing">
                                                            <v-icon>mdi-drag</v-icon>
                                                        </v-col>
                                                        <v-col cols=12 v-if="(field && field.name) || editing" class="py-1">
                                                            <TextInput
                                                                :label="$tc('Field') + ' ' + $tc('Name')"
                                                                placeholder=""
                                                                name="name"
                                                                :refName="'basicField-' + key + '-' + fKey + '-name'"
                                                                :idName="'basicField-' + key + '-' + fKey + '-name'"
                                                                validation-rules="required"
                                                                :editing="editing"
                                                                :value="field.name"
                                                                helpPrefix="schema"
                                                                :focusField="focusProp"
                                                                @blur="(event) => { updateResource(key, fKey, 'name', event) }"
                                                                
                                                                @focus="onFocusBasic"
                                                                
                                                            ></TextInput>
                                                        </v-col>
                                                        <v-col cols=12 v-if="((field && field.title) || editing) && expandedBasic[key][fKey]" class="pt-0 pb-1">
                                                            <TextInput
                                                                :label="$tc('Title')"
                                                                placeholder=""
                                                                name="title"
                                                                :refName="'basicField-' + key + '-' + fKey + '-title'"
                                                                :idName="'basicField-' + key + '-' + fKey + '-title'"

                                                                :editing="editing"
                                                                :value="field.title"
                                                                helpPrefix="schema"
                                                                :focusField="focusProp"
                                                                @focus="onFocusBasic"
                                                                @blur="(event) => { updateResource(key, fKey, 'title', event) }"
                                                            ></TextInput>
                                                        </v-col>

                                                        <v-col cols=12 v-if="((field && field.shortName) || editing) && expandedBasic[key][fKey]" class="pt-0 pb-1">
                                                            <TextInput
                                                                :label="$tc('Short Name')"
                                                                placeholder=""
                                                                name="shortName"
                                                                :refName="'basicField-' + key + '-' + fKey + '-shortName'"
                                                                :idName="'basicField-' + key + '-' + fKey + '-shortName'"

                                                                :editing="editing"
                                                                :value="field.shortName"
                                                                helpPrefix="schema"
                                                                :focusField="focusProp"
                                                                @focus="onFocusBasic"
                                                                @blur="(event) => { updateResource(key, fKey, 'shortName', event) }"
                                                            ></TextInput>
                                                        </v-col>

                                                        <v-col cols=12 v-if="((field && field.type) || editing) && expandedBasic[key][fKey]" class="pt-0 pb-1">
                                                            <Select
                                                                :label="$tc('Field') + ' ' + $tc('Type')"
                                                                placeholder=""
                                                                name="type"
                                                                :items="fieldTypes"
                                                                :editing="editing"
                                                                :value="field.type"
                                                                :idName="'basicField-' + key + '-' + fKey + '-type'"
                                                                helpPrefix="schema"
                                                                @edited="(newValue) => { updateResource(key, fKey, 'type', newValue) }"
                                                            ></Select>
                                                        </v-col>

                                                        <v-col cols=12 v-if="((field && field.description) || editing) && expandedBasic[key][fKey]" class="pt-0 pb-1">
                                                            <TextArea
                                                                :label="$tc('Field') + ' ' + $tc('Description')"
                                                                placeholder=""
                                                                name="description"
                                                                :refName="'basicField-' + key + '-' + fKey + '-description'"
                                                                :idName="'basicField-' + key + '-' + fKey + '-description'"

                                                                :editing="editing"
                                                                :value="field.description"
                                                                helpPrefix="schema"
                                                                :focusField="focusProp"
                                                                @focus="onFocusBasic"
                                                                @blur="(event) => { updateResource(key, fKey, 'description', event) }"
                                                            ></TextArea>
                                                        </v-col>

                                                        <v-col cols=12 v-if="((field && field.format) || editing) && expandedBasic[key][fKey]" class="pt-0 pb-1">
                                                            <TextInput
                                                                :label="$tc('Format')"
                                                                placeholder=""
                                                                name="format"
                                                                :refName="'basicField-' + key + '-' + fKey + '-format'"
                                                                :idName="'basicField-' + key + '-' + fKey + '-format'"

                                                                :editing="editing"
                                                                :value="field.format"
                                                                helpPrefix="schema"
                                                                :focusField="focusProp"
                                                                @focus="onFocusBasic"
                                                                @blur="(event) => { updateResource(key, fKey, 'format', event) }"
                                                            ></TextInput>
                                                        </v-col>

                                                        <v-col cols=12 v-if="((field && field.var_class) || editing) && expandedBasic[key][fKey]" class="pt-0 pb-1">
                                                            <Select
                                                                :label="$tc('Var Class')"
                                                                placeholder=""
                                                                name="var_class"
                                                                :items="variableClassificationValues"
                                                                itemText="code"
                                                                itemValue="code"
                                                                :idName="'basicField-' + key + '-' + fKey + '-var_class'"

                                                                :editing="editing"
                                                                :value="field.var_class"
                                                                helpPrefix="schema"
                                                                @edited="(newValue) => { updateResource(key, fKey, 'var_class', newValue) }"
                                                            ></Select>
                                                        </v-col>

                                                        <v-col cols=12 v-if="((field && field.rdfType) || editing) && expandedBasic[key][fKey]" class="pt-0 pb-1">
                                                            <TextInput
                                                                :label="$tc('RDF Type')"
                                                                placeholder=""
                                                                name="rdfType"
                                                                :refName="'basicField-' + key + '-' + fKey + '-rdfType'"
                                                                :idName="'basicField-' + key + '-' + fKey + '-rdfType'"

                                                                :editing="editing"
                                                                :value="field.rdfType"
                                                                helpPrefix="schema"
                                                                :focusField="focusProp"
                                                                @focus="onFocusBasic"
                                                                @blur="(event) => { updateResource(key, fKey, 'rdfType', event) }"
                                                            ></TextInput>
                                                        </v-col>

                                                        <v-col cols=12 v-if="((field && field.tags) || editing) && expandedBasic[key][fKey]" class="pt-0 pb-1">
                                                            <TextInput
                                                                :label="$tc('Tags', 2)"
                                                                placeholder=""
                                                                name="tags"
                                                                :refName="'basicField-' + key + '-' + fKey + '-tags'"
                                                                :idName="'basicField-' + key + '-' + fKey + '-tags'"

                                                                :editing="editing"
                                                                :value="field.tags"
                                                                helpPrefix="schema"
                                                                :focusField="focusProp"
                                                                @focus="onFocusBasic"
                                                                @blur="(event) => { updateResource(key, fKey, 'tags', event) }"
                                                            ></TextInput>
                                                        </v-col>

                                                        <v-col cols=12 v-if="((field && field.notes) || editing) && expandedBasic[key][fKey]" class="pt-0 pb-1">
                                                            <TextArea
                                                                :label="$tc('Field') + ' ' + $tc('Notes', 2)"
                                                                placeholder=""
                                                                name="notes"
                                                                :refName="'basicField-' + key + '-' + fKey + '-notes'"
                                                                :idName="'basicField-' + key + '-' + fKey + '-notes'"

                                                                :editing="editing"
                                                                :value="field.notes"
                                                                helpPrefix="schema"
                                                                :focusField="focusProp"
                                                                @focus="onFocusBasic"
                                                                @blur="(event) => { updateResource(key, fKey, 'notes', event) }"
                                                            ></TextArea>
                                                        </v-col>

                                                        <v-col cols=12 v-if="((field && field.constraints && field.constraints.enum) || editing) && expandedBasic[key][fKey]" class="pt-0 pb-1">
                                                            <TextArea
                                                                :label="$tc('Enum', 1)"
                                                                placeholder=""
                                                                name="enum"
                                                                :refName="'basicField-' + key + '-' + fKey + '-enum'"
                                                                :idName="'basicField-' + key + '-' + fKey + '-enum'"

                                                                :editing="editing"
                                                                :value="(field.constraints && field.constraints.enum) ? (typeof(field.constraints.enum) === 'string' ? field.constraints.enum : field.constraints.enum.join(',')) : ''"
                                                                helpPrefix="schema"
                                                                :focusField="focusProp"
                                                                @focus="onFocusBasic"
                                                                @blur="(event) => { updateResourceEnum(key, fKey, 'constraints', 'enum', event) }"
                                                            ></TextArea>
                                                        </v-col>

                                                        <v-col cols=12 v-if="expandedBasic[key][fKey] && loggedIn" class="pt-0 pb-1">
                                                            <Select
                                                                :label="$tc('Highlight')"
                                                                name="highlight"
                                                                :editing="true"
                                                                :value="field.highlight"
                                                                :idName="'basicField-' + key + '-' + fKey + '-highlight'"
                                                                :items="[ {text: 'Yes', value: true}, {text: 'No', value: false}]"
                                                                helpPrefix="schema"
                                                                @edited="(newValue) => { updateResourceHighlight(key, fKey, 'highlight', newValue) }"
                                                            ></Select>
                                                        </v-col>

                                                        <v-col v-if="expandedBasic[key][fKey]" cols=12 class="pt-0 pb-1">
                                                        </v-col>

                                                        <v-col v-if="expandedBasic[key][fKey]" cols=10 class="pt-0 pb-1">
                                                        </v-col>
                                                        <v-col v-if="expandedBasic[key][fKey]" cols=2 class="pt-0 pb-1">
                                                            <v-btn v-if="editing" class="error" @click="removeField(key, fKey)"><v-icon>mdi-delete</v-icon></v-btn>
                                                        </v-col>
                                                    </v-row>
                                                </v-col>
                                                
                                                <v-col v-if="expandedBasic[key][fKey] && loggedIn" cols=5 class="borderLeft">
                                                    <Comments @setComment="(e) => { $emit('setComment', e) }" :id="commentId" :type="'schema'" :resource="resource.name" :field="field.name" :refable="commentRefs"></Comments>
                                                </v-col>

                                                <v-col cols=5 v-if="!expandedBasic[key][fKey]"></v-col>
                                            </v-row>
                                        </v-container>

                                    </v-row>
                                </draggable>
                            </span>
                            <v-row>
                                <v-col cols=2>
                                    <v-btn v-if="editing" class="primary" id="addField" @click="addField(key)">{{$tc('Add Field')}}<v-icon>mdi-plus</v-icon></v-btn>
                                </v-col>
                                <v-col cols=10>
                                </v-col>
                            </v-row>
                        </span>
                    </v-col>
                </span>
                <v-btn v-if="editing" class="primary" id="addFileResource" @click="addResource">{{$tc('Add File/Resource')}}</v-btn>
            </v-row>

            <v-row v-else-if="stateType == 2 && editing">
                <v-col cols=12>
                    <v-textarea v-model="workingStr" @change="updatedStr"></v-textarea>
                </v-col>
            </v-row>

            <v-row v-else-if="stateType == 2 && !editing">
                <div class="preserveWhite">{{JSON.stringify(workingVal, replacerFunc(), 4)}}</div>
            </v-row>

            <v-row v-else-if="editing">
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
        
    </v-container>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';
import RepeatingObject from './RepeatingObject';

import JsonProcessor from '../../mixins/JsonProcessor';

import TextInput from '../FormElements/TextInput';
// import SimpleCheckbox from '../FormElements/SimpleCheckbox';
import Select from '../FormElements/Select';
import DateInput from '../FormElements/DateInput';
import TextArea from '../FormElements/TextArea';
import Comments from '../Comments';
import draggable from 'vuedraggable'
import SchemaFilter from '../Schema/SchemaFilter.vue'


export default{
    mixins:[JsonProcessor],
    components: {
        RepeatingObject,
        TextInput,
        Select,
        Comments,
        draggable,
        // SimpleCheckbox,
        DateInput,
        SchemaFilter,
        TextArea
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
            default: 0,
        },
        focusProp: {
            type: String,
            required: false,
        },
        commentId: {
            type: String,
            default: "",
            required: false,
        },
    },

    watch: {

        $route: function(to, from){
            if (to.hash !== from.hash){
                this.openAndScroll(to.hash);
            }
        },

        stateType: function(){
            this.$emit('state', this.stateType);
        },

        editing: function(){
            if (this.editing && (this.stateType == 1)){
                this.stateType = 0;
            }else if (!this.editing && (this.stateType == 0)){
                this.stateType = 1;
            }
        },

        val: function(){
            if (!this.editing){
                this.redrawIndex++;
                this.$forceUpdate();
            }
        }

    },

    computed: {
        ...mapState({
            variableClassification: state => state.variableClassifications.wipItem,
            loggedIn: state => state.user.loggedIn,
        }),

        fieldNameOccurences: function(){
            let items = {};

            for (let i=0; i<this.workingVal.resources.length; i++){
                items[i] = {};
                for (let j=0; j<this.workingVal.resources[i].schema.fields.length; j++){
                    let val = 1;
                    if (typeof(items[i][this.workingVal.resources[i].schema.fields[j].name]) !== 'undefined'){
                        val = items[i][this.workingVal.resources[i].schema.fields[j].name] + 1;
                    }
                    items[i][this.workingVal.resources[i].schema.fields[j].name] = val;
                }
            }

            return items;
        },

        resourceNameToIndex: function(){
            let items = {};
            for (let i=0; i<this.workingVal.resources.length; i++){
                items[this.workingVal.resources[i].name] = i;
            }
            return items;
        },

        fieldNameToIndex: function(){
            let items = {};
            for (let i=0; i<this.workingVal.resources.length; i++){
                items[this.workingVal.resources[i].name] = {};
                for (let j=0; j<this.workingVal.resources[i].schema.fields.length; j++){
                    items[this.workingVal.resources[i].name][this.workingVal.resources[i].schema.fields[j].name] = j;
                }
            }
            return items;
        },

        variableClassificationValues: function(){
            let rv = [];
            if (this.variableClassification && this.variableClassification.values){
                let k = Object.keys(this.variableClassification.values);
                for (let i=0; i<k.length; i++){
                    rv.push({code: this.variableClassification.values[k[i]].code + ". " + this.variableClassification.values[k[i]].title})
                }
            }
            return rv;
        },

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

        commentRefs: function(){
            let items = [];

            for (let i=0; i<this.workingVal.resources.length; i++){
                for (let j=0; j<this.workingVal.resources[i].schema.fields.length; j++){
                    let baseVal = this.workingVal.resources[i].name+"."+this.workingVal.resources[i].schema.fields[j].name;
                    items.push({text: baseVal, link: '#fieldHeader-'+baseVal});
                }
            }

            this.$emit('commentRefs', items);

            return items;
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
        toggleExpandedBasic: function(key, fKey){
            this.expandedBasic[key][fKey] = !this.expandedBasic[key][fKey];
            this.reindexKey++;
            this.$forceUpdate();
        },

        duplicated: function(resKey, fieldName){
            if (this.fieldNameOccurences[resKey][fieldName] > 1){
                this.error = true;
                this.errorText = "Some resources have duplicated field names, bordered in red, consider revising"
                return true;
            }
            return false;
        },

        openAndScroll: function(resourceFieldKey){
            resourceFieldKey = resourceFieldKey.replaceAll("+", " ");
            let resName = resourceFieldKey.substring(1, resourceFieldKey.indexOf('.'))
            let fieldName = resourceFieldKey.substring(resourceFieldKey.indexOf('.')+1);

            let resIndex = this.resourceNameToIndex[resName];
            let fieldIndex = this.fieldNameToIndex[resName][fieldName];

            this.expandedBasicResource[resIndex] = true;
            this.expandedBasic[resIndex][fieldIndex] = true;
            this.reindexKey++;
            this.$forceUpdate();

            this.$nextTick(function () {

                let el = document.getElementById('fieldHeader-'+resIndex+'-'+fieldIndex);

                el.scrollIntoView({
                    behavior: 'smooth', // smooth scroll
                    block: 'start' // the upper border of the element will be aligned at the top of the visible part of the window of the scrollable area.
                })
                
            });
        },

        toggleExpandedBasicResource: function(key){
            this.expandedBasicResource[key] = !this.expandedBasicResource[key];
            this.reindexKey++;
            this.$forceUpdate();
        },

        filter: function(key, val){
            if (Array.isArray(val)){
                if (val.length === 0){
                    delete this.filters[key];
                }else{
                    this.filters[key] = val;
                }
            }
            if (val === ""){
                delete this.filters[key];
            }else{
                this.filters[key] = val;
            }
            this.reindexKey++;
            this.redrawIndex++;
            this.$emit('filter', key, val);
        },

        filtered: function(field){
            if (this.editing){
                return false;
            }

            const textFilters = ['name'];

            let fKeys = Object.keys(this.filters);
            let rv = false
            for (let i=0; i<fKeys.length; i++){
                let filterFieldName = fKeys[i];
                if (Array.isArray(this.filters[filterFieldName])){
                    if (this.filters[filterFieldName].length > 0){
                        if (!filterFieldName || (!field[filterFieldName] && field[filterFieldName] !== 0 && field[filterFieldName] !== false) || (this.filters[filterFieldName].indexOf(field[filterFieldName]) === -1)){
                            rv = true;
                        }
                    }
                }else if(textFilters.indexOf(filterFieldName) !== -1){
                    if (!filterFieldName || !field[filterFieldName] || (field[filterFieldName].indexOf(this.filters[filterFieldName]) === -1) ){
                        rv = true;
                    }
                }else{
                    if (!filterFieldName || !field[filterFieldName] || (field[filterFieldName] !== this.filters[filterFieldName]) ){
                        rv = true;
                    }
                }
            }
            return rv;
        },

        dragEnd: function(key, e){

            let origElement = this.workingVal.resources[key].schema.fields[e.oldIndex];

            // var swap = this.workingVal.resources[key].schema.fields[e.newIndex];
            // this.workingVal.resources[key].schema.fields[e.newIndex] = this.workingVal.resources[key].schema.fields[e.oldIndex];
            // this.workingVal.resources[key].schema.fields[e.oldIndex] = swap;

            //remove the old index then insert at newIndex
            this.workingVal.resources[key].schema.fields.splice(e.oldIndex, 1);
            this.workingVal.resources[key].schema.fields.splice(e.newIndex, 0, origElement);

            let swap = this.expandedBasic[key][e.newIndex];
            this.expandedBasic[key][e.newIndex] = this.expandedBasic[key][e.oldIndex];
            this.expandedBasic[key][e.oldIndex] = swap;

            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);   
            this.reindexKey++;
            this.$forceUpdate();
        },

        addResource: function(){
            if (!this.workingVal){
                this.workingVal = {};
            }
            
            if (!this.workingVal.resources){
                this.workingVal.resources = [];
            }

            // if (this.workingVal.resources.length == 0){
            this.workingVal.resources.push({
                schema: {
                    fields: []
                }
            }); 
            //}

            this.expandedBasic.push([]);
            this.expandedBasicResource.push(true);

            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);   
            this.reindexKey++;
            this.$forceUpdate();
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
            });
            
            
            if (!this.expandedBasic[key]){
                this.expandedBasic[key] = [];
            }
            let key0 = Object.keys(this.workingVal.resources)[0];
            for (let i=0; i<this.workingVal.resources[key0].schema.fields.length; i++){
                this.expandedBasic[key].push(true);
            }

            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);
            //this.reindexKey++;
            //this.$forceUpdate();
        },

        updateResourcePath: function(key, event){
            let newValue = event.target.value;
            if (!this.workingVal.resources[key]){
                this.workingVal.resources[key] = {}
            }
            if (newValue !== ""){
                this.workingVal.resources[key].path = newValue;
            }else{
                delete this.workingVal.resources[key].path
            }
            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);
        },

        updateResourceName: function(key, event){
            let newValue = event.target.value;
            if (!this.workingVal.resources[key]){
                this.workingVal.resources[key] = {}
            }

            if (newValue !== ""){
                this.workingVal.resources[key].name = newValue;
            }else{
                delete this.workingVal.resources[key].name;
            }
            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);
        },

        updateResourceBase: function(key, field, event){
            let newValue;
            try{
                newValue = event.target.value;
            }catch(e){
                newValue = event;
            }
            if (!this.workingVal.resources[key]){
                this.workingVal.resources[key] = {}
            }

            if (newValue !== ""){
                this.workingVal.resources[key][field] = newValue;
            }else{
                delete this.workingVal.resources[key][field];
            }
            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);
        },

        updateResource: function(key, fieldKey, path, event){
            let value = event;
            if (event && event.target && typeof(event.target.value) !== 'undefined'){
                value = event.target.value;
            }

            if (value !== ""){
                this.workingVal.resources[key].schema.fields[fieldKey][path] = value;
            }else{
                delete this.workingVal.resources[key].schema.fields[fieldKey][path];
            }
            
            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);
        },

        async updateResourceHighlight(key, fieldKey, path, event){
            let value = event;
            if (event && event.target && typeof(event.target.value) !== 'undefined'){
                value = event.target.value;
            }
            this.workingVal.resources[key].schema.fields[fieldKey][path] = value;
            
            let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
            this.workingStr = str;
            this.$emit('edited', this.workingVal);
            this.$emit('editedHighlight', this.editing);
        },

        updateResourceEnum: function(key, fieldKey, nested, path, event){
            let value = event.target.value;
            let arrVal = value.split(", ");
            arrVal = arrVal.length === 1 ? arrVal[0].split(",") : arrVal;

            if (!this.workingVal.resources[key].schema.fields[fieldKey][nested]){
                this.workingVal.resources[key].schema.fields[fieldKey][nested] = {};
            }
            
            if (value !== ""){
                this.workingVal.resources[key].schema.fields[fieldKey][nested][path] = arrVal;
            }else{
                delete this.workingVal.resources[key].schema.fields[fieldKey][nested][path];
            }
            
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
            stateType: this.stateTypeParent,
            fieldTypes: [
                'string', 
                'number', 
                'integer', 
                'boolean', 
                'object', 
                'array', 
                'date', 
                'time', 
                'datetime', 
                'year', 
                'yearmonth', 
                'duration',
                'geopoint',
                'geojson',
                'any'
            ],
            redrawIndex: 0,
            expandedBasic: [],
            filters: {},
            expandedBasicResource: [],
        };
    },

    mounted(){
        this.workingVal = this.val;

        if (this.workingVal && this.workingVal.resources && this.workingVal){
            for (let i=0; i<this.workingVal.resources.length; i++){
                this.expandedBasic[i] = [];
                this.expandedBasicResource[i] = false;
                if (this.workingVal.resources[i] && this.workingVal.resources[i].schema && this.workingVal.resources[i].schema.fields){
                    for (let j=0; j<this.workingVal.resources[i].schema.fields.length; j++){
                        this.expandedBasic[i][j] = false;
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

        this.redrawIndex++;
        this.$forceUpdate();
        this.$nextTick(function () {     
            if (this.$route.hash){
                this.openAndScroll(this.$route.hash);
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
        min-height: 125px;
    }

    .borderLeft{
        border-left: 1px solid;
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

    .relativePos{
        position: relative;
    }

    .duplicate{
        border-color: var(--v-error-base);
        border-width: 2px;
    }

</style>>
