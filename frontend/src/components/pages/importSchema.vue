<template>
    <div class="mt-3 ml-2">
        <h1 class="display-1 font-weight-thin mt-2 mb-3">Import Metadata</h1>
        <v-container fluid class="ml-1 pb-0 mb-1">
            <p>Please select type of metadata to import:</p>
            <v-radio-group v-model="metadataType" row class="ml-1">
                <v-radio label="Table Schema" value="table-schema"></v-radio>
                <v-radio label="Tabular Data Package" value="tabular-data-package"></v-radio>
            </v-radio-group>
        </v-container>
        <div class="ml-2 mb-2">
            <FileReader :show-encrypt-button="true"
                        :show-upload-button="true"
                        :show-import-button="false"
                        :read-file="true"
                        :trigger-upload="upload[0]"
                        @import-button-clicked="importButtonClicked"
                        @upload-button-clicked="uploadButtonClicked"
                        @upload-finished="uploadFinished">
            </FileReader>
            <FileReader :show-encrypt-button="true"
                        :show-upload-button="false"
                        :show-import-button="false"
                        :read-file="false"
                        :trigger-upload="upload[1]"
                        @import-button-clicked="importButtonClicked"
                        @upload-button-clicked="uploadButtonClicked"
                        @upload-finished="uploadFinished">
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
import Vue from 'vue';

export default {
    components:{
        AlertValidationError,
        AlertError,
        AlertSuccess,
        FileReader,
    },
    data () {
        return {
            metadataType: 'table-schema',
            uploadInProgress: 0,
            upload: [false, false],
            qq: false,
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

        uploadButtonClicked(){
            this.upload[0] = true;
        },

        uploadFinished(){
            Vue.set(this.upload, this.uploadInProgress, false);
            this.uploadInProgress += 1;
            Vue.set(this.upload, this.uploadInProgress, true);
        },



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
