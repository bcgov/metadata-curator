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
        value: 'edition description',
        selector2: '#description-value'
    },
    keywords: {
        selector: 'input[name="keywords"]',
        value: 'keyword1,keyword2, keyword3',
        selector2: '#keywords-value'
    },
    collectionMethod: {
        selector: 'input[name="collectionMethod"]',
        value: 'collectionMethod',
        selector2: '#collectionMethod-value'
    },
    availability: {
        selector: 'input[name="availability"]',
        value: 'availability',
        selector2: '#availability-value'
    },
    notes: {
        selector: 'textarea[name="notes"]',
        value: 'some edition notes go here',
        selector2: '#notes-value'
    },
    citation: {
        selector: 'input[name="citation"]',
        value: 'citation',
        selector2: '#citation-value'
    },
    instructions: {
        selector: 'input[name="instructions"]',
        value: 'instructions',
        selector2: '#instructions-value'
    },
    inclusions: {
        selector: 'input[name="inclusions"]',
        value: 'inclusions',
        selector2: '#inclusions-value'
    },
    exclusions: {
        selector: 'input[name="exclusions"]',
        value: 'exclusions',
        selector2: '#exclusions-value'
    },
    quality: {
        selector: 'input[name="quality"]',
        value: 'quality',
        selector2: '#quality-value'
    },
    delta_over_time: {
        selector: 'input[name="delta_over_time"]',
        value: 'description of how this edition has changed overtime',
        selector2: '#delta_over_time-value'
    },
    additional_info: {
        selector: 'textarea[name="additional_info"]',
        value: 'Additional information about this edition',
        selector2: '#additional_info-value'
    },
    references: {
        selector: 'input[name="references"]',
        value: 'References',
        selector2: '#references-value'
    },
    more_information: {
        selector: 'input[name="more_information"]',
        value: 'https://google.ca',
        selector2: '#more_information-value'
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

        await client.click('#addVersion');

        await client.pause(2000);

        const groupSel = helpers.confGet('providerGroup');

        await client.click('xpath', '//input[@name="providerGroup"]/..');
        await client.pause(100);
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

        await client.click('#branch-link-0');

    }catch(ex){
        await helpers.logout(client);
        throw ex;
    }
});

Then(/^Data approver should see information on the characteristics of the edition$/, async function(){
    client = this.browser;
    await client.pause(5000);
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
    try{
        for (var property in workingEdition){
            if (workingEdition[property].value && !workingEdition[property].select){
                workingEdition[property].value += "e"
            }else if ( (workingEdition[property].ariaChecked) || (workingEdition[property].ariaChecked === false) ){
                workingEdition[property].ariaChecked = (workingEdition[property].ariaChecked === 'true') ? "false" : "true";
            }
        }

        await client.pause(5000);
        await client.click('#edit-btn-version-info');

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
        await client.pause(3000);
        await client.click('div[role="list"] a');
        await client.pause(3000);
    }catch(ex){
        await helpers.logout(client);
        throw ex;
    }
});