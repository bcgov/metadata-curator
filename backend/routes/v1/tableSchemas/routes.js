const { tableSchemaController } = require('../../../controllers')
const { postTableSchema } = tableSchemaController;

module.exports = (router) => {
    router.post('', catchAsync(postTableSchema));
    return router;
}
