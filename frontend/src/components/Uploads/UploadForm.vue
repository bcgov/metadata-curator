<template>
    <v-container>
        <v-row>
            <v-col cols=6>
                <Select
                    :label="$tc('Ministry / Organization')"
                    placeholder="Ministry or organization the data upload is coming from"
                    name="ministry_organization"
                    :editing="true"
                    :value="upload && upload.ministry_organization ? upload.ministry_organization : ''"
                    validation-rules="required"
                    helpPrefix="upload"
                    :autocomplete="true"
                    :items="false"
                    @blur="(event) => { updateUpload('ministry_organization', event) }"
                ></Select>
            </v-col>
            <v-col cols=6>
                <TextInput
                    :label="$tc('Source System')"
                    placeholder="System of origin of the data being uploaded"
                    name="source"
                    :editing="true"
                    :value="upload && upload.source ? upload.source : ''"
                    helpPrefix="upload"
                    
                    @blur="(event) => { updateUpload('source', event) }"
                ></TextInput>
            </v-col>


            <v-col cols=6>
                <TextInput
                    :label="$tc('Human Friendly Name')"
                    placeholder="Human friendly name(s) of the dataset, metadata and/or document"
                    name="name"
                    :editing="true"
                    :value="upload && upload.name ? upload.name : ''"
                    validation-rules="required"
                    helpPrefix="upload"
                    
                    @blur="(event) => { updateUpload('name', event) }"
                ></TextInput>
            </v-col>
            <v-col cols=6>
                <TextArea
                    :label="$tc('Important Additional Information')"
                    placeholder="Information relevant for a researcher planning research strategy (e.g., the data files are sorted by date of discharge rather than the date of admission). Purpose of the data (e.g., why it was collected and how?). This may also be provided as separate document files (e.g. PDF)"
                    name="information"
                    :editing="true"
                    :value="upload && upload.information ? upload.information : ''"
                    helpPrefix="upload"
                    
                    @blur="(event) => { updateUpload('information', event) }"
                ></TextArea>
            </v-col>
        

            <v-col cols=6>
                <TextArea
                    :label="$tc('Description')"
                    placeholder="High level description of the dataset, metadata, and/or documentation being uploaded"
                    name="description"
                    :editing="true"
                    :value="upload && upload.description ? upload.description : ''"
                    helpPrefix="upload"
                    validation-rules="required"
                    @blur="(event) => { updateUpload('description', event) }"
                ></TextArea>
            </v-col>
            <v-col cols=6>
                <DateInput
                    :label="$tc('Date Range Start')"
                    placeholder="Date range over which the data being uploaded spans"
                    name="date_range_start"
                    :editing="true"
                    helpPrefix="upload"
                    :value="upload && upload.date_range_start ? upload.date_range_start : ''"
                    @edited="(newValue) => { updateUploadE('date_range_start', newValue) }">
                </DateInput>
            </v-col>

            <v-col cols=6>
                <TextInput
                    :label="$tc('Number of files to be uploaded')"
                    placeholder="Total number of files you intend to upload"
                    name="num_files"
                    :editing="true"
                    :value="upload && upload.num_files ? upload.num_files : ''"
                    helpPrefix="upload"
                    validation-rules="required|numeric"
                    @blur="(event) => { updateUpload('num_files', event) }"
                ></TextInput>
            </v-col>
            <v-col cols=6>
                <DateInput
                    :label="$tc('Date Range End')"
                    placeholder="Date range over which the data being uploaded spans"
                    name="date_range_end"
                    :editing="true"
                    helpPrefix="upload"
                    :value="upload && upload.date_range_end ? upload.date_range_end : ''"
                    @edited="(newValue) => { updateUploadE('date_range_end', newValue) }">
                </DateInput>
            </v-col>

            <v-col cols=6>
                <DateInput
                    :label="$tc('Date data was created or updated')"
                    placeholder="Date the data was extracted from the source system"
                    name="data_create_date"
                    :editing="true"
                    helpPrefix="upload"
                    validation-rules="required"
                    :value="upload && upload.data_create_date ? upload.data_create_date : ''"
                    @edited="(newValue) => { updateUploadE('data_create_date', newValue) }">
                </DateInput>
            </v-col>
        </v-row>

        <v-row v-if="upload && upload.old_submission && upload.old_submission.data && Object.keys(upload.old_submission.data).length>0">
            <v-col cols=12>
                <h3>Deprecated fields</h3>
            </v-col>
            <span v-for="(field, key) in upload.old_submission.data" :key="'oldUploadFields-'+key" :style=" (deprecatedKeys.indexOf(key) === -1 && field) ? 'width: 50%;' : ''">
                <v-col cols=6 v-if="deprecatedKeys.indexOf(key) === -1 && field">
                    <TextInput
                        :label="$tc(key)"
                        :name="key"
                        :editing="false"
                        :value="field"
                        helpPrefix="upload"
                    ></TextInput>
                </v-col>
            </span>
        </v-row>
    </v-container>
</template>

<script>
    import { mapActions, mapState} from "vuex";
    import TextInput from '../FormElements/TextInput';
    import TextArea from '../FormElements/TextArea';
    import DateInput from '../FormElements/DateInput';

    export default {
        name: 'UploadForm',
        components:{
            TextInput,
            TextArea,
            DateInput,
        },
        props: {
        },
        mounted() {
            
        },
        data() {
            return {
                deprecatedKeys: ['ministryOrganization', "datasetName", "uploadDescription", 'numOfUploadFiles', 'createdUpdatedDate', 'sourceSystem', 'importantAdditionalInfo', 'daterangestart', 'dateRangeEnd']
            }
        },
        methods: {
            ...mapActions({
                modifyStoreUpload: 'upload/modifyStoreUpload',
            }),

            updateUpload: async function(key, event){
                let value = event.target.value;
                this.updateUploadE(key, value);
            },

            updateUploadE: async function(key, value){
                let newUp = this.upload ? JSON.parse(JSON.stringify(this.upload)) : {};
                newUp[key] = value;
                
                await this.modifyStoreUpload(newUp);
            }

        },
        
        computed: {
            ...mapState({
                upload: state => state.upload.upload,
            }),
        },
    }
</script>

