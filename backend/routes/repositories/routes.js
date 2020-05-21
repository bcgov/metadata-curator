let db = require('../db/db');

module.exports = (router) => {

    router.post('', catchAsync(async (req, res, next) => {
        const repoSchema = new db.RepoSchema;
        repoSchema.name = req.body.name;
        repoSchema.create_date = new Date();
        repoSchema.data_upload_id = req.body.data_upload_id;

        repo = await repoSchema.save();
        res.status(201).json({id: repo._id});
    }));
    
    return router;
}