const db = require('../db/db');
const log = require('npmlog');

const repoBranchService = require('./repoBranchService');
const revisionService = require('./revisionService');

const createRepo = async function(dataUploadId, name) {
    const repoSchema = new db.RepoSchema;
    repoSchema.name = name;
    repoSchema.create_date = new Date();
    repoSchema.data_upload_id = dataUploadId;

    return await repoSchema.save();
}

const listRepositories = async () => {
    try {
        return await db.RepoSchema.find({}).sort({ "create_date": 1});
    } catch (e) {
        log.error(e);
        throw new Error(e.message)
    }
}

const listRepositoriesByDataUpload = async (dataUploadId) => {
    try {
        return await db.RepoSchema.find({data_upload_id:dataUploadId}).sort({ "create_date": 1});
    } catch (e) {
        log.error(e);
        throw new Error(e.message)
    }
}

const getRepoById = async (id) => {
    try {
        return await db.RepoSchema.findOne({_id: id});
    } catch (e) {
        log.error(e);
        throw new Error(e.message)
    }
}

const createRepoWithDataPackage = async function(dataUploadId, name, updater, dataPackageDescriptor) {
    const repo = await createRepo (dataUploadId, name);

    const branch = await repoBranchService.addBranch(repo._id, "standard", "draft", "Draft " + name).catch ((err) => {
        // delete repo
        repo.delete();
        throw err;
    })
    return await revisionService.createRevisionWithDataPackage(branch, "Initial metadata", updater, dataPackageDescriptor).catch ((err) => {
        // delete branch
        branch.delete();
        // delete repo
        repo.delete();
        throw err;
    })
}

module.exports = {
    createRepo,
    listRepositories,
    listRepositoriesByDataUpload,
    createRepoWithDataPackage,
    getRepoById
}
