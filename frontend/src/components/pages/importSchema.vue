<template>
    <div style="vertical-align: top !important;">
        <h2>Import Page</h2>
        <div style="width:350px;">
            <FileReader :show-encrypt-button="false"
                        :show-upload-button="false"
                        :show-import-button="true"
                        @import-button-clicked="importButtonClicked">
            </FileReader>
        </div>
        <p>aklsdjfkljsdf ajsdfjsdf alksdfjlsdlf alksdjflsdjf alksjfkljdkslf</p>
        <p>aklsdjfkljsdf ajsdfjsdf alksdfjlsdlf alksdjflsdjf alksjfkljdkslf</p>
        <p>aklsdjfkljsdf ajsdfjsdf alksdfjlsdlf alksdjflsdjf alksjfkljdkslf</p>
        <p>aklsdjfkljsdf ajsdfjsdf alksdfjlsdlf alksdjflsdjf alksjfkljdkslf</p>
        <p>aklsdjfkljsdf ajsdfjsdf alksdfjlsdlf alksdjflsdjf alksjfkljdkslf</p>
        <p>aklsdjfkljsdf ajsdfjsdf alksdfjlsdlf alksdjflsdjf alksjfkljdkslf</p>
        <p>aklsdjfkljsdf ajsdfjsdf alksdfjlsdlf alksdjflsdjf alksjfkljdkslf</p>
        <p>aklsdjfkljsdf ajsdfjsdf alksdfjlsdlf alksdjflsdjf alksjfkljdkslf</p>
        <p>aklsdjfkljsdf ajsdfjsdf alksdfjlsdlf alksdjflsdjf alksjfkljdkslf</p>
        <p>aklsdjfkljsdf ajsdfjsdf alksdfjlsdlf alksdjflsdjf alksjfkljdkslf</p>
        <p>aklsdjfkljsdf ajsdfjsdf alksdfjlsdlf alksdjflsdjf alksjfkljdkslf</p>
        <p>aklsdjfkljsdf ajsdfjsdf alksdfjlsdlf alksdjflsdjf alksjfkljdkslf</p>
        <p>aklsdjfkljsdf ajsdfjsdf alksdfjlsdlf alksdjflsdjf alksjfkljdkslf</p>
        <p>aklsdjfkljsdf ajsdfjsdf alksdfjlsdlf alksdjflsdjf alksjfkljdkslf</p>
        <p>aklsdjfkljsdf ajsdfjsdf alksdfjlsdlf alksdjflsdjf alksjfkljdkslf</p>
        <p>aklsdjfkljsdf ajsdfjsdf alksdfjlsdlf alksdjflsdjf alksjfkljdkslf</p>

    </div>
</template>
<script>
import FileReader from '../FileReader';
import {mapActions, mapMutations} from 'vuex';

export default {
    components:{
        FileReader,
    },
    data () {
        return {
            label: "Import schema",
        }
    },
    created() {
        this.resetState();
    },
    methods: {
        ...mapActions({
            createSchema: 'schemaImport/createSchema'
        }),
        ...mapMutations({
            resetState: 'file/resetState',
            setSchema: 'schemaImport/setSchema'
        }),
        importButtonClicked(content) {
            console.log("importButtonClicked");
            // console.log("schema: ", content);
            this.setSchema({ schema: content});
            this.saveSchema();
        },
        saveSchema() {
            // console.log("save schema");
            this.createSchema();
        }
    },
    computed: {
    },
}
</script>
<style scoped>
</style>
