let db = require('../db/db');

const {repositoryController} = require('../../controllers')
const { getRepos, postBranch, postRevision, getBranches, getRevisions, getBranch, putBranch, deleteBranch, getRevision, putRevision, deleteRevision } = repositoryController;

module.exports = (router) => {
    router.get('/:branchId', catchAsync(getBranch));
    router.put('/:branchId', catchAsync(putBranch));
    router.delete('/:branchId', catchAsync(deleteBranch));

    router.post('/branches/:branchId/revisions', catchAsync(postRevision));
    router.get('/branches/:branchId/revisions', catchAsync(getRevisions));
    router.get('/branches/:branchId/revisions/:revId', catchAsync(getRevision));
    router.put('/:branches/:branchId/revisions/:revId', catchAsync(putRevision));
    router.delete('/branches/:branchId/revisions/:revId', catchAsync(deleteRevision));

    return router;
}