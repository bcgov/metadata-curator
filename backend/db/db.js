const mongoose = require('mongoose');
const config = require('config');

//mongoose.set('useCreateIndex', true);

const dbProps = config.get('database');

dbHost = dbProps.host;
dbUser = dbProps.username;
dbPass = dbProps.password;
dbName = dbProps.dbName;

const db = {};

db.init = async function (_connString = null) {
    const logger = require('npmlog');
    const connString = (_connString == null) ? 'mongodb://' + dbUser + ':' + dbPass + '@' + dbHost + '/' + dbName + '?authSource=' + dbName : _connString;
    await mongoose.connect(connString, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    });
    db.db = mongoose.connection;

    db.db.on('error', function (error) {
        // logger.error(error);
        throw (error);
    });
    db.db.once('open', function () {
        // logger.debug('DB connection established');
    });
    //db.TableSchema = require('./model/tableSchema').model;
    db.DataPackageSchema = require('./model/dataPackageSchema').model;
    db.DataUploadSchema = require('./model/dataUpload');
    db.RepoSchema = require('./model/repo').model;
    db.RepoBranchSchema = require('./model/repoBranch').model;
    db.RevisionSchema = require('./model/revision');
    db.User = require('./model/user');
    db.ConfigSchema = require('./model/config');
    db.VariableClassification = require('./model/variableClassification');
    db.Options = require('./model/option');
    db.Project = require('./model/project');
};

module.exports = db;
