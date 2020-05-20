const { dataPackageService} = require('../services');

const postDataPackage = async (req, res, next) => {
    let descriptor = {...req.body};
    descriptor.profile = "tabular-data-package";

    const pkg = await dataPackageService.addDataPackage(descriptor);
    res.status(201).json({id: pkg._id.toString()});
}

const getDataPackage = async (req, res, next) => {
    const id = req.params.dataPackageId;
    res.status(200).json(await dataPackageService.getDataPackageById(id));
}

const listDataPackages = async (req, res, next) => {
    res.status(200).json(await dataPackageService.listDataPackages());
}

module.exports = {
    postDataPackage,
    getDataPackage,
    listDataPackages
}
