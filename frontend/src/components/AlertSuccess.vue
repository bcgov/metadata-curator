<template>
    <div class="ml-2 mb-2">
        <v-alert class="ml2 mb-2"
                 text
                 prominent
                 type="success"
                 icon="mdi-cloud-check">{{message}}</v-alert>
    </div>
</template>

<script>

    import MaterialDesignIcons from "../mixins/MaterialDesignIcons";

    export default {
        mixins: [MaterialDesignIcons],
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
