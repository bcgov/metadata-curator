const dataUploadService = require('./dataUploadService');
const commentService = require('./commentService');
const tableSchemaService = require('./tableSchemaService');
const dataPackageService = require('./dataPackageService');

const repoService = require('./repoService');
const repoBranchService = require('./repoBranchService');
const revisionService = require('./revisionService');

module.exports = {
    commentService,
    dataPackageService,
    dataUploadService,
    tableSchemaService,

    repoService,
    repoBranchService,
    revisionService
}
