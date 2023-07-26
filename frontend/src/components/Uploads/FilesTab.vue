<template>
  <v-row v-if="upload">
    <v-col cols="3">
      <v-tabs v-model="tab" vertical style="width: 100%" :disabled="uploading" :key="`fileTabs-${diffH ? JSON.stringify(diffH) : ''}`">
        <v-tab v-for="(file, index) in upload.files" style="width: 100%" :key="`${file.name}-${index}-${diffH && diffH[index] ? JSON.stringify(diffH[index]) : ''}-${uploaded[index]}`" :disabled="uploading || wait || inferring">
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
            <v-col cols="10"></v-col>
            <v-col cols="2">
              <v-btn color="primary" @click="startUploads" :disabled="!readyToUpload">{{ $tc('Upload') }}</v-btn>
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
                @encrypted="(i, file, sig) => fileOpened(index, file, sig)"
                id="fileForm-reader"
              >
              </FileReader>
            </v-col>
            <v-col cols="12" v-if="wait">
              <v-progress-circular indeterminate></v-progress-circular>
              {{$tc('Please wait reading file')}}...
            </v-col>
          </v-row>

          <v-row v-if="upload && upload.status && upload.status !== 'submitted'">
            <v-col cols="12" v-if="inferring">
              <v-progress-circular indeterminate></v-progress-circular>
              {{ $tc('Inferring...') }}
            </v-col>

            <v-col cols="12" v-else-if="errorInferring[index]">
              <div>
                {{ $tc("Error inferring for this file, comparison not shown") }}
              </div>
              <div>
                {{ errorInferring[index] }}
              </div>
            </v-col>

            <v-col cols="12" v-else-if="inferredSchema[index] && inferredSchema[index].resources && inferredSchema[index].resources[0] ">
              <BasicComparison 
                @compared="d => {diff(index, d)}"
                key="comparisonObj"
                left-header="Current Metadata"
                right-header="Expected Metadata"
                :left-side-text="getOneResourceSchema(inferredSchema[index], 0)"
                :right-side-text="getOneResourceSchema(schemaState, tab)"
                :diff-json="true"
              />
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
      inferredSchema: [],
      inferring: false,
      contentToTabOrder: [],
      uploading: false,
      startUpload: [],
      uploadIndex: 0,
      diffH: [],
      uploaded: [],
      fileIds: [],
      errorInferring: [],
    }
  },

  computed: {
    ...mapState({
      user: state => state.user.user,
      upload: state => state.upload.upload,
      schemaState: state => state.schemaImport.dataPackageSchema,
      inferContent: state => state.file.content,
      versions: state => state.repos.branches,
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
      createDataPackageSchemaInferred: 'schemaImport/createDataPackageSchemaInferred',
      getBranchesByUpload: "repos/getBranchesByUpload",
    }),
    ...mapMutations({
      clearContent: 'file/clearContent',
      setDataPackageSchema: 'schemaImport/setDataPackageSchema',
    }),

    diff(index, d){
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
      
      if (this.uploadIndex >= this.upload.files.length){
          await this.updateFormSubmission(true);
          await this.updateUpload(this.upload);
          let actualInferred = JSON.parse(JSON.stringify(this.inferredSchema[0]));
          for (let i=1; i<this.inferredSchema.length; i++){
            actualInferred.resources.push(JSON.parse(JSON.stringify(this.inferredSchema[i].resources[0])));
          }
          if (this.versions && this.versions[0] && this.versions[0]._id){
            actualInferred.version = this.versions[0]._id;
          }
          this.setDataPackageSchema({schema: actualInferred});
          await this.createDataPackageSchemaInferred();
          this.uploading = false;
      }else{
          this.tab = this.uploadIndex;
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
      this.spanKey++;
      // this.clearFile = true;
      //this.fileReaders[this.fileReaders.length] = {}
      if (!file){
        console.warn("File coming through empty", index, file, sig);
      }else{
        if (!this.uploading){
          this.contentToTabOrder[index] = this.inferContent.length - 1;
          this.files[index] = file;
          this.files[index].sig = sig;
          this.infer(index);
          this.wait = false;
          this.$emit('changed', index);
          this.spanKey++;
        }
      }
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
        if (!this.files[i]){
          console.warn('updating form submission with a null file', f.files[i], i);
        }
        let name = this.files[i] && this.files[i].name ? this.files[i].name : false;
        name = !name && this.files[i] && this.files[i].title ? this.files[i].title : name;
        name = !name ? this.fileIds[i] : name;
        f.files[i].id = this.fileIds[i];
        if (name){
          f.files[i].uploaded_name = name;
        }
      }

      if (start){
        f.status = 'upload_in_progress';
      }

      if (done){
        f.status = 'submitted';
      }
      await this.modifyStoreUpload(f);
    },

    async infer(index){
      let optUrl = '/js/semantic_infer.json';
      let opt = await (await fetch(optUrl)).json();
      this.inferring = true;
      
      let maxIndex = false;
      if (typeof(index) === 'undefined' || index === 0){
        index = 0;
        this.inferredSchema = [];
        this.errorInferring = [];
      }else{
        maxIndex = index;
      }

      

      for (let i=index; ( (typeof(this.contentToTabOrder[i]) !== 'undefined') && (i<this.upload.files.length) ); i++){
        let fileIndex = this.contentToTabOrder[i];
        let workingInferred = {resources: []};
        try{
          let string = new TextDecoder().decode(this.inferContent[fileIndex]);
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
          for (let j=0; j<rows.length; j++){
            rows[j] = rows[j].split(delim);
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

          let dotIndex = this.files[i].name.lastIndexOf('.');
          let name = dotIndex >= 0 ? this.files[i].name.substring(0,dotIndex).toLowerCase() : this.files[i].name.toLowerCase();
          workingInferred.resources.push({
            name: name,
            saved_path: "./"+this.files[i].name,
            data: rows,
            description: this.upload.files[i].description,
            temporal_start: formatDate(this.upload.files[i].start_date),
            temporal_end: formatDate(this.upload.files[i].end_date),
          });
          let r = await semanticInfer.datapackage_infer.infer_datapackage(workingInferred, false, opt);
          delete r.resources[0].saved_path;
          delete r.resources[0].data;
          this.inferredSchema[i] = r;
          this.errorInferring[i] = (false);

        }catch(ex){
          this.inferredSchema[i] = {};
          this.errorInferring[i] = (ex);
          console.error("Error inferring:", ex);
        }
        if (maxIndex !== false && index >= maxIndex){
          break;
        }
      }

      this.inferring = false;
    },
  },

  async created(){
    this.clearContent();
    await this.getBranchesByUpload({uploadId: this.upload._id})
    for (let i=0; i<this.upload.files.length; i++){
      this.startUpload.push(false);
      this.uploaded.push(false);
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