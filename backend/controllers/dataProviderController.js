const { dataProviderService } = require('../services')

const getDataProviders = async (req, res, next) => {
    const providers = await dataProviderService.listDataProviders(req.user);
    res.json(providers);
}

module.exports = {
    getDataProviders
}
