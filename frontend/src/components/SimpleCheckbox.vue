<template>
    <span>
        <v-checkbox
            v-model="checkbox"
            :color="clr"
            class="inline"
            :disabled="disabled"
            @change="$emit('edited', checkbox)"
        >
        </v-checkbox>
        <span class="higher">
            {{$tc(label)}}
            <v-tooltip right v-if="$te('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))">
                <template v-slot:activator="{ on }">
                    <v-icon color="label_colour" v-on="on">mdi-help-circle-outline</v-icon>
                </template>
                <span>&nbsp;{{$t('help.'+((helpPrefix) ? helpPrefix + '.' + name : name))}}</span>
            </v-tooltip>
        </span>
    </span>
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
            disabled: {
                type: Boolean,
                required: false,
                default: () => false,
            },
            name: {
                type: String,
                required: false,
                default: '',
            },
            helpPrefix: {
                type: String,
                required: false,
                default: '',
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

    .inline.v-input{
        display: inline-block;
    }

    .higher{
        line-height: 28px;
        vertical-align: text-bottom;
        font-size: 20px;
        font-weight: bold;
    }

</style>
