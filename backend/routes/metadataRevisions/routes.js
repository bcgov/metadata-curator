let db = require('../db/db');
let mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

module.exports = (router) => {

    router.post('', catchAsync(async (req, res, next) => {
        // console.log("req.body: ", req.body);
        const metadataRevisionSchema = new db.MetadataRevisionSchema;

        metadataRevisionSchema.repo_branch_id = req.body.repo_branch_id;
        metadataRevisionSchema.type = req.body.type;
        metadataRevisionSchema.revision_number = req.body.revision_number;
        metadataRevisionSchema.change_summary = req.body.change_summary;
        metadataRevisionSchema.content = req.body.content;
        metadataRevisionSchema.updater = req.body.updater;
        metadataRevisionSchema.create_date = new Date();

        const revision = await metadataRevisionSchema.save();
        res.status(201);
        res.json({
            status: 201,
            message: 'Metadata revision saved successfully.',
            id: revision._id
        });

    }));
    
    
    router.get('/:dataUploadId', catchAsync(async (req, res, next) => {
    
        // console.log("req.params.dataUploadId: ", req.params.dataUploadId);
        const dataUploadId = req.params.dataUploadId;

        var pipeline = [
            {
                "$project": {
                    "_id": 0,
                    "du": "$$ROOT"
                }
            },
            {
                "$lookup": {
                    "localField": "du._id",
                    "from": "repo",
                    "foreignField": "data_upload_id",
                    "as": "r"
                }
            },
            {
                "$unwind": {
                    "path": "$r",
                    "preserveNullAndEmptyArrays": false
                }
            },
            {
                "$lookup": {
                    "localField": "r._id",
                    "from": "repo_branch",
                    "foreignField": "repo_id",
                    "as": "rb"
                }
            },
            {
                "$unwind": {
                    "path": "$rb",
                    "preserveNullAndEmptyArrays": false
                }
            },
            {
                "$lookup": {
                    "localField": "rb._id",
                    "from": "metadata_revision",
                    "foreignField": "repo_branch_id",
                    "as": "mr"
                }
            },
            {
                "$unwind": {
                    "path": "$mr",
                    "preserveNullAndEmptyArrays": false
                }
            },
            {
                "$match": {
                    "du._id": new ObjectId(dataUploadId)
                }
            },
            {
                "$sort": {
                    "mr.revision_number": 1
                }
            },
            {
                "$project": {
                    "mr._id": "$mr._id",
                    "mr.type": "$mr.type",
                    "mr.revision_number": "$mr.revision_number",
                    "mr.change_summary": "$mr.change_summary",
                    "mr.create_date": "$mr.create_date",
                    "mr.updater": "$mr.updater",
                    "_id": 0
                }
            }
        ];

        let result = await db.DataUploadSchema.aggregate(pipeline).exec();
        // console.log("results: ", result);
        result = result.map(item => item.mr);
        // console.log("final results: ", result);
        res.json(result);
    }))
    
    return router;
}
