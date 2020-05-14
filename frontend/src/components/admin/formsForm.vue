<template>
    <v-container>
            <link ref="bsCSS" rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css'>
            <link ref="formioCSS" rel='stylesheet' href='https://unpkg.com/formiojs@latest/dist/formio.full.min.css'>
            <v-row>
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
            <FormBuilder v-bind:form="item" v-bind:options="{}"></FormBuilder>
        
        
    </v-container>
</template>

<script>
import { FormBuilder } from 'vue-formio';

export default {

    components:{
        FormBuilder: FormBuilder,
    },

    props: {
        item: {
            type: Object,
            required: true,
        },
        open: {
            type: Boolean
        }
        
    },

    data(){
        return {
            setId: (typeof(this.item._id) === "undefined")
        }
    },

    watch: {
        item: function(newVal){
            this.setId =  (typeof(newVal._id) === "undefined")
        },
        open: function(newVal){
            this.$refs['bsCSS'].disabled = !newVal;
            this.$refs['formioCSS'].disabled = !newVal;
        },
        name: function(newVal){
            if (this.setId){
                this.item._id = newVal;
            }
        }
    }
}
</script>