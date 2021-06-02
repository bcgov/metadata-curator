import axios from 'axios';

export class Backend {
    constructor(){}

    getToken(){
        const url = '/api/token'
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    getPublicKey(){
        const url = '/api/v1/publickey'
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    getUploadUrl(){
        const url = '/api/v1/uploadurl'
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    concatenateUpload(joinIds, uploadUrl, jwt, resumable, filename, filetype){
        let uploadOptions = {}
        uploadOptions.headers = {
            "Tus-Resumable": resumable,
            "Upload-Concat": "final;" + joinIds.join(" "),
            "Upload-Metadata": "filename "+btoa(filename)+",filetype "+btoa(filetype)+",jwt " + btoa(jwt)
        };
        console.log("concat", uploadUrl, uploadOptions)
        return axios.post(uploadUrl, {}, uploadOptions);
    }

    postTableSchema(schema) {
        const url = '/api/v1/tableschemas'
        // console.log("postSchema: ", schema);
        const headers = {
            'Content-Type': 'application/json'
        }
        return axios.post(url, schema,
            {withCredentials: true, headers: headers}
            ).then(response => response.data);
    }

    postDataPackageSchema(schema) {
        const url = '/api/v1/datapackageschemas'
        // console.log("postTabDataPackage: ", tabDataPackage);
        const headers = {
            'Content-Type': 'application/json'
        }
        return axios.post(url, schema,
            {withCredentials: true, headers: headers}
        ).then(response => response.data)
    }

    getDataUploads(query){
        if (typeof(query) === "undefined"){
            query = {filterBy: false};
        }
        let url = '/api/v1/datauploads';
        if(query.filterBy) {
            if (query.filterBy === "provider" && query.providerGroups) {
                url = `${url}/?filterBy=${query.filterBy}&providerGroups=${query.providerGroups}`;
            } else {
                url = `${url}/?filterBy=${query.filterBy}`;
            }
        }
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    getDataUpload(dataUploadId){
        const url = `/api/v1/datauploads/${dataUploadId}`;
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    getRevisionsByDataUpload(dataUploadId){
        const url = '/api/v1/metadatarevisions/' + dataUploadId;
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    getCommentsByDataUpload(dataUploadId){
        const url = '/api/v1/datauploads/' + dataUploadId + '/comments';
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    postCommentByDataUpload(dataUploadId, comment){
        const url = '/api/v1/datauploads/' + dataUploadId + '/comments';
        const body = { content: comment};
        return axios.post(url, body,{withCredentials: true}).then(response => response.data)
    }

    postDataUpload(dataUpload){
        // console.log("BE postdataUpload: " + dataUpload);
        const url = `/api/v1/datauploads`;
        return axios.post(url, dataUpload,{withCredentials: true}).then(response => response.data)
    }

    putDataUpload(dataUpload){
        // console.log("BE putdataUpload: " + dataUpload);
        const url = `/api/v1/datauploads/${dataUpload._id}`;
        return axios.put(url, dataUpload,{withCredentials: true}).then(response => response.data)
    }

    getPermissions(){
        const url = `/api/v1/forum/permissions`;
        return axios.get(url,{withCredentials: true}).then(response => response.data)
    }

    putPermission(id, editedPermission){
        const url = `/api/v1/forum/permission/${id}`;
        return axios.put(url, editedPermission, {withCredentials: true}).then(response => response.data)
    }

    newPermission(newPermission){
        const url = `/api/v1/forum/permission`;
        return axios.post(url, newPermission, {withCredentials: true}).then(response => response.data)
    }

    deletePermission(id){
        const url = `/api/v1/forum/permission/${id}`;
        return axios.delete(url, {}, {withCredentials: true}).then(response => response.data)
    }

    getForms(){
        const url = `/api/v1/formio/forms`;
        return axios.get(url, {withCredentials: true}).then( (response) => {
            let data = response.data;
            // for (let i=0; i<data.length; i++){
            //     response.data[i]._id = response.data[i].name
            // }
            return data;
        })
    }

    putForm(id, editedForm){
        const url = `/api/v1/formio/form/${id}`;
        return axios.put(url, editedForm, {withCredentials: true}).then(response => response.data)
    }

    newForm(newForm){
        const url = `/api/v1/formio/form`;
        return axios.post(url, newForm, {withCredentials: true}).then(response => response.data)
    }

    deleteForm(id){
        const url = `/api/v1/formio/form/${id}`;
        return axios.delete(url, {}, {withCredentials: true}).then(response => response.data)
    }

    getForm(formName) {
        const url = `/api/v1/formio/form/${formName}`;
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    getFormSubmission(formName, submissionId) {
        const url = `/api/v1/formio/form/${formName}/submission/${submissionId}`;
        return axios.get(url,{withCredentials: true}).then(response => response.data)
    }

    postFormSubmission(formName, submission) {
        const url = `/api/v1/formio/form/${formName}/submission`;
        return axios.post(url, submission,{withCredentials: true}).then(response => response.data)
    }

    putFormSubmission(formName, submissionId, submission) {
        const url = `/api/v1/formio/form/${formName}/submission/${submissionId}`;
        return axios.put(url, submission,{withCredentials: true}).then(response => response.data)
    }

    getDataProviders(){
        let url = '/api/v1/dataproviders';
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }


    getTopics(){
        const url = `/api/v1/forum/topics`;
        return axios.get(url,{withCredentials: true}).then(response => response.data)
    }

    putTopic(id, editedTopic){
        const url = `/api/v1/forum/topics/${id}`;
        return axios.put(url, editedTopic, {withCredentials: true}).then(response => response.data)
    }

    newTopic(newTopic){
        const url = `/api/v1/forum/topics`;
        return axios.post(url, newTopic, {withCredentials: true}).then(response => response.data)
    }

    deleteTopic(id){
        const url = `/api/v1/forum/topics/${id}`;
        return axios.delete(url, {}, {withCredentials: true}).then(response => response.data)
    }

    getComments(topicId){
        const url = `/api/v1/forum/comments/topic/${topicId}`;
        return axios.get(url,{withCredentials: true}).then(response => response.data)
    }

    putComment(id, editedComment){
        const url = `/api/v1/forum/comments/${id}`;
        return axios.put(url, editedComment, {withCredentials: true}).then(response => response.data)
    }

    newComment(newComment){
        const url = `/api/v1/forum/comments`;
        return axios.post(url, newComment, {withCredentials: true}).then(response => response.data)
    }

    deleteComment(id){
        const url = `/api/v1/forum/comments/${id}`;
        return axios.delete(url, {}, {withCredentials: true}).then(response => response.data)
    }

    getFormSubmissions(formName) {
        const url = `/api/v1/formio/submission/${formName}`;
        return axios.get(url,{withCredentials: true}).then(response => response.data)
    }

    deleteFormSubmission(id, formName) {
        const url = `/api/v1/formio/form/${formName}/submission/${id}`;
        return axios.delete(url,{withCredentials: true}).then(response => response.data)
    }

    getRepos(query){
        if (typeof(query) === "undefined"){
            query = {filterBy: false};
        }
        let url = '/api/v1/repos';
        if(query.filterBy) {
            let keys = Object.keys(query.filterBy);
            for (let i=0; i<keys.length; i++){
                url += (i==0) ? `/?` : `&`;
                url += `${keys[i]}=${query.filterBy[keys[i]]}`;
            }
        }
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    postRepo(repo){
        // console.log("BE postdataUpload: " + dataUpload);
        const url = `/api/v1/repos`;
        const body = { name: repo.name };
        return axios.post(url, body, {withCredentials: true}).then(response => response.data)
    }

    putRepo(repo){
        // console.log("BE putdataUpload: " + dataUpload);
        const url = `/api/v1/repos/${repo._id}`;
        const body = { 
            name: repo.name,
        };
        return axios.put(url, body, {withCredentials: true}).then(response => response.data)
    }

    getRepoBranches(repoId){
        // console.log("BE putdataUpload: " + dataUpload);
        const url = `/api/v1/repos/${repoId}/branches`;
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    getBranches(filterObj){
        let url = `/api/v1/repobranches`;
        if ((filterObj) && (filterObj.upload_id)){
            url += "?data_upload_id=" + filterObj.upload_id
        }
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    postRepoBranch(repoId, branch){
        const url = `/api/v1/repobranches/${repoId}/branches`;
        const body = { 
            name: branch.name,
            type: branch.type,
            description: branch.description,
            upload_id: branch.upload_id,
        };
        return axios.post(url, body, {withCredentials: true}).then(response => response.data)
    }

    putRepoBranch(repoId, branch){
        const url = `/api/v1/repobranches/${branch._id}`;
        const body = { 
            name: branch.name,
            type: branch.type,
            description: branch.description,
            upload_id: branch.upload_id,
        };
        return axios.put(url, body, {withCredentials: true}).then(response => response.data)
    }

    getMcVersion(){
        let url = `/api/version`;
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    getForumVersion(){
        let url = `/api/version?type=forum`;
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    getTusVersion(){
        let url = `/api/version?type=tusd`;
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }


    getConfigs(){
        const url = `/api/v1/config`
        return axios.get(url, {withCredentials: true}).then( (response) => {
            let data = response.data;
            return data;
        })
    }

    getConfig(key){
        const url = `/api/v1/config/${key}`
        return axios.get(url, {withCredentials: true}).then( (response) => {
            let data = response.data;
            return data;
        })
    }

    putConfig(id, editedForm){
        let body = {value: editedForm.value};
        const url = `/api/v1/config/${editedForm.key}`;
        return axios.put(url, body, {withCredentials: true}).then(response => response.data)
    }

    newConfig(newForm){
        const url = `/api/v1/config`;
        return axios.post(url, newForm, {withCredentials: true}).then(response => response.data)
    }

    deleteConfig(id){
        const url = `/api/v1/config/${id}`;
        return axios.delete(url, {}, {withCredentials: true}).then(response => response.data)
    }

}
