const { client } = require('nightwatch-api');
const { Given, Then, When } = require('@cucumber/cucumber');

const helpers = require('./helpers');
const { captureRejectionSymbol } = require('events');

const path = helpers.confGet('screenshotPath');

const data1 = {
    ministryOrganization: {
        selector: 'input[name="data[ministryOrganization]"]',
        value: "Metadata Curator",
    },
    datasetName: {
        selector: 'input[name="data[datasetName]"]',
        value: "my dataset",
    },
    uploadDescription: {
        selector: 'textarea[name="data[uploadDescription]"]',
        value: "description of the dataset",
    },
    numOfUploadFiles: {
        selector: 'input[name="data[numOfUploadFiles]"]',
        value: "1",
    },
    createdUpdatedDate: {
        selector: 'input[type="hidden"][name="data[createdUpdatedDate]"] + input[type="text"]',
        value: "2021-Jun-17",
    },
    keywordsDescribingData: {
        selector: 'textarea[name="data[keywordsDescribingData]"]',
        value: "Keyword1, Keyword2, Automated Test",
    }
}

Given(/^Data provider successfully uploads a data file$/, async () => {

    await helpers.open(client);
    await helpers.login(client, 'publisher');
    await client.saveScreenshot("./"+path+"/preNewUpload.png");
    client.click('#userMenu').pause(10)
    client.click('#toUserPage').pause(100).saveScreenshot('./'+confGet('screenshotPath')+'/uploadUserInfo.png');
    
    await helpers.newUpload(client);
    await client.pause(5000);
    await client.saveScreenshot("./"+path+"/postNewUpload.png");
    
    for (const property in data1){
        await client.setValue(data1[property].selector, data1[property].value)
    }

    await client.click('#next-1');
    
    await client.pause(1000);
    await client.click('#newDatasetButton');
    await client.pause(3000);
    await client.click('#newVersionButton');
    await client.pause(3000);
    await client.saveScreenshot("./"+path+"/preNext2.png");
    await client.click('#next-2');
    await client.pause(300);
    await client.saveScreenshot("./"+path+"/postNext2.png");
    
    let f = require('path').resolve(__dirname + '/sample.csv');
    await client.setValue('#fileForm-reader input[type="file"]', f);
    await client.click('#next-3');

    let d = new Date();
    let mo = (d.getMonth()+1)
    if (mo<10){
        mo = "0" + mo;
    }
    let da = d.getFullYear() + "-" + mo + "-" + d.getDate()
    
    await client.click('#fileinfo-0-start');
    await client.setValue('#fileinfo-0-start', da);
    await client.click('#fileinfo-0-title');
    await client.pause(500);

    await client.click('#fileinfo-0-end');
    await client.setValue('#fileinfo-0-end', da);

    await client.pause(500);
    await client.click('#fileinfo-0-title');
    await client.pause(500);
    await client.click('#fileinfo-0-title');
    await client.pause(500);
    await client.click('#fileinfo-0-title');

    await client.saveScreenshot("./"+path+"/preNext3.png");
    await client.click('#next-4');
    await client.saveScreenshot("./"+path+"/postNext3.png").pause(1);

    await client.click('#next-5');

    await client.pause(100);

    await client.click('#upload');

    var res;
    try{
        //res = await client.waitForElementVisible('#upload-success-indicator', 15000);
        return await client.pause(15000);
    }catch(ex){
        let p = "./"+path+"/"+new Date().toString()+".png"
        p = p.replace(/:/g, "");
        await client.saveScreenshot(p);
        throw ex;
    }
});

When(/^Data provider chooses to see the details of the upload$/, async () => {
    let url;
    await client.url( (result) => { url = result.value });
    let id = url.substring(url.lastIndexOf("/")+1);
    try {
        //phase2 has upload tab
        await client.click('#tab-uploads');
    }catch(ex){
        //phase 1 only has home
        await client.click('#tab-home');   
    }
    
    //click the upload in the list
    await client.pause(2500);
    await client.saveScreenshot("./"+path+"/checkingForUpload1.png");
    await client.waitForElementVisible(('#upload-'+id), 5000);
    await client.saveScreenshot("./"+path+"/checkingForUpload2.png");
    await client.waitForElementVisible('#upload-'+id+' i.mdi-checkbox-marked-circle', 1000);
    await client.pause(25000);
    return client.click('#upload-'+id);
});

Then(/^Data provider should see information on the characteristics of the data upload$/, async() => {
    await client.assert.containsText('#uploadDetail-name', data1.datasetName.value);
    await client.pause(5000);
    await client.click('#uploadDetail-showInfo');
    await client.waitForElementVisible('input[name="data[ministryOrganization]"]', 10000)
    await client.pause(200);

    var success = true;
    for (var property in data1){
        if (data1[property].selector.indexOf('textarea') !== -1){
            success = (success && await client.assert.containsText(data1[property].selector, data1[property].value));
        }else{
            success = (success && await client.assert.value(data1[property].selector, data1[property].value));
        }
    }

    return success;
  });

Then(/^the title is "([^"]*)"$/, title => {
  return client.assert.title(title);
});