<template>
  <v-container>
      <v-row v-if="this.upload && this.upload.status === 'submitted'">
        <v-col cols="12">
          <v-alert type="success">This upload was submitted on {{ this.upload.upload_date | formatDate }}</v-alert>
        </v-col>
      </v-row>
      <v-row v-if="errorAlert">
          <v-col cols=12 class="pa-0">
              <v-alert class="mb-0" v-model="errorAlert" type="error" dismissible>
                  {{errorText}}
              </v-alert>
          </v-col>
      </v-row>
      <v-row v-if="warningAlert">
          <v-col cols=12 class="pa-0">
              <v-alert class="mb-0" v-model="warningAlert" type="warning" dismissible>
                  {{warningText}}
              </v-alert>
          </v-col>
      </v-row>
      <v-row>
          <v-col cols=12 v-if="loading">
              <span>{{$tc('Loading')}}...</span>
              <v-progress-circular indeterminate></v-progress-circular>
          </v-col>
          <v-col cols=12 v-else-if="notFound">
              <span>{{$tc('404 Not Found')}}...</span>
          </v-col>

          <v-col cols=12 v-else>
            <v-row class="mb-0">
              <v-col cols="12" class="pa-0">
                <v-tabs v-model="topTab">
                  <v-tab key="info">Info</v-tab>
                  <v-tab key="files">Files</v-tab>
                </v-tabs>
              </v-col>
            </v-row>

            <v-row class="mt-0">
              <v-col cols="12" class="pa-0">
                <v-tabs-items v-model="topTab" class="pt-3">
                  <v-tab-item key="info">
                    <UploadForm ref="uploadForm" :readonly="true" />
                  </v-tab-item>
                  <v-tab-item key="files">
                    <FileTab />
                  </v-tab-item>
                </v-tabs-items>
              </v-col>
            </v-row>
          </v-col>
      </v-row>
  </v-container>
</template>
<script>

  import {mapActions, mapMutations, mapState} from "vuex";
  import FileTab from '../Uploads/FilesTab';
  import UploadForm from '../Uploads/UploadForm';

  export default {
      components:{
        FileTab,
        UploadForm
      },
      async created() {
          this.loading = true;
          this.$store.commit('file/clearContent');
          this.modifyStoreUpload({});
          if(this.$route.params.id && this.$route.params.id != 'new') {
              this.uploadId = this.$route.params.id;
          }
          
          if(this.uploadId) {

              await this.getUpload(this.uploadId);
              if (this.upload === null){
                  this.loading = false;
                  this.notFound = true;
                  this.errorAlert = true;
                  this.errorText = "Upload not found";
                  return;
              }

              

              if (this.enabledPhase >= 2){
                  await this.getSchema({id: this.uploadId});
                  await this.getAllRepos();
                  await this.getBranchesByUpload({uploadId: this.uploadId})

                  this.selectedDataset = '-1';
                  this.selectedVersion = '-1';

                  if (this.schemaState && this.schemaState.version){
                      this.selectedVersion = this.schemaState.version
                  }

                  if (this.versions && this.versions[0] && this.versions[0].repo_id){
                      this.selectedDataset = this.versions[0].repo_id;
                      this.selectedVersion = this.versions[0]._id;
                      this.allowSelect = false;
                      if (this.versions[0].variable_classification){
                          await this.getVariableClassification({field: '_id', value: this.versions[0].variable_classification});
                      }
                  }else{
                      await this.getVariableClassifications({});
                      await this.getVariableClassification({field: '_id', value: this.variableClassifications[0]._id});
                  }
              }
          }

          this.loading = false;
      },
      methods: {
          ...mapActions({
              getUpload: 'upload/getUpload',
              createInitialUpload: 'upload/createInitialUpload',
              updateUpload: 'upload/updateUpload',
              getSchema: 'schemaImport/getDataPackageByUploadId',
              getSchemaFromVersion: 'schemaImport/getDataPackage',
              createDataPackageSchema: 'schemaImport/createDataPackageSchema',
              createDataPackageSchemaInferred: 'schemaImport/createDataPackageSchemaInferred',
              updateDataPackageSchema: 'schemaImport/updateDataPackageSchema',
              getAllRepos: 'repos/getAllRepos',
              saveDataset: 'repos/saveRepo',
              getBranchById: 'repos/getBranchById',
              getBranches: "repos/getBranches",
              getBranchesByUpload: "repos/getBranchesByUpload",
              saveBranch: 'repos/saveBranch',
              updateBranch: 'repos/updateBranch',
              getVariableClassifications: 'variableClassifications/getItems',
              getVariableClassification: 'variableClassifications/getItem',
              modifyStoreUpload: 'upload/modifyStoreUpload',
          }),
          ...mapMutations({
              resetState: 'upload/resetState',
              setDataPackageSchema: 'schemaImport/setDataPackageSchema',
              editDataset: 'repos/editRepo',
              clearDataset: 'repos/clearRepo',
              editBranch: 'repos/editBranch',
              clearBranch: 'repos/clearBranch',
              setRepo: 'repos/setRepo',
              clearContent: 'file/clearContent',
          }),

          async stepSaveFileUploads(){
              await this.updateUpload(this.upload);
              //this.step = this.steps.step7UploadSummary;
              this.$router.push({ name: 'data-upload-detail', id: this.uploadId });

          },
      },
      data () {
          return {
              uploadId: null,
              errorAlert: false,
              errorText: "",
              schema: {},
              selectedDataset: "-1",
              selectedVersion: "-1",
              datasetList: [],
              showDiff: false,
              loading: false,
              providerGroup: null,
              notFound: false,
              warningAlert: false,
              warningText: '',
              topTab: 1,
          }
      },
      computed: {
          ...mapState({
              user: state => state.user.user,
              upload: state => state.upload.upload,
              uploadError: state => state.upload.error,
              schemaState: state => state.schemaImport.dataPackageSchema,
              datasets: state => state.repos.allRepos,
              versions: state => state.repos.branches,
              variableClassifications: state => state.variableClassifications.items,
              variableClassification: state => state.variableClassifications.wipItem,
              dataset: state => state.repos.repo
          }),

          enabledPhase(){
              let en = this.$store.state.config.items.find(item => item['key'] === 'enabledPhase');
              return (en) ? parseInt(en.value) : 1;
          },

          versionList: function(){
              let v = JSON.parse(JSON.stringify(this.versions));
              v = v.filter(obj => {
                  return obj.approved === false;
              });
              v.unshift({name: "", _id: "-1"});
              return v;
          }
      },
      watch: {

          datasets: function(){
              this.datasetList = JSON.parse(JSON.stringify(this.datasets));
              this.datasetList.unshift({name: "", _id: "-1"})
          },

          schemaState: function(){
              if (typeof(this.schemaState) !== "undefined" && this.schemaState !== null && Object.keys(this.schemaState).length !== 0){
                  this.schema = JSON.parse(JSON.stringify(this.schemaState));
                  delete this.schema._id;
                  delete this.schema.profile;
                  delete this.schema.version;
                  delete this.schema.__v;

                  this.jsonRedraw++;
                  this.allowCreate = false;
              }
          },

          // eslint-disable-next-line no-unused-vars
          upload: async function (newVal, oldVal) {
              if(newVal && !oldVal) {
                  if (this.enabledPhase >= 2){
                      await this.getSchema({id: this.uploadId});
                      await this.getAllRepos();
                      await this.getBranchesByUpload({uploadId: this.uploadId})
                      if (this.schemaState && this.schemaState.version){
                          this.selectedVersion = this.schemaState.version
                      }
                  }

                  this.loading = false;

              }
          },
      },

  }
</script>
<style scoped>
.fixed{
  position: fixed;
  z-index: 100;
}
</style>
