<template>
    <span>
        <v-checkbox
            v-model="checkbox"
            :color="clr"
            :disabled="disabled"
            :class="'ma-0 mt-n3' + (large ? ' bolded' : ' normalText') + (editing ? ' editMode' : '')"
            @change="$emit('edited', checkbox)"
        >
            <template v-slot:label>
                {{displayLabel}}&nbsp;
                <v-tooltip right v-model="showTooltip" v-if="$te('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))">
                    <template v-slot:activator="{}">
                        <v-icon color="label_colour" 
                            @mouseenter="showTooltip = true"
                            @mouseleave="closeOnLeave ? (showTooltip = false) : false">
                            mdi-help-circle-outline
                        </v-icon>
                    </template>
                    <span v-html="displayTooltip"></span>
                </v-tooltip>
            </template>
        </v-checkbox>
    </span>
</template>

<script>
    let marked = require('marked');

    export default {
        props: {
            label: {
                type: String,
                required: false,
                default: () => ''
            },
            color: {
                type: String,
                required: false,
                default: () => 'blue'
            },
            checked: {
                type: Boolean,
                required: false,
                default: () => false
            },
            disabled: {
                type: Boolean,
                required: false,
                default: () => false,
            },
            name: {
                type: String,
                required: false,
                default: '',
            },
            helpPrefix: {
                type: String,
                required: false,
                default: '',
            },
            large: {
                type: Boolean,
                required: false,
                default: false,
            },
            editing: {
                type: Boolean,
                required: false,
                default: true,
            }
        },
        data() {
            return {
                checkbox: false,
                clr: 'blue',
                showTooltip: false,
                closeOnLeave: true,
            }
        },
        computed:{
            displayTooltip: function(){
                let t = ''
                let translateKey = 'help.'+((this.helpPrefix) ? this.helpPrefix + '.' + this.name : this.name);
                if (this.$te(translateKey)){
                    t = this.$t(translateKey);
                }
                return marked(t);
            },
            displayLabel: function(){
                return this.$te(this.label) ? this.$tc(this.label) : this.label;
            }
        },
        mounted() {
            // console.log(`mounted - checked: ${this.checked}, color: ${this.color}`);
            if (this.checked) { this.checkbox = this.checked; }
            this.updateColor(this.color);
        },
        methods: {
            updateColor(newColor) {
                if(!newColor) { this.clr = 'blue'; }
                else { this.clr = newColor; }
            },
        },
        watch: {
            checked: function (newVal) {
                // console.log("watch checked: " + newVal);
                if(newVal != null) {
                    // console.log("newval update checkbox val");
                   this.checkbox = newVal;
                }
            },
            color: function (newVal) {
                // console.log("watch color: " + newVal);
                this.updateColor(newVal);
             },
        }
    }
</script>

<style scoped>
</style>

<style>

    .v-card>.v-card__subtitle .v-input .v-label, .v-card>.v-card__text .v-input .v-label{
        opacity: .7;
    }

    .v-card>.v-card__subtitle .v-input.editMode .v-label, .v-card>.v-card__text .v-input.editMode .v-label{
        opacity: 1;
        color: var(--v-text-base);
    }

    .v-input.normalText .v-label{
        font-size: 14px;
    }

    .v-input.bolded .v-label{
        font-weight: bold;
    }

</style>

