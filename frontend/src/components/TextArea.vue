<template>
    <div style="width:350px;">
        <ValidationProvider ref="provider" :rules="validationRules" v-slot="{ errors }" :name="label ? label : name">
            <v-textarea
                :label="displayLabel"
                :placeholder="placeholder"
                :name="name"
                v-model="val"
                :outlined="outlined"
                :auto-grow="autogrow"
                :error-messages="errors.length > 0 ? [errors[0]] : []"
                ref="txtArea"
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
                    return this.label + ' *';
                }
                return this.label;
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
