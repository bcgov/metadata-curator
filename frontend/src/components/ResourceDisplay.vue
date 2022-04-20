<template>
    <v-container class="comparison">
        <v-row v-for="(resource, key) in resources" :key="'resources'+key+'-'+redrawResource" :class="displayClass('resources.' + key)">
            <v-col cols=11 :class="'noOverflow' + displayClass('resources.' + key + '.name')">
                <h1>{{$tc('Resource')}} {{resource.name}}</h1>
            </v-col>
            <v-col cols=1>
                <v-btn @click="collapse(key)"><v-icon>{{collapsed[key] ? 'mdi-plus' : 'mdi-minus'}}</v-icon></v-btn>
            </v-col>
            <v-col cols=12 v-if="!collapsed[key] && ( (resource.schema && resource.schema.fields) || (resource.tableSchema && resource.tableSchema.fields))">
                <div v-for="(field, fkey) in ((resource.tableSchema && resource.tableSchema.fields) ? resource.tableSchema.fields : resource.schema.fields)" :key="'field-'+fkey+'-'+(field ? field.name : '')" :class="`field` + displayClass('resources.' + key + '.schema.fields.' + fkey.toString())">
                    <v-row v-if="field && field.name" :class="'ma-0 noOverflow' + displayClass('resources.' + key + '.schema.fields.' + fkey.toString() + '.name')">
                        <v-col cols=1>
                            <v-btn @click="collapse(key, fkey)"><v-icon>{{collapsedFields[key][fkey] ? 'mdi-plus' : 'mdi-minus'}}</v-icon></v-btn>
                        </v-col>
                        <v-col cols=2></v-col>
                        <v-col cols=9>
                            <h3>{{field.name}}</h3>
                        </v-col>
                    </v-row>

                    <span v-if="!collapsedFields[key][fkey]">
                        <v-row v-for="(attribute, attribKey) in sortedField(field, key, fkey)" :key="'field-'+fkey+'-'+attribKey+'attribute'" :class="'ma-0' + displayClass('resources.' + key + '.schema.fields.' + fkey.toString() + '.'+attribKey)">
                            <v-col cols="3" v-if="attribKey !== 'name' && attribKey !== 'highlight'">
                                {{$tc(attribKey)}}
                            </v-col>
                            <v-col cols="9" class="noOverflow" v-if="attribKey !== 'name' && attribKey !== 'highlight'">
                                {{attribute}}
                            </v-col>
                        </v-row>
                    </span>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>

import JsonProcessor from '../mixins/JsonProcessor';

export default {

    mixins: [JsonProcessor],

    props: {
        resources: {
            type: Array,
            required: true,
        },
        other: {
            type: Array,
            required: false,
        },
        diff: {
            type: Object,
            required: false,
            default: () => {}
        },
        compareType: {
            type: String,
            required: false,
            default: "left",
        },
        resourcesCollapsedByDefault: {
            type: Boolean,
            required: false,
            default: false,
        },
        fieldsCollapsedByDefault: {
            type: Boolean,
            required: false,
            default: false,
        }
    },

    data() {
        return {
            collapsed: [],
            collapsedFields: [],
            redrawResource: 0,
        }
    },

    mounted(){
        for (let i=0; i<this.resources.length; i++){
            this.collapsed.push(this.resourcesCollapsedByDefault);
            this.collapsedFields.push([]);
            let f = (this.resources[i].schema && this.resources[i].schema.fields) ? this.resources[i].schema.fields : this.resources[i].tableSchema.fields
            for (let j=0; j<f.length; j++){
                this.collapsedFields[i].push(this.fieldsCollapsedByDefault);
            }
        }
    },

    computed: {
        rightSideDiff: function(){
            if (this.compareType !== 'right'){
                return {}
            }
            return this.diff;
            
        },
    },

    methods: {

        sortedField: function(field, key, fkey){
            if (this.other && this.other[key] && this.other[key].schema && this.other[key].schema.fields && this.other[key].schema.fields[fkey]){
                let otherAttribs = Object.keys(this.other[key].schema.fields[fkey]);
                for (let i=0; i<otherAttribs.length; i++){
                    if (typeof(field[otherAttribs[i]]) === 'undefined'){
                        field[otherAttribs[i]] = "<Not Specified>";
                    }
                }
            }

            field = Object.keys(field).sort().reduce(
                (obj, key) => { 
                    obj[key] = field[key]; 
                    return obj;
                }, 
                {}
            );

            return field;

        },

        collapse: function(key, fkey){
            if (typeof(fkey) === 'undefined'){
                this.collapsed[key] = !this.collapsed[key];
                this.redrawResource++;
            }else{
                this.collapsedFields[key][fkey] = !this.collapsedFields[key][fkey];
                this.redrawResource++;
            }
        },

        displayClass: function(keyString){
            let currDif = JSON.parse(JSON.stringify(this.diff));
            if (this.compareType === 'right'){
                currDif = JSON.parse(JSON.stringify(this.rightSideDiff));
            }
            
            var dotIndex = keyString.indexOf(".");
            while (dotIndex !== -1){
                let currKey = keyString.substring(0, dotIndex)
                keyString = keyString.substring(dotIndex+1);
                dotIndex = keyString.indexOf(".");
                try{
                    if (currDif && currDif[currKey]){
                        currDif = currDif[currKey];
                    }else{
                        currDif = currDif[currKey.toString()];
                    }
                }catch(ex){
                    currDif = {}
                }
            }
            
            if (currDif && currDif[keyString] && currDif[keyString].added){
                
                return (this.diffType !== 'right') ? ' greenDiff' : ' redDiff';
            }else if (currDif && currDif[keyString] && currDif[keyString].removed){
                return (this.diffType !== 'right') ? ' redDiff' : ' greenDiff';
            }else if (currDif && currDif[keyString] && currDif[keyString].diff){
                return ' yellowDiff'
            }

            return '';

        }
    }

}

</script>

<style scoped>
    .noOverflow{
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }

    .noOverflow:hover{
        text-overflow: clip;
        white-space: normal;
        word-break: break-all;
    }

    .field{
        border: 1px solid;
        margin-bottom: 5px;
        padding-bottom: 10px;
    }

    .fieldHighlight{
        background: var(--v-textHighlight-base);
    }

    .redDiff{
        background: #ff4000;
    }

    .greenDiff{
        background: #00CC55;
    }

    .yellowDiff{
        background: yellow;
        color: black;
    }

    .comparison{
        color: var(--v-text-base);
    }


</style>