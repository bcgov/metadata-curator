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
    data () {
        return {
            tab: null,
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        }
    },
}
</script>
<style scoped>
</style>
