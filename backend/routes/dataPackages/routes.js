
const { dataPackageController } = require('../../controllers')
const { postDataPackage, getDataPackage, listDataPackages } = dataPackageController;

module.exports = (router) => {
    router.post('', catchAsync(postDataPackage));
    router.get('/:dataPackageId', catchAsync(getDataPackage));
    router.get('', catchAsync(listDataPackages));
    return router;
}
