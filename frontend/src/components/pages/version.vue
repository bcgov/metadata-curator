<template>
    <div>
        <v-tabs
            v-model="tab"
        >
            <v-tab key="general">
                Version Info
            </v-tab>
            <v-tab key="meta">
                Metadata
            </v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab">
            <v-tab-item key="general">
                <BranchForm></BranchForm>
            </v-tab-item>

            <v-tab-item key="meta">
                <MetadataForm></MetadataForm>
            </v-tab-item>
        </v-tabs-items>
        
    </div>
</template>
<script>

import BranchForm from "../BranchForm";
import MetadataForm from "../MetadataForm";

export default {
    components:{
        BranchForm,
        MetadataForm,
    },
    data(){
        return {
            tab: null
        }
    }
}
</script>
<style scoped>
</style>
