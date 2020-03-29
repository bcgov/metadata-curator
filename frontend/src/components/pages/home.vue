<template>
    <div>
<!--        <FileReader></FileReader>-->

        <DataUploads></DataUploads>
    </div>
</template>
<script>

import {mapMutations} from 'vuex';
// import FileReader from '../FileReader';
import DataUploads from "../DataUploads";

export default {
    components:{
        DataUploads,
        // FileReader,
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
