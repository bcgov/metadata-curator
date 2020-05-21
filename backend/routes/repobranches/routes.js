let db = require('../db/db');

module.exports = (router) => {

    router.post('', catchAsync(async (req, res, next) => {
        const repoBranchSchema = new db.RepoBranchSchema;
        repoBranchSchema.repo_id = req.body.repo_id;
        repoBranchSchema.type = req.body.type;
        repoBranchSchema.name = req.body.name;
        repoBranchSchema.description = req.body.description;
        repoBranchSchema.create_date = new Date();

        const repoBranch = await repoBranchSchema.save();
        res.status(201).json({id: repoBranch._id});
    }));
    
    return router;
}