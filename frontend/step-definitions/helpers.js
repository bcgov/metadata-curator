const { client } = require('nightwatch-api');
const conf = require('./config.json');

confGet = function(parm){
    return conf[parm];
}

confHas = function(parm){
    return (typeof(conf[parm]) !== "undefined");
}

module.exports = {
    confGet: confGet,

    confHas: confHas,

    open: function(){
        return client.url(confGet('url'));
    },

    //assumes not logged in won't work otherwise
    login: async function(client, userType){
        try {
            //might have to go through insecure cert link for terraform
            await client.waitForElementVisible('#details-button', 1000);
            await client.click('#details-button');
            await client.click('#proceed-link');
            await client.click('#details-button');
            await client.click('#proceed-link');
        }catch(e){}

        await client.waitForElementVisible('input[name="username"]', 1000);
        await client.waitForElementVisible('input[name="password"]', 1000);
        await client.waitForElementVisible('input[id="kc-login"]', 1000);
        client
                .setValue('input[name="username"]', confGet(userType+"Account"))
                .setValue('input[name="password"]', confGet(userType+"Password"))
                .click('input[id="kc-login"]')

        return client.waitForElementVisible('div.v-toolbar__title.font-weight-light', 1000);
                
    },

    logout: function(client){
        return client.click('#userMenu').click('#userMenu-Logout');
    },

    newUpload: async function(client){
        try {
            await client.click('#tab-uploads');
        }catch(ex){
            await client.click('#tab-home');
        }
        
        return client.click('#newUpload');
    }
}