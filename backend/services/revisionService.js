const db = require('../db/db');
const log = require('npmlog');
const Mongoose = require('mongoose');
const ObjectId = Mongoose.Types.ObjectId;

const createRevisionWithDataPackage = async function(branch, changeSummary, updater, dataPackageDescriptor) {
    const metadataRevisionSchema = new db.MetadataRevisionSchema;

    metadataRevisionSchema.repo_branch_id = branch._id;
    metadataRevisionSchema.type = 'tabular_data_package';
    metadataRevisionSchema.revision_number = branch.revisions.length + 1;
    metadataRevisionSchema.change_summary = changeSummary;
    //metadataRevisionSchema.content = await dataPackageService.buildDataPackageSchema(dataPackageDescriptor);
    metadataRevisionSchema.updater = updater;
    metadataRevisionSchema.create_date = new Date();

    const rev = await metadataRevisionSchema.save();

    // await repoBranchService.addRevision(branch._id, rev).catch(err => {
    //     log.error(err);
    //     log.error("Rolling back the revision");
    //     rev.delete();
    //     throw err;
    // });

    return rev;
}

const updateRevision = async function(revId, changeSummary, updater) {
    const metadataRevisionSchema = getRevisionById(revId);
    metadataRevisionSchema.change_summary = changeSummary;
    metadataRevisionSchema.updater = updater;

    const rev = await metadataRevisionSchema.save();
    return rev;
}

const deleteRevision = async function(revisionId) {
    const rev = await getRevisionById(revisionId)
    //await repoBranchService.removeRevision(rev.repo_branch_id, revisionId);
    await rev.delete();
}

const listRevisionsByBranch = async (branchId) => {
    try {
        return await db.MetadataRevisionSchema.find({repo_branch_id:branchId}).sort({ "create_date": 1});
    } catch (e) {
        log.error(e);
        throw new Error(e.message)
    }
}

const listRevisionsByDataUpload = async (dataUploadId) => {
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
                "dataUpload._id": "$du._id",
                "repo._id": "$r._id",
                "repo_branch._id": "$rb._id",
                "revision._id": "$mr._id",
                "revision.type": "$mr.type",
                "revision.revision_number": "$mr.revision_number",
                "revision.change_summary": "$mr.change_summary",
                "revision.create_date": "$mr.create_date",
                "revision.updater": "$mr.updater",
                "_id": 0
            }
        }
    ];

    let result = await db.DataUploadSchema.aggregate(pipeline).exec();
    return result;//.map(item => item.mr);
}

const getRevisionById = async (id) => {
    try {
        return await db.MetadataRevisionSchema.findOne({_id: id});
    } catch (e) {
        log.error(e);
        throw new Error(e.message)
    }
}

module.exports = {
    createRevisionWithDataPackage,
    deleteRevision,
    updateRevision,
    listRevisionsByBranch,
    getRevisionById,
    listRevisionsByDataUpload
}
