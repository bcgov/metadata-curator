<template>
    <div>
        <span v-if="!editing">
            <span class="mr-2">
                <h2 v-if="large" class="inline">
                    {{displayLabel}}{{(displayLabel && displayLabel.length>0) ? ':' : ''}}
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
                </h2>
                <span v-else>
                    {{displayLabel}}{{(displayLabel && displayLabel.length>0) ? ':' : ''}}
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
            </span>

            <span>
                <h2 v-if="large" class="inline" :id="idName ? idName : (name+'-value')">
                    {{val}}
                </h2>
                <span v-else :id="idName ? idName : (name+'-value')">
                    {{val}}
                </span>
            </span>
        </span>

        <span v-else>
            <ValidationProvider ref="provider" :rules="validationRules" v-slot="{ errors }" :name="label && $te(label) ? $tc(label) : name">
                <v-text-field
                    :placeholder="$te(placeholder) ? $tc(placeholder) : placeholder"
                    :name="name"
                    v-model="val"
                    :append-icon="( !password ? '' : (plainText ? 'mdi-eye' : 'mdi-eye-off') )"
                    :type="password && !plainText ? 'password' : 'text'"
                    :error-messages="errors.length > 0 ? [errors[0]] : []"
                    :outlined="outlined"
                    :ref="refName ? refName : 'txtField'"
                    :id="idName ? idName : ''"
                    @focus="$emit('focus', $event)"
                    @blur="$emit('blur', $event)"
                    @keydown="$emit('keydown', $event)"
                    @click:append="plainText = !plainText"
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
                </v-text-field>
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
            validationRules: {
                type: String,
                required: false,
                default: () => ''
            },
            value: {
                type: [String, Number, Array],
                required: false,
                default: () => ''
            },
            outlined: {
                type: Boolean,
                required: false,
                default: () => false
            },
            editing: {
                type: Boolean,
                required: false,
                default: () => false
            },
            large: {
                type: Boolean,
                required: false,
                default: () => false
            },
            helpPrefix: {
                type: String,
                required: false,
                default: "",
            },
            refName: {
                type: String,
                required: false,
                default: "",
            },
            idName: {
                type: String,
                required: false,
                default: "",
            },
            focusField: {
                type: String,
                required: false,
                default: "",
            },
            password: {
                type: Boolean,
                required: false,
                default: false,
            }
            
        },
        data() {
            return {
                val: Array.isArray(this.value) ? this.value.join(",") : this.value,
                showTooltip: false,
                closeOnLeave: true,
                plainText: false,
            }
        },
        methods: {

            clearValidation() {
                this.$refs.provider.reset();
            },
            reset() {
                this.$refs.txtField.reset();
            },
            focus() {
                this.$refs.txtField.focus();
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

            displayLabel: function(){
                if (this.validationRules.toLowerCase().indexOf("required") >= 0) {
                    return this.label + '*';
                }
                return this.label;
            }
        },
        watch: {
            value: function (newVal) {
                // console.log("newVal: " + newVal);
                // console.log("oldVal: " + oldVal);
                this.val = Array.isArray(newVal) ? newVal.join(',') : newVal;
            },
            val(){
                // console.log("val changed: ", this.val);
                this.$emit('edited', this.val);
            },
            // focusField: function(){
            //     if (this.focusField===this.refName){
            //         this.$nextTick(function () {
            //             if (this.$refs[this.focusField]){
            //                 this.$refs[this.focusField].focus();
            //             }
            //         });
            //     }
            // }
        },
        mounted(){
            // if (this.focusField===this.refName){
            //     if (this.$refs[this.focusField]){
            //         this.$refs[this.focusField].focus();
            //     }
            //     this.$nextTick(function () {
            //         if (this.$refs[this.focusField]){
            //             this.$refs[this.focusField].focus();
            //         }
            //     });
            // }
        },
    };
</script>

<style scoped>
    .inline{
        display: inline-block;
    }

</style>

<style>
    .v-input .v-label{
        height: 25px;
        font-size: 20px;
    }
</style>