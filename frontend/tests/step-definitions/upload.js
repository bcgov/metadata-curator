const { Given, Then, When } = require('@cucumber/cucumber');

const helpers = require('./helpers');
const { captureRejectionSymbol } = require('events');

const path = helpers.confGet('screenshotPath');

const data1 = {
    ministry_organization: {
        selector: '//input[@name="ministry_organization"]/..',
        select: true,
        value: "test",
        selector2: '#ministry_organization-value',
    },
    name: {
        selector: 'input[name="name"]',
        selector2: '#name-value',
        value: "my dataset",
    },
    description: {
        selector: 'textarea[name="description"]',
        selector2: '#description-value',
        value: "description of the dataset",
    },
    num_files: {
        selector: 'input[name="num_files"]',
        selector2: '#num_files-value',
        value: "1",
    },
    data_created_date: {
        selector: 'input[name="data_create_date"]',
        selector2: '#data_create_date-value',
        value: "2",
    }
}

Given(/^Data provider successfully uploads a data file$/, async function(){
    const client = this.browser;

    await client.pause(1000);

    await helpers.open(client);

    await client.pause(1000);

    await helpers.login(client, 'publisher');
    await client.saveScreenshot("./"+path+"/preNewUpload.png");
    client.click('#userMenu').pause(10)
    client.click('#toUserPage').pause(100).saveScreenshot('./'+confGet('screenshotPath')+'/uploadUserInfo.png');

    await helpers.newUpload(client);
    await client.pause(10000);
    await client.saveScreenshot("./"+path+"/postNewUpload.png");

    for (const property in data1){
        if (data1[property].select){

            await client.click('xpath', data1[property].selector);
            await client.pause(1000);
            await client.click('xpath', '//div[@class="v-list-item__title"][contains(.,"' + data1[property].value+'")]');
            await client.pause(1000);

        }else{
            await client.setValue(data1[property].selector, data1[property].value)
        }
    }

    await client.click('#next-1');

    await client.execute('window.scrollTo(0,0);');
    await client.saveScreenshot("./"+path+"/postNext1.png");

    await client.pause(3000);
    await client.click('#newDatasetButton');
    await client.pause(7500);
    await client.click('#newVersionButton');
    await client.pause(7500);
    await client.saveScreenshot("./"+path+"/preNext2.png");
    await client.click('#next-2');
    await client.pause(300);
    await client.saveScreenshot("./"+path+"/postNext2.png");
    await client.pause(3000);

    let f = require('path').resolve(__dirname + '/sample.csv');
    let el = await client.findElements('#fileForm-reader input[type="file"]');
    await client.executeScript("console.log(arguments[0], arguments[0].style); arguments[0].style['pointer-events']='auto'; arguments[0].style.width='1000px'; arguments[0].style.maxWidth='1000px'; arguments[0].style.opacity=1", el);

    await client.pause(500);
    await client.setValue('#fileForm-reader input[type="file"]', f);
    await client.pause(500);
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

    await client.setValue('#fileinfo-0-num_records', 5);

    await client.saveScreenshot("./"+path+"/preNext3.png");
    await client.pause(500);
    await client.click('#next-4');
    await client.pause(500);
    await client.saveScreenshot("./"+path+"/postNext3.png").pause(1);

    await client.pause(500);
    await client.saveScreenshot("./"+path+"/preNext5.png").pause(1);
    await client.click('#next-5');
    await client.saveScreenshot("./"+path+"/postNext5.png").pause(1);
    await client.pause(500);

    await client.click('#upload');

    var res;
    try{
        //res = await client.waitForElementVisible('#upload-success-indicator', 15000);
        return await client.pause(13000);
    }catch(ex){
        let p = "./"+path+"/"+new Date().toString()+".png"
        p = p.replace(/:/g, "");
        await client.saveScreenshot(p);
        throw ex;
    }
});

When(/^Data provider chooses to see the details of the upload$/, async function(){
    const client = this.browser;
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
    await client.pause(5000);
    return client.click('#upload-'+id);
});

Then(/^Data provider should see information on the characteristics of the data upload$/, async function(){
    const client = this.browser;
    await client.pause(30000);//
    await client.saveScreenshot("./"+path+"/uploadSummary1.png");//
    await client.assert.textContains('#uploadDetail-name', data1.name.value);
    //await client.click('#uploadDetail-showInfo');
    await client.waitForElementVisible('#ministry_organization-value', 10000)
    await client.pause(2500);

    var success = true;

    for (var property in data1){
        success = (success && await client.assert.textContains(data1[property].selector2, data1[property].value));
    }

    return success;
  });

Then(/^the title is "([^"]*)"$/, async function(title){
    const client = this.browser;
    await client.assert.titleEquals(title);
    return true;
});
