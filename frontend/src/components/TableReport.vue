<template>
    <v-container>
        <v-row>
            <v-col cols=2>
                <v-btn @click="back">Back</v-btn>
            </v-col>
            <v-col cols=8>
            </v-col>
            <v-col cols=2>
                <v-menu offset-y bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn v-on="on" color="success">Export</v-btn>
                    </template>
                    <v-list>
                        <v-list-item-group>
                            <v-list-item v-for="(item, index) in exportTypes" :key="index">
                                <v-list-item-content>
                                    <v-list-item-title @click="goExport(item)">{{item}}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list-item-group>
                    </v-list>
                </v-menu>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols=12 class="text-center">
                <h3>{{reportTitle}}</h3>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols=12>
                <v-data-table
                    dense
                    :headers="headers"
                    :items="items"
                    :items-per-page="-1"
                >
                </v-data-table>
            </v-col>
        </v-row>
        
    </v-container>
</template>

<script>

const exportCSV = 'csv';

    export default {
        components: {
        },

        props: {
            reportTitle: {
                type: String,
                required: true
            },

            headers: {
                type: Array,
                required: true
            },
            
            items: {
                type: Array,
                required: true
            },

            dialog: {
                type: Boolean,
                required: false,
                default: false,
            }
        },

        data() {
            return {
                exportTypes: [exportCSV]
            }
        },

        computed: {
        },

        watch: {
        },

        methods: {
            back: function(){
                if (this.dialog){
                    this.$emit('close');
                }else{
                    this.$router.back();
                }
            },

            goExport(type){
                let fileContents = '';
                let fileName = '';
                let fileMimeType = '';
                if (type === exportCSV){
                    fileMimeType = 'text/csv';
                    fileName = this.reportTitle + ".csv";
                    for (let i=0; i<this.headers.length; i++){
                        fileContents += '"' + this.headers[i].text + '",'
                    }
                    //replace last , with newline
                    fileContents = fileContents.slice(0,-1) + "\n";

                    for (let i=0; i<this.items.length; i++){
                        for (let j=0; j<this.headers.length; j++){
                            let value = this.items[i];
                            let digValues = this.headers[j].value.split(".");
                            for (let k=0; k<digValues.length; k++){
                                if (typeof(value) !== 'undefined'){
                                    value = value[digValues[k]];
                                }
                            }
                            if (typeof(value) !== 'undefined'){
                                fileContents += '"' + value + '",';
                            }else{
                                fileContents += '"' + '",';
                            }
                        }
                        //replace last comma with newline
                        fileContents = fileContents.slice(0,-1) + "\n";
                    }
                    //remove last newline
                    fileContents = fileContents.slice(0,-1)
                }
                let download = require('downloadjs');
                download(fileContents, fileName, fileMimeType);
            }
        },

        mounted(){
        }
    };
</script>

<style scoped>
</style>
