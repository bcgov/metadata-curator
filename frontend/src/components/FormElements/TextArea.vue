<template>
    <div>
         <span v-if="!editing">
            <span class="mr-2">
                {{displayLabel}}:
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
            </span>
            <span :id="idName ? idName : (name+'-value')">{{val}}</span>
        </span>

        <span v-else>
            <ValidationProvider ref="provider" :rules="validationRules" v-slot="{ errors }" :name="label && $te(label) ? $tc(label) : name">
                <v-textarea
                    :placeholder="$tc(placeholder)"
                    :name="name"
                    v-model="val"
                    :outlined="outlined"
                    :auto-grow="autogrow"
                    :error-messages="errors.length > 0 ? [errors[0]] : []"
                    ref="txtArea"
                    :id="idName ? idName : ''"
                    @blur="$emit('blur', $event)"
                >
                    <template v-slot:prepend>
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
                </v-textarea>
            </ValidationProvider>
        </span>
    </div>
</template>

<script>

    import ValidationRules from "../../mixins/ValidationRules";
    let marked = require('marked');

    export default {
        mixins: [ValidationRules],
        props: {
            name: {
                type: String,
                required: true,
                default: () => ''
            },
            label: {
                type: String,
                required: true,
                default: () => ''
            },
            placeholder: {
                type: String,
                required: false,
                default: () => ''
            },
            autogrow: {
                type: Boolean,
                required: false,
                default: () => true
            },
            validationRules: {
                type: String,
                required: false,
                default: () => ''
            },
            value: {
                type: String,
                required: false,
                default: () => ''
            },
            outlined: {
                type: Boolean,
                required: false,
                default: () => true
            },
            normal: {
                type: Boolean,
                required: false,
                default: () => true
            },
            editing: {
                type: Boolean,
                required: false,
                default: () => false
            },
            helpPrefix: {
                type: String,
                required: false,
                default: ''
            },
            idName: {
                type: String,
                required: false,
                default: ''
            }
        },
        data() {
            return {
                val: this.value,
                showTooltip: false,
                closeOnLeave: true,
            }
        },

        methods: {
            clearValidation() {
                this.$refs.provider.reset();
            },
            reset() {
                this.$refs.txtArea.reset();
            },
            focus() {
                this.$refs.txtArea.focus();
            }
        },

        computed: {
            displayTooltip: function(){
                let t = ''
                let translateKey = 'help.'+((this.helpPrefix) ? this.helpPrefix + '.' + this.name : this.name);
                if (this.$te(translateKey)){
                    t = this.$t(translateKey);
                }
                return marked(t);
            },

            displayLabel: function () {
                if (this.validationRules.toLowerCase().indexOf("required") >= 0) {
                    return this.$te(this.label) ? this.$tc(this.label) + '*' : this.label + '*';
                }
                return this.$te(this.label) ? this.$tc(this.label) : this.label;
            }
        },
        watch: {
            value: function (newVal) {
                this.val = newVal
            },
            val(){
                // console.log("val changed: ", this.val);
                this.$emit('edited', this.val);
            },
        }

    };
</script>

<style>

</style>
