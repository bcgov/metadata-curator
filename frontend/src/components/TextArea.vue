<template>
    <div style="width:350px;">
        <ValidationProvider :rules="validationRules" v-slot="{ errors }" :name="label ? label : name">
            <v-textarea
                :label="displayLabel"
                :placeholder="placeholder"
                :name="name"
                v-model="val"
                :outlined="outlined"
                :auto-grow="autogrow"
                :error-messages="errors.length > 0 ? [errors[0]] : []"
            ></v-textarea>
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
        },
        data() {
            return {
                val: this.value,
                outlined: true
            }
        },
        computed: {
            displayLabel: function () {
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
