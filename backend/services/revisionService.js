const db = require('../db/db');
const log = require('npmlog');

const repoBranchService = require('./repoBranchService');

const createRevisionWithDataPackage = async function(branch, changeSummary, updater, dataPackageDescriptor) {
    const metadataRevisionSchema = new db.MetadataRevisionSchema;

    metadataRevisionSchema.repo_branch_id = branch._id;
    metadataRevisionSchema.type = 'tabular_data_package';
    metadataRevisionSchema.revision_number = branch.revisions.length + 1;
    metadataRevisionSchema.change_summary = changeSummary;
    metadataRevisionSchema.content = dataPackageDescriptor;
    metadataRevisionSchema.updater = updater;
    metadataRevisionSchema.create_date = new Date();

    const rev = await metadataRevisionSchema.save();

    await repoBranchService.addRevision(branch._id, rev).catch(err => {
        log.error(err);
        log.error("Rolling back the revision");
        rev.delete();
        throw err;
    });

    return rev;
}

const deleteRevision = async function(revisionId) {
    const rev = await getRevisionById(revisionId)
    await repoBranchService.removeRevision(rev.repo_branch_id, revisionId);
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
    listRevisionsByBranch,
    getRevisionById
}
