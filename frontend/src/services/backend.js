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

    concatenateUpload(joinIds, uploadUrl, jwt, resumable){
        let uploadOptions = {}
        uploadOptions.headers = {
            "Tus-Resumable": resumable,
            "Upload-Concat": "final;" + joinIds.join(" "),
            "Upload-Metadata": "jwt " + jwt
        };
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

    getDataUploads(){
        const url = '/api/v1/datauploads'
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

    putDataUpload(dataUpload){
        console.log("BE putdataUpload: " + dataUpload);
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
            for (let i=0; i<data.length; i++){
                response.data[i]._id = response.data[i].name
            }
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

}
