let db = require('../db/db');

module.exports = (router) => {

    router.post('/v1/repos', async (req, res, next) => {

        try {
            // console.log("req.body: ", req.body);
            const repoSchema = new db.RepoSchema;
            repoSchema.name = req.body.name;
            repoSchema.create_date = new Date();
            repoSchema.data_upload_id = req.body.data_upload_id;
    
            repo = await repoSchema.save();
            res.status(201);
            res.json({
                status: 201,
                message: 'Repo saved successfully.',
                id: repo._id
            });
        } catch(err) {
            console.log("err: ", err);
            // log.debug(err);
            res.status(500);
            res.json({
                status: 500,
                error: err.message
            });
        }
    
    });
    
    router.post('/v1/repobranches', async (req, res, next) => {
    
        try {
            // console.log("req.body: ", req.body);
            const repoBranchSchema = new db.RepoBranchSchema;
            repoBranchSchema.repo_id = req.body.repo_id;
            repoBranchSchema.type = req.body.type;
            repoBranchSchema.name = req.body.name;
            repoBranchSchema.description = req.body.description;
            repoBranchSchema.create_date = new Date();
    
            const repoBranch = await repoBranchSchema.save();
            res.status(201);
            res.json({
                status: 201,
                message: 'Repo branch saved successfully.',
                id: repoBranch._id
            });
    
        } catch(err) {
            console.log("err: ", err);
            // log.debug(err);
            res.status(500);
            res.json({
                status: 500,
                error: err.message
            });
        }
    
    });
    
    return router;
}