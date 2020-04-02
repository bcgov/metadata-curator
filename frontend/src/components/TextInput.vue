<template>
    <div style="width:350px;">
        <ValidationProvider :rules="validationRules" v-slot="{ errors }" :name="label ? label : name">
            <v-text-field
                :label="displayLabel"
                :placeholder="placeholder"
                :name="name"
                v-model="val"
                :error-messages="errors.length > 0 ? [errors[0]] : []"
                :outlined="outlined"
                :normal="normal"
                ref="txtField"
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
            outlined: {
                type: Boolean,
                required: false,
                default: () => false
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
                console.log("clear validation");
                this.$refs.txtField.reset();
                this.$refs.txtField.resetValidation();
            },
            focus() {
                console.log("focus");
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
            value: function (newVal, oldVal) {
                console.log("newVal: " + newVal);
                console.log("oldVal: " + oldVal);
                this.val = newVal
            },
            val(){
                console.log("val changed: ", this.val);
                this.$emit('edited', this.val);
            },
        }
    };
</script>

<style scoped>

</style>
