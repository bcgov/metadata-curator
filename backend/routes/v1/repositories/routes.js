const {repositoryController} = require('../../../controllers');
const { putBranch } = require('../../../controllers/repoBranchController');
const { getRepos, postRepository, putRepository, getBranches, postBranch } = repositoryController;

module.exports = (router) => {
    router.get('/', catchAsync(getRepos));
    router.post('/', catchAsync(postRepository));
    router.put('/:repoId', catchAsync(putRepository));
    router.post('/:repoId/branches', catchAsync(postBranch));
    router.put('/:repoId/branches', catchAsync(putBranch));
    router.get('/:repoId/branches', catchAsync(getBranches));
    return router;

}
