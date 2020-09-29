<template>
    <v-container>
            <link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css'>
            <link rel='stylesheet' href='https://unpkg.com/formiojs@4.10.0/dist/formio.full.min.css'>
            <v-row>
                <v-col cols="12">
                     <v-switch
                        v-model="json_view"
                        :label="`Json View`"
                        ></v-switch>`
                </v-col>
            </v-row>
            <v-row v-if="!json_view">
                <v-col cols="12">
                    <v-text-field v-model="item.title" label="Title"></v-text-field>
                </v-col>
                <v-col cols="12">
                    <v-text-field v-model="item.name" label="Name"></v-text-field>
                </v-col>
                <v-col cols="12">
                    <v-text-field v-model="item.path" label="Api Path"></v-text-field>
                </v-col>
            </v-row>
            <FormBuilder v-if="!json_view" v-bind:form="item" v-bind:options="{}"></FormBuilder>
            <v-row v-if="json_view">
                <v-col cols="12">
                    <AlertError v-if="errorText !== ''" :message="errorText"></AlertError>
                </v-col>
            </v-row>
            <v-textarea v-if="json_view" v-model="itemString">
            </v-textarea>
        
        
    </v-container>
</template>

<script>

import { FormBuilder } from 'vue-formio';

import AlertError from '../AlertError';

export default {

    components:{
        FormBuilder: FormBuilder,
        AlertError: AlertError,
    },

    props: {
        item: {
            type: Object,
            required: true,
        },
        
    },

    data(){
        return {
            setId: (typeof(this.item._id) === "undefined"),
            json_view: "false",
            itemString: JSON.stringify(this.item),
            errorText: ""
        }
    },

    watch: {
        item: function(newVal){
            this.setId =  (typeof(newVal._id) === "undefined")
            this.itemString = JSON.stringify(newVal);
        },

        itemString: function(newVal){
            this.errorText = "";
            try {
                let o = JSON.parse(newVal);
                let ok = Object.keys(o);
                for (let i=0; i<ok.length; i++){
                    this.item[ok[i]] = o[ok[i]];
                }
                
            }catch(ex){
                this.errorText = "Invalid JSON";
            }
        },

        name: function(newVal){
            if (this.setId){
                this.item._id = newVal;
            }
        }
    }
}
</script>