
const { dataPackageController } = require('../../controllers')
const { postDataPackage, deleteDataPackage, getDataPackage, listDataPackages } = dataPackageController;

module.exports = (router) => {
    router.post('', catchAsync(postDataPackage));
    router.get('/:dataPackageId', catchAsync(getDataPackage));
    router.delete('/:dataPackageId', catchAsync(deleteDataPackage));
    router.get('', catchAsync(listDataPackages));
    return router;
}
