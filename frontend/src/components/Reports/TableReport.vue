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
                            <v-list-item v-for="(item, index) in exportTypes" :key="index" @click="goExport(item)">
                                <v-list-item-content>
                                    <v-list-item-title>{{item}}</v-list-item-title>
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
                    id="reportTable"
                    dense
                    :headers="headers"
                    :items="items"
                    :items-per-page="-1"
                >
                    <template v-slot:item="{ item }">
                        <tr>
                            <td v-for="(header, hInd) in headers" :key="`td-${hInd}`">{{computeValue(item, header.value)}}</td>
                        </tr>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        
    </v-container>
</template>

<script>

const exportCSV = 'csv';
const exportPDF = 'pdf';

import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

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
                exportTypes: [exportCSV, exportPDF]
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

            computeValue(item, stringIndex){
                let indexAt = stringIndex.split(".");
                let rv = item;
                try{
                    for (let i=0; i<indexAt.length; i++){
                        rv = rv[indexAt[i]];
                    }
                }catch(e){
                    // pass
                }
                return rv;
            },

            async goExport(type){
                let fileContents = '';
                let fileName = this.reportTitle;
                let fileMimeType = '';
                let download = true;

                let simpleArr = [];

                for (let i=0; i<this.items.length; i++){
                    simpleArr.push([]);
                    for (let j=0; j<this.headers.length; j++){
                        let value = this.items[i];
                        let digValues = this.headers[j].value.split(".");
                        for (let k=0; k<digValues.length; k++){
                            if (typeof(value) !== 'undefined'){
                                value = value[digValues[k]];
                            }
                        }
                        if (typeof(value) !== 'undefined'){
                            simpleArr[i].push(value);
                        }else{
                            simpleArr[i].push('');
                        }
                    }
                }

                if (type === exportCSV){
                    fileMimeType = 'text/csv';
                    fileName += ".csv";
                    for (let i=0; i<this.headers.length; i++){
                        fileContents += '"' + this.headers[i].text + '",'
                    }
                    //replace last , with newline
                    fileContents = fileContents.slice(0,-1) + "\n";

                    for (let i=0; i<simpleArr.length; i++){
                        for (let j=0; j<simpleArr[i].length; j++){
                            fileContents += '"' + simpleArr[i][j] + '",';
                        }
                        //replace last comma with newline
                        fileContents = fileContents.slice(0,-1) + "\n";
                    }
                    
                    //remove last newline
                    fileContents = fileContents.slice(0,-1);
                }else if (type === exportPDF){
                    fileName += ".pdf";
                    download = false;
                    let fileContents = new jsPDF({
                        orientation: "landscape",
                        unit: "in",
                        format: [11, 8.5]
                    });

                    let headers = [];
                    for (let i=0; i<this.headers.length; i++){
                        headers.push(this.headers[i].text);
                    }


                    fileMimeType = "application/pdf";
                    fileContents.text(this.reportTitle, 3, .5);
                    autoTable(fileContents, {
                        head: [headers],
                        body: simpleArr,
                        startY: 1,
                    })
                    fileContents.save(fileName);
                }
                if (download){
                    let download = require('downloadjs');
                    download(fileContents, fileName, fileMimeType);
                }
            }
        },

        mounted(){
        }
    };
</script>

<style scoped>
</style>
