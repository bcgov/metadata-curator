const { Given, Then, When } = require('@cucumber/cucumber');

const helpers = require('./helpers');
const path = helpers.confGet('screenshotPath');

var workingDataset = {
    name: {
        selector: 'input[name="name"]',
        value: 'Dataset ',
        selector2: '#name-value'
    },
    ministry: {
        selector: '//input[@name="ministry_organization"]/..',
        select: true,
        value: "test",
        selector2: '#ministry_organization-value',
    },
    description: {
        selector: 'textarea[name="description"]',
        value: 'this is a description',
        selector2: '#description-value'
    },
    data_collection_type: {
        selector: '//input[@name="data_collection_type"]/..',
        select: true,
        value: "Main",
        selector2: '#data_collection_type-value',
    },
    gov_allow_publish: {
        selector: 'input[name="gov_allow_publish"] + .v-input--selection-controls__ripple',
        ariaChecked: "true",
        selector2: '#gov_allow_publish-id i'
    },
    aca_allow_publish: {
        selector: 'input[name="aca_allow_publish"] + .v-input--selection-controls__ripple',
        ariaChecked: "false",
        selector2: '#aca_allow_publish-id i'
    },
    gov_approval_needed: {
        selector: 'input[name="gov_approval_needed"] + .v-input--selection-controls__ripple',
        ariaChecked: "true",
        selector2: '#gov_approval_needed-id i'
    },
    aca_approval_needed: {
        selector: 'input[name="aca_approval_needed"] + .v-input--selection-controls__ripple',
        ariaChecked: "false",
        selector2: '#aca_approval_needed-id i'
    },
    in_bc_catalogue: {
        selector: 'input[name="in_bc_catalogue"] + .v-input--selection-controls__ripple',
        ariaChecked: "true",
        selector2: '#in_bc_catalogue-id i'
    },
    lifecycle_status: {
        selector: '//input[@name="lifecycle_status"]/..',
        select: true,
        value: "Active",
        selector2: '#lifecycle_status-value',
    },


};

Given(/^Data approver successfully creates a dataset$/, async function(){
    client = this.browser;
    const testTime = new Date().toISOString();
    workingDataset.name.value = 'Dataset ' + testTime;

    try{
        await helpers.open(client);
        await helpers.login(client, 'approver');

        await helpers.newDataset(client);

        const groupSel = helpers.confGet('providerGroup');

        await client.click('xpath', '//input[@name="providerGroup"]/..');
        await client.pause(200);
        await client.click('xpath', '//div[@class="v-list-item__title"][contains(.,"' + groupSel+'")]');
        await client.pause(200);

        for (property in workingDataset){
            if (workingDataset[property].select){

                await client.click('xpath', workingDataset[property].selector);
                await client.pause(100);
                await client.click('xpath', '//div[@class="v-list-item__title"][contains(.,"' + workingDataset[property].value+'")]');

            }else if (workingDataset[property].value){
                await client.setValue(workingDataset[property].selector, workingDataset[property].value)
            }else if (workingDataset[property].ariaChecked === 'true'){
                await client.click(workingDataset[property].selector);
            }
        }

        await client.saveScreenshot('./'+path+'/preSaveDataset-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');
        await client.click('#saveDataset');
        await client.pause(5000);
    }catch(ex){
        await helpers.logout(client);
        throw ex;
    }
});

When(/^Data approver chooses to see the details of the dataset$/, async function(){
    client = this.browser;
    try{
        let id = '#dataset-'+workingDataset.name.value.toLowerCase();
        id += '----' + workingDataset.ministry.value.toLowerCase();
        id = id.replace(/[ :.]/g, '-')
        await client.pause(5000);
        console.log("Dataset ID to click:"+ id);
        await client.saveScreenshot('./'+path+'/selectDataSetForDetails.png');
        await client.click(id);
        await client.pause(2000);
    }catch(ex){
        await helpers.logout(client);
        throw ex
    }
});

Then(/^Data approver should see information on the characteristics of the dataset$/, async function(){
    client = this.browser;
    await client.pause(5000);
    await client.saveScreenshot('./'+path+'/preDatasetReview-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');
    try{
        let success = true;
        for (var property in workingDataset){

            if ( (workingDataset[property].ariaChecked) || (workingDataset[property].ariaChecked === 'false') ){

                let contains = workingDataset[property].ariaChecked === 'true' ? 'fa-check-square' : 'fa-square'

                success = (success && await client.assert.attributeContains(workingDataset[property].selector2, 'class', contains));
            }else if (workingDataset[property].selector2){
                success = (success && await client.assert.textContains(workingDataset[property].selector2, workingDataset[property].value));
            }else if (workingDataset[property].value){
                success = (success && await client.assert.value(workingDataset[property].selector, workingDataset[property].value));
            }else{
                success = false;
            }
        }

        return success;
    }catch(ex){
        console.log("ERROR ERROR ERROR", ex);
        await helpers.logout(client);
        throw ex;
    }
});

Then(/^Data approver edits the dataset information$/, async function(){
    client = this.browser;
    try{
        for (var property in workingDataset){
            if (workingDataset[property].value && !workingDataset[property].select){
                workingDataset[property].value += "e"
            }else if ( (workingDataset[property].ariaChecked) || (workingDataset[property].ariaChecked === false) ){
                workingDataset[property].ariaChecked = (workingDataset[property].ariaChecked === 'true') ? "false" : "true";
            }
        }

        await client.pause(5000);
        await client.click('#editDatasetBtn');

        for (property in workingDataset){
            if (workingDataset[property].value && !workingDataset[property].select){
                client.getValue(workingDataset[property].selector, (textValue) => {
                    for(let i = 0; i < textValue.value.length; i ++) {
                        client.setValue(workingDataset[property].selector, '\u0008');
                    }
                });
                await client.setValue(workingDataset[property].selector, workingDataset[property].value)
            }else if ( (workingDataset[property].ariaChecked === 'true') || (workingDataset[property].ariaChecked === 'false') ){
                await client.click(workingDataset[property].selector);
            }
        }

        await client.pause(5000);

        await client.saveScreenshot('./'+path+'/preDatasetEditSave-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');
        await client.click('#saveDataset');
        await client.pause(2000);
    }catch(ex){
        await helpers.logout(client);
        throw ex;
    }
});

Then(/^the Data approver logs out$/, async function(){
    client = this.browser;
    await client.setWindowPosition(0, 0);
    await helpers.logout(client);
    await client.pause(500)
});
