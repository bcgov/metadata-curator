<template>
    <div style="width: 75%;">
        <MetadataRevisions></MetadataRevisions>
    </div>
</template>
<script>

import MetadataRevisions from "../MetadataRevisions";
import {mapActions} from "vuex";

export default {
    components:{
        MetadataRevisions
    },
    created() {
        // console.log("dataUploadRevisions id param: " + this.$route.params.id);
        this.loadRevisions();
    },
    methods: {
        ...mapActions({
            getRevisions: 'dataUploadRevisions/getRevisions',
        }),
        async loadRevisions() {
            // this.message = 'Retrieving data upload revisions...';
            await this.getRevisions(this.$route.params.id);
            // this.message = '';
        },
    },
    data () {
        return {
        }
    },
}
</script>
<style scoped>
</style>
