<template>
    <v-container>

        <v-dialog 
            v-model="preview"
            fullscreen
            hide-overlay
            transition="dialog-bottom-transition">
                <v-card>
                    <v-card-title>
                        {{$tc('Preview')}}
                        <v-spacer></v-spacer>
                        <v-btn @click="preview = false"><v-icon>mdi-close</v-icon></v-btn>
                    </v-card-title>
                    <v-card-text v-if="viewType === 'application/pdf'">
                        <pdf :src="renderContent" :page="page">
                            <template slot="loading">
                                Loading...
                            </template>
                        </pdf>
                        <v-row>
                            <v-col cols=2></v-col>
                            <v-col cols=1>
                                <v-btn color="primary" @click="page -= 1">Back</v-btn>
                            </v-col>
                            <v-col cols=1>{{page}}/{{numPages}}</v-col>
                            <v-col cols=1>
                                <v-btn color="primary" @click="page += 1">Next</v-btn>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-text v-else-if="viewType === 'text/csv'">
                        <v-data-table
                            id="reportTable"
                            dense
                            :headers="renderHeaders"
                            :items="renderItems"
                            :items-per-page="-1"
                        >
                        </v-data-table>
                    </v-card-text>
                    <v-card-text v-else-if="viewType === 'image'">
                        <v-img :src="renderContent"></v-img>
                    </v-card-text>
                    <v-card-text v-else>
                        Unknown preview type, how did you get here?
                    </v-card-text>
                </v-card>
        </v-dialog>

        <v-row>
            <v-col cols=12>
                <v-alert
                    :type="alertType"
                    dismissible
                    v-model="alert">
                        {{alertText}}
                </v-alert>
            </v-col>
            <v-col cols=12>
                <h3>{{$tc('Supplemental Information')}}</h3>
            </v-col>

        </v-row>

        <v-row>
            <v-col cols=6>
                <h4>Attached files</h4>
            </v-col>
            <v-col cols=2>
                <h4>Public</h4>
            </v-col>
        </v-row>

        <v-row v-for="(file, index) in branch.supplemental_files" :key="'supp-file-'+index">
            <v-col cols=6>
                <v-icon>
                    {{ 
                        (fileType(file.name) === 'csv') ? 'mdi-file-delimited' : (
                            fileType(file.name) === 'pdf' ? 'mdi-file-pdf-box' : 'mdi-file'
                        )
                    }}
                </v-icon>
                {{file.name}}
            </v-col>
            <v-col cols=2 class="text-right">
              <SimpleCheckbox
                  label=""
                  :name="`${index}-public`"
                  
                  :editing="user.isApprover || user.isAdmin"
                  :disabled="!(user.isApprover || user.isAdmin)"
                  :checked="(file) ? file.public : ''"
                  helpPrefix="edition"
                  @edited="(newValue) => { setFilePublic(file, newValue) }">
              </SimpleCheckbox>
            </v-col>
            <v-col cols=4 class="text-right">
                <v-btn text :disabled="disabled" v-if="previewable(file)" @click="getFile(file)"><v-icon>mdi-eye</v-icon></v-btn>
                <v-btn text :disabled="disabled" :href="`/api/v1/repobranches/${branch._id}/file/${file.id}`"><v-icon>mdi-download</v-icon></v-btn>
                <ConfirmButton :text="true" color="error" :disabled="disabled" v-if="deleteable()" @click="deleteFile(file)" :useIcon="true" icon='mdi-delete' label="Delete"></ConfirmButton>
            </v-col>
        </v-row>

        <v-row v-if="user.isApprover || user.isAdmin">
            <v-col cols=12>
                <h4>Add new file</h4>
                <BasicFileReader
                    :show-upload-button="true"
                    :index="0"
                    id="supplemental-reader"
                    :uploadUrl="supplementalUploadUrl"
                    @upload-finished="finishUpload"
                >
                </BasicFileReader>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import pdfvuer from 'pdfvuer';

import { mapState, mapActions, mapMutations } from 'vuex';

import BasicFileReader from '../FormElements/BasicFileReader';
import ConfirmButton from '../FormElements/ConfirmButton';
import SimpleCheckbox from '../FormElements/SimpleCheckbox';

export default {
    mixins: [],

    components:{
        BasicFileReader,
        pdf: pdfvuer,
        ConfirmButton: ConfirmButton,
        SimpleCheckbox: SimpleCheckbox,
    },

    props: {
    },
    data(){
        return {
            alertType: "success",
            alertText: '',
            alert: false,
            preview: false,
            disabled: false,
            renderContent: null,
            renderHeaders: [],
            renderItems: [],
            page: 1,
            numPages: 0,
            viewType: '',
        }
    },

    watch: {
    },

    methods: {
        ...mapActions({
            updateBranch: 'repos/updateBranch',
            getBranchById: 'repos/getBranchById',
            getSupplementalUploadUrl: 'file/getSupplementalUploadUrl',
            getSuppFile: 'file/getSupplementalFile',
            deleteSuppFile: 'file/deleteSupplementalFile',
        }),
        ...mapMutations({    
            editBranch: 'repos/editBranch',
        }),

        //eslint-disable-next-line
        setFilePublic: function(file, newValue){
          //file.public = newValue;
          let newSupp = this.branch.supplemental_files ? JSON.parse(JSON.stringify(this.branch.supplemental_files)) : [];
          let index = newSupp.findIndex( e => { return e.id === file.id});
          newSupp[index] = JSON.parse(JSON.stringify(file));
          newSupp[index].public = newValue;

          this.editBranch({name: 'supplemental_files', value: newSupp});
            
          this.updateBranch().then( () => {
              this.alertType = "success"
              this.alertText = "Successfully updated edition";
              this.alert = true;
              //this.closeOrBack();
              this.editing = false;

          }).catch( err => {
              this.alertType = "error"
              if (err.response && err.response.data && err.response.data.error){
                  this.alertText = "Error: " + err.response.data.error;
              }else{
                  this.alertText = err.message;
              }
              this.alert = true;
          });
        },

        previewable: function(file){
            let type = this.fileType(file.name);
            const previewableTypes = ['pdf', 'csv', 'jpg', 'jpeg', 'png', 'gif', 'bmp'];
            return (previewableTypes.indexOf(type) !== -1)
        },

        deleteable: function(){
            return this.user.isApprover || this.user.isAdmin;
        },

        fileType: function(filename){
            let type = null;
            if (filename.indexOf(".") !== -1){
                type = filename.substring(filename.lastIndexOf(".")+1).toLowerCase();
            }
            return type;
        },

        deleteFile: async function(file){
            if (!this.disabled){
                this.disabled = true;

                await this.deleteSuppFile({branchId: this.branch._id, fileId: file.id});
                if (this.supError){
                    this.alertType = 'error';
                    this.alertText = this.supError;
                    this.alert = true;
                    return;
                }

                this.alertType = "success"
                this.alertText = "Successfully deleted file";
                this.alert = true;

                await this.getBranchById({id: this.branch._id});

                this.disabled = false;
            }

        },

        getFile: async function(file, forceDownload){
            if (!this.disabled){
                this.disabled = true;

                if (forceDownload){
                    this.renderContent = `/api/v1/repobranches/${this.branch._id}/file/${file.id}`
                    let download = require('downloadjs');
                    download(this.renderContent);
                    this.disabled = false;
                    return;
                }

                let expressedType = this.fileType(file.name);

                if (expressedType !== 'pdf'){
                    await this.getSuppFile({branchId: this.branch._id, fileId: file.id});
                }
                if (this.supError){
                    this.alertType = 'error';
                    this.alertText = this.supError;
                    this.alert = true;
                    return;
                }


                if (this.supHeaders || (expressedType === 'pdf')){
                    let type = (expressedType === 'pdf') ? 'application/pdf' : this.supHeaders['content-type'];
                    this.pdf = null;
                    if (type === 'text/csv'){
                        let rows = JSON.parse(JSON.stringify(this.supplementalFile))
                        rows = rows.split("\n");
                        this.renderHeaders = [];
                        this.renderItems = [];
                        for (let i=0; i<rows.length; i++){
                            let row = rows[i];
                            if (row.indexOf(", ") !== -1){
                                row = row.split(", ");
                            }else{
                                row = row.split(",");
                            }
                            
                            if (i === 0){
                                for (let j=0; j<row.length; j++){
                                
                                    this.renderHeaders.push({
                                        text: row[j],
                                        value: row[j]
                                    });
                                }
                            }else{
                                let rowObj = {};
                                for (let j=0; j<this.renderHeaders.length; j++){
                                    rowObj[this.renderHeaders[j].value] = row[j];
                                }
                                this.renderItems.push(rowObj);
                            }
                        }
                        
                       
                        this.viewType = 'text/csv';
                        this.preview = true;
                    }else if (type === 'application/pdf'){
                        // var enc = new TextEncoder();
                        var self = this;
                        
                        self.renderContent = pdfvuer.createLoadingTask(`/api/v1/repobranches/${this.branch._id}/file/${file.id}`);
                        self.renderContent.then(pdf => {
                            self.numPages = pdf.numPages;
                        });
                        this.viewType = 'application/pdf'
                        this.preview = true;
                    }else if (type.indexOf("image/") === 0){
                        this.viewType = 'image'
                        this.preview = true;
                        this.renderContent = `/api/v1/repobranches/${this.branch._id}/file/${file.id}`
                    }else{
                        let download = require('downloadjs');
                        download(this.supplementalFile, file.name, type);
                    }
                }else{
                    let download = require('downloadjs');
                    download(this.supplementalFile, file.name);
                }
                this.disabled = false;
            }
        },

        finishUpload: async function(upload){
            let hash = upload.url.substring(upload.url.lastIndexOf("/")+1);
            if (hash.indexOf("+") > 0){
                hash = hash.substring(0, hash.indexOf("+"));
            }
            let newSupp = this.branch.supplemental_files ? JSON.parse(JSON.stringify(this.branch.supplemental_files)) : [];

            newSupp.push({id: hash, name: upload.file.name});
            this.editBranch({name: 'supplemental_files', value: newSupp});
            
            this.updateBranch().then( () => {
                this.alertType = "success"
                this.alertText = "Successfully updated edition";
                this.alert = true;
                //this.closeOrBack();
                this.editing = false;

            }).catch( err => {
                this.alertType = "error"
                if (err.response && err.response.data && err.response.data.error){
                    this.alertText = "Error: " + err.response.data.error;
                }else{
                    this.alertText = err.message;
                }
                this.alert = true;
            });
        }
    },

    mounted(){
        this.getSupplementalUploadUrl();
    },

    computed: {
        ...mapState({
            user: state => state.user.user,
            branch: state => state.repos.branch,
            supplementalUploadUrl: state => state.file.supplementalUploadUrl,
            supplementalFile: state => state.file.supplementalFile,
            supError: state => state.file.supError,
            supHeaders: state => state.file.supHeaders
        })
    },
    
}
</script>

<style scoped>

    .hoverLink{
        cursor: pointer;
        border: 1px solid;
    }

    .hoverLink.disabled{
        cursor: not-allowed;
    }

</style>