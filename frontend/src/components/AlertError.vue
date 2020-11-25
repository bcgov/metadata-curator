<template>
    <v-alert class="ml-2 mb-2"
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
