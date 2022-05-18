<template>
    <v-container class="comparison">
        <v-row v-for="(resource, key) in resources" :key="'resources'+key+'-'+redrawResource" :class="displayClass('resources.' + key)">
            <v-col cols=11 :class="'noOverflow' + displayClass('resources.' + key + '.name')">
                <h1>{{$tc('Resource')}} {{resource.name}}</h1>
            </v-col>
            <v-col cols=1>
                <v-btn @click="collapse(key)"><v-icon>{{collapsed[key] ? 'mdi-plus' : 'mdi-minus'}}</v-icon></v-btn>
            </v-col>
            <v-col cols=12 v-if="!collapsed[key]" class="field">
                <v-row v-for="(attrib, aKey) in sortedResource(resource, key)" :key="'resource-attrib-'+aKey+'-'+key" :class="'ma-0' + displayClass('resources.' + key + '.'+aKey)">
                    <v-col cols=3 v-if="aKey !== 'schema'">
                        {{$tc(aKey)}}
                    </v-col>
                    <v-col cols=9 v-if="aKey !== 'schema'" class="noOverflow">
                        {{attrib}}
                    </v-col>
                </v-row>
            
                <v-col cols=12 v-if="!collapsed[key] && ( (resource.schema && resource.schema.fields) || (resource.tableSchema && resource.tableSchema.fields))">
                    <div v-for="(field, fkey) in ((resource.tableSchema && resource.tableSchema.fields) ? resource.tableSchema.fields : resource.schema.fields)" :key="'field-'+fkey+'-'+(field ? field.name : '')" :class="`field` + displayClass('resources.' + key + '.schema.fields.' + fkey.toString())">
                        <v-row v-if="field && field.name" :class="'ma-0 noOverflow' + displayClass('resources.' + key + '.schema.fields.' + fkey.toString() + '.name')">
                            <v-col cols=1 v-if="collapsedFields && collapsedFields[key]">
                                <v-btn @click="collapse(key, fkey)"><v-icon>{{collapsedFields[key][fkey] ? 'mdi-plus' : 'mdi-minus'}}</v-icon></v-btn>
                            </v-col>
                            <v-col cols=2></v-col>
                            <v-col cols=9>
                                <h3>{{field.name}}</h3>
                            </v-col>
                        </v-row>

                        <span v-if="!collapsedFields || !collapsedFields[key] || !collapsedFields[key][fkey]">
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
            </v-col>
        </v-row>
    </v-container>
</template>

<script>

import JsonProcessor from '../../mixins/JsonProcessor';

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

        sortedResource: function(resource, key){
            let r = JSON.parse(JSON.stringify(resource));
            if (this.other && this.other[key] && this.other[key]){
                let otherAttribs = Object.keys(this.other[key]);
                for (let i=0; i<otherAttribs.length; i++){
                    
                    if (r && typeof(r[otherAttribs[i]]) === 'undefined'){
                        r[otherAttribs[i]] = "<Not Specified>";
                    }
                }
            }

            if (r){
                if (r && r.schema && r.schema.fields){
                    r["Number of Fields"] = r.schema.fields.length;
                }
            }

            if (r){
                r = Object.keys(r).sort().reduce(
                    (obj, key) => { 
                        obj[key] = r[key]; 
                        return obj;
                    }, 
                    {}
                );
            }

            return r;
        },

        sortedField: function(field, key, fkey){
            let f = JSON.parse(JSON.stringify(field));
            if (this.other && this.other[key] && this.other[key].schema && this.other[key].schema.fields && this.other[key].schema.fields[fkey]){
                let otherAttribs = Object.keys(this.other[key].schema.fields[fkey]);
                for (let i=0; i<otherAttribs.length; i++){
                    
                    if (f && typeof(f[otherAttribs[i]]) === 'undefined'){
                        f[otherAttribs[i]] = "<Not Specified>";
                    }
                }
            }

            if (f){
                f = Object.keys(f).sort().reduce(
                    (obj, key) => { 
                        obj[key] = f[key]; 
                        return obj;
                    }, 
                    {}
                );
            }

            return f;

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
            let specialKey = ".Number of Fields";
            let initialKey = 'resources.';
            let expectedPos = keyString.length - specialKey.length;
            
            if ( (keyString.indexOf(initialKey) === 0) && (keyString.indexOf(specialKey) === expectedPos) ){
                let index = parseInt(keyString.substring(initialKey.length, keyString.indexOf(specialKey) ));
                if (this.other && this.other[index] && this.other[index].schema && this.other[index].schema.fields){
                    if (this.resources[index].schema.fields.length === this.other[index].schema.fields.length){
                        return '';
                    }
                    return ' yellowDiff';
                }
            
            }
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