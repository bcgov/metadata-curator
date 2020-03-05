<template>
    <div style="width:350px;">
        <ValidationProvider :rules="validationRules" v-slot="{ errors }" :name="label ? label : name">
            <v-select
                :label="displayLabel"
                :name="name"
                v-model="select"
                :items="items"
                :item-text="itemText"
                :item-value="itemValue"
                :error-messages="errors.length > 0 ? [errors[0]] : []"
                outlined
            ></v-select>
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
            items: {
                type: Array,
                required: false,
                default: () => []
            },
            itemText: {
                type: String,
                required: false,
                default: () => 'text'
            },
            itemValue: {
                type: String,
                required: false,
                default: () => 'value'
            },
            select: {
                type: String,
                required: false,
                default: () => null
            },

        },
        data() {
            return {
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
        // watch: {
        //     value: function (newVal, oldVal) {
        //         this.val = newVal
        //     },
        // }

    };
</script>

<style scoped>

</style>
