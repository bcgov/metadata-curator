<template>
    <div style="margin-left: 10px; margin-bottom: 12px; width:65%;">
        <v-alert style="margin-left: 10px; margin-bottom: 12px; width:75%;"
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
