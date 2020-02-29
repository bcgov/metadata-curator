<template>
        <ValidationProvider :rules="validate" v-slot="{ errors }" :name="label ? label : name">
            <v-text-field
                :label="label"
                :placeholder="placeholder"
                :name="name"
                v-model="val"
                :error-messages="errors.length > 0 ? [errors[0]] : []"
                outlined
            ></v-text-field>
        </ValidationProvider>
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
            value: {
                type: String,
                required: false,
                default: () => ''
            },
        },
        data() {
            return {
                val: this.value,
                // validate: ((this.field.required)? 'required' : ''),
                validate: 'required'
            }
        },
        watch: {
            value: function (newVal, oldVal) {
                this.val = newVal
            },
        }

    };
</script>

<style scoped>
</style>
