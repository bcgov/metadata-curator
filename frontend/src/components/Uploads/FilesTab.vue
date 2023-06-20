<template>
  <v-row v-if="upload">
    <v-col cols="3">
      <v-tabs v-model="tab" vertical style="width: 100%" :disabled="uploading" :key="`fileTabs-${diffH ? JSON.stringify(diffH) : ''}`">
        <v-tab v-for="(file, index) in upload.files" style="width: 100%" :key="`${file.name}-${index}-${diffH && diffH[index] ? JSON.stringify(diffH[index]) : ''}-${uploaded[index]}`" :disabled="uploading">
          <v-icon
            v-if="hasDiff[index] === 0"
            size="large"
            color="success"
          >mdi-check-circle</v-icon>
          <v-icon
            v-else-if="hasDiff[index] === 1"
            size="large"
            color="warning"
          >mdi-alert</v-icon>
          <v-icon
            v-else-if="hasDiff[index] === 2"
            size="large"
            color="error"
          >mdi-alpha-x-circle</v-icon>
          <span class="text-wrap" style="word-break: break-all; text-transform: none;">&nbsp;{{ file.name }}&nbsp;</span>
          <v-icon
            v-if="uploaded[index] || (upload && upload.status && upload.status === 'submitted')"
            size="large"
            color="primary"
          >mdi-check-circle</v-icon>
        </v-tab>
      </v-tabs>
    </v-col>

    <v-col cols="9">
      <v-tabs-items v-model="tab">
        <v-tab-item v-for="(file, index) in upload.files" :key="file.name" class="pl-1">
          <v-row v-if="upload && upload.status && upload.status !== 'submitted'">
            <v-col cols="12">
              {{ $tc('Please select file matching this description') }}
            </v-col>
          </v-row>
          <v-row v-else>
            <v-col cols="12"></v-col>
          </v-row>

          <v-row class="mb-3">
            <v-col cols="12" class="py-0" v-if="file && file.id && user && user.isAdmin && upload && upload.status && upload.status === 'submitted'">
              {{ $tc('File Id') }}: {{ file.id }}
            </v-col>
            <v-col cols="12" class="py-0">
              {{ $tc('Title') }}: {{ file.title }}
            </v-col>
            <v-col cols="12" class="py-0" v-if="file && file.description">
              {{ $tc('Description') }}: {{ file.description }}
            </v-col>
            <v-col cols="12" class="py-0" v-if="file && file.start_date && file.end_date">
              {{ $tc('Date Range') }}: {{ file.start_date | formatDate }} - {{ file.end_date | formatDate }}
            </v-col>
            <v-col cols="12" class="py-0" v-if="file && file.temporal_fields">
              {{ $tc('Temporal Fields') }}: {{ file.temporal_fields }}
            </v-col>
            <v-col cols="12" class="py-0" v-if="file && file.num_records">
              {{ $tc('Number of Records') }}: {{ file.num_records }}
            </v-col>
            <v-col cols="12" class="py-0" v-if="file && file.uploaded_name">
              {{ $tc('Uploaded file name') }}: {{ file.uploaded_name }}
            </v-col>
          </v-row>

          <v-row v-if="upload && upload.status && upload.status !== 'submitted'">
            <v-col cols="12">
              <FileReader
                :show-encrypt-button="false"
                :show-upload-button="false"
                :show-import-button="false"
                :read-file="true"
                :disabled="wait"
                :clear-file="clearFile"
                @reading-file="wait=true"
                :trigger-upload="startUpload[index]"
                @upload-finished="uploadFinished"
                :index="index"
                @file-opened="(i, file, sig) => fileOpened(i, file, sig)"
                id="fileForm-reader"
              >
              </FileReader>
            </v-col>
          </v-row>

          <v-row v-if="upload && upload.status && upload.status !== 'submitted'">
            <v-col cols="12" v-if="inferring">
              <v-progress-circular indeterminate></v-progress-circular>
              {{ $tc('Inferring...') }}
            </v-col>

            <v-col cols="12" v-else-if="inferredSchema && inferredSchema.resources && inferredSchema.resources[tabToContentOrder[index]] ">
              <BasicComparison @compared="d => {diff(index, d)}" key="comparisonObj" :left-side-text="getOneResourceSchema(inferredSchema, tabToContentOrder[index])" :right-side-text="getOneResourceSchema(schemaState, tab)" :diff-json="true" />
            </v-col>

          </v-row>
        </v-tab-item>
      </v-tabs-items>
      <v-row v-if="upload && upload.status && upload.status !== 'submitted'">
        <v-col cols="10"></v-col>
        <v-col cols="2">
          <v-btn color="primary" @click="startUploads" :disabled="!readyToUpload">{{ $tc('Upload') }}</v-btn>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
  <v-row v-else>
    Odd there seems to be no files here...
  </v-row>
</template>

<script>
import Vue from 'vue';
import { mapMutations, mapActions, mapState } from 'vuex';

import FileReader from '../FormElements/FileReader';
import BasicComparison from '../Schema/BasicComparison';
var semanticInfer = require('semantic_infer');

export default {

  components: {
    FileReader,
    BasicComparison,
  },

  data() {
    return {
      tab: 0,
      files: [],
      fileReaders: [],
      wait: false,
      clearFile: false,
      inferredSchema: {},
      inferring: false,
      tabToContentOrder: {},
      contentToTabOrder: {},
      uploading: false,
      startUpload: [],
      uploadIndex: 0,
      diffH: [],
      uploaded: [],
      fileIds: [],
    }
  },

  computed: {
    ...mapState({
      user: state => state.user.user,
      upload: state => state.upload.upload,
      schemaState: state => state.schemaImport.dataPackageSchema,
      inferContent: state => state.file.content,
    }),
    readyToUpload() {
      return !(this.inferring || Object.keys(this.files).length !== this.upload.files.length || this.uploading || this.wait)
    },
    hasDiff(){
      let rv = [];
      for (let j=0; j<this.diffH.length; j++){
        let level = 0;
        try {
          let d = this.diffH[j];
          let k = Object.keys(d);
        
          for (let i=0; i<k.length; i++){
            if (d[k[i]] > level){
              level = d[k[i]];
            }
          }
        }catch(e){
          level = -1;
        }
      rv[j] = level;
      }
      return rv
    },
  },

  methods: {
    ...mapActions({
      modifyStoreUpload: 'upload/modifyStoreUpload',
      updateUpload: 'upload/updateUpload',
    }),
    ...mapMutations({
      clearContent: 'file/clearContent',
    }),

    diff(index, d){
      console.log('diff?', index, d);
      if (index === this.tab){
        Vue.set(this.diffH, index, d);
      }
      // this.$forceUpdate();
    },

    getOneResourceSchema(schema, index){
      let intSchema = JSON.parse(JSON.stringify(schema));
      intSchema.resources[0] = intSchema.resources[index];
      intSchema.resources.length = 1;
      return JSON.stringify(intSchema);
    },

    async uploadFinished(id){
      Vue.set(this.startUpload, this.tab, false);
      this.fileIds[this.uploadIndex] = id;
      this.uploaded[this.uploadIndex] = true;
      this.uploadIndex++;
      this.tab = this.uploadIndex;
      
      if (this.uploadIndex >= this.upload.files.length){
          await this.updateFormSubmission(true);
          await this.updateUpload(this.upload);
          this.uploading = false;
      }else{
          Vue.set(this.startUpload, this.uploadIndex, true);
          
      }
    },

    startUploads(){
        if (this.readyToUpload){
          this.tab = 0;
          this.uploadIndex = 0;
          this.uploading = true;
          Vue.set(this.startUpload, 0, true);
        }
    },

    fileOpened(index, file, sig){
      // this.clearFile = false;
      this.wait = false;
      this.spanKey++;
      // this.clearFile = true;
      //this.fileReaders[this.fileReaders.length] = {}
      //this.tabToContentOrder[index] = this.files.length;
      this.tabToContentOrder[index] = this.inferContent.length;
      this.contentToTabOrder[this.inferContent.length] = index;
      this.files[index] = file;
      this.files[index].sig = sig;
      this.$emit('changed', index);
      this.spanKey++;
    },

    async updateFormSubmission(done, start){
      if (typeof(done) === "undefined"){
        done = false;
      }

      if (typeof(start) === "undefined"){
        start = false;
      }

      let f = JSON.parse(JSON.stringify(this.upload));
      for (let i=0; i<this.files.length; i++){
        f.files[i].id = this.fileIds[i];
        f.files[i].uploaded_name = this.files[i].name;
      }

      if (start){
        f.status = 'upload_in_progress';
      }

      if (done){
        f.status = 'submitted';
      }
      await this.modifyStoreUpload(f);
    },

    async infer(){
      this.inferring = true;
      let inferredSchema = {resources: []}
      for (let i=0; ( (i<this.inferContent.length) && (i<this.upload.files.length) ); i++){
        try{
          let string = new TextDecoder().decode(this.inferContent[i]);
          let rows = string.split("\n");

          let delim = ",";
          if (rows.length > 0){

            if (rows.length > 1001){
              rows.length = 1001;
            }

            var commaSpaceCount = (rows[0].match(/, /g) || []).length;
            var commaCount = (rows[0].match(/,/g) || []).length;
            var pipeSpaceCount = (rows[0].match(/\| /g) || []).length;
            var pipeCount = (rows[0].match(/\|/g) || []).length;

            let greatestCount = commaCount;

            if (commaSpaceCount >= greatestCount){
              greatestCount = commaSpaceCount;
              delim = ", ";
            }

            if (pipeSpaceCount >= greatestCount){
              greatestCount = pipeSpaceCount;
              delim = "| ";
            }

            if (pipeCount >= greatestCount){
              greatestCount = pipeCount;
              delim = "|";
            }
          }
          //cap at 1000 semantic infer isn't happy with files of 1mb in size
          for (let i=0; i<rows.length; i++){
            rows[i] = rows[i].split(delim);
          }
          let headers = rows.shift();
          rows.unshift(headers);

          //header row and at least one data row
          if (rows.length > 2){
            rows.pop(); //remove last element in case its a partial row
          }

          var formatDate = function(dateStr){
            try{
              let ind = dateStr.indexOf("T");
              return `${ind !== 0 ? dateStr.substring(0, ind) : dateStr}`;
            }catch(e){
              return "";
            }
          }

          let fileIndex = this.contentToTabOrder[i];

          let index = this.files[fileIndex].name.lastIndexOf('.');
          let name = index >= 0 ? this.files[fileIndex].name.substring(0,index).toLowerCase() : this.files[fileIndex].name.toLowerCase();
          inferredSchema.resources.push({
            name: name,
            saved_path: "./"+this.files[fileIndex].name,
            data: rows,
            description: this.upload.files[i].description,
            temporal_start: formatDate(this.upload.files[i].start_date),
            temporal_end: formatDate(this.upload.files[i].end_date),
          });

        }catch(ex){
          console.error("Error inferring:", ex);
        }
      }
      
      try{
        let optUrl = '/js/semantic_infer.json';
        let opt = await (await fetch(optUrl)).json();

        let r = await semanticInfer.datapackage_infer.infer_datapackage(inferredSchema, false, opt);
        this.inferredSchema = r;
        for (let i=0; i<this.inferredSchema.resources.length; i++){
          delete this.inferredSchema.resources[i].saved_path
          delete this.inferredSchema.resources[i].data;
        }
      }catch(e){
        this.inferredSchema = inferredSchema;
        for (let i=0; i<this.inferredSchema.resources.length; i++){
          this.inferredSchema.resources[i].path = this.inferredSchema.resources[i].saved_path;
          delete this.inferredSchema.resources[i].saved_path
          delete this.inferredSchema.resources[i].data;
        }
        console.error(e);
      }

      this.showDiff = false;
      if (Object.keys(this.schemaState).length >= 1){
        this.showDiff = JSON.stringify(this.inferredSchema) !== JSON.stringify(this.schemaState);
      }
      this.inferring = false;
    },
  },

  created(){
    this.clearContent();
    for (let i=0; i<this.upload.files.length; i++){
      this.startUpload.push(false);
      this.uploaded.push(false);
    }
  },

  watch: {
    inferContent: function(){
      if (!this.uploading){
        this.infer();
      }
    }
  }
}
</script>

<style>
  .v-slide-group__content.v-tabs-bar__content{
    width: 100%;
  }
  .v-tabs--vertical>.v-tabs-bar .v-tab{
    height: auto;
    min-height: 48px;
  }
</style>