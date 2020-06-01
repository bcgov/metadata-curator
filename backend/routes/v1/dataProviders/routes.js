const {dataProviderController} = require('../../../controllers');
const { getDataProviders } = dataProviderController;

module.exports = (router) => {
    router.get ('', catchAsync(getDataProviders));
    return router;
}
