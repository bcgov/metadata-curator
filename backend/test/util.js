module.exports = {
    setEnabledPhase: async function(phase){
        const axios = require('axios');
        try{
            await axios.post('/api/v1/config', {key: 'enabledPhase', value: phase});
            return true;
        }catch(e){
            return false;
        }
    }
}