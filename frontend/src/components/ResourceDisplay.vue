<template>
    <v-container class="comparison">
        <v-row v-for="(resource, key) in resources" :key="'resources'+key" :class="displayClass('resources.' + key)">
            <v-col cols=12 :class="'noOverflow' + displayClass('resources.' + key + '.name')">
                <h1>{{$tc('Resource')}} {{resource.name}}</h1>
            </v-col>
            <v-col cols=12 v-if="(resource.schema && resource.schema.fields) || (resource.tableSchema && resource.tableSchema.fields)">
                <div v-for="(field, fkey) in ((resource.tableSchema && resource.tableSchema.fields) ? resource.tableSchema.fields : resource.schema.fields)" :key="'field-'+fkey+'-'+(field ? field.name : '')" :class="`field${field && field.highlight ? ' fieldHighlight' : ''}` + displayClass('resources.' + key + '.tableSchema.fields.' + fkey.toString())">
                    <v-row v-if="field && field.name" :class="'ma-0 noOverflow' + displayClass('resources.' + key + '.tableSchema.fields.' + fkey.toString() + '.name')">
                        <v-col cols=9>
                            <h3>{{field.name}}</h3>
                        </v-col>
                    </v-row>

                    <v-row v-if="field && (field.shortName || (field._descriptor && field._descriptor.shortName))" :class="'ma-0 noOverflow' + displayClass('resources.' + key + '.tableSchema.fields.' + fkey.toString() + '.shortName')">
                        <v-col cols=3>
                            {{$tc('Short Name')}}:
                        </v-col>
                        <v-col cols=9>
                            {{field.shortName ? field.shortName : field._descriptor.shortName}}
                        </v-col>
                    </v-row>

                    <v-row v-if="field && (field.title || (field._descriptor && field._descriptor.title))" :class="'ma-0'  + displayClass('resources.' + key + '.tableSchema.fields.' + fkey.toString() + '.title')">
                        <v-col cols=3>
                            {{$tc('Title')}}:
                        </v-col>
                        <v-col cols=9>
                            {{field.title ? field.title : field._descriptor.title}}
                        </v-col>
                    </v-row>

                    <v-row v-if="field && (field.type || (field._descriptor && field._descriptor.type))" :class="'ma-0' + displayClass('resources.' + key + '.tableSchema.fields.' + fkey.toString() + '.type')">
                        <v-col cols=3>
                            {{$tc('Type')}}:
                        </v-col>
                        <v-col cols=9>
                            {{field.type ? field.type : field._descriptor.type}}
                        </v-col>
                    </v-row>

                    <v-row v-if="field && (field.description || (field._descriptor && field._descriptor.description))" :class="'ma-0' + displayClass('resources.' + key + '.tableSchema.fields.' + fkey.toString() + '.description')">
                        <v-col cols=3>
                            {{$tc('Description')}}:
                        </v-col>
                        <v-col cols=9>
                            {{field.description ? field.description : field._descriptor.description}}
                        </v-col>
                    </v-row>

                    <v-row v-if="field && (field.example || (field._descriptor && field._descriptor.example))" :class="'ma-0' + displayClass('resources.' + key + '.tableSchema.fields.' + fkey.toString() + '.example')">
                        <v-col cols=3>
                            {{$tc('Example')}}:
                        </v-col>
                        <v-col cols=9>
                            {{field.example ? field.example : field._descriptor.example}}
                        </v-col>
                    </v-row>

                    <v-row v-if="field && (field.constraints || (field._descriptor && field._descriptor.constraints))" :class="'ma-0' + displayClass('resources.' + key + '.tableSchema.fields.' + fkey.toString() + '.constraints')">
                        <v-col cols=3>
                            {{$tc('Constraint', 2)}}:
                        </v-col>
                        <v-col cols=9>
                            {{field.constraints ? field.constraints : field._descriptor.constraints}}
                        </v-col>
                    </v-row>

                    <v-row v-if="field && field.var_class" :class="'ma-0' + displayClass('resources.' + key + '.tableSchema.fields.' + fkey.toString() + '.var_class')">
                        <v-col cols=3>
                            {{$tc('Var Class', 1)}}:
                        </v-col>
                        <v-col cols=9>
                            {{field.var_class ? field.var_class : "" }}
                        </v-col>
                    </v-row>

                    <v-row 
                        v-if="field 
                            && (field.format || (field._descriptor && field._descriptor.format))
                            && ( (field.format && field.format !== 'default') || ((field._descriptor && field._descriptor.format && field._descriptor.format !== 'default')) )" 
                            :class="'ma-0'  + displayClass('resources.' + key + '.tableSchema.fields.' + fkey.toString() + '.format')">
                        <v-col cols=3>
                            {{$tc('Format')}}:
                        </v-col>
                        <v-col cols=9>
                            {{field.format ? field.format : field._descriptor.format}}
                        </v-col>
                    </v-row>

                    <v-row v-if="field && (field.rdfType || (field._descriptor && field._descriptor.rdfType))" :class="'ma-0' + displayClass('resources.' + key + '.tableSchema.fields.' + fkey.toString() + '.rdfType')">
                        <v-col cols=3>
                            {{$tc('RDF Type')}}:
                        </v-col>
                        <v-col cols=9>
                            {{field.rdfType ? field.rdfType : field._descriptor.rdfType}}
                        </v-col>
                    </v-row>

                    <v-row v-if="field && (field.tags || (field._descriptor && field._descriptor.tags))" :class="'ma-0' + displayClass('resources.' + key + '.tableSchema.fields.' + fkey.toString() + '.tags')">
                        <v-col cols=3>
                            {{$tc('Tags', 2)}}:
                        </v-col>
                        <v-col cols=9>
                            {{field.tags ? field.tags : field._descriptor.tags}}
                        </v-col>
                    </v-row>

                    <v-row v-if="field && (field.missingValues || (field._descriptor && field._descriptor._missingValues))" :class="'ma-0' + displayClass('resources.' + key + '.tableSchema.fields.' + fkey.toString() + '.missingValues')">
                        <v-col cols=3>
                            {{$tc('Missing Value', 2)}}:
                        </v-col>
                        <v-col cols=9>
                            {{field.missingValues ? field.missingValues : field._descriptor._missingValues}}
                        </v-col>
                    </v-row>

                    <v-row v-if="field && (field.comments || (field._descriptor && field._descriptor.comments))" :class="'ma-0' + displayClass('resources.' + key + '.tableSchema.fields.' + fkey.toString() + '.comments')">
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