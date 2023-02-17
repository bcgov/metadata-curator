const { Given, Then, When } = require('@cucumber/cucumber');

const helpers = require('./helpers');
const path = helpers.confGet('screenshotPath');

var workingSchema = {
    resName: {
        selector: 'input[name="resName"]',
        value: 'Resource 1',
        selector2: '#basicField-0-name'
    },
    path: {
        selector: 'input[name="path"]',
        value: './tmp/upload.csv',
        selector2: '#basicField-0-path'
    },
    resDescription: {
        selector: 'textarea[name="resDescription"]',
        value: 'file description',
        selector2: '#basicField-0-description'
    },
    temporal_start: {
        selector: 'input[name="temporal_start"]',
        value: '2020-03-31',
        selector2: '#temporal_start-value'
    },
    temporal_end: {
        selector: 'input[name="temporal_end"]',
        value: '2022-06-23',
        selector2: '#temporal_end-value'
    },
    source: {
        selector: 'input[name="source_system"]',
        value: 'source',
        selector2: '#basicField-0-source_system'
    },
    name: {
        selector: 'input[name="name"]',
        value: 'field 0 name',
        selector2: '#basicField-0-0-name'
    },
    title: {
        selector: 'input[name="title"]',
        value: 'field 0 title',
        selector2: '#basicField-0-0-title'
    },
    shortName: {
        selector: 'input[name="shortName"]',
        value: 'field 0 short',
        selector2: '#basicField-0-0-shortName'
    },
    type: {
        selector: '//input[@name="type"]/..',
        select: true,
        value: "string",
        selector2: '#basicField-0-0-type',
    },
    description: {
        selector: 'textarea[name="basicField-0-0-description"]',
        value: "field description",
        selector2: '#basicField-0-0-description-value',
        expectedValue: "field description",
    },
    format: {
        selector: 'input[name="format"]',
        value: 'field 0 format',
        selector2: '#basicField-0-0-format'
    },
    rdfType: {
        selector: 'input[name="rdfType"]',
        value: "field 0 rdfType",
        selector2: '#basicField-0-0-rdfType',
    },
    notes: {
        selector: 'textarea[name="basicField-0-0-notes"]',
        value: "field 0 notes",
        selector2: '#basicField-0-0-notes-value',
        expectedValue: "field 0 notes",
    },
    enum: {
        selector: 'textarea[name="enum"]',
        value: 'field enum',
        selector2: '#basicField-0-0-enum'
    },
    highlight: {
        selector: '//input[@name="highlight"]/..',
        select: true,
        value: "Yes",
        selector2: '#basicField-0-0-highlight-span .v-select__selection',
    },
};


When(/^they provide schema information$/, async function(){
    client = this.browser;

    try{
        await client.pause(5000);
        await client.saveScreenshot('./'+path+'/preAddFileResource-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');
        await client.click('#addFileResource');
        await client.click('#addField');

        for (property in workingSchema){
            if (workingSchema[property].select){
                await client.saveScreenshot('./'+path+'/provideSchemaSelect-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');
                await client.click('xpath', workingSchema[property].selector);
                await client.pause(100);
                await client.click('xpath', '//div[@class="v-list-item__title"][contains(.,"' + workingSchema[property].value+'")]');

            }else if (workingSchema[property].value){
                await client.saveScreenshot('./'+path+'/provideSchemaValue-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');
                await client.setValue(workingSchema[property].selector, workingSchema[property].value)
            }
        }

        await client.pause(1000);
        await client.saveScreenshot('./'+path+'/preSchemaSave-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');
        await client.click('#saveMetadata');
        await client.pause(5000);

    }catch(ex){
        await helpers.logout(client);
        throw ex;
    }
});

Then(/^they should see the schema information$/, async function(){
    client = this.browser;
    await client.pause(4000);
    await client.click('button.expandResource');
    await client.pause(1000);
    await client.click('button.expandField');
    await client.pause(1000);

    await client.saveScreenshot('./'+path+'/preSchemaReview-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');
    await client.execute('window.scrollTo(0,(document.body.scrollHeight-150));');
    await client.saveScreenshot('./'+path+'/preSchemaReviewBOTTOM-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');
    try{
        let success = true;
        for (var property in workingSchema){

            if (workingSchema[property].selector2 === '#highlight-value'){
                success = (success && await client.assert.attributeContains('#fieldHeader-0-0', 'class', 'fieldHighlight'));
            }else if (workingSchema[property].selector2){
                let text = await client.getText(workingSchema[property].selector2);
                if (workingSchema[property].expectedValue){
                    client.waitForElementPresent(workingSchema[property].selector2, 3000);
                    success = (success && await client.assert.textContains(workingSchema[property].selector2, workingSchema[property].expectedValue));
                }else{
                    client.waitForElementPresent(workingSchema[property].selector2, 3000);
                    success = (success && await client.assert.textContains(workingSchema[property].selector2, workingSchema[property].value));
                }
            }else if (workingSchema[property].value){
                success = (success && await client.assert.value(workingSchema[property].selector, workingSchema[property].value));
            }else{
                success = false;
            }
            await client.saveScreenshot('./'+path+'/schemaInReview-'+property+'.png');
        }

        return success;
    }catch(ex){
        console.log("ERROR ERROR ERROR", ex);
        await helpers.logout(client);
        throw ex;
    }
});


When(/^the user is on the files and fields tab$/, async function(){
    client = this.browser;
    try{
        await client.waitForElementPresent('#schema-tab', 30000);
        await client.click('#schema-tab');
        await client.pause(3000);
    }catch(ex){
        await helpers.logout(client);
        throw ex;
    }
});

Then(/^They should be able to upload a data package$/, async function(){
    client = this.browser;
    try{
        await client.pause(15000);
        await client.assert.elementPresent("input[type='file'][accept='.json,application/json,application/JSON']");
        await client.assert.elementPresent("#create-without-import");
    }catch(ex){
        await helpers.logout(client);
        throw ex;
    }
});

When(/^they create without import$/, async function(){
    client = this.browser;
    try{
        await client.click("#create-without-import");
        await client.pause(1000)
    }catch(ex){
        await helpers.logout(client);
        throw ex;
    }
});

When(/^they choose to view schema information$/, async function(){
    client = this.browser;
    try{

        // await client.refresh();
        await client.click('#tab-versions');
        await client.pause(3000);
        await client.click('.v-list-item--link')

        await client.pause(3000)
        await client.click('#schema-tab');
        await client.pause(3000);
    }catch(ex){
        await helpers.logout(client);
        throw ex;
    }
});
