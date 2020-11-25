const { configController } = require('../../../controllers')
const { getConfigs, getConfig, postConfig, putConfig, deleteConfig } = configController;
let auth = require('../../../modules/auth');

module.exports = (router) => {
    router.get('/', catchAsync(getConfigs));
    router.post('/', auth.requireAdmin, catchAsync(postConfig));
    router.get('/:configKey', catchAsync(getConfig));
    router.put('/:configKey', auth.requireAdmin, catchAsync(putConfig));
    router.delete('/:configKey', auth.requireAdmin, catchAsync(deleteConfig));    

    return router;
}