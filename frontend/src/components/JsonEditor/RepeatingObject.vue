<template>
    <v-container fluid>
        <v-row v-for="(expand, key) in keys" :key="'repeating-'+level+'-'+key+'-'+reindexKey">
            <v-col cols=1 v-if="typeof(workingVal[keys[key]]) === 'object'">
                <v-btn @click="toggleExpanded(keys[key])" x-small>
                    <v-icon>{{isExpanded[keys[key]] && isExpanded[keys[key]].self ? 'mdi-minus' : 'mdi-plus'}}</v-icon>
                </v-btn>
            </v-col>
            <v-col cols=3 :key="'selectType-'+level+'-'+key+'-'+reindexKey">
                <v-select 
                    @change="changeType(keys[key], $event)"
                    v-if="showType && showType[keys[key]] && showType[keys[key]].self"
                    :items="objectTypes" 
                    :label="$tc('Type')" 
                    v-model="type[key]"></v-select>
                <v-btn v-else x-small icon>
                    <v-icon @click="toggleType(keys[key])">mdi-settings</v-icon>
                </v-btn>
            </v-col>
            <v-col cols=3>
                <v-text-field 
                    :ref="'keyField-' + level + '-' + key"
                    :id="'keyField-' + level + '-' + key" 
                    @focus="focusField" 
                    @blur="clearFocus" 
                    prefix='"' 
                    suffix='":' 
                    :value="keys[key]" 
                    @input="updateKey(keys[key], $event)"></v-text-field>
            </v-col>

            <v-col cols=12 class="subObject pa-2" v-if="isExpanded[keys[key]] && isExpanded[keys[key]].self && typeof(workingVal[keys[key]])==='object'">
                <RepeatingObject 
                    :level="level+1" 
                    :val="workingVal[keys[key]]" 
                    @update="onUpdate(keys[key], $event)" 
                    :expanded="isExpanded[keys[key]]" 
                    @expand="onExpand(keys[key], $event)"
                    :focus-prop="focus" 
                    :self-key="keys[key]"
                    :type-prop="type[key]"
                    :show-type-prop="showType[keys[key]]"
                    @show-type="updateShowType(keys[key], $event)"
                    @focus="onFocus"></RepeatingObject>
            </v-col>

            <v-col cols=4 class="pa-2" v-else-if="(!isExpanded[keys[key]] || !isExpanded[keys[key]].self) && typeof(workingVal[keys[key]])==='object'">
                <span>{{$tc('Expand to see more')}}</span>
            </v-col>

            <v-col cols=4 v-else>
                <v-select
                    v-if="type[key] === 'True/False'"
                    v-model="workingVal[keys[key]]" 
                    @input="updateText(keys[key])"
                    :ref="'valueField-' + level + '-' + selfKey + '-' + key + '-' + keys[key]" 
                    :id="'valueField-' + level + '-' + selfKey + '-' + key + '-' + keys[key]" 
                    @focus="focusField" 
                    :items="[{text: 'false', value: false}, {text: 'true', value: true}]" 
                    @blur="clearFocus"></v-select>
                
                <v-text-field 
                    v-else
                    v-model="workingVal[keys[key]]" 
                    @input="updateText(keys[key])"
                    @focus="focusField" 
                    :ref="'valueField-' + level + '-' + selfKey + '-' + key + '-' + keys[key]" 
                    :id="'valueField-' + level + '-' + selfKey + '-' + key + '-' + keys[key]" 
                    
                    @blur="clearFocus"></v-text-field>
            </v-col>

            <v-col cols=1>
                <v-btn class="error" @click="removeField(keys[key])">
                    <v-icon>mdi-minus</v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-btn primary @click="addField">
                {{$tc('Add') + ' ' + $tc('Field')}}
            </v-btn>
        </v-row>
    </v-container>
</template>

<script>

export default{

    name: 'RepeatingObject',
    
    props: {
        val: {
            type: [Object, Array],
            required: true,
        },
        level: {
            type: Number,
            required: false,
            default: 0,
        },
        expanded: {
            type: Object,
            required: false,
            default: () => {},
        },
        focusProp: {
            type: String,
            required: false,
            default: ""
        },
        typeProp: {
            type: String,
            required: false,
            default: "Object"
        },
        showTypeProp:{
            type: Object,
            required: false,
            default: () => {},
        },
        selfKey:{
            type: String,
            required: false,
            default: "_"
        }
    },

    methods: {

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

        updateShowType: function(key, showType){
            let self = this.showType[key].self;
            this.showType[key] = showType;
            this.showType[key].self = self;
            this.$emit('show-type', this.showType);
        },

        toggleType: function(key){
            this.showType[key].self = !this.showType[key].self;
            this.$emit('show-type', this.showType);
            this.reindexKey++;
        },

        onExpand: function(key, expand){
            let self = this.isExpanded[key].self;
            this.isExpanded[key] = expand;
            if (typeof(self) !== 'undefined'){
                this.isExpanded[key].self = self;
            }else{
                this.isExpanded[key].self = true;
            }
            this.$emit('expand', this.isExpanded);
        },

        onUpdate: function(key, info){
            if (typeof(info.createdKey) !== 'undefined'){
                this.workingVal[key][info.createdKey] = info.val;
                let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
                this.workingStr = str;
                this.keys = Object.keys(this.workingVal);
                
                this.$emit("update", {key: key, val: this.workingVal[key]});
            }else if (typeof(info.newKey) === 'undefined'){
                this.workingVal[key][info.key] = info.val;
                let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
                this.workingStr = str;
                this.keys = Object.keys(this.workingVal);
                this.$emit("update", {key: key, val: this.workingVal[key]});

            }else{
                this.workingVal[key][info.newKey] = this.workingVal[key][info.key];
                delete this.workingVal[key][info.key];
                let str = JSON.stringify(this.workingVal, this.replacerFunc(), 4);
                this.workingStr = str;
                this.keys = Object.keys(this.workingVal);
                for (let i=0; i<this.keys.length; i++){
                    this.type[i] = Array.isArray(this.workingVal[this.keys[i]]) ? "List" : false;
                    this.type[i] = (!this.type[i] && (typeof(this.workingVal[this.keys[i]])==='object')) ? "Object" : this.type[i];
                    this.type[i] = (!this.type[i] && (typeof(this.workingVal[this.keys[i]])==='boolean')) ? "True/False" : this.type[i];
                    this.type[i] = (!this.type[i] && (typeof(this.workingVal[this.keys[i]])==='number')) ? "Number" : this.type[i];
                    this.type[i] = (!this.type[i]) ? "Text" : this.type[i];
                }
                this.$emit("update", {key: key, val: this.workingVal[key]});
            }
            //this.reindexKey++;
        },

        updateText: function(key){
            this.$emit("update", {key: key, val: this.workingVal[key]});
            //this.reindexKey++;
        },

        changeType: function(key, newType){
            switch (newType){
                case "List":
                    this.workingVal[key] = [];
                    break;
                case "Object":
                    this.workingVal[key] = {};
                    break;
                case "True/False":
                    this.workingVal[key] = false;
                    break;
                case "Number":
                    this.workingVal[key] = 0;
                    break;
                default:
                    this.workingVal[key] = "";
                    break;
            }
            this.showType[key].self = false;
            this.$emit('show-type', this.showType);
            this.$emit("update", {key: key, val: this.workingVal[key]});
            
        },

        updateKey: function(key, newKey){
            
            this.workingVal[newKey] = this.workingVal[key];
            delete this.workingVal[key];
            
            this.keys = Object.keys(this.workingVal);
            let newIndex = this.keys.indexOf(newKey);
            if (newIndex >= 0){
                this.focus = 'keyField-' + this.level + '-' + newIndex;
                this.$emit('focus', this.focus);
            }

            for (let i=0; i<this.keys.length; i++){
                this.type[i] = Array.isArray(this.workingVal[this.keys[i]]) ? "List" : false;
                this.type[i] = (!this.type[i] && (typeof(this.workingVal[this.keys[i]])==='object')) ? "Object" : this.type[i];
                this.type[i] = (!this.type[i] && (typeof(this.workingVal[this.keys[i]])==='boolean')) ? "True/False" : this.type[i];
                this.type[i] = (!this.type[i] && (typeof(this.workingVal[this.keys[i]])==='number')) ? "Number" : this.type[i];
                this.type[i] = (!this.type[i]) ? "Text" : this.type[i];
            }

            this.$emit("update", {key: key, newKey: newKey, val: this.workingVal[key]});
            
            //this.reindexKey++;
            this.$forceUpdate();
        },

        toggleExpanded: function(key){
            if (!this.isExpanded[key]){
                this.isExpanded[key] = {self: true};
            }else if (typeof(this.isExpanded[key].self) !== "undefined"){
                this.isExpanded[key].self = !this.isExpanded[key].self;
            }else{
                this.isExpanded[key].self = true;
            }
            this.reindexKey++;
            this.$emit('expand', this.isExpanded);
        },

        onFocus: function(f){
            this.focus = f;
            this.redrawIndex++;
            this.$emit('focus', this.focus);
        },

        focusField: function(event){
            this.focus=event.target.id;
            this.redrawIndex++;
            this.$emit('focus', this.focus);
        },

        clearFocus: function(){
            //this.focus = "";
        },

        init: function(){
            this.workingVal = JSON.parse(JSON.stringify(this.val, this.replacerFunc()));
            this.keys = Object.keys(this.workingVal);

            let setExpandedKeys = true;
            if (Object.keys(this.expanded).length > 0){
                this.isExpanded = this.expanded
                // delete this.isExpanded.self;
                setExpandedKeys = (Object.keys(this.expanded).length <= 0);
            }

            let setShowTypeKeys = true;
            if (Object.keys(this.showTypeProp).length > 0){
                
                this.showType = JSON.parse(JSON.stringify(this.showTypeProp));
                delete this.showType.self;
                setShowTypeKeys = (Object.keys(this.showType).length <= 0);
            }
            
            for (let i=0; i<this.keys.length; i++){
                if (setExpandedKeys){
                    this.isExpanded[this.keys[i]] = {self: false};
                }
                
                this.type[i] = Array.isArray(this.workingVal[this.keys[i]]) ? "List" : false;
                this.type[i] = (!this.type[i] && (typeof(this.workingVal[this.keys[i]])==='object')) ? "Object" : this.type[i];
                this.type[i] = (!this.type[i] && (typeof(this.workingVal[this.keys[i]])==='boolean')) ? "True/False" : this.type[i];
                this.type[i] = (!this.type[i] && (typeof(this.workingVal[this.keys[i]])==='number')) ? "Number" : this.type[i];
                this.type[i] = (!this.type[i]) ? "Text" : this.type[i];

                
                if (setShowTypeKeys){
                    this.showType[this.keys[i]] = {self: false};
                }
            }

            if (setExpandedKeys){
                this.$emit('expand', this.isExpanded);
            }
            
            if (setShowTypeKeys){
                this.$emit('show-type', this.showType);
            }
            
            if (this.focusProp){
                this.focus = this.focusProp;
                if (this.$refs[this.focus] && this.$refs[this.focus][0]){
                    this.$refs[this.focus][0].focus();
                }
            }

            this.$nextTick(function () {
                if (this.$refs[this.focus] && this.$refs[this.focus][0]){
                    this.$refs[this.focus][0].focus();
                }
            });
        },

        addField: function(){
            let keys = Object.keys(this.workingVal);
            let newKey = this.typeProp === "Object" ? "newKey" : "0";
            let index = 2;
            while (keys.indexOf(newKey) !== -1){
                if (this.typeProp === "Object"){
                    newKey = "newKey" + index;
                    index++;
                }else{
                    newKey = (parseInt(newKey)+1).toString();
                }
            }
            this.workingVal[newKey] = "";
 
            if (typeof(this.showType[newKey]) === "undefined"){
                this.showType[newKey] = {};
            }
            this.showType[newKey].self = true;
            
            this.$emit('show-type', this.showType);
            
            this.reindexKey++;
            this.$forceUpdate();
            this.$emit("update", {key: newKey, val: this.workingVal[newKey], createdKey: newKey});
            
        },

        removeField: function(key){
            delete this.workingVal[key];
            delete this.showType[key];
            this.$emit('show-type', this.showType);
            this.reindexKey++;
            this.$forceUpdate();
            this.$emit("update", {key: key, val: this.workingVal[key]});

        }
    },

    updated: function(){
        if ( (this.focus) && (typeof(this.$refs[this.focus]) !== 'undefined') ){
            this.$refs[this.focus][0].focus();
        }
    },

    data() {
        return {
            workingVal: {},
            keys: [],
            isExpanded: {},
            objectTypes: [
                {val: 'Text', text: this.$tc('Text')}, 
                {val: 'Object', text: this.$tc('Object')}, 
                {val: 'List', text: this.$tc('List')}, 
                {val: 'Number', text: this.$tc('Number')}, 
                {val: 'True/False', text: this.$tc('True/False')}
            ],
            type: [],
            reindexKey: 0,
            focus: "",
            showType: {},
        };
    },

    watch: {
        val: function(){
            this.init();
        },
    },

    mounted(){
        this.init();
        
    }
}
</script>

<style scoped>

    .subObject{
        border: 1px solid;
    }

</style>>
