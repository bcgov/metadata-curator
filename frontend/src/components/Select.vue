<template>
    <div>
         <span v-if="!editing">
            <span class="mr-2">{{displayLabel}}</span>
            <span>{{val}}</span>
        </span>

        <span v-else>
            <ValidationProvider :rules="validationRules" v-slot="{ errors }" :name="label ? $tc(label) : $tc(name)">
                <v-select
                    :label="$tc(displayLabel)"
                    :name="name"
                    v-model="val"
                    :items="items"
                    :item-text="itemText"
                    :item-value="itemValue"
                    :error-messages="errors.length > 0 ? [errors[0]] : []"
                    @change="$emit('edited', val)"
                    outlined
                ></v-select>
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
            value: {
                type: String,
            },
            editing: {
                type: Boolean,
                required: false,
                default: () => false
            }

        },
        data() {
            return {
                val: null
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
        },
        mounted(){
            this.val = this.value;
        }

    };
</script>

<style scoped>

</style>
