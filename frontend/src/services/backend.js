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

}
