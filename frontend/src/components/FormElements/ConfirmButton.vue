<template>
    <v-btn
        :text="text"
        :color="color"
        @click="handleClick"
        v-click-outside="outside"
        :disabled="disabled"
        >
            <v-icon v-if="useIcon && !confirming">{{icon}}</v-icon>
            <span v-else>{{displayLabel}}</span>
    </v-btn>
</template>

<script>
    export default {
        components: {
        },

        props: {
            label: {
                type: String,
                required: true,
            },
            icon:{
                type: String,
                required: true,
            },
            useIcon:{
                type: Boolean,
                required: false,
                default: false,
            },
            color: {
                type: String
            },
            text: {
                type: Boolean,
                default: false
            },
            disabled: {
                type: Boolean,
                default: false,
            }
        },
        data() {
            return {
                confirming: false,
            }
        },

        computed: {
            displayLabel: function(){
                return (this.confirming) ? this.$tc('Confirm') + ' ' + this.label : this.label;
            }
        },

        methods: {
            handleClick: function(){
                if (this.confirming){
                    this.$emit('click');
                }
                this.confirming = !this.confirming
            },
            outside: function(){
                this.confirming = false;
            }
        }
    }
</script>

<style scoped>

</style>