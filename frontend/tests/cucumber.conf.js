const { setDefaultTimeout, After, Before, setWorldConstructor } = require('@cucumber/cucumber');
const World = require('./world.js');

setDefaultTimeout(500000);

setWorldConstructor(World);

Before(async function(){
  await this.initNightwatch();
});

After(async function(){
  await this.endNightwatch();
});