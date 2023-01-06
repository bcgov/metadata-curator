const { World } = require('@cucumber/cucumber');
const { NightwatchBrowser } = require('nightwatch');
const Nightwatch = require('nightwatch');

// console.log("nightwatchClient", nightwatchClient);
nightwatchClient = Nightwatch.createClient({
    browserName: process.env.BROWSER || 'chrome', // can be either: firefox, chrome, safari, or edge
  });

class world extends World {
  browser = NightwatchBrowser;

  constructor(options) {
    /*
     * If you don't call the super method you will need
     * to bind the options here as you see fit.
     */
    super(options);
    // Custom actions go here.
  }

  /*
   * Constructors cannot be asynchronous! To work around this we'll
   * use an init method with the Before hook
   */
  async initNightwatch() {
      if (!this.browser){
        this.browser = await nightwatchClient.launchBrowser();
        this.browser.pause(1000);
      }
  }

  async endNightwatch() {
    if (this.browser) {
      await this.browser.close();
      await this.browser.quit()
    }
  }
}

module.exports = world;
