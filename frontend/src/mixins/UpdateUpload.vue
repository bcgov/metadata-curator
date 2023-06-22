<script>

import {mapActions, mapState} from "vuex";

export default {
  computed: {
    ...mapState({
        repo: state => state.repos.repo,
        branch: state => state.repos.branch,
        schema: state => state.schemaImport.tableSchema,
        user: state => state.user.user,
        uploadError: 'upload/error',
    }),
  },
  methods:{
    ...mapActions({
      updateUpload: 'upload/updateUpload',
    }),
    updateUploadOnEdit: async function(){
      let dateStart = null;
      let dateEnd = null;

      let numFiles = 1;

      if (this.schema && this.schema.resources){
          numFiles = this.schema.resources.length;
          for (let i=0; i<this.schema.resources.length; i++){
              if (this.schema.resources[i].temporal_start){
                  dateStart = ( (!dateStart) || (this.schema.resources[i].temporal_start < dateStart)) ? this.schema.resources[i].temporal_start : dateStart;
              }

              if (this.schema.resources[i].temporal_end){
                  dateEnd = ( (!dateEnd) || (this.schema.resources[i].temporal_end < dateEnd)) ? this.schema.resources[i].temporal_end : dateEnd;
              }

          }
      }

      let ministry_organization = (this.repo.ministry_organization) ? this.repo.ministry_organization : "";
      ministry_organization = (this.branch.repo_id && this.branch.repo_id.ministry_organization) ? this.branch.repo_id.ministry_organization : ministry_organization;

      if (!ministry_organization){
        this.$emit('error', "Ministry/Organization is required");
        return;
      }

      let datasetName = (this.repo.name) ? this.repo.name : "";
      datasetName = (this.branch.repo_id && this.branch.repo_id.name) ? this.branch.repo_id.name : datasetName;

      let branchName = (this.branch.name) ? (" " +this.branch.name) : ""
        
      let data = {
        "ministry_organization": ministry_organization,
        "name": datasetName + branchName,
        "description": (this.branch.description) ? this.branch.description : '',
        "date_range_start": dateStart,
        "date_range_end": dateEnd,
        "information": (this.branch.additional_info) ? this.branch.additional_info : '',
        "data_create_date": new Date(),
        "num_files": numFiles
      }
      let files = [];
      if (this.schema && this.schema.resources){
        for (let i=0; i<this.schema.resources.length; i++){
          let file = {};
          file.id = "Not yet uploaded";
          file.size = 0;
          file.name = this.schema.resources[i].name;
          file.data = this.schema.resources[i].type && this.schema.resources[i].type === "Data";
          file.start_date = this.schema.resources[i].temporal_start;
          file.end_date = this.schema.resources[i].temporal_end;
          file.num_records = this.schema.resources[i].num_rows;
          file.title = this.schema.resources[i].name;
          file.description = this.schema.resources[i].description;
          file.type = this.schema.resources[i].type;
          file.temporal_fields = this.schema.resources[i].temporal_fields;
          if (typeof(file.data) === 'undefined'){
            file.data = false;
          }
          files.push(file);
        }
      }
        
      try{
            
        data.uploader = this.user.email;
        data.provider_group = this.branch.author_groups[0];
        data.files = files;
        data._id = this.branch.data_upload_id;
            
            
        let d = await this.updateUpload(data);

        if (!d || !d._id){
          this.$emit('error', "Error creating upload, "+d);
          return;
        }

        await this.updateBranch();
        if (this.uploadError){
          this.$emit('error', this.uploadError);
          return;
        }
      }catch(e){
        this.$emit('error', e);
      }
    }
  }
}
</script>
