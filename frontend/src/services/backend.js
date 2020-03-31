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

}
