const db = require('../db/db');

const addBranch = async function(repoId, type, name, description) {
    const repoBranchSchema = new db.RepoBranchSchema;
    repoBranchSchema.repo_id = repoId;
    repoBranchSchema.type = type;
    repoBranchSchema.name = name;
    repoBranchSchema.description = description;
    repoBranchSchema.revisions = [];
    repoBranchSchema.create_date = new Date();

    return await repoBranchSchema.save();
}

const updateBranch = async function(branchId, type, name, description) {
    const repoBranchSchema = getBranchById(branchId);
    repoBranchSchema.type = type;
    repoBranchSchema.name = name;
    repoBranchSchema.description = description;
    return await repoBranchSchema.save();
}


const listBranches = async (repoId) => {
    try {
        return await db.RepoBranchSchema.find({repo_id:repoId}).sort({ "create_date": 1});
    } catch (e) {
        log.error(e);
        throw new Error(e.message)
    }
}

const getBranchById = async (id) => {
    try {
        return await db.RepoBranchSchema.findOne({_id: id});
    } catch (e) {
        log.error(e);
        throw new Error(e.message)
    }
}

const deleteBranch = async (id) => {
    const branch = await db.RepoBranchSchema.findOne({_id: id});
    if (branch.revisions.length != 0) {
        throw new Error("Unable to delete a branch that has revisions")
    }
    return await db.RepoBranchSchema.delete({_id: id});
}

const addRevision = async (branchId, revision) => {
    const branch = await db.RepoBranchSchema.findOne({_id: branchId});
    branch.revisions.push(revision._id.toString());
    return await branch.save();
}

const removeRevision = async (branchId, revisionId) => {
    const branch = await db.RepoBranchSchema.findOne({_id: branchId});
    if (branch.revisions[branch.revisions.length - 1].toString() !== revisionId.toString()) {
        throw new Error("Only the most recent revision can be deleted.");
    }
    branch.revisions = branch.revisions.filter((v, i, a) => v != revisionId);
    await branch.save();
}

module.exports = {
    addBranch,
    updateBranch,
    listBranches,
    getBranchById,
    deleteBranch,
    addRevision,
    removeRevision
}
