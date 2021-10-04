<template>
    <div>
        <span v-if="!editing">
            <span class="mr-2">
                <h2 v-if="large" class="inline">
                    {{$tc(displayLabel)}}:
                </h2>
                <span v-else>
                    {{$tc(displayLabel)}}:
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
            <ValidationProvider ref="provider" :rules="validationRules" v-slot="{ errors }" :name="label ? $tc(label) : $tc(name)">
                <v-text-field
                    :label="$tc(displayLabel)"
                    :placeholder="$tc(placeholder)"
                    :name="name"
                    v-model="val"
                    :error-messages="errors.length > 0 ? [errors[0]] : []"
                    :outlined="outlined"
                    ref="txtField"
                ></v-text-field>
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
                type: String,
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
                this.$refs.txtField.reset();
            },
            focus() {
                this.$refs.txtField.focus();
            }
        },
        computed: {
            displayLabel: function(){
                if (this.validationRules.toLowerCase().indexOf("required") >= 0) {
                    return this.label + ' *';
                }
                return this.label;
            }
        },
        watch: {
            value: function (newVal) {
                // console.log("newVal: " + newVal);
                // console.log("oldVal: " + oldVal);
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
    .inline{
        display: inline-block;
    }

</style>
