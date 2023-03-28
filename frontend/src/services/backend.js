import axios from 'axios';

export class Backend {
    constructor(){}

    getToken(jwt){
        const url = '/api/token'
        let options = {
            withCredentials: true
        }

        if (jwt){
            options = {
                headers: {
                    'Authorization': "Bearer " + jwt
                }
            }
        }
        return axios.get(url, options).then(response => response.data)
    }

    getPublicKey(){
        const url = '/api/v1/publickey'
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    getUploadUrl(){
        const url = '/api/v1/uploadurl'
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    getSupplementalUploadUrl(){
        const url = '/api/v1/supplementaluploadurl'
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    concatenateUpload(joinIds, uploadUrl, jwt, resumable, filename, filetype, checksum){
        let uploadOptions = {}
        uploadOptions.headers = {
            "Tus-Resumable": resumable,
            "Upload-Concat": "final;" + joinIds.join(" "),
            "Upload-Metadata": "filename "+btoa(filename)+",filetype "+btoa(filetype)+",checksum "+btoa(checksum)+",jwt " + btoa(jwt)
        };
        return axios.post(uploadUrl, {}, uploadOptions);
    }

    getTableSchema(id, byUploadId, inferred){
        byUploadId = typeof(byUploadId) !== 'undefined' ? byUploadId : false;
        inferred = typeof(inferred) !== 'undefined' ? inferred : false;

        let url = `/api/v1/datapackages/branch/${id}`
        if (byUploadId){
            url = `/api/v1/datapackages/branch?upload_id=${id}`
            url += `&inferred=${inferred}`
        }else if (inferred){
            url += `?inferred=${inferred}`
        }
        return axios.get(url, {withCredentials: true}).then(response => response.data);
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

    getDataPackageRevs(id){
        let url = `/api/v1/datapackages/${id}/revisions`;
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    getEditionsByResourceField(name){
        let url = `/api/v1/repobranches/branches/${name}`;
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    postDataPackageSchema(schema) {
        const url = '/api/v1/datapackages'
        // console.log("postTabDataPackage: ", tabDataPackage);
        const headers = {
            'Content-Type': 'application/json'
        }
        return axios.post(url, schema,
            {withCredentials: true, headers: headers}
        ).then(response => response.data)
    }

    putDataPackageSchema(id, schema) {
        const url = `/api/v1/datapackages/${id}`
        // console.log("postTabDataPackage: ", tabDataPackage);
        const headers = {
            'Content-Type': 'application/json'
        }
        // console.log("PUT", schema);
        return axios.put(url, schema,
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

    deleteDataUpload(dataUploadId){
        const url = `/api/v1/datauploads/${dataUploadId}`;
        return axios.delete(url, {withCredentials: true}).then(response => response.data)
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

    getCommentsByRepo(repoId){
        const url = '/api/v1/repos/' + repoId + '/comments';
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    postCommentByRepo(repoId, comment){
        const url = '/api/v1/repos/' + repoId + '/comments';
        const body = { content: comment};
        return axios.post(url, body,{withCredentials: true}).then(response => response.data)
    }

    getCommentsByBranch(branchId){
        const url = '/api/v1/repobranches/' + branchId + '/comments';
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    postCommentByBranch(branchId, comment){
        const url = '/api/v1/repobranches/' + branchId + '/comments';
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

    getDataProviders(){
        let url = '/api/v1/dataproviders';
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }


    async getTopics(){
        const url = `/api/v1/forum/topics`;
        let r = await axios.get(url,{withCredentials: true})
        if (r.data && r.data.length >= 100){
            let page = 2;
            let u = url + "?page=" + page;
            let r2 = await axios.get(u,{withCredentials: true})
            while (r2.data && r2.data.length >= 100){
                r.data = r.data.concat(r2.data);
                page++;
                u = url + "?page=" + page;
                r2 = await axios.get(u,{withCredentials: true})
            }
            r.data = r.data.concat(r2.data)

        }
        return r.data
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

    getReposFull(query){
        if (typeof(query) === "undefined"){
            query = {filterBy: false};
        }
        let url = '/api/v1/repos/editionfull';
        if(query.filterBy) {
            let keys = Object.keys(query.filterBy);
            for (let i=0; i<keys.length; i++){
                url += (i==0) ? `/?` : `&`;
                url += `${keys[i]}=${query.filterBy[keys[i]]}`;
            }
        }
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    getRepoRevs(id){
        let url = `/api/v1/repos/${id}/revisions`;
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    postRepo(repo){
        // console.log("BE postdataUpload: " + dataUpload);
        const url = `/api/v1/repos`;
        const body = repo;
        return axios.post(url, body, {withCredentials: true}).then(response => response.data)
    }

    putRepo(repo){
        // console.log("BE putdataUpload: " + dataUpload);
        const url = `/api/v1/repos/${repo._id}`;
        const body = repo;
        return axios.put(url, body, {withCredentials: true}).then(response => response.data)
    }

    getRepoBranches(repoId){
        // console.log("BE putdataUpload: " + dataUpload);
        const url = `/api/v1/repobranches/${repoId}/branches`;
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    copyRepoBranchSchema(copyFromRepoId, copyToRepoId){
        // console.log("BE putdataUpload: " + dataUpload);
        const url = `/api/v1/repobranches/${copyToRepoId}/copy-schema`;
        return axios.put(url, {copyFrom: copyFromRepoId}, {withCredentials: true}).then(response => response.data)
    }

    getBranches(filterObj){
        let url = `/api/v1/repobranches`;
        if ((filterObj) && ( (filterObj.upload_id) || (filterObj.upload_id === '') )){
            url += "?data_upload_id=" + ( (filterObj.upload_id) ? filterObj.upload_id : 'null');
        }
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    getBranchById(id){
        let url = `/api/v1/repobranches/${id}`;
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    getBranchRevsById(id){
        let url = `/api/v1/repobranches/${id}/revisions`;
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    postRepoBranch(repoId, branch){
        const url = `/api/v1/repobranches/${repoId}/branches`;
        return axios.post(url, branch, {withCredentials: true}).then(response => response.data)
    }

    putRepoBranch(repoId, branch){
        const url = `/api/v1/repobranches/${branch._id}`;
        return axios.put(url, branch, {withCredentials: true}).then(response => response.data)
    }

    deleteRepoBranch(id){
        const url = `/api/v1/repobranches/${id}`;
        return axios.delete(url, {}, {withCredentials: true}).then(response => response.data)
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

    getVariableClassifications(){
        const url = `/api/v1/varclass`
        return axios.get(url, {withCredentials: true}).then( (response) => {
            let data = response.data;
            return data;
        })
    }

    getVariableClassification(key){
        const url = `/api/v1/varclass/${key}`
        return axios.get(url, {withCredentials: true}).then( (response) => {
            let data = response.data;
            return data;
        })
    }

    putVariableClassification(id, editedForm){
        const url = `/api/v1/varclass/${id}`;
        return axios.put(url, editedForm, {withCredentials: true}).then(response => response.data)
    }

    newVariableClassification(newForm){
        const url = `/api/v1/varclass`;
        return axios.post(url, newForm, {withCredentials: true}).then(response => response.data)
    }

    deleteVariableClassification(id){
        const url = `/api/v1/varclass/${id}`;
        return axios.delete(url, {}, {withCredentials: true}).then(response => response.data)
    }

    getCommentsByVarClass(varClassId){
        const url = '/api/v1/varclass/' + varClassId + '/comments';
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    postCommentByVarClass(varClassId, comment){
        const url = '/api/v1/varclass/' + varClassId + '/comments';
        const body = { content: comment};
        return axios.post(url, body,{withCredentials: true}).then(response => response.data)
    }

    putUserBCDC(email, bcdcUserInfo){
        const url = `/api/v1/user/${email}`;
        return axios.put(url, bcdcUserInfo, {withCredentials: true}).then(response => response.data)
    }

    pushToBCDC(branchId, accessKey){
        const url = `/api/v1/repobranches/${branchId}/bcdc`;
        return axios.post(url, {accessKey: accessKey}, {withCredentials: true}).then(response => response.data)
    }

    sunsetBCDC(branchId, accessKey){
        const url = `/api/v1/repobranches/${branchId}/bcdc_sunset`;
        return axios.post(url, {accessKey: accessKey}, {withCredentials: true}).then(response => response.data)
    }

    getSuppFile(branchId, fileId){
        const url = `/api/v1/repobranches/${branchId}/file/${fileId}`;
        return axios.get(url, {withCredentials: true}).then(response => response)
    }

    deleteSuppFile(branchId, fileId){
        const url = `/api/v1/repobranches/${branchId}/file/${fileId}`;
        return axios.delete(url, {withCredentials: true}).then(response => response)
    }

    getOptions(query){
        if (typeof(query) === "undefined"){
            query = {filterBy: false};
        }
        let url = '/api/v1/options';
        if(query.filterBy) {
            url = `${url}/?filterBy=${query.filterBy}`;
        }
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    getOption(id){
        let url = `/api/v1/options/${id}`;
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    putOption(option){
        // console.log("BE putdataUpload: " + dataUpload);
        const url = `/api/v1/options/${option._id}`;
        return axios.put(url, option,{withCredentials: true}).then(response => response.data)
    }

    postOption(option){
        // console.log("BE putdataUpload: " + dataUpload);
        const url = `/api/v1/options`
        return axios.post(url, option,{withCredentials: true}).then(response => response.data)
    }

}
