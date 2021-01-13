const db = require('../db/db');
const log = require('npmlog');
var mongoose = require('mongoose');

const repoBranchService = require('./repoBranchService');
const revisionService = require('./revisionService');
const forumClient = require('../clients/forum_client');

const createRepo = async function(user, name) {
    const id = mongoose.Types.ObjectId();
    const topic = await forumClient.addTopic(id, user);
    const repoSchema = new db.RepoSchema;
    repoSchema._id = id;
    repoSchema.name = name;
    repoSchema.create_date = new Date();
    repoSchema.created_by = user.email;
    repoSchema.topic_id = topic._id;

    return await repoSchema.save();
}

const updateRepo = async function(user, id, body) {
    //check topic exists this checks for user permissions
    const response = await forumClient.getTopic(user, id);
    const fields = {...body};
    var record = {};
    try{
        record = await db.RepoSchema.find({_id: mongoose.Types.ObjectId(id)});
    }catch(ex){
        //record doesn't exist
        log.error(ex);
        throw new Error(ex.message);
    }

    //record exists
    if (fields.name){
        record.name = fields.name;
    }

    return await repoSchema.save();
}

const listRepositories = async (user, query) => {
    try {
        const topicResponse = await forumClient.getTopics(user, query);
        topics = topicResponse.data.filter(item => item.parent_id);
        const repoIds = topics.map(item => item.name);
        if(query && query.upload_id) {
            //return await db.RepoSchema.find({data_upload_id: mongoose.Types.ObjectId(query.filterBy)}).sort({ "create_date": 1});
            return await db.RepoBranchSchema.find({data_upload_id: query.upload_id}).populate('repo_id');
            //return await db.RepoSchema.find({_id: {$in: repoIds}}).sort({ "create_date": 1});
        }else{
            return await db.RepoSchema.find({_id: {$in: repoIds}}).sort({ "create_date": 1});
        }
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

const createRepoWithDataPackage = async function(name, updater, dataPackageDescriptor) {
    const repo = await createRepo (name);

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
    updateRepo,
    listRepositories,
    listRepositoriesByDataUpload,
    createRepoWithDataPackage,
    getRepoById
}
