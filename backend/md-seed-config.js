const db = require('./db/db');
const DataUploads = require('./seeders/data-uploads.seeder');
const Repos = require('./seeders/repos.seeder');
const RepoBranches = require('./seeders/repo-branches.seeder');
const MetadataRevisions = require('./seeders/metadata-revisions.seeder');

/**
 * Seeders List
 * order is important
 * @type {Object}
 */
const seedersList = {
    DataUploads,
    Repos,
    RepoBranches,
    MetadataRevisions
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


module.exports = {seedersList, connect, dropdb};
