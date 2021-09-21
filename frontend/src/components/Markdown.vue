<template>
    <div>
        <label class="label">
            {{$tc(displayLabel)}}{{ (displayLabel.length > 0) ? ':' : ''}}
        </label>
        <span v-if="!editing" v-html="displayValue" class="value"></span>
        <div v-else>
            <div class="toolbar">
                <v-btn tabindex="-1" icon small @click="add('#')">H1</v-btn>
                <v-btn tabindex="-1" icon small @click="add('##')">H2</v-btn>
                <v-btn tabindex="-1" icon small @click="add('###')">H3</v-btn>
                <v-btn tabindex="-1" icon small @click="wrap('*')"><v-icon>mdi-format-italic</v-icon></v-btn>
                <v-btn tabindex="-1" icon small @click="wrap('**')"><v-icon>mdi-format-bold</v-icon></v-btn>
                <v-btn tabindex="-1" icon small @click="wrap('~~')"><v-icon>mdi-format-strikethrough</v-icon></v-btn>
                <v-btn tabindex="-1" icon small @click="add('- ')"><v-icon>mdi-format-list-bulleted</v-icon></v-btn>
                <v-btn tabindex="-1" icon small @click="add('1. ')"><v-icon>mdi-format-list-numbered</v-icon></v-btn>
                <v-btn tabindex="-1" icon small @click="add('&nbsp;&nbsp;&nbsp;&nbsp;')"><v-icon>mdi-format-indent-increase</v-icon></v-btn>
            </div>
            
                <v-textarea
                    ref="ta"
                    :name="name"
                    :label="placeholder"
                    v-model="model"
                    :disabled="disabled"
                    outlined dense
                    
                ></v-textarea>
            
        </div>
    </div>
</template>

<script>

let marked = require('marked');

export default {

    props: {
        name: String,
        value: String,
        label: String,
        editing: Boolean,
        placeholder: String,
        validationRules: {
            type: String,
            required: false,
            default: ""
        },
        scope: String,
        disabled: {
            type: Boolean,
            default: false
        },
    },

    data() {
        return {
            model: this.value,
            scopeName: this.scope + '.' + this.name,
        }
    },

    computed: {
        displayValue: function(){
            if (this.model){
                return marked(this.model);
            }
            return "";
        },
        displayLabel: function(){
            return this.label;
        }
    },

    watch: {
        value(){
            this.model = this.value;
        },
        model() {
            this.$emit('edited', this.model);
        },
    },

    methods: {
        add: function(markup, replace){
            if (typeof(replace) === "undefined"){
                replace = false;
            }
            var tArea = document.getElementsByName(this.name)[0];
            // get cursor's position
            let startPos = tArea.selectionStart;
            let endPos = replace ? tArea.selectionEnd : startPos;

            this.model = this.model.substring(0,startPos) + markup + this.model.substring(endPos, this.model.length);

            // move cursor & refocus
            setTimeout(() => {
                startPos += markup.length;
                tArea.selectionStart = tArea.selectionEnd = startPos;
                tArea.focus();
            }, 10);
        },
        wrap: function(markup){
            var tArea = document.getElementsByName(this.name)[0];
            // get cursor's position
            let startPos = tArea.selectionStart;
            let endPos = tArea.selectionEnd;

            if (startPos != endPos){
                this.model = this.model.substring(0,startPos) + markup + this.model.substring(startPos,endPos) + markup + this.model.substring(endPos, this.model.length);
            }else{
                this.model = this.model.substring(0,startPos) + markup + markup + this.model.substring(startPos, this.model.length)
            }

            // move cursor & refocus
            setTimeout(() => {
                startPos += markup.length;
                tArea.selectionStart = tArea.selectionEnd = startPos;
                tArea.focus();
            }, 10);
        }
    }
};
</script>

<style scoped>
   
</style>