<template>
    <div style="width:350px;">
        <ValidationProvider :rules="validationRules" v-slot="{ errors }" :name="label ? label : name">
            <v-text-field
                :label="displayLabel"
                :placeholder="placeholder"
                :name="name"
                v-model="val"
                :error-messages="errors.length > 0 ? [errors[0]] : []"
                outlined
            ></v-text-field>
        </ValidationProvider>
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
        },
        data() {
            return {
                val: this.value,
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
            value: function (newVal, oldVal) {
                this.val = newVal
            },
        }

    };
</script>

<style scoped>

</style>
