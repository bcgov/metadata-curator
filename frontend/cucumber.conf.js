const { setDefaultTimeout, AfterAll, BeforeAll } = require('@cucumber/cucumber');
const { createSession, closeSession, startWebDriver, stopWebDriver } = require('nightwatch-api');
const config = require('./step-definitions/config.json');

setDefaultTimeout(200000);

BeforeAll(async () => {
  let browser = config.browser
  await startWebDriver({ env: browser });
  await createSession();
});

AfterAll(async () => {
  await closeSession();
  await stopWebDriver();
});