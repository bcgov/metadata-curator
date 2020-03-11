<template>
    <v-tabs
        background-color="accent-4"
        centered
        dark
        icons-and-text>
        <v-tabs-slider></v-tabs-slider>
        <v-tab to="/">
            Home
            <v-icon>mdi-phone</v-icon>
        </v-tab>
        <v-tab to="/import">
            Import
            <v-icon>mdi-import</v-icon>
        </v-tab>
        <v-tab to="/">
            Guess
            <v-icon>mdi-phone</v-icon>
        </v-tab>
    </v-tabs>
</template>

<script>
export default {


}
</script>

<style scoped>

</style>
