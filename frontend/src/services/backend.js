import axios from 'axios';

export class Backend {
    constructor(){}

    getToken(){
        const url = '/api/token'
        return axios.get(url, {withCredentials: true}).then(response => response.data)
    }

    
}