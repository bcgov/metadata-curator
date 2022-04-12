const { Given, Then, When } = require('@cucumber/cucumber');

const helpers = require('./helpers');
const path = helpers.confGet('screenshotPath');

var workingSchema = {
    resName: {
        selector: 'input[name="resName"]',
        value: 'Resource 1',
        selector2: '#resName-value'
    },
    path: {
        selector: 'input[name="path"]',
        value: './tmp/upload.csv',
        selector2: '#path-value'
    },
    resDescription: {
        selector: 'textarea[name="resDescription"]',
        value: 'file description',
        selector2: '#resDescription-value'
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
        selector2: '#source_system-value'
    },
    name: {
        selector: 'input[name="name"]',
        value: 'field 0 name',
        selector2: '#name-value'
    },
    title: {
        selector: 'input[name="title"]',
        value: 'field 0 title',
        selector2: '#title-value'
    },
    shortName: {
        selector: 'input[name="shortName"]',
        value: 'field 0 title',
        selector2: '#title-value'
    },
    type: {
        selector: '//input[@name="type"]/..',
        select: true,
        value: "string",
        selector2: '#type-value',
    },
    description: {
        selector: 'textarea[name="description"]',
        value: 'field description',
        selector2: '#description-value'
    },
    format: {
        selector: 'input[name="format"]',
        value: 'field 0 format',
        selector2: '#format-value'
    },
    rdfType: {
        selector: 'input[name="rdfType"]',
        value: "field 0 rdfType",
        selector2: '#rdfType-value',
    },
    tags: {
        selector: 'input[name="tags"]',
        value: "field 0 tag",
        selector2: '#tags-value',
    },
    notes: {
        selector: 'input[name="notes"]',
        value: "field 0 notes",
        selector2: '#notes-value',
    },
    enum: {
        selector: 'textarea[name="enum"]',
        value: 'field enum',
        selector2: '#enum-value'
    },
    highlight: {
        selector: '//input[@name="highlight"]/..',
        select: true,
        value: "Yes",
        selector2: '#highlight-value',
    },
};


When(/^they provide schema information$/, async function(){
    client = this.browser;

    try{

        await client.click('#addFileResource');
        await client.click('#addField');
        
        for (property in workingSchema){
            if (workingSchema[property].select){

                await client.click('xpath', workingSchema[property].selector);
                await client.pause(100);
                await client.click('xpath', '//div[@class="v-list-item__title"][contains(.,"' + workingSchema[property].value+'")]');
                
            }else if (workingSchema[property].value){
                await client.setValue(workingSchema[property].selector, workingSchema[property].value)
            }
        }
        
        await client.pause(1000);
        await client.saveScreenshot('./'+path+'/preSchemaSave-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');
        await client.click('#saveMetadata');
        await client.pause(5000);
        await client.saveScreenshot('./'+path+'/postSchemaSave-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');

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

    await client.moveToElement(workingSchema.enum.selector2, 50, 50);

    await client.saveScreenshot('./'+path+'/preSchemaReview-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');
    try{
        let success = true;
        for (var property in workingSchema){

            if (workingSchema[property].selector2 === '#highlight-value'){
                success = (success && await client.assert.attributeContains('#fieldHeader-0-0', 'class', 'fieldHighlight'));
            }else if (workingSchema[property].selector2){
                if (workingSchema[property].expectedValue){
                    success = (success && await client.assert.textContains(workingSchema[property].selector2, workingSchema[property].expectedValue));
                }else{
                    success = (success && await client.assert.textContains(workingSchema[property].selector2, workingSchema[property].value));
                }
            }else if (workingSchema[property].value){
                success = (success && await client.assert.value(workingSchema[property].selector, workingSchema[property].value));
            }else{
                success = false;
            }
        }

        await client.saveScreenshot('./'+path+'/postSchemaReview-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');

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
        await client.pause(3000);
        await client.click('#schema-tab');
        await client.pause(3000);
        await client.saveScreenshot('./'+path+'/onFilesAndFieldsTab-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');
    }catch(ex){
        await helpers.logout(client);
        throw ex;
    }
});

Then(/^They should be able to upload a data package$/, async function(){
    client = this.browser;
    try{
        await client.pause(3000);
        await client.assert.elementPresent("input[type='file'][accept='.json,application/json,application/JSON']");
        await client.assert.elementPresent("#create-without-import");
        await client.saveScreenshot('./'+path+'/postSchemaCanUpload-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');
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
        await client.saveScreenshot('./'+path+'/postSchemaNoImport-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');
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
        await client.saveScreenshot('./'+path+'/schemaPreTab-'+new Date().toISOString().replace(/[:.]/g, '').replace(/[:.]/g, '')+'.png');
        await client.click('#schema-tab');
        await client.saveScreenshot('./'+path+'/schemaPostTab-'+new Date().toISOString().replace(/[:.]/g, '').replace(/[:.]/g, '')+'.png');
        await client.pause(3000);
        await client.saveScreenshot('./'+path+'/postViewSchemaTab-'+new Date().toISOString().replace(/[:.]/g, '').replace(/[:.]/g, '')+'.png');
    }catch(ex){
        await helpers.logout(client);
        throw ex;
    }
});