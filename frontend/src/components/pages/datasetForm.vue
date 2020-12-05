<template>
    <v-container fluid>
        <v-row dense>
            <v-tabs v-model="tab">
                <v-tab key="dataset">Dataset</v-tab>
                <v-tab key="schema">Schema</v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab" class="fullWidth">
                <v-tab-item key="dataset">
                    <DatasetForm></DatasetForm>
                </v-tab-item>
                <v-tab-item key="schema">
                </v-tab-item>
            </v-tabs-items>
        </v-row>
    </v-container>
</template>
<script>

import DatasetForm from '../DatasetForm';

export default {
    components:{
        DatasetForm
    },
    
    data () {
        return {
            tab: "dataset",
        }
    },
    methods: {
      
    },
}
</script>

<style scoped>
    .fullWidth{
        width: 100%;
    }

</style>