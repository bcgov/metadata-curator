<template>
    <div style="vertical-align: top !important; margin-top: 25px; margin-left:15px;">
        <h1 class="display-2 font-weight-thin" style="margin-top:15px; margin-bottom:20px;">Import Metadata</h1>
        <v-container fluid style="margin-left:5px; padding-bottom:0px; margin-bottom:7px;">
            <p>Please select type of metadata to import:</p>
            <v-radio-group v-model="metadataType" row style="margin-left:10px;">
                <v-radio label="Table Schema" value="table-schema"></v-radio>
                <v-radio label="Tabular Data Package" value="tabular-data-package"></v-radio>
            </v-radio-group>
        </v-container>
        <div style="width:350px; margin-left:15px; margin-bottom: 12px;">
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

        <v-alert v-if="errorMsg && !validationErrorsMsgs && validationErrorsMsgs.length > 0"  style="margin-left: 10px; margin-bottom: 12px; width:65%;"
                 text
                 prominent
                 type="error"
                 icon="mdi-cloud-alert">{{errorMsg}}</v-alert>

        <v-alert v-if="validationErrorsMsgs && validationErrorsMsgs.length > 0" style="margin-left: 10px; margin-bottom: 12px; width:65%;"
                 text
                 prominent
                 type="error"
                 icon="mdi-cloud-alert">
            <h4 style="margin-bottom: 10px; margin-left: 5px;">{{errorMsg}}</h4>
            <ul>
                <li v-for="error in validationErrorsMsgs" :key="error">{{error}}</li>
            </ul>
        </v-alert>

        <v-alert v-if="validationErrorsByResource && validationErrorsByResource.length > 0" style="margin-left: 10px; margin-bottom: 12px; width:65%;"
                 text
                 prominent
                 type="error"
                 icon="mdi-cloud-alert">
            <h4 style="margin-bottom: 10px; margin-left: 5px;">{{errorMsg}}</h4>
            <ul v-for="resourceErrorGroup in validationErrorsByResource" :key="resourceErrorGroup">
                Resource name: {{resourceErrorGroup[0]}}
                <li v-for="resourceError in resourceErrorGroup[1]" :key="resourceError.name" style="margin-left: 45px;">
                    {{resourceError.message}}
                </li>
            </ul>
        </v-alert>

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
            metadataType: 'table-schema'
        }
    },
    created() {
        this.resetSchemaImportState();
        this.resetFileState();
    },
    methods: {
        ...mapActions({
            createTableSchema: 'schemaImport/createTableSchema',
            createDataPackageSchema: 'schemaImport/createDataPackageSchema'
        }),
        ...mapMutations({
            resetFileState: 'file/resetState',
            setTableSchema: 'schemaImport/setTableSchema',
            setDataPackageSchema: 'schemaImport/setDataPackageSchema',
            resetSchemaImportState: 'schemaImport/resetState',
        }),
        importButtonClicked(content) {
            console.log("importButtonClicked");
            // console.log("schema: ", content);
            if(this.metadataType == 'table-schema') {
                this.setTableSchema({schema: content});
                this.saveTableSchema();
            }
            else {
                this.setDataPackageSchema({schema: content});
                this.saveDataPackageSchema();
            }
        },
        saveTableSchema() {
            // console.log("save schema");
            this.createTableSchema();
        },
        saveDataPackageSchema() {
            // console.log("save schema");
            this.createDataPackageSchema();
        }
    },
    computed: {
        ...mapState({
            successMsg: state => state.schemaImport.successMsg,
        }),
        ...mapGetters({
            errorMsg: 'schemaImport/errorMsg',
            validationErrorsMsgs: 'schemaImport/validationErrorMsgs',
            validationErrorsByResource: 'schemaImport/validationErrorsByResource'
        }),
    },
}
</script>
<style scoped>
</style>
