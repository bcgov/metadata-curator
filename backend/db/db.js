const mongoose = require('mongoose');
const config = require('config');

mongoose.set('useCreateIndex', true);

const dbProps = config.get('database');

dbHost = dbProps.host;
dbUser = dbProps.username;
dbPass = dbProps.password;
dbName = dbProps.dbName;

const db = {};

db.init = function (_connString = null) {
    const logger = require('npmlog');
    const connString = (_connString == null) ? 'mongodb://' + dbUser + ':' + dbPass + '@' + dbHost + '/' + dbName + '?authSource=' + dbName : _connString;
    // console.log("connectionstr: " + connString);
    mongoose.connect(connString, {
        useUnifiedTopology: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        bufferMaxEntries: 0
    });
    db.db = mongoose.connection;

    db.db.on('error', function (error) {
        // logger.error(error);
        throw (error);
    });
    db.db.once('open', function () {
        // logger.debug('DB connection established');
    });
    db.TableSchema = require('./model/tableSchema').model;
    db.DataPackageSchema = require('./model/dataPackageSchema');
    db.DataUploadSchema = require('./model/dataUpload');
    db.RepoSchema = require('./model/repo');
    db.RepoBranchSchema = require('./model/repoBranch').model;
    db.MetadataRevisionSchema = require('./model/metadataRevision');
};

module.exports = db;
