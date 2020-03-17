<template>
    <div style="vertical-align: top !important;">
        <h2 style="margin-left: 10px; margin-bottom: 15px;">Import</h2>
        <div style="width:350px; margin-left: 10px; margin-bottom: 12px;">
            <FileReader :show-encrypt-button="false"
                        :show-upload-button="false"
                        :show-import-button="true"
                        @import-button-clicked="importButtonClicked">
            </FileReader>
        </div>

        <v-alert v-if="successMsg" style="margin-left: 10px; margin-bottom: 12px; width:65%;"
            text
            prominent
            type="success"
            icon="mdi-cloud-check">{{successMsg}}</v-alert>

        <v-alert v-if="errorMsg && !validationErrorsMsgs"  style="margin-left: 10px; margin-bottom: 12px; width:65%;"
                 text
                 prominent
                 type="error"
                 icon="mdi-cloud-alert">{{errorMsg}} dis one</v-alert>

        <v-alert v-if="validationErrorsMsgs" style="margin-left: 10px; margin-bottom: 12px; width:65%;"
                 text
                 prominent
                 type="error"
                 icon="mdi-cloud-alert">
            <h4 style="margin-bottom: 10px; margin-left: 5px;">{{errorMsg}}</h4>
            <ul>
                <li v-for="error in validationErrorsMsgs" :key="error">{{error}}</li>
            </ul>
        </v-alert>

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
import {mapState, mapActions, mapMutations, mapGetters} from 'vuex';

export default {
    components:{
        FileReader,
    },
    data () {
        return {
        }
    },
    created() {
        this.resetSchemaImportState();
        this.resetFileState();
    },
    methods: {
        ...mapActions({
            createSchema: 'schemaImport/createSchema'
        }),
        ...mapMutations({
            resetFileState: 'file/resetState',
            setSchema: 'schemaImport/setSchema',
            resetSchemaImportState: 'schemaImport/resetState',
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
        ...mapState({
            successMsg: state => state.schemaImport.successMsg,
        }),
        ...mapGetters({
            errorMsg: 'schemaImport/errorMsg',
            validationErrorsMsgs: 'schemaImport/validationErrorMsgs'
        }),
    },
}
</script>
<style scoped>
</style>
