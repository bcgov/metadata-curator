<template>
    <v-alert style="margin-left: 10px; margin-bottom: 12px; width:65%;"
             text
             prominent
             type="error"
             icon="mdi-cloud-alert">{{message}}</v-alert>
</template>

<script>

    export default {
        props: {
            message: {
                type: String,
                required: true,
                default: () => ''
            },
        },
        data() {
            return {
            }
        },
    };
</script>

<style scoped>
</style>
