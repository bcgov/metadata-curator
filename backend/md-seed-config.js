const db = require('./db/db');
const {DataUploadsSeeder, DataUploadData} = require('./seeders/data-uploads.seeder');
const {ReposSeeder, ReposData} = require('./seeders/repos.seeder');
const {RepoBranchesSeeder, RepoBranchesData} = require('./seeders/repo-branches.seeder');
const {MetadataRevisionsSeeder, MetadataRevisionsData} = require('./seeders/metadata-revisions.seeder');

/**
 * Seeders List
 * order is important
 * @type {Object}
 */
const seedersList = {
    DataUploadsSeeder,
    ReposSeeder,
    RepoBranchesSeeder,
    MetadataRevisionsSeeder
};

const seedersData = {
    DataUploadData,
    ReposData,
    RepoBranchesData,
    MetadataRevisionsData
};


/**
 * Connect to mongodb implementation
 * @return {Promise}
 */
const connect = async () => db.init();

/**
 * Drop/Clear the database implementation
 * @return {Promise}
 */
const dropdb = async () => db.db.dropDatabase();


module.exports = {seedersList, seedersData, connect, dropdb};
