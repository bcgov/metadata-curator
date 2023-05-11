const { Given, Then, When } = require('@cucumber/cucumber');

const helpers = require('./helpers');

const testTime = new Date().toISOString();
const path = helpers.confGet('screenshotPath');

var workingEdition = {
    name: {
        selector: 'input[name="name"]',
        value: 'Edition ' + testTime,
        selector2: '#name-value'
    },
    short_title: {
        selector: 'input[name="short_title"]',
        value: 'short title',
        selector2: '#short_title-value'
    },
    type: {
        selector: '//input[@name="type"]/..',
        select: true,
        value: "Standard",
        selector2: '#type-value',
    },
    description: {
        selector: 'textarea[name="description"]',
        value: "edition description",
        selector2: '#description-value',
        expectedValue: "edition description",
    },
    keywords: {
        selector: 'input[name="keywords"]',
        value: 'keyword1,keyword2, keyword3',
        selector2: '#keywords-value'
    },
    citation: {
        selector: 'input[name="citation"]',
        value: 'citation',
        selector2: '#citation-value'
    },
    instructions: {
        selector: 'textarea[name="instructions"]',
        value: "edition instructions",
        selector2: '#instructions-value',
        expectedValue: "edition instructions",
    },
    inclusions: {
        selector: 'textarea[name="inclusions"]',
        value: "edition inclusions",
        selector2: '#inclusions-value',
        expectedValue: "edition inclusions",
    },
    exclusions: {
        selector: 'textarea[name="exclusions"]',
        value: "edition exclusions",
        selector2: '#exclusions-value',
        expectedValue: "edition exclusions",
        
    },
    quality: {
        selector: 'textarea[name="quality"]',
        value: "edition quality",
        selector2: '#quality-value',
        expectedValue: "edition quality",
    },
    delta_over_time: {
        selector: 'textarea[name="delta_over_time"]',
        value: "edition delta_over_time",
        selector2: '#delta_over_time-value',
        expectedValue: "edition delta_over_time",
    },
    additional_info: {
        selector: 'textarea[name="additional_info"]',
        value: "edition additional_info",
        selector2: '#additional_info-value',
        expectedValue: "edition additional_info",
    },
    references: {
        selector: 'textarea[name="references"]',
        value: "edition references",
        selector2: '#references-value',
        expectedValue: "edition references",
    },
    faq: {
        selector: 'textarea[name="faq"]',
        value: "# Header\nsecond line",
        selector2: '#faq-value',
        expectedValue: "Header",
    },
    published: {
        selector: 'input[name="published"] + .v-input--selection-controls__ripple',
        ariaChecked: "false",
        selector2: '#published-id i'
    },
    // approved: {
    //     selector: 'input[name="approved"] + .v-input--selection-controls__ripple',
    //     ariaChecked: "false",
    //     selector2: '#approved-id i'
    // },
};

//presumes you are on the dataset page
When(/^Data approver makes a new edition$/, async function(){
    client = this.browser;

    try{

        await client.waitForElementPresent('#dataset-editions-tab', 30000);
        await client.click('#dataset-editions-tab');
        await client.pause(10000);
        await client.saveScreenshot('./'+path+'/preAddEdition-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');
        await client.waitForElementPresent('#addVersion', 25000);
        await client.pause(10000);
        await client.click('#addVersion');
        await client.pause(3000);
        await client.saveScreenshot('./'+path+'/postAddEdition-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');

        const groupSel = helpers.confGet('providerGroup');

        await client.waitForElementPresent('input[name="name"]', 20000);

        await client.pause(2000);
        await client.click('xpath', '//input[@name="providerGroup"]/..');
        await client.pause(5000);
        await client.click('xpath', '//div[@class="v-list-item__title"][contains(.,"' + groupSel+'")]');
        
        for (property in workingEdition){
            if (workingEdition[property].select){

                await client.click('xpath', workingEdition[property].selector);
                await client.pause(100);
                await client.click('xpath', '//div[@class="v-list-item__title"][contains(.,"' + workingEdition[property].value+'")]');
                
            }else if (workingEdition[property].value){
                await client.setValue(workingEdition[property].selector, workingEdition[property].value)
            }else if (workingEdition[property].ariaChecked === 'true'){
                await client.click(workingEdition[property].selector);
            }
        }
        
        await client.pause(1000);
        await client.saveScreenshot('./'+path+'/preEditionSave-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');
        await client.click('#saveVersion');
        await client.pause(5000);



        
    }catch(ex){
        await helpers.logout(client);
        throw ex;
    }
});

Then(/^Data approver chooses to see the details of the edition$/, async function(){
    try{
        await client.waitForElementPresent('#dataset-editions-tab', 20000);
        await client.click('#dataset-editions-tab');
        await client.pause(5000);
        await client.saveScreenshot('./'+path+'/viewEditions-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');
        await client.waitForElementPresent('#branch-link-0', 20000);
        await client.click('#branch-link-0');
        await client.pause(5000);
        await client.saveScreenshot('./'+path+'/viewEdition-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');

    }catch(ex){
        await helpers.logout(client);
        throw ex;
    }
});

Then(/^Data approver should see information on the characteristics of the edition$/, async function(){
    client = this.browser;
    await client.waitForElementPresent('#name-value', 30000);
    await client.saveScreenshot('./'+path+'/preEditionReview-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');
    try{
        let success = true;
        for (var property in workingEdition){

            if ( (workingEdition[property].ariaChecked) || (workingEdition[property].ariaChecked === 'false') ){
                
                let contains = workingEdition[property].ariaChecked === 'true' ? 'fa-check-square' : 'fa-square'

                success = (success && await client.assert.attributeContains(workingEdition[property].selector2, 'class', contains));
            }else if (workingEdition[property].selector2){
                if (workingEdition[property].expectedValue){
                    success = (success && await client.assert.textContains(workingEdition[property].selector2, workingEdition[property].expectedValue));
                }else{
                    success = (success && await client.assert.textContains(workingEdition[property].selector2, workingEdition[property].value));
                }
            }else if (workingEdition[property].value){
                success = (success && await client.assert.value(workingEdition[property].selector, workingEdition[property].value));
            }else{
                success = false;
            }
            await client.pause(200);
        }

        return success;
    }catch(ex){
        console.log("ERROR ERROR ERROR", ex);
        await helpers.logout(client);
        throw ex;
    }
});

When(/^Data approver edits the edition$/, async function(){
    client = this.browser;
    await client.waitForElementPresent('#name-value', 30000)
    try{
        for (var property in workingEdition){
            if (workingEdition[property].value && !workingEdition[property].select){
                workingEdition[property].value += "e"
            }else if ( (workingEdition[property].ariaChecked) || (workingEdition[property].ariaChecked === false) ){
                workingEdition[property].ariaChecked = (workingEdition[property].ariaChecked === 'true') ? "false" : "true";
            }
        }

        await client.waitForElementPresent('#edit-btn-version-info', 30000);
        await client.click('#edit-btn-version-info');

        await client.waitForElementPresent('input[name="name"]', 30000);

        for (property in workingEdition){
            if (workingEdition[property].value && !workingEdition[property].select){
                client.getValue(workingEdition[property].selector, (textValue) => {
                    for(let i = 0; i < textValue.value.length; i ++) {
                        client.setValue(workingEdition[property].selector, '\u0008'); 
                    }
                });
                await client.setValue(workingEdition[property].selector, workingEdition[property].value)
            }else if ( (workingEdition[property].ariaChecked === 'true') || (workingEdition[property].ariaChecked === 'false') ){
                await client.click(workingEdition[property].selector);
            }
        }

        await client.pause(5000);
        
        await client.saveScreenshot('./'+path+'/preEditEditionSave-'+new Date().toISOString().replace(/[:.]/g, '')+'.png');
        await client.click('#saveVersion');
        await client.pause(3000);
    }catch(ex){
        await helpers.logout(client);
        throw ex;
    }
});

Given(/^the browser is dataset ready$/, async function(){
    client = this.browser;
    try{
        await helpers.open(client);
        await helpers.login(client, 'approver');
        await client.click('#tab-datasets');
        await client.waitForElementPresent('div[role="list"] a', 30000);
        await client.click('div[role="list"] a');
        await client.pause(5000);
    }catch(ex){
        await helpers.logout(client);
        throw ex;
    }
});