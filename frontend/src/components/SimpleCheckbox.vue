<template>
        <v-checkbox
            :label="label"
            v-model="checkbox"
            :color="clr"
        ></v-checkbox>
</template>

<script>

    export default {
        props: {
            label: {
                type: String,
                required: false,
                default: () => ''
            },
            color: {
                type: String,
                required: false,
                default: () => 'blue'
            },
            checked: {
                type: Boolean,
                required: false,
                default: () => false
            },
        },
        data() {
            return {
                checkbox: false,
                clr: 'blue'
            }
        },
        mounted() {
            // console.log(`mounted - checked: ${this.checked}, color: ${this.color}`);
            if (this.checked) { this.checkbox = this.checked; }
            this.updateColor(this.color);
        },
        methods: {
            updateColor(newColor) {
                if(!newColor) { this.clr = 'blue'; }
                else { this.clr = newColor; }
            },
        },
        watch: {
            checked: function (newVal) {
                // console.log("watch checked: " + newVal);
                if(newVal != null) {
                    // console.log("newval update checkbox val");
                   this.checkbox = newVal;
                }
            },
            color: function (newVal) {
                // console.log("watch color: " + newVal);
                this.updateColor(newVal);
             },
        }
    }
</script>

<style scoped>

</style>
