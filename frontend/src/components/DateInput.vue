<template>
    <div>
        <span v-if="!editing">
            <span class="mr-2">
                <h2 v-if="large" class="inline">
                    {{displayLabel}}:
                    <v-tooltip right v-if="$te('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))">
                        <template v-slot:activator="{ on }">
                            <v-icon color="label_colour" v-on="on">mdi-help-circle-outline</v-icon>
                        </template>
                        <span>&nbsp;{{$t('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))}}</span>
                    </v-tooltip>
                </h2>
                <span v-else>
                    {{displayLabel}}:
                    <v-tooltip right v-if="$te('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))">
                        <template v-slot:activator="{ on }">
                            <v-icon color="label_colour" v-on="on">mdi-help-circle-outline</v-icon>
                        </template>
                        <span>&nbsp;{{$t('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))}}</span>
                    </v-tooltip>
                </span>
            </span>

            <span>
                <h2 v-if="large" class="inline">
                    {{val}}
                </h2>
                <span v-else>
                    {{val}}
                </span>
            </span>
        </span>

        <span v-else>
            <ValidationProvider ref="provider" :rules="validationRules" v-slot="{ errors }" :name="label ? ($te(label) ? $tc(label) : label) : ($te(name) ? $tc(name) : name)">
                <v-menu
                    v-model="menuOpen"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                            :placeholder="placeholder"
                            v-model="val"
                            :label="displayLabel"
                            prepend-icon="mdi-calendar"
                            autocomplete="off"
                            v-bind="attrs"
                            v-on="on"
                            @change="$emit('edited', val)"
                            :name="name"
                            :error-messages="errors.length > 0 ? [errors[0]] : []"
                            :ref="refName ? refName : 'dateField'"
                            :id="idName ? idName : ''"
                            @focus="$emit('focus', $event)"
                            @blur="$emit('blur', $event)"
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
                        </v-text-field>
                    </template>
                    <v-date-picker v-model="val" @input="menuOpen = false" @change="$emit('edited', val)"></v-date-picker>
                </v-menu>
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
            validationRules: {
                type: String,
                required: false,
                default: () => ''
            },
            value: {
                type: [String, Date],
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
            }
            
        },
        data() {
            let v = this.value;
            let tryDate = false;
            try{
                v = this.value.toISOString().split('T')[0];
            }catch(ex){
                tryDate = true;
            }

            if (tryDate){
                try{
                    v = new Date(this.value).toISOString().split('T')[0];
                }catch(ex){
                    v = ""
                }
            }

            return {
                val: v,
                menuOpen: false,
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
            displayLabel: function(){
                if (this.validationRules.toLowerCase().indexOf("required") >= 0) {
                    return this.$te(this.label) ? (this.$tc(this.label) + ' *') : this.label + ' *';
                }
                return this.$te(this.label) ? this.$tc(this.label) : this.label;
            }
        },
        watch: {
            value: function (newVal) {
                try{
                    this.val = newVal.toISOString().split('T')[0];
                }catch{
                    this.val = new Date(newVal).toISOString().split('T')[0];
                }
            },
            val(){
                this.$emit('edited', this.val);
            },
        },
        mounted(){
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