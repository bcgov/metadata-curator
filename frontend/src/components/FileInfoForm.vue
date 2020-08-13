<template>
    <v-container>
        <span :key="'container'+spanKey">
            <v-row>
               <v-col cols=4 class="mx-2" v-for="(file, index) in files" :key="'fileinfo-'+index">
                   
                    <v-row>
                        <v-icon>mdi-file</v-icon>{{file.name}}
                    </v-row>
                    <v-row>
                        <v-text-field
                            v-model="title[index]"
                            label="Title"
                            placeholder="Title">
                        </v-text-field>
                    </v-row>

                    <v-row>
                        <v-select
                            v-model="type[index]"
                            :items="typeOptions"
                            label="File Type"
                            placeholder="File Type">
                        </v-select>
                    </v-row>

                    <v-row>
                        <v-menu
                            v-model="menu[index]"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                        >
                            <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                                v-model="start[index]"
                                label="Date Range Start"
                                prepend-icon="mdi-calendar"
                                readonly
                                v-bind="attrs"
                                v-on="on"
                            ></v-text-field>
                            </template>
                            <v-date-picker v-model="start[index]" @input="menu[index] = false"></v-date-picker>
                        </v-menu>
                    </v-row>

                    <v-row>
                        <v-menu
                            v-model="menu2[index]"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                        >
                            <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                                v-model="end[index]"
                                label="Date Range End"
                                prepend-icon="mdi-calendar"
                                readonly
                                v-bind="attrs"
                                v-on="on"
                            ></v-text-field>
                            </template>
                            <v-date-picker v-model="end[index]" @input="menu2[index] = false"></v-date-picker>
                        </v-menu>
                    </v-row>

                    <v-row>
                        <v-textarea
                            v-model="description[index]"
                            label="File"
                            placeholder="Description">
                        </v-textarea>
                    </v-row>
                </v-col>
            </v-row>   
        </span>    
    </v-container>
</template>

<script>
    import { mapState, mapActions } from "vuex";

    export default {
        name: 'FileInfoForm',
        components:{
        },
        props: {
        },
        
        mounted() {
            this.buildFiles();
        },
        methods: {

            ...mapActions({
                modifyStoreUpload: 'upload/modifyStoreUpload',
            }),

            updateFormSubmission(){
                let f = JSON.parse(JSON.stringify(this.formSubmission));

                for (let i=0; i<f.files.length; i++){
                    f.files[i].start_date = this.start[i];
                    f.files[i].end_date = this.end[i];
                    f.files[i].title = this.title[i];
                    f.files[i].type = this.type[i];
                    f.files[i].description = this.description[i];
                }
                this.modifyStoreUpload(f);
            },

            buildFiles(){
                if ( (typeof(this.formSubmission.files) !== "undefined") && (this.formSubmission.files.length > 0) ){
                    for (let i=0; i<this.formSubmission.files.length; i++){

                        //if its 1 it's only sig
                        if ( (typeof(this.handles[this.formSubmission.files[i].sig]) !== "undefined") && (typeof(this.handles[this.formSubmission.files[i].sig].name) !== "undefined") ){
                            this.files[i] = this.handles[this.formSubmission.files[i].sig]
                        }
                    }
                }else{
                    this.files = [];
                }
                this.spanKey++;
            }
        },
        data () {
            return {
                uploadId: null,
                formSubmission: {},
                spanKey: 0,
                files: [],
                description: [],
                title: [],
                end: [],
                start: [],
                type: [],
                typeOptions: ['Metadata', 'Documentation', 'Data', 'Other'],
                menu: [],
                menu2: [],
            }
        },
        computed: {
            ...mapState({
                uploadStore: state => state.upload.upload,
                handles: state => state.file.fileHandles
            }),
        },
        watch: {

            // eslint-disable-next-line no-unused-vars
            uploadStore: function (newVal, oldVal) {
                // eslint-disable-next-line no-undef
                if(newVal) {
                    // console.log("update  submission");
                    this.formSubmission = {...newVal};
                }
                this.buildFiles();
            },
        },
    }
</script>







