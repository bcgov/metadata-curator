<template>
    <v-container fluid>
        <v-row>
            <v-col cols=12>
                <span v-if="uploadStore">
                    <v-row v-for="(file, index) in uploadStore.files" :key="'fileReader'+index">
                        <v-col cols=12>
                            <v-row v-if="file.name">{{file.name}}</v-row>
                            <v-row v-if="file.title">{{$tc('Title')}}: {{file.title}}</v-row>
                            <v-row v-if="file.type">{{$tc('Type')}}: {{file.type}}</v-row>
                            <v-row v-if="file.size">{{$tc('Size')}}: {{file.size}}</v-row>
                            <v-row v-if="file.start_date">{{$tc('Date Range')}}: {{formatDate(file.start_date)}} - {{formatDate(file.end_date)}} </v-row>
                            <v-row v-if="file.description">{{$tc('Description')}}: {{file.description}}</v-row>
                            <v-row v-if="file.num_records">{{$tc('Number of Records')}}: {{file.num_records}}</v-row>
                        </v-col>
                    </v-row>
                </span>
            </v-col>
            <v-col cols="12">
                <v-row>
                    <v-col cols=6>
                        <TextInput
                            :label="$tc('Ministry / Organization')"
                            placeholder="Ministry or organization the data upload is coming from"
                            name="ministry_organization"
                            :editing="false"
                            :value="upload && upload.ministry_organization ? upload.ministry_organization : ''"
                            validation-rules="required"
                            helpPrefix="upload"
                            
                            @blur="(event) => { updateUpload('ministry_organization', event) }"
                        ></TextInput>
                    </v-col>
                    <v-col cols=6>
                        <TextInput
                            :label="$tc('Source System')"
                            placeholder="System of origin of the data being uploaded"
                            name="source"
                            :editing="false"
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
                            :editing="false"
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
                            :editing="false"
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
                            :editing="false"
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
                            :editing="false"
                            helpPrefix="upload"
                            :value="upload && upload.date_range_start ? upload.date_range_start : ''">
                        </DateInput>
                    </v-col>

                    <v-col cols=6>
                        <TextInput
                            :label="$tc('Number of files to be uploaded')"
                            placeholder="Total number of files you intend to upload"
                            name="num_files"
                            :editing="false"
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
                            :editing="false"
                            helpPrefix="upload"
                            :value="upload && upload.date_range_end ? upload.date_range_end : ''">
                        </DateInput>
                    </v-col>

                    <v-col cols=6>
                        <DateInput
                            :label="$tc('Date data was created or updated')"
                            placeholder="Date the data was extracted from the source system"
                            name="data_create_date"
                            :editing="false"
                            helpPrefix="upload"
                            validation-rules="required"
                            :value="upload && upload.data_create_date ? upload.data_create_date : ''">
                        </DateInput>
                    </v-col>
                </v-row>
            </v-col>

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
            
        </v-row>
    </v-container>
</template>

<script>

    import {mapActions, mapState} from "vuex";
    import TextInput from './TextInput';
    import TextArea from './TextArea';
    import DateInput from './DateInput';

    export default {
        mixins: [],
        components:{
            TextInput,
            TextArea,
            DateInput,
        },
        props: {
            uploadId: {
                type: String,
                required: true
            }
        },
        data: () => ({
            formSubmission: {},
            spanKey: 0,
            deprecatedKeys: ['ministryOrganization', "datasetName", "uploadDescription", 'numOfUploadFiles', 'createdUpdatedDate', 'sourceSystem', 'importantAdditionalInfo', 'daterangestart', 'dateRangeEnd']
        }),
        methods: {
            ...mapActions({
                getUpload: 'upload/getUpload',
                
            }),
            formatDate(d){
                if (d.substring(d.length-1) === "Z"){
                    d = d.substring(0,d.length-1);
                }
                var date = new Date(d);
                let month = new Array();
                month[0] = "January";
                month[1] = "February";
                month[2] = "March";
                month[3] = "April";
                month[4] = "May";
                month[5] = "June";
                month[6] = "July";
                month[7] = "August";
                month[8] = "September";
                month[9] = "October";
                month[10] = "November";
                month[11] = "December";
                return month[date.getMonth()] + " " + date.getDate() + ", " +date.getFullYear()
            }
        },

        computed: {
            ...mapState({
                uploadStore: state => state.upload.upload,
                upload: state => state.upload.upload,
            }),
        },

        mounted(){
            this.getUpload(this.uploadId);
            
        },

        watch: {
            // commentVal: function (newVal, oldVal) {
            //     console.log(`commentVal changed - oldVal: ${oldVal}, newVal: ${newVal}`);
            // },
            // eslint-disable-next-line no-unused-vars
            uploadStore: function (newVal, oldVal) {
                // eslint-disable-next-line no-undef
                if(newVal) {
                    this.formSubmission = {...newVal};
                }
            
            },
        }
    };
</script>

<style scoped>

</style>
