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

        <AlertSuccess v-if="successMsg" :message="successMsg"></AlertSuccess>

        <AlertError v-if="errorMsg && !validationErrorsMsgs && validationErrorsMsgs.length > 0" :message="errorMsg"></AlertError>

        <AlertValidationError v-if="validationErrorsMsgs && validationErrorsMsgs.length > 0"
            :message="errorMsg"
            :validation-error-messages="validationErrorsMsgs">
        </AlertValidationError>

        <AlertValidationError v-if="validationErrorsByResource && validationErrorsByResource.length > 0"
                              :message="errorMsg"
                              :validationErrorMessagesByGroup="validationErrorsByResource">
        </AlertValidationError>

    </div>
</template>
<script>
import FileReader from '../FileReader';
import {mapState, mapActions, mapMutations, mapGetters} from 'vuex';
import AlertSuccess from "../AlertSuccess";
import AlertError from "../AlertError";
import AlertValidationError from "../AlertValidationError";

export default {
    components:{
        AlertValidationError,
        AlertError,
        AlertSuccess,
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
