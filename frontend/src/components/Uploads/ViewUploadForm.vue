<template>
    <v-container fluid class="mt-2">
        <v-row>
            <v-row>
                <h3>Upload Information</h3>
            </v-row>
            <v-col cols="12">
                <v-row>
                    <v-col cols=6>
                        <TextInput
                            :label="$tc('Ministry / Organization')"
                            name="ministry_organization"
                            :editing="false"
                            :autocomplete="true"
                            :value="upload && upload.ministry_organization ? upload.ministry_organization : ''"
                            helpPrefix="upload"
                        ></TextInput>
                    </v-col>
                    <v-col cols=6>
                        <TextInput
                            :label="$tc('Source System')"
                            name="source"
                            :editing="false"
                            :value="upload && upload.source ? upload.source : ''"
                            helpPrefix="upload"
                        ></TextInput>
                    </v-col>


                    <v-col cols=6>
                        <TextInput
                            :label="$tc('Human Friendly Name')"
                            name="name"
                            :editing="false"
                            :value="upload && upload.name ? upload.name : ''"
                            helpPrefix="upload"
                        ></TextInput>
                    </v-col>
                    <v-col cols=6>
                        <TextArea
                            :label="$tc('Important Additional Information')"
                            name="information"
                            :editing="false"
                            :value="upload && upload.information ? upload.information : ''"
                            helpPrefix="upload"
                        ></TextArea>
                    </v-col>
                

                    <v-col cols=6>
                        <TextArea
                            :label="$tc('Description')"
                            name="description"
                            :editing="false"
                            :value="upload && upload.description ? upload.description : ''"
                            helpPrefix="upload"
                        ></TextArea>
                    </v-col>
                    <v-col cols=6>
                        <DateInput
                            :label="$tc('Date Range Start')"
                            name="date_range_start"
                            :editing="false"
                            helpPrefix="upload"
                            :value="upload && upload.date_range_start ? upload.date_range_start : ''">
                        </DateInput>
                    </v-col>

                    <v-col cols=6>
                        <TextInput
                            :label="$tc('Number of files to be uploaded')"
                            name="num_files"
                            :editing="false"
                            :value="upload && upload.num_files ? upload.num_files : ''"
                            helpPrefix="upload"
                        ></TextInput>
                    </v-col>
                    <v-col cols=6>
                        <DateInput
                            :label="$tc('Date Range End')"
                            name="date_range_end"
                            :editing="false"
                            helpPrefix="upload"
                            :value="upload && upload.date_range_end ? upload.date_range_end : ''">
                        </DateInput>
                    </v-col>

                    <v-col cols=6>
                        <DateInput
                            :label="$tc('Date data was created or updated')"
                            name="data_create_date"
                            :editing="false"
                            helpPrefix="upload"
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
            
            <v-col cols=12>
                <span v-if="uploadStore">
                    <v-row>
                        <h3>Included Files</h3>
                    </v-row>
                    <v-row>
                        <v-col cols=6 v-for="(file, index) in uploadStore.files" :key="'fileReader'+index" class="bordered mb-2">
                            <v-row>
                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('File Name')"
                                        placeholder=""
                                        name="name"
                                        :editing="false"
                                        :value="file.name"
                                        helpPrefix="upload"
                                    ></TextInput>
                                </v-col>
                            </v-row>
                            <v-row v-if="file.title">
                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Title')"
                                        placeholder=""
                                        name="title"
                                        :editing="false"
                                        :value="file.title"
                                        helpPrefix="upload"
                                    ></TextInput>
                                </v-col>
                            </v-row>
                            <v-row v-if="file.type">
                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Type')"
                                        placeholder=""
                                        name="type"
                                        :editing="false"
                                        :value="file.type"
                                        helpPrefix="upload"
                                    ></TextInput>
                                </v-col>
                            </v-row>
                            <v-row v-if="file.size">
                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Size')"
                                        placeholder=""
                                        name="size"
                                        :editing="false"
                                        :value="file.size"
                                        helpPrefix="upload"
                                    ></TextInput>
                                </v-col>
                            </v-row>

                            <v-row v-if="file.start_date && file.end_date">
                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Date Range')"
                                        placeholder=""
                                        name="date_range"
                                        :editing="false"
                                        :value="formatDate(file.start_date) + ' - ' + formatDate(file.end_date)"
                                        helpPrefix="upload"
                                    ></TextInput>
                                </v-col>
                            </v-row>

                            <v-row v-if="file.temporal_fields">
                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Temporal range verification field(s)')"
                                        placeholder=""
                                        name="temporal_fields"
                                        :editing="false"
                                        :value="file.temporal_fields"
                                        helpPrefix="upload"
                                    ></TextInput>
                                </v-col>
                            </v-row>

                            <v-row v-if="file.description">
                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Description')"
                                        placeholder=""
                                        name="description"
                                        :editing="false"
                                        :value="file.description"
                                        helpPrefix="upload"
                                    ></TextInput>
                                </v-col>
                            </v-row>

                            <v-row v-if="file.num_records">
                                <v-col cols=12>
                                    <TextInput
                                        :label="$tc('Number of Records')"
                                        placeholder=""
                                        name="num_records"
                                        :editing="false"
                                        :value="file.num_records"
                                        helpPrefix="upload"
                                    ></TextInput>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </span>
            </v-col>

        </v-row>
    </v-container>
</template>

<script>

    import {mapActions, mapState} from "vuex";
    import TextInput from '../FormElements/TextInput';
    import TextArea from '../FormElements/TextArea';
    import DateInput from '../FormElements/DateInput';

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
    .bordered{
        border: 1px solid;
    }
</style>
