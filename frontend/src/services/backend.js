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

    // putValidateSchema(schema) {
    //     const url = '/api/v1/validateTableSchema'
    //     return axios.put(url, schema,{withCredentials: true,}).then(response => response.data);
    // }

    postSchema(schema) {
        const url = '/api/v1/schemas'
        // console.log("postSchema: ", schema);
        const headers = {
            'Content-Type': 'application/json'
        }
        return axios.post(url, schema,
            {withCredentials: true, headers: headers}
            ).then(response => response.data);
    }

}
