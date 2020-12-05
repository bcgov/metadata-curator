const { repoBranchController} = require('../../../controllers')
const { postRevision, getRevisions, getBranches, getBranch, putBranch, deleteBranch, getRevision, putRevision, deleteRevision } = repoBranchController;

module.exports = (router) => {
    router.get('/', catchAsync(getBranches));
    router.get('/:branchId', catchAsync(getBranch));
    router.put('/:branchId', catchAsync(putBranch));
    router.delete('/:branchId', catchAsync(deleteBranch));

    router.post('/:branchId/revisions', catchAsync(postRevision));
    router.get('/:branchId/revisions', catchAsync(getRevisions));
    router.get('/:branchId/revisions/:revId', catchAsync(getRevision));
    router.put('/:branchId/revisions/:revId', catchAsync(putRevision));
    router.delete('/:branchId/revisions/:revId', catchAsync(deleteRevision));

    return router;
}