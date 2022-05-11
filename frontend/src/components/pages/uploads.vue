<template>
    <div>
        <DataUploads></DataUploads>
    </div>
</template>
<script>

import {mapMutations} from 'vuex';
import DataUploads from "../Uploads/DataUploads";

export default {
    components:{
        DataUploads,
    },
    created() {
        this.resetState();
    },
    methods: {
        ...mapMutations({
            resetState: 'file/resetState'
        }),
    },
}
</script>
<style scoped>
</style>
