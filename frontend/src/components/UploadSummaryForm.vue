<template>
    <v-container>
        <span :key="'uploadSummary'+spanKey">
            <v-row>
                <v-col cols=12>
                    <v-icon color="primary">mdi-check</v-icon> Data Uploaded Successfully
                </v-col>
            </v-row>
            <span v-if="uploadStore">
                <v-row v-for="(file, index) in uploadStore.files" :key="'fileReader'+index">
                    <v-col cols=12>
                        <v-row v-if="file.name">{{file.name}}</v-row>
                        <v-row v-if="file.title">Title: {{file.title}}</v-row>
                        <v-row v-if="file.type">Type: {{file.type}}</v-row>
                        <v-row v-if="file.size">Size: {{file.size}}</v-row>
                        <v-row v-if="file.start_date">Date Range: {{formatDate(file.start_date)}} - {{formatDate(file.end_date)}} </v-row>
                        <v-row v-if="file.description">Description: {{file.description}}</v-row>
                    </v-col>
                </v-row>
            </span>
        </span>
    </v-container>
</template>

<script>
    import { mapState } from "vuex";

    export default {
        name: 'UploadSummaryForm',
        components:{
        },
        props: {
        },
        
        methods: {
            formatDate(d){
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

        data () {
            return {
                uploadId: null,
                spanKey: 0
            }
        },
        computed: {
            ...mapState({
                uploadStore: state => state.upload.upload,
            }),
        },
        watch: {

            // eslint-disable-next-line no-unused-vars
            uploadStore: function (newVal, oldVal) {
                // eslint-disable-next-line no-undef
                if(newVal) {
                    // console.log("update  submission");
                    this.formSubmission = {...newVal};
                    this.spanKey++;
                }
            },
        },
    }
</script>







