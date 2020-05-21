const { dataPackageService} = require('../services');

const postTableSchema = async (req, res) => {
    let descriptor = {...req.body};
    const pkg = await dataPackageService.addDataPackageFromTableSchema(descriptor);
    res.status(201).json({id: pkg._id.toString()});
}

module.exports = {
    postTableSchema
}
