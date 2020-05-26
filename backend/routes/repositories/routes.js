let db = require('../db/db');

const {repositoryController} = require('../../controllers')
const { getRepos, postBranch, postRevision, getBranches, getRevisions, getBranch, putBranch, deleteBranch, getRevision, putRevision, deleteRevision } = repositoryController;

module.exports = (router) => {
    router.get('/', catchAsync(getRepos));

    router.post('/:repoId/branches', catchAsync(postBranch));
    router.get('/:repoId/branches', catchAsync(getBranches));
    router.get('/:repoId/branches/:branchId', catchAsync(getBranch));
    router.put('/:repoId/branches/:branchId', catchAsync(putBranch));
    router.delete('/:repoId/branches/:branchId', catchAsync(deleteBranch));

    router.post('/:repoId/branches/:branchId/revisions', catchAsync(postRevision));
    router.get('/:repoId/branches/:branchId/revisions', catchAsync(getRevisions));
    router.get('/:repoId/branches/:branchId/revisions/:revId', catchAsync(getRevision));
    router.put('/:repoId/branches/:branchId/revisions/:revId', catchAsync(putRevision));
    router.delete('/:repoId/branches/:branchId/revisions/:revId', catchAsync(deleteRevision));

    return router;
}