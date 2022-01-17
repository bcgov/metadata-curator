<template>
    <div>
         <span v-if="!editing">
            <span class="mr-2">
                {{displayLabel}}
                <v-tooltip right v-if="$te('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))">
                    <template v-slot:activator="{ on }">
                        <v-icon color="label_colour" v-on="on">mdi-help-circle-outline</v-icon>
                    </template>
                    <span>&nbsp;{{$t('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))}}</span>
                </v-tooltip>
            </span>
            <span>{{val}}</span>
        </span>

        <span v-else>
            <ValidationProvider ref="provider" :rules="validationRules" v-slot="{ errors }" :name="label ? $tc(label) : $tc(name)">
                <v-textarea
                    :placeholder="$tc(placeholder)"
                    :name="name"
                    v-model="val"
                    :outlined="outlined"
                    :auto-grow="autogrow"
                    :error-messages="errors.length > 0 ? [errors[0]] : []"
                    ref="txtArea"
                    :id="idName ? idName : ''"
                >
                    <template v-slot:label>
                        {{displayLabel}}
                        <v-tooltip right v-if="$te('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))">
                            <template v-slot:activator="{ on }">
                                <v-icon color="label_colour" v-on="on">mdi-help-circle-outline</v-icon>
                            </template>
                            <span>&nbsp;{{$t('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))}}</span>
                        </v-tooltip>
                    </template>
                </v-textarea>
            </ValidationProvider>
        </span>
    </div>
</template>

<script>

    import ValidationRules from "../mixins/ValidationRules";

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
            displayLabel: function () {
                if (this.validationRules.toLowerCase().indexOf("required") >= 0) {
                    return this.$tc(this.label) + ' *';
                }
                return this.$tc(this.label);
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

<style scoped>

</style>
